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
        setIsLoading(false);
      })
      .catch(error => {
        console.error('Errore durante il recupero delle categorie:', error);
        setIsLoading(false);
      });
  }, []);
  
  if (isLoading) {
    return <div className="loading-categories">Caricamento categorie...</div>;
  }
  
  return (
    <section className="categories">
      <h2 className="section-title">Esplora per categoria</h2>
      
      <div className="category-grid">
        {categories.map(category => (
          <Link 
            to={`/categoria/${category.id}`} 
            key={category.id} 
            className="category-card"
          >
            <div className="category-icon">{category.icon}</div>
            <h3>{category.name}</h3>
            <p>{category.description}</p>
          </Link>
        ))}
      </div>
    </section>
  );
}

export default CategoryGrid;
