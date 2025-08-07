import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import PageHeader from '../components/ui/PageHeader';
import { useAuth } from '../contexts/AuthContext';
import LoadingSpinner from '../components/LoadingSpinner';
import LoanCard from '../components/LoanCard';
import { getLoans, getStats } from '../utils/api';
import { Loan } from '@/shared/types';

function DashboardPage() {
  const [loans, setLoans] = useState<Loan[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  const { user, isAdmin, isApprovedBorrower } = useAuth();

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      
      // Hent brukerens siste lån
      const loansResponse = await getLoans(undefined, 1, 5);
      if (loansResponse.success && loansResponse.data) {
        setLoans(loansResponse.data.loans);
      }

      // Hent statistikk hvis admin
      if (isAdmin) {
        const statsResponse = await getStats();
        if (statsResponse.success && statsResponse.data) {
          setStats(statsResponse.data);
        }
      }
    } catch (err: any) {
      setError('Kunne ikke laste dashboard data');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <LoadingSpinner message="Laster dashboard..." />;
  }

  return (
    <div className="container">
      <PageHeader
        title="Dashboard"
        subtitle={`Velkommen, ${user?.name}!`}
        actions={
          <div>
            {isApprovedBorrower && (
              <Link to="/create-loan" className="btn btn-success">Nytt lån</Link>
            )}
          </div>
        }
      />

      {error && (
        <div className="alert alert-error" style={{ marginBottom: '2rem' }}>
          {error}
        </div>
      )}

      {/* Admin statistikk */}
      {isAdmin && stats && (
        <div className="grid grid-3" style={{ marginBottom: '2rem' }}>
          <div className="card">
            <div className="card-header">Lån statistikk</div>
            <div className="card-body">
              <div style={{ display: 'grid', gap: '0.5rem' }}>
                <div>Totalt: <strong>{stats.loans.total}</strong></div>
                <div>Aktive: <strong style={{ color: '#27ae60' }}>{stats.loans.active}</strong></div>
                <div>Returnerte: <strong style={{ color: '#3498db' }}>{stats.loans.returned}</strong></div>
                <div>Forfalte: <strong style={{ color: '#e74c3c' }}>{stats.loans.overdue}</strong></div>
              </div>
            </div>
          </div>

          <div className="card">
            <div className="card-header">Bruker statistikk</div>
            <div className="card-body">
              <div style={{ display: 'grid', gap: '0.5rem' }}>
                <div>Totalt: <strong>{stats.users.total}</strong></div>
                <div>Godkjente: <strong style={{ color: '#27ae60' }}>{stats.users.approved}</strong></div>
                <div>Venter: <strong style={{ color: '#f39c12' }}>{stats.users.pending}</strong></div>
              </div>
            </div>
          </div>

          <div className="card">
            <div className="card-header">Hurtighandlinger</div>
            <div className="card-body">
              <div style={{ display: 'grid', gap: '0.5rem' }}>
                <Link to="/admin" className="btn btn-primary" style={{ textAlign: 'center' }}>
                  Admin panel
                </Link>
                <Link to="/loans" className="btn btn-outline" style={{ textAlign: 'center' }}>
                  Se alle lån
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Handlinger for godkjente brukere */}
      {isApprovedBorrower && (
        <div className="grid grid-2" style={{ marginBottom: '2rem' }}>
          <div className="card">
            <div className="card-header">Opprett nytt lån</div>
            <div className="card-body">
              <p>Registrer nytt utstyr som skal lånes ut.</p>
              <Link to="/create-loan" className="btn btn-success">
                Nytt lån
              </Link>
            </div>
          </div>

          <div className="card">
            <div className="card-header">Mine lån</div>
            <div className="card-body">
              <p>Se oversikt over aktive og tidligere lån.</p>
              <Link to="/loans" className="btn btn-primary">
                Se alle lån
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* Melding for ikke-godkjente brukere */}
      {!user?.isApproved && user?.role !== 'ADMIN' && (
        <div className="alert alert-warning" style={{ marginBottom: '2rem' }}>
          <strong>Konto venter på godkjenning</strong>
          <p>
            Din konto må godkjennes av en administrator før du kan låne utstyr. 
            Du vil få beskjed når kontoen er godkjent.
          </p>
        </div>
      )}

      {/* Siste lån */}
      {loans.length > 0 && (
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <h2>
              {isAdmin ? 'Siste lån (alle brukere)' : 'Mine siste lån'}
            </h2>
            <Link to="/loans" className="btn btn-outline">
              Se alle
            </Link>
          </div>

          <div className="grid grid-2">
            {loans.map((loan) => (
              <LoanCard 
                key={loan.id} 
                loan={loan} 
                showUser={isAdmin}
              />
            ))}
          </div>
        </div>
      )}

      {loans.length === 0 && isApprovedBorrower && (
        <div className="card">
          <div className="card-body" style={{ textAlign: 'center', padding: '3rem' }}>
            <h3>Ingen lån registrert</h3>
            <p style={{ marginBottom: '1.5rem' }}>
              Du har ikke registrert noen lån ennå.
            </p>
            <Link to="/create-loan" className="btn btn-primary">
              Opprett ditt første lån
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}

export default DashboardPage;