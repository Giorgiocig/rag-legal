import sys
import os
import uuid
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from dotenv import load_dotenv
load_dotenv()

from langsmith import Client
from langsmith.evaluation import evaluate
from langsmith.evaluation.evaluator import EvaluationResult
from langchain_openai import ChatOpenAI
from sqlalchemy import text

from rag import RAGService
from db.session import SessionLocal
from models.document import Document

client = Client()
rag = RAGService()
judge = ChatOpenAI(model="gpt-4o-mini", temperature=0)

TEST_PDF_PATH = "backend/pdf-test/fornitura-servizi-test.pdf"

# -------------------------
# SETUP / CLEANUP
# -------------------------
def setup_test_document():
    db = SessionLocal()
    try:
        doc = Document(
            id=str(uuid.uuid4()),
            filename="fornitura-servizi-test.pdf",
            file_path=TEST_PDF_PATH,
            status="test"
        )
        db.add(doc)
        db.commit()
        db.refresh(doc)
        rag.index_document(TEST_PDF_PATH, db, doc.id)
        return doc.id
    except:
        db.close()
        raise

def cleanup_test_document(document_id: str):
    db = SessionLocal()
    try:
        db.execute(text("DELETE FROM chunks WHERE document_id = :id"), {"id": document_id})
        doc = db.query(Document).filter(Document.id == document_id).first()
        if doc:
            db.delete(doc)
        db.commit()
    finally:
        db.close()

# -------------------------
# DATASET
# -------------------------
dataset_name = "rag-legal-test"

if not client.has_dataset(dataset_name=dataset_name):
    dataset = client.create_dataset(dataset_name=dataset_name)
    client.create_examples(
        inputs=[
            {"question": "qual è l'oggetto del contratto?"},
            {"question": "quanto dura il contratto?"},
            {"question": "quali sono gli obblighi del fornitore?"},
        ],
        outputs=[
            {"answer": "fornitura di servizi di sviluppo software personalizzato"},
            {"answer": "dodici mesi con rinnovo automatico"},
            {"answer": "eseguire i servizi con diligenza professionale"},
        ],
        dataset_id=dataset.id,
    )

# -------------------------
# RAG PIPELINE
# -------------------------
def rag_pipeline(inputs):
    db = SessionLocal()
    try:
        article_number = rag.extract_article_number(inputs["question"])
        results = []

        if article_number:
            sql = text(
                "SELECT content, page, article FROM chunks WHERE article = :article AND document_id = :document_id LIMIT 5;"
            )
            results = db.execute(
                sql, {"article": article_number, "document_id": DOCUMENT_ID}
            ).fetchall()

        if len(results) == 0:
            query_embedding = rag.embeddings.embed_query(inputs["question"])
            sql = text(
                "SELECT content, page, article FROM chunks WHERE document_id = :document_id ORDER BY embedding <-> CAST(:query_embedding AS vector) ASC LIMIT 10;"
            )
            results = db.execute(
                sql, {"query_embedding": query_embedding, "document_id": DOCUMENT_ID}
            ).fetchall()

        context = "\n\n".join([r.content for r in results])
        answer = rag.chain.invoke({"context": context, "question": inputs["question"]})
        answer = answer.split("ARTICOLI_USATI")[0].strip()

        return {"answer": answer}
    finally:
        db.close()

# -------------------------
# EVALUATOR
# -------------------------
def correctness_evaluator(outputs, reference_outputs):
    expected = reference_outputs.get("answer", "")
    actual = outputs.get("answer", "")

    response = judge.invoke(f"""
La risposta attesa è: {expected}
La risposta ottenuta è: {actual}
La risposta ottenuta è semanticamente corretta rispetto a quella attesa? Rispondi solo con 1 (sì) o 0 (no).
""")

    score = int(response.content.strip())
    return EvaluationResult(key="correctness", score=score)

# -------------------------
# MAIN
# -------------------------
DOCUMENT_ID = setup_test_document()

try:
    results = evaluate(
        rag_pipeline,
        data=dataset_name,
        evaluators=[correctness_evaluator],
        experiment_prefix="rag-legal-v1",
    )
    print(results)
finally:
    cleanup_test_document(DOCUMENT_ID)