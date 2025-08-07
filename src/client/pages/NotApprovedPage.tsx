import React from 'react';
import { useAuth } from '../contexts/AuthContext';

function NotApprovedPage() {
  const { user } = useAuth();

  return (
    <div className="container">
      <div style={{ maxWidth: '600px', margin: '3rem auto', textAlign: 'center' }}>
        <div className="card">
          <div className="card-body" style={{ padding: '3rem' }}>
            <h1 style={{ color: '#f39c12', marginBottom: '1.5rem' }}>
              Konto venter på godkjenning
            </h1>
            
            <p style={{ fontSize: '1.1rem', marginBottom: '2rem' }}>
              Hei {user?.name}! Din konto er opprettet, men må godkjennes av en administrator 
              før du kan begynne å låne utstyr.
            </p>

            <div className="alert alert-info" style={{ textAlign: 'left' }}>
              <h4>Hva skjer nå?</h4>
              <ul style={{ marginTop: '1rem', paddingLeft: '1.5rem' }}>
                <li>En administrator vil gjennomgå søknaden din</li>
                <li>Du vil få en e-post når kontoen er godkjent</li>
                <li>Etter godkjenning kan du logge inn og begynne å låne utstyr</li>
              </ul>
            </div>

            <div style={{ marginTop: '2rem' }}>
              <p style={{ fontSize: '0.9rem', color: '#7f8c8d' }}>
                Har du spørsmål? Ta kontakt med administratoren.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default NotApprovedPage;