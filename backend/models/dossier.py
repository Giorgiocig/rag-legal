import uuid
from sqlalchemy import Column, String, DateTime
from datetime import datetime
from db.base import Base


class Dossier(Base):
    __tablename__ = "dossier"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    nome = Column(String)
    created_at = Column(DateTime, default=datetime.utcnow)
