from pydantic import BaseModel


class DossierRequest(BaseModel):
    nome: str
