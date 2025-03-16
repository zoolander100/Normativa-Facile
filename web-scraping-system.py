def extract_keywords(self, doc, num_keywords=10):
        """Estrae parole chiave dal documento"""
        # Rimuovi stopwords e punteggiatura
        words = [token.text.lower() for token in doc if not token.is_stop and not token.is_punct and token.is_alpha]
        
        # Conta frequenza delle parole
        word_freq = {}
        for word in words:
            if word in word_freq:
                word_freq[word] += 1
            else:
                word_freq[word] = 1
        
        # Ordina per frequenza
        sorted_words = sorted(word_freq.items(), key=lambda x: x[1], reverse=True)
        
        # Prendi le prime N parole
        return [word for word, freq in sorted_words[:num_keywords]]
    
    def simplify_text(self, text):
        """Semplifica il testo per renderlo più comprensibile"""
        # Divide il testo in frasi
        sentences = sent_tokenize(text)
        
        # Seleziona le frasi più importanti (per ora prendiamo le prime 5)
        important_sentences = sentences[:min(5, len(sentences))]
        
        # Ricostruisci il testo
        simplified = ' '.join(important_sentences)
        
        # Sostituisci termini tecnici con spiegazioni più semplici
        tech_terms = {
            'decreto legislativo': 'legge',
            'comma': 'punto',
            'ai sensi dell\'articolo': 'secondo la legge',
            'in deroga': 'come eccezione',
            'contributo a fondo perduto': 'finanziamento che non deve essere restituito',
            'agevolazione fiscale': 'sconto sulle tasse',
            'adempimento': 'obbligo',
            'a decorrere da': 'a partire da'
        }
        
        for term, simple in tech_terms.items():
            simplified = re.sub(r'\b' + re.escape(term) + r'\b', simple, simplified, flags=re.IGNORECASE)
        
        return simplified
    
    def generate_practical_case(self, document):
        """Genera un caso pratico basato sul documento"""
        # Un esempio di caso pratico generato
        practical_case = f"""
        Caso pratico: Applicazione della normativa "{document['titolo']}"
        
        Scenario:
        L'azienda XYZ, una piccola impresa con 15 dipendenti nel settore {document['categoria'].split('_')[0]}, 
        vuole accedere alle agevolazioni previste.
        
        Requisiti da soddisfare:
        1. Essere iscritta al registro delle imprese
        2. Avere sede legale in Italia
        3. Dimostrare la sostenibilità del progetto
        
        Passi da seguire:
        1. Compilare la domanda secondo il modello disponibile sul sito {document['fonte']}
        2. Allegare un business plan dettagliato
        3. Inviare la documentazione entro la scadenza prevista
        
        Benefici potenziali:
        - Accesso a finanziamenti fino a 100.000€
        - Riduzione del carico fiscale
        - Supporto nella digitalizzazione aziendale
        """
        
        return practical_case
    
    def process_all_documents(self, documents_df):
        """Elabora tutti i documenti nel database"""
        processed_docs = []
        
        for _, doc in documents_df.iterrows():
            try:
                processed_doc = self.process_document(doc.to_dict())
                processed_doc['caso_pratico'] = self.generate_practical_case(processed_doc)
                processed_docs.append(processed_doc)
                logger.info(f"Documento elaborato: {processed_doc['titolo']}")
            except Exception as e:
                logger.error(f"Errore durante l'elaborazione del documento: {str(e)}")
        
        return pd.DataFrame(processed_docs)
    
    def save_processed_docs(self, processed_df, filename="normative_elaborate.json"):
        """Salva i documenti elaborati in JSON"""
        processed_df.to_json(filename, orient='records', force_ascii=False, indent=4)
        logger.info(f"Documenti elaborati salvati in {filename}")


