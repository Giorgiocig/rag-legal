import uuid
import re
import asyncio
from concurrent.futures import ThreadPoolExecutor

from langchain_text_splitters import RecursiveCharacterTextSplitter
from langchain_openai import OpenAIEmbeddings
from langchain_openai import ChatOpenAI
from langchain_core.prompts import ChatPromptTemplate
from langchain_core.output_parsers import StrOutputParser

from models.chunk import Chunk

from sqlalchemy import text

from llama_parse import LlamaParse
from helper.helper import parse_pdf


class RAGService:
    def __init__(self):
        self.embeddings = OpenAIEmbeddings(model="text-embedding-3-small")
        self.llm = ChatOpenAI(model="gpt-4o-mini")
        prompt = ChatPromptTemplate.from_messages(
            [
                (
                    "system",
                    """Sei un assistente legale. Rispondi basandoti SOLO sul contesto fornito.
        Alla fine della risposta aggiungi SEMPRE questa riga con i numeri degli articoli del contesto che hai usato per rispondere:
        ARTICOLI_USATI:X
        Esempio: se hai usato solo l'articolo 7 scrivi ARTICOLI_USATI:7
        Esempio: se hai usato articoli 2 e 5 scrivi ARTICOLI_USATI:2,5
        NON inventare articoli non presenti nel contesto.""",
                ),
                ("human", "Contesto:\n{context}\n\nDomanda: {question}"),
            ]
        )
        self.chain = prompt | self.llm | StrOutputParser()
        self.parser = LlamaParse(
            api_key="llx-Jsvp2FrwF2pPEfhfUrrDa1OdvKj4nNORM4VjBpaJ758hI1X0",
            result_type="markdown",
        )

    def load_pdf(self, file_path: str):
        with ThreadPoolExecutor() as executor:
            future = executor.submit(
                parse_pdf,
                file_path,
                "llx-Jsvp2FrwF2pPEfhfUrrDa1OdvKj4nNORM4VjBpaJ758hI1X0",
            )
            documents = future.result()
            print(f"Documents: {documents}")

        return [{"page": i + 1, "text": doc.text} for i, doc in enumerate(documents)]

    def chunk_pages(self, pages):
        splitter = RecursiveCharacterTextSplitter(chunk_size=800, chunk_overlap=100)

        chunks = []

        for p in pages:
            split = splitter.split_text(p["text"])

            for i, c in enumerate(split):
                chunks.append({"content": c, "page": p["page"], "chunk_index": i})

        return chunks

    def split_by_articles(self, text):
        sections = re.split(r"\n(?=#{1,3}\s)", text)

        articles = []
        for i, content in enumerate(sections):
            content = content.strip()
            if not content:
                continue

            title_match = re.search(
                r"#{1,3}\s*(?:Art(?:icolo|\.)?\s*)?(\d+)", content, re.IGNORECASE
            )
            section_number = title_match.group(1) if title_match else None

            if not section_number:
                continue

            # Article subsection
            sub_sections = re.split(r"\n(?=\d+\.\d+\s)", content)

            if len(sub_sections) == 1:
                articles.append({"article": section_number, "content": content})
            else:
                articles.append({"article": section_number, "content": sub_sections[0]})
                for sub in sub_sections[1:]:
                    sub_match = re.search(r"(\d+\.\d+)", sub)
                    sub_number = sub_match.group(1) if sub_match else None
                    if sub_number:
                        articles.append({"article": sub_number, "content": sub})

        return articles

    def index_dossier_document(self, file_path: str, db, document_id: str):
        pages = self.load_pdf(file_path)
        full_text = "\n".join([p["text"] for p in pages])

        splitter = RecursiveCharacterTextSplitter(chunk_size=800, chunk_overlap=100)
        chunks = splitter.split_text(full_text)

        for idx, content in enumerate(chunks):
            embedding = self.embeddings.embed_query(content)
            chunk = Chunk(
                id=str(uuid.uuid4()),
                document_id=document_id,
                content=content,
                article=None,
                page=1,
                chunk_index=idx,
                embedding=embedding,
            )
            db.add(chunk)

        db.commit()

    def index_document(self, file_path: str, db, document_id: str):

        # LOAD PDF
        pages = self.load_pdf(file_path)

        # unisci testo pagine
        full_text = "\n".join([p["text"] for p in pages])

        # SPLIT ARTICLES
        articles = self.split_by_articles(full_text)

        # SAVE ARTICLES
        for idx, article_data in enumerate(articles):

            content = article_data["content"]
            article_number = article_data["article"]

            # embedding articolo intero
            embedding = self.embeddings.embed_query(content)

            chunk = Chunk(
                id=str(uuid.uuid4()),
                document_id=document_id,
                content=content,
                article=article_number,
                page=1,  # miglioriamo dopo
                chunk_index=idx,
                embedding=embedding,
            )

            db.add(chunk)

        db.commit()

    def extract_article_number(self, query: str):
        match = re.search(r"art(?:icolo|\.)?\s*(\d+)", query, re.IGNORECASE)

        if match:
            return match.group(1)

        return None

    def query(self, question: str, db, document_id: str):
        article_number = self.extract_article_number(question)
        results = []

        if article_number:
            sql = text("""
                SELECT content, page, article
                FROM chunks
                WHERE article = :article AND document_id = :document_id
                LIMIT 5;
            """)
            results = db.execute(
                sql, {"article": article_number, "document_id": document_id}
            ).fetchall()

        if len(results) == 0:
            query_embedding = self.embeddings.embed_query(question)
            sql = text("""
                SELECT content, page, article,
                    embedding <-> CAST(:query_embedding AS vector) AS distance
                FROM chunks
                WHERE document_id = :document_id
                ORDER BY distance ASC
                LIMIT 5;
            """)
            results = db.execute(
                sql, {"query_embedding": query_embedding, "document_id": document_id}
            ).fetchall()

        context = "\n\n".join([r.content for r in results])
        return self.chain.stream({"context": context, "question": question}), results
