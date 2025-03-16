// ProfilePage.js
import React, { useState, useEffect, useContext } from 'react';
import { UserContext } from '../context/UserContext';
import { useHistory } from 'react-router-dom';
import './ProfilePage.css';

function ProfilePage() {
  const { user, setUser } = useContext(UserContext);
  const history = useHistory();
  const [formData, setFormData] = useState({
    nome: '',
    cognome: '',
    email: '',
    azienda: '',
    settore: '',
    dimensione: '',
    interessi: [],
    preferenze_notifiche: {
      email: true,
      push: false
    }
  });
  const [isLoading, setIsLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [error, setError] = useState('');
  
  useEffect(() => {
    if (!user) {
      history.push('/login');
      return;
    }
    
    // Popola i dati del form con quelli dell'utente
    setFormData({
      nome: user.nome || '',
      cognome: user.cognome || '',
      email: user.email || '',
      azienda: user.azienda || '',
      settore: user.settore || '',
      dimensione: user.dimensione || '',
      interessi: user.interessi || [],
      preferenze_notifiche: user.preferenze_notifiche || {
        email: true,
        push: false
      }
    });
  }, [user, history]);
  
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };
  
  const handleInterestToggle = (interest) => {
    setFormData(prev => {
      const interessi = [...prev.interessi];
      
      if (interessi.includes(interest)) {
        // Rimuovi interesse
        return {
          ...prev,
          interessi: interessi.filter(i => i !== interest)
        };
      } else {
        // Aggiungi interesse
        return {
          ...prev,
          interessi: [...interessi, interest]
        };
      }
    });
  };
  
  const handleNotificationToggle = (type) => {
    setFormData(prev => ({
      ...prev,
      preferenze_notifiche: {
        ...prev.preferenze_notifiche,
        [type]: !prev.preferenze_notifiche[type]
      }
    }));
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    setSuccessMessage('');
    
    try {
      // In una implementazione reale, qui ci sarebbe una chiamata API
      // Per ora simuliamo un aggiornamento di successo
      
      // Simula un ritardo di rete
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Aggiorna lo stato utente
      setUser({
        ...user,
        ...formData
      });
      
      setSuccessMessage('Profilo aggiornato con successo!');
      
      // Nascondi il messaggio dopo 3 secondi
      setTimeout(() => {
        setSuccessMessage('');
      }, 3000);
    } catch (err) {
      setError('Si è verificato un errore durante l\'aggiornamento del profilo');
      console.error('Errore aggiornamento profilo:', err);
    } finally {
      setIsLoading(false);
    }
  };

  // Array di settori disponibili
  const settoriDisponibili = [
    'Tecnologia',
    'Manifattura',
    'Servizi',
    'Commercio',
    'Agricoltura',
    'Edilizia',
    'Turismo',
    'Sanità'
  ];

  // Array di interessi normativi disponibili
  const interessiDisponibili = [
    'startup_innovazione',
    'fisco_agevolazioni',
    'lavoro_contratti',
    'ambiente_sostenibilita',
    'importexport_esteri',
    'privacy_gdpr',
    'sicurezza_lavoro',
    'appalti_pubblici'
  ];

  // Mappa per il testo visualizzato degli interessi
  const interessiLabels = {
    'startup_innovazione': 'Startup e Innovazione',
    'fisco_agevolazioni': 'Fisco e Agevolazioni',
    'lavoro_contratti': 'Lavoro e Contratti',
    'ambiente_sostenibilita': 'Ambiente e Sostenibilità',
    'importexport_esteri': 'Import/Export',
    'privacy_gdpr': 'Privacy e GDPR',
    'sicurezza_lavoro': 'Sicurezza sul Lavoro',
    'appalti_pubblici': 'Appalti Pubblici'
  };

  // Opzioni per la dimensione dell'azienda
  const dimensioniAzienda = [
    'Micro (< 10 dipendenti)',
    'Piccola (10-49 dipendenti)',
    'Media (50-249 dipendenti)',
    'Grande (250+ dipendenti)'
  ];
  
  return (
    <div className="profile-container">
      <h1>Il tuo profilo</h1>
      <p className="profile-subtitle">Personalizza le tue preferenze per ricevere normative rilevanti per la tua attività</p>
      
      {successMessage && (
        <div className="success-message">{successMessage}</div>
      )}
      
      {error && (
        <div className="error-message">{error}</div>
      )}
      
      <form onSubmit={handleSubmit}>
        <div className="form-section">
          <h2>Informazioni personali</h2>
          
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="nome">Nome</label>
              <input
                type="text"
                id="nome"
                name="nome"
                value={formData.nome}
                onChange={handleChange}
                required
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="cognome">Cognome</label>
              <input
                type="text"
                id="cognome"
                name="cognome"
                value={formData.cognome}
                onChange={handleChange}
                required
              />
            </div>
          </div>
          
          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
            />
          </div>
        </div>
        
        <div className="form-section">
          <h2>Informazioni aziendali</h2>
          
          <div className="form-group">
            <label htmlFor="azienda">Nome azienda</label>
            <input
              type="text"
              id="azienda"
              name="azienda"
              value={formData.azienda}
              onChange={handleChange}
            />
          </div>
          
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="settore">Settore</label>
              <select
                id="settore"
                name="settore"
                value={formData.settore}
                onChange={handleChange}
              >
                <option value="">Seleziona un settore</option>
                {settoriDisponibili.map(settore => (
                  <option key={settore} value={settore}>{settore}</option>
                ))}
              </select>
            </div>
            
            <div className="form-group">
              <label htmlFor="dimensione">Dimensione azienda</label>
              <select
                id="dimensione"
                name="dimensione"
                value={formData.dimensione}
                onChange={handleChange}
              >
                <option value="">Seleziona dimensione</option>
                {dimensioniAzienda.map(dim => (
                  <option key={dim} value={dim}>{dim}</option>
                ))}
              </select>
            </div>
          </div>
        </div>
        
        <div className="form-section">
          <h2>Aree normative di interesse</h2>
          <p>Seleziona le aree di interesse per ricevere aggiornamenti personalizzati</p>
          
          <div className="interests-container">
            {interessiDisponibili.map(interesse => (
              <div 
                key={interesse} 
                className={`interest-tag ${formData.interessi.includes(interesse) ? 'selected' : ''}`}
                onClick={() => handleInterestToggle(interesse)}
              >
                {interessiLabels[interesse]}
              </div>
            ))}
          </div>
        </div>
        
        <div className="form-section">
          <h2>Preferenze di notifica</h2>
          
          <div className="toggle-container">
            <label className="toggle-label">
              <span>Notifiche via email</span>
              <div 
                className={`toggle ${formData.preferenze_notifiche.email ? 'active' : ''}`}
                onClick={() =>