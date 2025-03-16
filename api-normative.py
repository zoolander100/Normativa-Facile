from flask import Flask, request, jsonify
from flask_cors import CORS
import pandas as pd
import json
import logging
from normative_system import NormativeSystem

# Configurazione logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

app = Flask(__name__)
CORS(app)  # Abilita CORS per tutte le rotte

# Istanza del sistema di normative
system = NormativeSystem(youtube_api_key="YOUR_YOUTUBE_API_KEY")

# Carica il database all'avvio
try:
    system.run_full_pipeline(use_cached=True)
    logger.info("Database caricato con successo")
except Exception as e:
    logger.error(f"Errore durante il caricamento del database: {str(e)}")


@app.route('/api/categories', methods=['GET'])
def get_categories():
    """Restituisce le categorie disponibili"""
    categories = [
        {
            "id": "startup_innovazione",
            "name": "Start-up e Innovazione",
            "icon": "🚀",
            "description": "Incentivi, fondi e requisiti per start-up innovative e progetti tecnologici."
        },
        {
            "id": "fisco_agevolazioni",
            "name": "Fisco e Agevolazioni",
            "icon": "💰",
            "description": "Agevolazioni fiscali, crediti d'imposta e incentivi economici per le imprese."
        },
        {
            "id": "lavoro_contratti",
            "name": "Lavoro e Contratti",
            "icon": "👔",
            "description": "Normative sul lavoro, contratti, assunzioni e formazione professionale."
        },
        {
            "id": "ambiente_sostenibilita",
            "name": "Ambiente e Sostenibilità",
            "icon": "🌱",
            "description": "Incentivi per la sostenibilità, economia circolare e transizione ecologica."
        },
        {
            "id": "importexport_esteri",
            "name": "Import/Export e Mercati Esteri",
            "icon": "🌍",
            "description": "Normative doganali, incentivi all'export e internazionalizzazione."
        }
    ]
    
    return jsonify({"categories": categories})


@app.route('/api/search', methods=['GET'])
def search_normative():
    """Cerca normative in base a query e categoria"""
    query = request.args.get('q', '')
    category = request.args.get('category', None)
    
    if not query:
        return jsonify({"error": "Parametro di ricerca mancante"}), 400
    
    try:
        results = system.search_documents(query, category)
        
        # Formatta i risultati
        formatted_results = []
        for doc in results:
            formatted_doc = {
                "id": hash(doc['titolo']),  # Genera un ID univoco
                "titolo": doc['titolo'],
                "categoria": doc['categoria'],
                "fonte": doc['fonte'],
                "data": doc['data'],
                "riassunto": doc['riassunto'],
                "url": doc['url'],
                "caso_pratico": doc.get('caso_pratico', ''),
                "video_correlati": doc.get('video_correlati', [])[:2],  # Limita a 2 video
                "articoli_correlati": doc.get('articoli_correlati', [])[:2]  # Limita a 2 articoli
            }
            formatted_results.append(formatted_doc)
        
        return jsonify({
            "results": formatted_results,
            "count": len(formatted_results),
            "query": query,
            "category": category
        })
        
    except Exception as e:
        logger.error(f"Errore durante la ricerca: {str(e)}")
        return jsonify({"error": "Errore durante la ricerca"}), 500


@app.route('/api/document/<int:doc_id>', methods=['GET'])
def get_document(doc_id):
    """Ottiene i dettagli di un documento specifico"""
    try:
        # Trova il documento con l'ID specificato
        for _, doc in system.processed_database.iterrows():
            if hash(doc['titolo']) == doc_id:
                # Formatta il documento
                formatted_doc = {
                    "id": doc_id,
                    "titolo": doc['titolo'],
                    "categoria": doc['categoria'],
                    "fonte": doc['fonte'],
                    "data": doc['data'],
                    "riassunto": doc['riassunto'],
                    "testo_semplificato": doc['testo_semplificato'],
                    "caso_pratico": doc.get('caso_pratico', ''),
                    "url": doc['url'],
                    "parole_chiave": doc.get('parole_chiave', []),
                    "video_correlati": doc.get('video_correlati', []),
                    "articoli_correlati": doc.get('articoli_correlati', [])
                }
                return jsonify(formatted_doc)
        
        return jsonify({"error": "Documento non trovato"}), 404
        
    except Exception as e:
        logger.error(f"Errore durante il recupero del documento: {str(e)}")
        return jsonify({"error": "Errore durante il recupero del documento"}), 500


