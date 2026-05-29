from langchain_openai import ChatOpenAI
from langchain_core.prompts import ChatPromptTemplate
from langchain_core.output_parsers import StrOutputParser
from sqlalchemy import text
import json


class DossierAnalysis:
    def __init__(self):
        self.llm = ChatOpenAI(model="gpt-4o-mini", temperature=0)

        self.map_prompt = ChatPromptTemplate.from_messages(
            [
                (
                    "system",
                    """Sei un assistente legale. Dal seguente documento estrai queste informazioni in formato JSON:
                    - subjects: soggetti coinvolti e ruoli (attore, convenuto, avvocati, giudice)
                    - logistics: dati logistici (indirizzo, foro competente, sezione tribunale)
                    - petitum: somme richieste e domande riconvenzionali
                    - strategy: esito della causa, motivazione della decisione, punti di forza e debolezza di ogni parte, sintesi strategica

            Restituisci SOLO il JSON, niente altro. Se un campo non è presente nel documento usa null.""",
                ),
                ("human", "Documento:\n{document}"),
            ]
        )

        self.reduce_prompt = ChatPromptTemplate.from_messages(
            [
                (
                    "system",
                    """Sei un assistente legale. Aggrega le informazioni dai documenti.
                        REGOLE FONDAMENTALI:
                        1. Usa ESATTAMENTE questi nomi di campo: attore, convenuto, avvocato_attore, avvocato_convenuto, giudice, indirizzo, foro_competente, sezione_tribunale, totale_richiesto, domanda_riconvenzionale, esito, motivazione, punti_forza_attore, punti_debolezza_attore, punti_forza_convenuto, punti_debolezza_convenuto, sintesi_strategica
                        2. NON lasciare null un campo se l'informazione è presente in almeno uno dei documenti
                        3. In caso di conflitto tra documenti, usa l'informazione più recente o più completa
                        4. Tutti i valori devono essere stringhe semplici, mai oggetti o array
                        5. La sintesi_strategica deve essere sempre presente — sintetizza il caso in 1-2 frasi anche se hai informazioni parziali
                        6. Per esito usa: 'vinto', 'perso', 'transatto', 'in corso' — se non è chiaro dalla documentazione scrivi 'in corso'

                        Tutti i valori devono essere stringhe semplici. Se un campo non è presente usa null.""",
                ),
                ("human", "Informazioni estratte dai documenti:\n{partial_results}"),
            ]
        )

        self.map_chain = self.map_prompt | self.llm | StrOutputParser()
        self.reduce_chain = self.reduce_prompt | self.llm.with_structured_output(
            DossierAnalysis
        )

    def analyze(self, dossier_id: str, db):
        sql = text("""
            SELECT d.id, d.filename, c.content
            FROM documents d
            JOIN chunks c ON c.document_id = d.id
            WHERE d.dossier_id = :dossier_id
            ORDER BY d.id, c.chunk_index;
        """)
        rows = db.execute(sql, {"dossier_id": dossier_id}).fetchall()

        documents = {}
        for row in rows:
            if row.id not in documents:
                documents[row.id] = {"filename": row.filename, "content": ""}
            documents[row.id]["content"] += "\n" + row.content

        partial_results = []
        for doc in documents.values():
            result = self.map_chain.invoke({"document": doc["content"]})
            partial_results.append(f"Da '{doc['filename']}':\n{result}")

        combined = "\n\n".join(partial_results)
        final_result = self.reduce_chain.invoke({"partial_results": combined})

        return final_result