# Classe per la ricerca di video YouTube correlati
class YouTubeIntegrator:
    def __init__(self, api_key):
        self.api_key = api_key
        self.youtube_search_url = "https://www.googleapis.com/youtube/v3/search"
    
    def search_videos(self, query, max_results=5):
        """Cerca video correlati su YouTube"""
        params = {
            'part': 'snippet',
            'q': query,
            'type': 'video',
            'maxResults': max_results,
            'key': self.api_key,
            'regionCode': 'IT',
            'relevanceLanguage': 'it'
        }
        
        try:
            response = requests.get(self.youtube_search_url, params=params)
            response.raise_for_status()
            
            results = response.json()
            
            videos = []
            for item in results.get('items', []):
                video_id = item['id']['videoId']
                title = item['snippet']['title']
                description = item['snippet']['description']
                thumbnail = item['snippet']['thumbnails']['high']['url']
                
                videos.append({
                    'id': video_id,
                    'title': title,
                    'description': description,
                    'thumbnail': thumbnail,
                    'url': f"https://www.youtube.com/watch?v={video_id}"
                })
            
            return videos
            
        except Exception as e:
            logger.error(f"Errore durante la ricerca su YouTube: {str(e)}")
            return []
    
    def enrich_documents(self, documents_df):
        """Arricchisce i documenti con video correlati"""
        for idx, doc in documents_df.iterrows():
            try:
                # Crea una query basata sul titolo e categoria
                query = f"{doc['titolo']} {doc['categoria'].replace('_', ' ')} normativa"
                
                # Cerca video correlati
                videos = self.search_videos(query, max_results=3)
                
                # Aggiungi i video al documento
                documents_df.at[idx, 'video_correlati'] = videos
                
                logger.info(f"Aggiunti {len(videos)} video al documento: {doc['titolo']}")
                
            except Exception as e:
                logger.error(f"Errore durante l'integrazione dei video: {str(e)}")
        
        return documents_df


# Classe per l'integrazione di articoli di giornale
class NewsIntegrator:
    def __init__(self, api_key=None):
        self.api_key = api_key
        self.news_sources = [
            'https://www.ilsole24ore.com/rss/economia.xml',
            'https://www.corriere.it/rss/economia.xml',
            'https://www.repubblica.it/rss/economia/rss2.0.xml',
            'https://www.italiaoggi.it/rss/rss_economia.asp'
        ]
    
    def fetch_news(self):
        """Recupera articoli dai feed RSS"""
        all_articles = []
        
        for source in self.news_sources:
            try:
                response = requests.get(source, timeout=30)
                response.raise_for_status()
                
                soup = BeautifulSoup(response.text, 'xml')
                
                # Estrai gli articoli dal feed RSS
                items = soup.find_all('item')
                
                for item in items:
                    title = item.find('title').text if item.find('title') else "Titolo non disponibile"
                    link = item.find('link').text if item.find('link') else None
                    description = item.find('description').text if item.find('description') else "Descrizione non disponibile"
                    pub_date = item.find('pubDate').text if item.find('pubDate') else "Data non disponibile"
                    
                    if link:
                        all_articles.append({
                            'titolo': title,
                            'url': link,
                            'descrizione': description,
                            'data_pubblicazione': pub_date,
                            'fonte': source.split('/')[2]
                        })
                
                logger.info(f"Recuperati {len(items)} articoli da {source}")
                
            except Exception as e:
                logger.error(f"Errore durante il recupero degli articoli da {source}: {str(e)}")
        
        return all_articles
    
    def categorize_articles(self, articles, categories):
        """Categorizza gli articoli in base alle categorie definite"""
        categorized_articles = []
        
        for article in articles:
            # Analizza il testo dell'articolo con SpaCy
            doc = nlp(article['titolo'] + " " + article['descrizione'])
            
            # Determina la categoria più appropriata
            best_category = None
            max_score = 0
            
            for category in categories:
                # Calcola un punteggio di rilevanza per la categoria
                category_terms = category.split('_')
                score = sum(1 for term in category_terms if term.lower() in doc.text.lower())
                
                if score > max_score:
                    max_score = score
                    best_category = category
            
            if best_category and max_score > 0:
                article['categoria'] = best_category
                categorized_articles.append(article)
        
        return categorized_articles
    
    def enrich_documents(self, documents_df):
        """Arricchisce i documenti con articoli correlati"""
        # Recupera articoli
        articles = self.fetch_news()
        
        # Categorizza gli articoli
        categories = documents_df['categoria'].unique()
        categorized_articles = self.categorize_articles(articles, categories)
        
        # Associa articoli ai documenti in base alla categoria
        for idx, doc in documents_df.iterrows():
            try:
                # Trova articoli correlati per categoria
                related_articles = [article for article in categorized_articles if article['categoria'] == doc['categoria']]
                
                # Aggiungi gli articoli al documento
                documents_df.at[idx, 'articoli_correlati'] = related_articles[:3]  # Limita a 3 articoli per documento
                
                logger.info(f"Aggiunti {len(related_articles[:3])} articoli al documento: {doc['titolo']}")
                
            except Exception as e:
                logger.error(f"Errore durante l'integrazione degli articoli: {str(e)}")
        
        return documents_df


