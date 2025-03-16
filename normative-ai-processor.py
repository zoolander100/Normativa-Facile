import logging
import re
import pandas as pd
import requests
from bs4 import BeautifulSoup
import spacy
import numpy as np
from datetime import datetime

# Carica il modello italiano di spaCy
try:
    nlp = spacy.load("it_core_news_lg")  # Modello italiano di dimensioni maggiori
except:
    # Fallback al modello più piccolo se quello grande non è disponibile
    nlp = spacy.load("it_core_news_sm")

# Configurazione logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

class NormativeScraper:
    """Classe per lo scraping delle normative da fonti ufficiali"""
    
    def __init__(self):
        self.database = pd.DataFrame()
        self.sources = [
            {
                "name": "Gazzetta Ufficiale",
                "url": "https://www.gazzettaufficiale.it/ricerca/api/sommario",
                "type": "official"
            },
            {
                "name": "Ministero dello Sviluppo Economico",
                "url": "https://www.mise.gov.it/it/normativa",
                "type": "ministry"
            },
            {
                "name": "Agenzia delle Entrate",
                "url": "https://www.agenziaentrate.gov.it/portale/normativa-e-prassi/normativa",
                "type": "agency"
            },
            {
                "name": "InfoCamere",
                "url": "https://www.infocamere.it/normativa",
                "type": "chamber"
            },
            {
                "name": "INPS",
                "url": "https://www.inps.it/normativa",
                "type": "institute"
            }
        ]
    
    def scrape_all_sources(self):
        """Esegue lo scraping di tutte le fonti configurate"""
        all_data = []
        
        for source in self.sources:
            try:
                logger.info(f"Scraping da {source['name']}...")
                
                # Qui andrebbe implementato lo scraping effettivo
                # Per semplicità, generiamo dati di esempio
                sample_data = self.generate_sample_data(source)
                all_data.extend(sample_data)
                
                logger.info(f"Recuperati {len(sample_data)} documenti da {source['name']}")
                
            except Exception as e:
                logger.error(f"Errore durante lo scraping di {source['name']}: {str(e)}")
        
        # Converti in DataFrame
        self.database = pd.DataFrame(all_data)
        
        return self.database
    
    def generate_sample_data(self, source):
        """Genera dati di esempio per simulare lo scraping"""
        categories = [
            "startup_innovazione", 
            "fisco_agevolazioni", 
            "lavoro_contratti", 
            "ambiente_sostenibilita", 
            "importexport_esteri"
        ]
        
        num_docs = np.random.randint(5, 15)  # Genera tra 5 e 15 documenti
        
        sample_data = []
        for i in range(num_docs):
            category = np.random.choice(categories)
            
            # Genera titoli in base alla categoria
            if category == "startup_innovazione":
                title_prefixes = ["Decreto Legge ", "Incentivi per ", "Piano Nazionale per "]
                title_subjects = ["startup innovative", "imprese tecnologiche", "digitalizzazione PMI"]
            elif category == "fisco_agevolazioni":
                title_prefixes = ["Decreto Fiscale ", "Agevolazioni ", "Credito d'imposta per "]
                title_subjects = ["PMI", "investimenti", "ricerca e sviluppo"]
            elif category == "lavoro_contratti":
                title_prefixes = ["Decreto Lavoro ", "Normativa sui ", "Regolamento per "]
                title_subjects = ["contratti di lavoro", "apprendistato", "formazione professionale"]
            elif category == "ambiente_sostenibilita":
                title_prefixes = ["Decreto Ambiente ", "Incentivi per ", "Normativa sulla "]
                title_subjects = ["economia circolare", "transizione ecologica", "efficienza energetica"]
            else:  # importexport_esteri
                title_prefixes = ["Decreto per ", "Regolamento sulle ", "Normativa per "]
                title_subjects = ["esportazioni", "dogane", "internazionalizzazione PMI"]
            
            title_prefix = np.random.choice(title_prefixes)
            title_subject = np.random.choice(title_subjects)
            title = f"{title_prefix}{title_subject}"
            
            # Genera date di pubblicazione degli ultimi 6 mesi
            year = 2025 if np.random.random() < 0.3 else 2024
            month = np.random.randint(1, 13)
            day = np.random.randint(1, 29)
            date = f"{year}-{month:02d}-{day:02d}"
            
            # Genera testo di esempio
            text = f"""
            {title}
            
            Art. 1
            Finalità e ambito di applicazione
            
            Il presente decreto stabilisce le modalità di attuazione degli incentivi previsti per {title_subject}, 
            con particolare riferimento alle condizioni di accesso, ai