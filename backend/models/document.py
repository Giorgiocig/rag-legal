import uuid
from sqlalchemy import Column, String, DateTime
from datetime import datetime
from db.base import Base


class Document(Base):
    __tablename__ = "documents"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    filename = Column(String)
    file_path = Column(String)
    status = Column(String, default="uploaded")
    created_at = Column(DateTime, default=datetime.utcnow)
    dossier_id = Column(String, nullable=True)
