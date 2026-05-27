import uuid
from sqlalchemy import Column, String, Integer, Text, ForeignKey
from sqlalchemy.dialects.postgresql import UUID
from pgvector.sqlalchemy import Vector

from db.base import Base


class Chunk(Base):
    __tablename__ = "chunks"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    document_id = Column(String, ForeignKey("documents.id"))

    content = Column(Text)
    page = Column(Integer)
    chunk_index = Column(Integer)
    article = Column(String)

    embedding = Column(Vector(1536))