# Classe principale per il sistema
class NormativeSystem:
    def __init__(self, youtube_api_key=None):
        self.scraper = NormativeScraper()
        self.ai_processor = NormativeAIProcessor()
        self.youtube_integrator = YouTubeIntegrator(youtube_api_key) if youtube_api_key else None
        self.news_integrator = NewsIntegrator()
        self.database = None
        self.processed_database = None
    
    def run_full_pipeline(self, use_cached=False):
        """Esegue l'intero pipeline di elaborazione"""
        # 1. Scraping
        if use_cached and self.scraper.load_from_json():
            logger.info("Utilizzando dati di scraping precedentemente salvati")
            self.database = self.scraper.database
        else:
            logger.info("Avvio scraping delle fonti...")
            self.database = self.scraper.scrape_all_sources()
            self.scraper.save_to_json()
        
        # 2. Elaborazione AI
        logger.info("Avvio elaborazione AI dei documenti...")
        self.processed_database = self.ai_processor.process_all_documents(self.database)
        
        # 3. Integrazione YouTube (se configurato)
        if self.youtube_integrator:
            logger.info("Integrazione con video YouTube...")
            self.processed_database = self.youtube_integrator.enrich_documents(self.processed_database)
        
        # 4. Integrazione articoli di giornale
        logger.info("Integrazione con articoli di giornale...")
        self.processed_database = self.news_integrator.enrich_documents(self.processed_database)
        
        # 5. Salvataggio risultati
        self.ai_processor.save_processed_docs(self.processed_database)
        
        logger.info("Pipeline completata con successo")
        return self.processed_database
    
    def search_documents(self, query, category=None):
        """Cerca documenti in base a una query"""
        if self.processed_database is None:
            logger.error("Database non disponibile. Eseguire prima run_full_pipeline()")
            return []
        
        # Filtra per categoria se specificata
        if category:
            filtered_db = self.processed_database[self.processed_database['categoria'] == category]
        else:
            filtered_db = self.processed_database
        
        # Calcola punteggi di rilevanza
        results = []
        for _, doc in filtered_db.iterrows():
            # Calcola un punteggio semplice basato sulla presenza dei termini della query
            score = 0
            query_terms = query.lower().split()
            
            for term in query_terms:
                if term in doc['titolo'].lower():
                    score += 3  # Maggiore peso per i termini nel titolo
                if term in doc['riassunto'].lower():
                    score += 2  # Peso medio per i termini nel riassunto
                if term in doc['testo_semplificato'].lower():
                    score += 1  # Peso minore per i termini nel testo
            
            if score > 0:
                results.append((doc, score))
        
        # Ordina per punteggio
        results.sort(key=lambda x: x[1], reverse=True)
        
        # Restituisci i documenti ordinati
        return [doc for doc, _ in results]


# Esempio di utilizzo
if __name__ == "__main__":
    # Configura il sistema
    system = NormativeSystem(youtube_api_key="YOUR_YOUTUBE_API_KEY")
    
    # Esegui il pipeline completo
    processed_data = system.run_full_pipeline(use_cached=True)
    
    # Cerca documenti
    results = system.search_documents("incentivi startup digitali", category="startup_innovazione")
    
    # Stampa i risultati
    for i, doc in enumerate(results[:5], 1):
        print(f"{i}. {doc['titolo']}")
        print(f"   Riassunto: {doc['riassunto'][:100]}...")
        print(f"   URL: {doc['url']}")
        print()
