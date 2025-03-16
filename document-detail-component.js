import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import './DocumentDetail.css';

function DocumentDetail() {
  const { docId } = useParams();
  const [document, setDocument] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaved, setIsSaved] = useState(false);
  const [activeTab, setActiveTab] = useState('semplificato');
  
  useEffect(() => {
    // Recupera i dettagli del documento
    fetch(`/api/document/${docId}`)
      .then(response => {
        if (!response.ok) {
          throw new Error('Documento non trovato');
        }
        return response.json();
      })
      .then(data => {
        setDocument(data);
        setIsLoading(false);
        
        // Controlla se il documento è salvato (simulato)
        const savedDocs = JSON.parse(localStorage.getItem('savedDocuments') || '[]');
        setIsSaved(savedDocs.includes(Number(docId)));
      })
      .catch(error => {
        console.error('Errore durante il recupero del documento:', error);
        setIsLoading(false);
      });
  }, [docId]);
  
  const toggleSave = () => {
    const savedDocs = JSON.parse(localStorage.getItem('savedDocuments') || '[]');
    
    if (isSaved) {
      // Rimuovi dai salvati
      const newSavedDocs = savedDocs.filter(id => id !== Number(docId));
      localStorage.setItem('savedDocuments', JSON.stringify(newSavedDocs));
    } else {
      // Aggiungi ai salvati
      savedDocs.push(Number(docId));
      localStorage.setItem('savedDocuments', JSON.stringify(savedDocs));
    }
    
    setIsSaved(!isSaved);
  };
  
  if (isLoading) {
    return <div className="loading">Caricamento documento...</div>;
  }
  
  if (!document) {
    return (
      <div className="error-state">
        <h2>Documento non trovato</h2>
        <p>Il documento richiesto non è disponibile o non esiste.</p>
        <Link to="/" className="btn">Torna alla Home</Link>
      </div>
    );
  }
  
  return (
    <div className="document-detail">
      <div className="document-header">
        <span className="category-tag">{document.categoria.replace('_', ' ')}</span>
        <h1>{document.titolo}</h1>
        <div className="document-meta">
          <span className="source">Fonte: {document.fonte}</span>
          <span className="date">Data: {new Date(document.data).toLocaleDateString('it-IT')}</span>
        </div>
        <div className="document-actions">
          <button className={`btn-save ${isSaved ? 'saved' : ''}`} onClick={toggleSave}>
            {isSaved ? 'Salvato ✓' : 'Salva'}
          </button>
          <a href={document.url} target="_blank" rel="noopener noreferrer" className="btn btn-outline">
            Vedi originale
          </a>
        </div>
      </div>
      
      <div className="document-tabs">
        <button 
          className={`tab ${activeTab === 'semplificato' ? 'active' : ''}`}
          onClick={() => setActiveTab('semplificato')}
        >
          Versione semplificata
        </button>
        <button 
          className={`tab ${activeTab === 'riassunto' ? 'active' : ''}`}
          onClick={() => setActiveTab('riassunto')}
        >
          Riassunto
        </button>
        <button 
          className={`tab ${activeTab === 'caso' ? 'active' : ''}`}
          onClick={() => setActiveTab('caso')}
        >
          Caso pratico
        </button>
      </div>
      
      <div className="document-content">
        {activeTab === 'semplificato' && (
          <div className="text-content">{document.testo_semplificato}</div>
        )}
        {activeTab === 'riassunto' && (
          <div className="text-content">{document.riassunto}</div>
        )}
        {activeTab === 'caso' && (
          <div className="text-content">{document.caso_pratico}</div>
        )}
      </div>
      
      <div className="document-keywords">
        <h3>Parole chiave</h3>
        <div className="keywords-list">
          {document.parole_chiave.map((keyword, index) => (
            <Link to={`/cerca?q=${keyword}`} key={index} className="keyword-tag">
              {keyword}
            </Link>
          ))}
        </div>
      </div>
      
      {document.video_correlati && document.video_correlati.length > 0 && (
        <div className="related-videos">
          <h3>Video correlati</h3>
          <div className="videos-grid">
            {document.video_correlati.map((video, index) => (
              <a 
                href={video.url} 
                target="_blank" 
                rel="noopener noreferrer" 
                key={index} 
                className="video-card"
              >
                <div className="video-thumbnail">
                  <img src={video.thumbnail} alt={video.title} />
                </div>
                <h4>{video.title}</h4>
              </a>
            ))}
          </div>
        </div>
      )}
      
      {document.articoli_correlati && document.articoli_correlati.length > 0 && (
        <div className="related-articles">
          <h3>Articoli correlati</h3>
          <div className="articles-list">
            {document.articoli_correlati.map((article, index) => (
              <a 
                href={article.url} 
                target="_blank" 
                rel="noopener noreferrer" 
                key={index} 
                className="article-card"
              >
                <h4>{article.titolo}</h4>
                <p>{article.descrizione}</p>
                <div className="article-meta">
                  <span className="source">{article.fonte}</span>
                  <span className="date">{new Date(article.data_pubblicazione).toLocaleDateString('it-IT')}</span>
                </div>
              </a>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default DocumentDetail;
