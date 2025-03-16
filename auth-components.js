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
        dimens