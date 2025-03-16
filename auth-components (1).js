import React, { useState, useContext } from 'react';
import { useHistory } from 'react-router-dom';
import { UserContext } from '../context/UserContext';
import './Auth.css';

export function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { setUser } = useContext(UserContext);
  const history = useHistory();
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);
    
    try {
      // In un'implementazione reale, qui ci sarebbe una chiamata API
      // Per ora simuliamo un login di successo
      
      // Simula un ritardo di rete
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const userData = {
        email,
        nome: 'Utente Demo',
        cognome: 'Test',
        azienda: 'Azienda Demo Srl',
        settore: 'tecnologia',
        dimensione: 'piccola',
        interessi: ['startup_innovazione', 'fisco_agevolazioni'],
        preferenze_notifiche: {
          email: true,
          push: false
        }
      };
      
      setUser(userData);
      history.push('/dashboard');
    } catch (err) {
      setError('Errore durante il login. Verifica email e password.');
      console.error('Errore login:', err);
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <div className="auth-container">
      <div className="auth-card">
        <h2>Accedi a NormaFacile</h2>
        <p className="auth-subtitle">Inserisci le tue credenziali per accedere</p>
        
        {error && <div className="error-message">{error}</div>}
        
        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="esempio@azienda.it"
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              placeholder="••••••••"
            />
          </div>
          
          <button type="submit" className="btn btn-full" disabled={isLoading}>
            {isLoading ? 'Accesso in corso...' : 'Accedi'}
          </button>
        </form>
        
        <div className="auth-links">
          <a href="/password-reset">Password dimenticata?</a>
          <a href="/registrazione">Non hai un account? Registrati</a>
        </div>
      </div>
    </div>
  );
}

export function Registration() {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    nome: '',
    cognome: '',
    azienda: '',
    settore: '',
    dimensione: 'piccola'
  });
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { setUser } = useContext(UserContext);
  const history = useHistory();
  
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    if (formData.password !== formData.confirmPassword) {
      setError('Le password non corrispondono');
      return;
    }
    
    setIsLoading(true);
    
    try {
      // In un'implementazione reale, qui ci sarebbe una chiamata API
      // Per ora simuliamo una registrazione di successo
      
      // Simula un ritardo di rete
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      const userData = {
        email: formData.email,
        nome: formData.nome,
        cognome: formData.cognome,
        azienda: formData.azienda,
        settore: formData.settore,
        dimensione: formData.dimensione,
        interessi: [],
        preferenze_notifiche: {
          email: true,
          push: false
        }
      };
      
      setUser(userData);
      history.push('/onboarding');
    } catch (err) {
      setError('Errore durante la registrazione. Riprova più tardi.');
      console.error('Errore registrazione:', err);
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <div className="auth-container">
      <div className="auth-card wide">
        <h2>Registrazione a NormaFacile</h2>
        <p className="auth-subtitle">Crea il tuo account per accedere a tutte le funzionalità</p>
        
        {error && <div className="error-message">{error}</div>}
        
        <form onSubmit={handleSubmit} className="auth-form">
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
                placeholder="Mario"
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
                placeholder="Rossi"
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
              placeholder="esempio@azienda.it"
            />
          </div>
          
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="password">Password</label>
              <input
                type="password"
                id="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                required
                placeholder="••••••••"
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="confirmPassword">Conferma Password</label>
              <input
                type="password"
                id="confirmPassword"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                required
                placeholder="••••••••"
              />
            </div>
          </div>
          
          <div className="form-group">
            <label htmlFor="azienda">Nome Azienda</label>
            <input
              type="text"
              id="azienda"
              name="azienda"
              value={formData.azienda}
              onChange={handleChange}
              required
              placeholder="La tua azienda Srl"
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
                required
              >
                <option value="">Seleziona un settore</option>
                <option value="tecnologia">Tecnologia</option>
                <option value="manifatturiero">Manifatturiero</option>
                <option value="servizi">Servizi</option>
                <option value="commercio">Commercio</option>
                <option value="agricoltura">Agricoltura</option>
                <option value="turismo">Turismo</option>
                <option value="altro">Altro</option>
              </select>
            </div>
            
            <div className="form-group">
              <label htmlFor="dimensione">Dimensione Azienda</label>
              <select
                id="dimensione"
                name="dimensione"
                value={formData.dimensione}
                onChange={handleChange}
                required
              >
                <option value="piccola">Piccola (1-10 dipendenti)</option>
                <option value="media">Media (11-50 dipendenti)</option>
                <option value="grande">Grande (51+ dipendenti)</option>
              </select>
            </div>
          </div>
          
          <button type="submit" className="btn btn-full" disabled={isLoading}>
            {isLoading ? 'Registrazione in corso...' : 'Registrati'}
          </button>
        </form>
        
        <div className="auth-links">
          <a href="/login">Hai già un account? Accedi</a>
        </div>
      </div>
    </div>
  );
}
