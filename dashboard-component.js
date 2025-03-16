import React, { useContext, useEffect, useState } from 'react';
import { UserContext } from '../context/UserContext';
import { Link, useHistory } from 'react-router-dom';
import './Dashboard.css';

function Dashboard() {
  const { user } = useContext(UserContext);
  const history = useHistory();
  const [latestNormative, setLatestNormative] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [savedItems, setSavedItems] = useState([]);
  const [userInterests, setUserInterests] = useState([]);
  
  useEffect(() => {
    // Reindirizza alla homepage se l'utente non è loggato
    if (!user) {
      history.push('/');
      return;
    }
    
    // Recupera normative recenti basate sugli interessi dell'utente
    const interests = user.interessi || [];
    setUserInterests(interests);
    
    // Carica normative recenti
    fetch('/api/latest')
      .then(response => response.json())
      .then(data => {
        setLatestNormative(data.results);
        setIsLoading(false);
      })
      .catch(error => {
        console.error('Errore durante il recupero delle normative:', error);
        setIsLoading(false);
      });
    
    // Carica elementi salvati dall'utente (simulati per ora)
    setSavedItems([
      {
        id: 123456,
        titolo: "Agevolazioni fiscali per startup innovative",
        categoria: "startup_innovazione",
        data: "2025-02-15"
      },
      {
        id: 789012,
        titolo: "Nuovi incentivi per la transizione digitale",
        categoria: "fisco_agevolazioni",
        data: "2025-01-30"
      }
    ]);
  }, [user, history]);
  
  if (isLoading) {
    return <div className="loading">Caricamento dashboard...</div>;
  }
  
  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <h1>Benvenuto, {user.nome || 'Utente'}</h1>
        <p>La tua dashboard personalizzata per rimanere aggiornato sulle normative italiane</p>
      </div>
      
      <div className="dashboard-grid">
        <div className="dashboard-section">
          <h2>Novità per te</h2>
          <div className="normative-list">
            {latestNormative.map(item => (
              <Link to={`/documento/${item.id}`} key={item.id} className="normative-card">
                <div className="normative-meta">
                  <span className="category-tag">{item.categoria.replace('_', ' ')}</span>
                  <span className="date">{new Date(item.data).toLocaleDateString('it-IT')}</span>
                </div>
                <h3>{item.titolo}</h3>
                <p>{item.riassunto}</p>
              </Link>
            ))}
          </div>
        </div>
        
        <div className="dashboard-section">
          <h2>I tuoi contenuti salvati</h2>
          {savedItems.length > 0 ? (
            <div className="saved-list">
              {savedItems.map(item => (
                <Link to={`/documento/${item.id}`} key={item.id} className="saved-item">
                  <h3>{item.titolo}</h3>
                  <div className="saved-meta">
                    <span className="category-tag">{item.categoria.replace('_', ' ')}</span>
                    <span className="date">{new Date(item.data).toLocaleDateString('it-IT')}</span>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <p className="empty-state">Non hai ancora salvato nessun contenuto</p>
          )}
        </div>
        
        <div className="dashboard-section">
          <h2>I tuoi interessi</h2>
          {userInterests.length > 0 ? (
            <div className="interests-grid">
              {userInterests.map(interest => (
                <Link to={`/cerca?category=${interest}`} key={interest} className="interest-tag">
                  {interest.replace('_', ' ')}
                </Link>
              ))}
            </div>
          ) : (
            <div className="empty-state">
              <p>Non hai ancora impostato i tuoi interessi</p>
              <Link to="/profilo" className="btn btn-sm">Aggiorna profilo</Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