@app.route('/api/latest', methods=['GET'])
def get_latest_normative():
    """Ottiene le normative più recenti per categoria"""
    category = request.args.get('category', None)
    
    try:
        if category:
            # Filtra per categoria
            filtered_db = system.processed_database[system.processed_database['categoria'] == category]
        else:
            filtered_db = system.processed_database
        
        # Ordina per data (assumendo che la data sia in formato stringa)
        # In un'implementazione reale, convertirei prima la data in datetime
        sorted_db = filtered_db.sort_values(by='data', ascending=False)
        
        # Prendi i primi 5 risultati
        latest = sorted_db.head(5)
        
        # Formatta i risultati
        formatted_results = []
        for _, doc in latest.iterrows():
            formatted_doc = {
                "id": hash(doc['titolo']),
                "titolo": doc['titolo'],
                "categoria": doc['categoria'],
                "fonte": doc['fonte'],
                "data": doc['data'],
                "riassunto": doc['riassunto'][:150] + "...",  # Limita lunghezza
                "url": doc['url']
            }
            formatted_results.append(formatted_doc)
        
        return jsonify({
            "results": formatted_results,
            "count": len(formatted_results),
            "category": category
        })
        
    except Exception as e:
        logger.error(f"Errore durante il recupero delle normative recenti: {str(e)}")
        return jsonify({"error": "Errore durante il recupero delle normative recenti"}), 500


@app.route('/api/profile', methods=['POST'])
def save_profile():
    """Salva il profilo utente"""
    data = request.json
    
    if not data or not data.get('email'):
        return jsonify({"error": "Dati profilo incompleti"}), 400
    
    try:
        # In un'implementazione reale, salverei il profilo in un database
        # Per ora, simulo un salvataggio di successo
        profile_data = {
            "email": data.get('email'),
            "nome": data.get('nome', ''),
            "cognome": data.get('cognome', ''),
            "azienda": data.get('azienda', ''),
            "settore": data.get('settore', ''),
            "dimensione": data.get('dimensione', ''),
            "interessi": data.get('interessi', []),
            "preferenze_notifiche": data.get('preferenze_notifiche', {})
        }
        
        # Simula un ID profilo
        profile_id = hash(profile_data['email'])
        
        return jsonify({
            "success": True,
            "profile_id": profile_id,
            "message": "Profilo salvato con successo"
        })
        
    except Exception as e:
        logger.error(f"Errore durante il salvataggio del profilo: {str(e)}")
        return jsonify({"error": "Errore durante il salvataggio del profilo"}), 500


@app.route('/api/analyze', methods=['POST'])
def analyze_text():
    """Analizza un testo normativo fornito dall'utente"""
    data = request.json
    
    if not data or not data.get('text'):
        return jsonify({"error": "Testo da analizzare mancante"}), 400
    
    try:
        # Simula l'analisi del testo tramite AI
        text = data.get('text')
        
        # In un'implementazione reale, userei il modello AI
        # Per ora, restituisco un'analisi simulata
        analysis = {
            "riassunto": "Riassunto simulato del testo fornito...",
            "testo_semplificato": "Versione semplificata del testo...",
            "parole_chiave": ["parola1", "parola2", "parola3"],
            "temi_principali": ["tema1", "tema2"],
            "documentazione_correlata": [
                {"titolo": "Documento correlato 1", "url": "#"},
                {"titolo": "Documento correlato 2", "url": "#"}
            ]
        }
        
        return jsonify({
            "success": True,
            "analysis": analysis
        })
        
    except Exception as e:
        logger.error(f"Errore durante l'analisi del testo: {str(e)}")
        return jsonify({"error": "Errore durante l'analisi del testo"}), 500


if __name__ == '__main__':
    app.run(debug=True)
