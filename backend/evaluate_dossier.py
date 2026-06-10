from dotenv import load_dotenv

load_dotenv()

from langsmith import Client
from langsmith.evaluation import evaluate
from langsmith.evaluation.evaluator import EvaluationResult
from rag import RAGService
from db.session import SessionLocal
from langchain_openai import ChatOpenAI

DOSSIER_ID = "il-tuo-dossier-id"  # sostituisci

# recupera testo documenti per il judge
def get_dossier_documents(dossier_id: str) -> str:
    db = SessionLocal()
    try:
        sql = text("""
            SELECT d.filename, c.content
            FROM documents d
            JOIN chunks c ON c.document_id = d.id
            WHERE d.dossier_id = :dossier_id
            ORDER BY d.id, c.chunk_index;
        """)
        rows = db.execute(sql, {"dossier_id": dossier_id}).fetchall()
        
        docs = {}
        for row in rows:
            if row.filename not in docs:
                docs[row.filename] = ""
            docs[row.filename] += row.content + "\n"
        
        return "\n\n".join([f"=== {name} ===\n{content}" for name, content in docs.items()])
    finally:
        db.close()

# funzione da valutare
def analysis_pipeline(inputs):
    db = SessionLocal()
    try:
        result = analysis_service.analyze(inputs["dossier_id"], db)
        return {"result": result, "documents": get_dossier_documents(inputs["dossier_id"])}
    finally:
        db.close()

# dataset
dataset_name = "dossier-analysis-test"

if not client.has_dataset(dataset_name=dataset_name):
    dataset = client.create_dataset(dataset_name=dataset_name)
    client.create_examples(
        inputs=[{"dossier_id": DOSSIER_ID}],
        outputs=[{"expected_attore": "Andrea Bellini", "expected_convenuto": "EdilNova S.r.l."}],
        dataset_id=dataset.id
    )