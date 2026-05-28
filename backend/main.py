from dotenv import load_dotenv
import nest_asyncio

from fastapi import FastAPI, HTTPException, UploadFile, File, Depends
import shutil
import os
import re
import json
from fastapi.responses import StreamingResponse
from sqlalchemy import text
from schemas.query_request import QueryRequest
from dossier_analysis import DossierAnalysis


from db.session import SessionLocal, engine
from db.base import Base

from models.document import Document
from models.dossier import Dossier
from schemas.dossier_request import DossierRequest

from rag import RAGService
from fastapi.middleware.cors import CORSMiddleware

nest_asyncio.apply()
load_dotenv()

# crea tabelle (solo MVP)
Base.metadata.create_all(bind=engine)

app = FastAPI()
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_origin_regex="https://.*\.vercel\.app",
    allow_methods=["*"],
    allow_headers=["*"],
)
rag = RAGService()
dossier_analysis = DossierAnalysis()

UPLOAD_DIR = "storage"
os.makedirs(UPLOAD_DIR, exist_ok=True)


# -------------------------
# DB dependency
# -------------------------
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


# -------------------------
# UPLOAD PDF
# -------------------------
@app.post("/upload")
async def upload_pdf(file: UploadFile = File(...), db=Depends(get_db)):
    # controlla se esiste già un documento con lo stesso nome
    existing = db.query(Document).filter(Document.filename == file.filename).first()
    if existing:
        db.execute(
            text("DELETE FROM chunks WHERE document_id = :id"), {"id": existing.id}
        )
        db.delete(existing)
        db.commit()

    file_path = f"{UPLOAD_DIR}/{file.filename}"

    # 1. salva file su disco
    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    # 2. salva su DB
    doc = Document(filename=file.filename, file_path=file_path, status="uploaded")

    db.add(doc)
    db.commit()
    db.refresh(doc)

    rag.index_document(file_path, db, doc.id)

    return {"message": "Documento caricato e indicizzato", "document_id": doc.id}


# -------------------------
# QUERY RAG
# -------------------------
@app.post("/query")
async def query(request: QueryRequest, db=Depends(get_db)):
    stream, results = rag.query(request.question, db, request.document_id)

    def generate():
        full_response = ""
        for chunk in stream:
            full_response += chunk
            yield chunk

        match = re.search(r"ARTICOLI_USATI:([\d,]+)", full_response)

        match = re.search(r"ARTICOLI_USATI:\s*([\d\s,]+)", full_response)
        if match:
            article_numbers = [n.strip() for n in match.group(1).split(",")]
            used_results = [r for r in results if r.article in article_numbers]
        else:
            used_results = results

        print(f"Chunks recuperati: {[r.article for r in results]}")
        print(f"Articoli usati dal LLM: {article_numbers}")
        print(f"Used results: {[r.article for r in used_results]}")

        sources = [{"page": r.page, "article": r.article} for r in used_results]
        yield f"\n###SOURCES###{json.dumps(sources)}"

    return StreamingResponse(generate(), media_type="text/plain")


# -------------------------
# DOCUMENT
# -------------------------
@app.get("/documents")
async def get_documents(db=Depends(get_db)):
    docs = db.query(Document).filter(Document.dossier_id == None).all()
    return {
        "documents": [
            {"id": d.id, "name": d.filename, "uploadedAt": d.created_at}
            for d in docs
        ]
    }


@app.delete("/documents/{document_id}")
async def delete_document(document_id: str, db=Depends(get_db)):
    doc = db.query(Document).filter(Document.id == document_id).first()
    if not doc:
        raise HTTPException(status_code=404, detail="Documento non trovato")

    db.execute(text("DELETE FROM chunks WHERE document_id = :id"), {"id": document_id})
    db.delete(doc)
    db.commit()

    return {"message": "Documento eliminato"}


# -------------------------
# DOSSIER
# -------------------------
@app.post("/dossier")
async def create_dossier(request: DossierRequest, db=Depends(get_db)):
    dossier = Dossier(nome=request.nome)
    db.add(dossier)
    db.commit()
    db.refresh(dossier)
    return {"dossier_id": dossier.id, "nome": dossier.nome}


@app.post("/dossier/{dossier_id}/upload")
async def upload_to_dossier(
    dossier_id: str, file: UploadFile = File(...), db=Depends(get_db)
):
    dossier = db.query(Dossier).filter(Dossier.id == dossier_id).first()
    if not dossier:
        raise HTTPException(status_code=404, detail="Dossier non trovato")

    file_path = f"{UPLOAD_DIR}/{file.filename}"
    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    doc = Document(
        filename=file.filename,
        file_path=file_path,
        status="uploaded",
        dossier_id=dossier_id,
    )
    db.add(doc)
    db.commit()
    db.refresh(doc)

    rag.index_dossier_document(file_path, db, doc.id)

    return {"message": "Documento caricato", "document_id": doc.id}


@app.get("/dossiers")
async def get_dossiers(db=Depends(get_db)):
    dossiers = db.query(Dossier).all()
    return {
        "dossiers": [
            {"id": d.id, "nome": d.nome, "created_at": d.created_at} for d in dossiers
        ]
    }


@app.get("/dossier/{dossier_id}/documents")
async def get_dossier_documents(dossier_id: str, db=Depends(get_db)):
    docs = db.query(Document).filter(Document.dossier_id == dossier_id).all()
    return {
        "documents": [
            {"id": d.id, "filename": d.filename, "created_at": d.created_at}
            for d in docs
        ]
    }


@app.post("/dossier/{dossier_id}/analyze")
async def analyze_dossier(dossier_id: str, db=Depends(get_db)):
    dossier = db.query(Dossier).filter(Dossier.id == dossier_id).first()
    if not dossier:
        raise HTTPException(status_code=404, detail="Dossier non trovato")

    result = dossier_analysis.analyze(dossier_id, db)
    return result
