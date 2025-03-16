// App.js - Componente principale
import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Route, Switch } from 'react-router-dom';
import Header from './components/Header';
import Footer from './components/Footer';
import LandingPage from './pages/LandingPage';
import Dashboard from './pages/Dashboard';
import CategoryPage from './pages/CategoryPage';
import SearchResults from './pages/SearchResults';
import DocumentDetail from './pages/DocumentDetail';
import UserProfile from './pages/UserProfile';
import { UserContext } from './context/UserContext';
import './App.css';

function App() {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  
  // Simula il caricamento dell'utente dal localStorage
  useEffect(() => {
    const savedUser = localStorage.getItem('normaFacileUser');
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
    setIsLoading(false);
  }, []);
  
  // Salva l'utente nel localStorage quando cambia
  useEffect(() => {
    if (user) {
      localStorage.setItem('normaFacileUser', JSON.stringify(user));
    }
  }, [user]);
  
  if (isLoading) {
    return <div className="loading">Caricamento...</div>;
  }
  
  return (
    <Router>
      <UserContext.Provider value={{ user, setUser }}>
        <div className="app">
          <Header />
          <main className="main-content">
            <Switch>
              <Route exact path="/" component={LandingPage} />
              <Route path="/dashboard" component={Dashboard} />
              <Route path="/categoria/:categoryId" component={CategoryPage} />
              <Route path="/cerca" component={SearchResults} />
              <Route path="/documento/:docId" component={DocumentDetail} />
              <Route path="/profilo" component={UserProfile} />
            </Switch>
          </main>
          <Footer />
        </div>
      </UserContext.Provider>
    </Router>
  );
}

export default App;

// LandingPage.js - Pagina principale
import React, { useState } from 'react';
import { useHistory } from 'react-router-dom';
import CategoryGrid from '../components/CategoryGrid';
import HeroSection from '../components/HeroSection';
import HowItWorks from '../components/HowItWorks';
import CTASection from '../components/CTASection';
import './LandingPage.css';

function LandingPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const history = useHistory();
  
  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      history.push(`/cerca?q=${encodeURIComponent(searchQuery)}`);
    }
  };
  
  return (
    <div className="landing-page">
      <HeroSection 
        searchQuery={searchQuery} 
        setSearchQuery={setSearchQuery} 
        handleSearch={handleSearch} 
      />
      <CategoryGrid />
      <HowItWorks />
      <CTASection />
    </div>
  );
}

export default LandingPage;

// HeroSection.js - Sezione hero della landing page
import React from 'react';
import './HeroSection.css';

function HeroSection({ searchQuery, setSearchQuery, handleSearch }) {
  return (
    <section className="hero">
      <div className="hero-content">
        <h1>Normative italiane semplificate per imprenditori</h1>
        <p className="subtitle">
          Accedi a tutte le opportunità che lo Stato italiano offre, con normative 
          complesse tradotte in linguaggio semplice e azioni concrete.
        </p>
        
        <form onSubmit={handleSearch} className="search-box">
          <input 
            type="text" 
            placeholder="Cerca normative, incentivi, agevolazioni..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <button type="submit" className="btn">Cerca</button>
        </form>
        
        <a href="/dashboard" className="btn">Inizia gratuitamente</a>
      </div>
      
      <div className="hero-image">
        <img src="/images/hero-image.svg" alt="Imprenditore che consulta normative semplificate" />
      </div>
    </section>
  );
}

export default HeroSection;

// CategoryGrid.js - Griglia delle categorie
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import './CategoryGrid.css';

function CategoryGrid() {
  const [categories, setCategories] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  
  useEffect(() => {
    // Recupera le categorie dall'API
    fetch('/api/categories')
      .then(response => response.json())
      .then(data => {
        setCategories(data.categories);