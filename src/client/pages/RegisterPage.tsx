import React, { useState } from 'react';
import { Link, Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../components/ui/Toast';

function RegisterPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  const { register, isAuthenticated } = useAuth();
  const { show } = useToast();

  // Redirect hvis allerede innlogget
  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Valider at passordene matcher
    if (password !== confirmPassword) {
      setError('Passordene matcher ikke');
      return;
    }

    setLoading(true);

    try {
      await register(name, email, password);
      show('Konto opprettet! Venter på godkjenning.', 'success');
    } catch (err: any) {
      const msg = err.message || 'Registrering feilet';
      setError(msg);
      show(msg, 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container">
      <div style={{ maxWidth: '400px', margin: '2rem auto' }}>
        <div className="form">
          <h1 style={{ textAlign: 'center', marginBottom: '2rem' }}>
            Opprett konto
          </h1>

          {error && (
            <div className="alert alert-error" style={{ marginBottom: '1rem' }}>
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="name" className="form-label">
                Fullt navn
              </label>
              <input
                type="text"
                id="name"
                className="form-input"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                disabled={loading}
              />
            </div>

            <div className="form-group">
              <label htmlFor="email" className="form-label">
                E-post
              </label>
              <input
                type="email"
                id="email"
                className="form-input"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={loading}
              />
            </div>

            <div className="form-group">
              <label htmlFor="password" className="form-label">
                Passord
              </label>
              <input
                type="password"
                id="password"
                className="form-input"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                disabled={loading}
              />
              <div className="form-error" style={{ fontSize: '0.75rem', color: '#7f8c8d' }}>
                Minst 8 tegn, må inneholde stor bokstav, liten bokstav og tall
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="confirmPassword" className="form-label">
                Bekreft passord
              </label>
              <input
                type="password"
                id="confirmPassword"
                className="form-input"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                disabled={loading}
              />
            </div>

            <button
              type="submit"
              className="btn btn-primary"
              style={{ width: '100%' }}
              disabled={loading}
            >
              {loading ? 'Oppretter konto...' : 'Opprett konto'}
            </button>
          </form>

          <div style={{ textAlign: 'center', marginTop: '1.5rem' }}>
            <p>
              Har du allerede konto?{' '}
              <Link to="/login" style={{ color: '#3498db' }}>
                Logg inn her
              </Link>
            </p>
          </div>

          <div className="alert alert-info" style={{ marginTop: '1.5rem', fontSize: '0.875rem' }}>
            <strong>Merk:</strong> Etter registrering må kontoen din godkjennes av en administrator 
            før du kan låne utstyr.
          </div>
        </div>
      </div>
    </div>
  );
}

export default RegisterPage;