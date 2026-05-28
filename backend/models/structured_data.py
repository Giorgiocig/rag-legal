from langchain_core import BaseModel, Field
from typing import Optional


class DossierAnalysis(BaseModel):
    attore: Optional[str] = Field(None, description="Nome dell'attore")
    convenuto: Optional[str] = Field(None, description="Nome del convenuto")
    avvocato_attore: Optional[str] = Field(None, description="Avvocato dell'attore")
    avvocato_convenuto: Optional[str] = Field(
        None, description="Avvocato del convenuto"
    )
    giudice: Optional[str] = Field(None, description="Nome del giudice")
    indirizzo: Optional[str] = Field(None, description="Indirizzo immobile o cantiere")
    foro_competente: Optional[str] = Field(None, description="Foro competente")
    sezione_tribunale: Optional[str] = Field(None, description="Sezione del tribunale")
    totale_richiesto: Optional[str] = Field(
        None, description="Somma totale richiesta dall'attore"
    )
    domanda_riconvenzionale: Optional[str] = Field(
        None, description="Domanda riconvenzionale del convenuto"
    )

    esito: Optional[str] = Field(
        None, description="Esito della causa: vinto/perso/transatto/in corso"
    )
    motivazione: Optional[str] = Field(
        None, description="Motivazione sintetica della decisione"
    )
    punti_forza_attore: Optional[str] = Field(
        None, description="Punti di forza dell'attore"
    )
    punti_debolezza_attore: Optional[str] = Field(
        None, description="Punti di debolezza dell'attore"
    )
    punti_forza_convenuto: Optional[str] = Field(
        None, description="Punti di forza del convenuto"
    )
    punti_debolezza_convenuto: Optional[str] = Field(
        None, description="Punti di debolezza del convenuto"
    )
    sintesi_strategica: Optional[str] = Field(
        None, description="Sintesi strategica del caso in 1-2 frasi per un avvocato"
    )
