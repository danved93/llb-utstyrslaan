import React, { useState, useEffect } from 'react';
import LoadingSpinner from '../components/LoadingSpinner';
import PageHeader from '../components/ui/PageHeader';
import { getPendingUsers, getUsers, approveUser, getStats } from '../utils/api';
import { User } from '@/shared/types';
import { useToast } from '../components/ui/Toast';

function AdminPage() {
  const [activeTab, setActiveTab] = useState<'pending' | 'users' | 'stats'>('pending');
  const [pendingUsers, setPendingUsers] = useState<User[]>([]);
  const [allUsers, setAllUsers] = useState<User[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const { show } = useToast();

  useEffect(() => {
    loadData();
  }, [activeTab]);

  const loadData = async () => {
    try {
      setLoading(true);
      
      if (activeTab === 'pending') {
        const response = await getPendingUsers();
        if (response.success && response.data) {
          setPendingUsers(response.data.users);
        }
      } else if (activeTab === 'users') {
        const response = await getUsers();
        if (response.success && response.data) {
          setAllUsers(response.data.users);
        }
      } else if (activeTab === 'stats') {
        const response = await getStats();
        if (response.success && response.data) {
          setStats(response.data);
        }
      }
    } catch (err: any) {
      setError('Kunne ikke laste data');
    } finally {
      setLoading(false);
    }
  };

  const handleApproveUser = async (userId: string, approved: boolean) => {
    try {
      setActionLoading(userId);
      const response = await approveUser(userId, approved);
      
      if (response.success) {
        // Fjern fra pending liste
        setPendingUsers(prev => prev.filter(user => user.id !== userId));
        
        // Oppdater all users liste hvis den er lastet
        if (activeTab === 'users') {
          setAllUsers(prev => prev.map(user => 
            user.id === userId 
              ? { ...user, isApproved: approved }
              : user
          ));
        }
        show(approved ? 'Bruker godkjent' : 'Bruker avslått', 'success');
      } else {
        const msg = response.error?.message || 'Kunne ikke oppdatere bruker';
        setError(msg);
        show(msg, 'error');
      }
    } catch (err: any) {
      const msg = 'En feil oppstod ved oppdatering av bruker';
      setError(msg);
      show(msg, 'error');
    } finally {
      setActionLoading(null);
    }
  };

  const formatDate = (date: Date | string) => {
    return new Date(date).toLocaleDateString('no-NO', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="container">
      <PageHeader title="Admin Panel" />

      {error && (
        <div className="alert alert-error" style={{ marginBottom: '2rem' }}>
          {error}
          <button 
            onClick={() => setError('')}
            style={{ 
              float: 'right', 
              background: 'none', 
              border: 'none', 
              color: 'inherit',
              cursor: 'pointer' 
            }}
          >
            ×
          </button>
        </div>
      )}

      {/* Tabs */}
      <div style={{ 
        borderBottom: '2px solid #e1e8ed', 
        marginBottom: '2rem',
        display: 'flex',
        gap: '2rem'
      }}>
        <button
          onClick={() => setActiveTab('pending')}
          style={{
            background: 'none',
            border: 'none',
            padding: '1rem 0',
            borderBottom: activeTab === 'pending' ? '2px solid #3498db' : '2px solid transparent',
            color: activeTab === 'pending' ? '#3498db' : '#7f8c8d',
            cursor: 'pointer',
            fontWeight: 500,
          }}
        >
          Ventende brukere
        </button>
        
        <button
          onClick={() => setActiveTab('users')}
          style={{
            background: 'none',
            border: 'none',
            padding: '1rem 0',
            borderBottom: activeTab === 'users' ? '2px solid #3498db' : '2px solid transparent',
            color: activeTab === 'users' ? '#3498db' : '#7f8c8d',
            cursor: 'pointer',
            fontWeight: 500,
          }}
        >
          Alle brukere
        </button>
        
        <button
          onClick={() => setActiveTab('stats')}
          style={{
            background: 'none',
            border: 'none',
            padding: '1rem 0',
            borderBottom: activeTab === 'stats' ? '2px solid #3498db' : '2px solid transparent',
            color: activeTab === 'stats' ? '#3498db' : '#7f8c8d',
            cursor: 'pointer',
            fontWeight: 500,
          }}
        >
          Statistikk
        </button>
      </div>

      {loading ? (
        <LoadingSpinner message="Laster data..." />
      ) : (
        <>
          {/* Pending Users Tab */}
          {activeTab === 'pending' && (
            <div>
              <h2 style={{ marginBottom: '1.5rem' }}>
                Brukere som venter på godkjenning ({pendingUsers.length})
              </h2>
              
              {pendingUsers.length === 0 ? (
                <div className="card">
                  <div className="card-body" style={{ textAlign: 'center', padding: '3rem' }}>
                    <h3>Ingen ventende brukere</h3>
                    <p>Alle brukere er godkjent eller avslått.</p>
                  </div>
                </div>
              ) : (
                <div className="grid grid-2">
                  {pendingUsers.map((user) => (
                    <div key={user.id} className="card">
                      <div className="card-header">
                        <h3>{user.name}</h3>
                        <span className="status-badge status-pending">Venter</span>
                      </div>
                      
                      <div className="card-body">
                        <p><strong>E-post:</strong> {user.email}</p>
                        <p><strong>Registrert:</strong> {formatDate(user.createdAt)}</p>
                        <p><strong>Rolle:</strong> {user.role}</p>
                      </div>
                      
                      <div className="card-footer">
                        <button
                          onClick={() => handleApproveUser(user.id, true)}
                          disabled={actionLoading === user.id}
                          className="btn btn-success"
                          style={{ marginRight: '0.5rem' }}
                        >
                          {actionLoading === user.id ? 'Laster...' : 'Godkjenn'}
                        </button>
                        
                        <button
                          onClick={() => handleApproveUser(user.id, false)}
                          disabled={actionLoading === user.id}
                          className="btn btn-danger"
                        >
                          {actionLoading === user.id ? 'Laster...' : 'Avslå'}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* All Users Tab */}
          {activeTab === 'users' && (
            <div>
              <h2 style={{ marginBottom: '1.5rem' }}>
                Alle brukere ({allUsers.length})
              </h2>
              
              <div className="table">
                <thead>
                  <tr>
                    <th>Navn</th>
                    <th>E-post</th>
                    <th>Rolle</th>
                    <th>Status</th>
                    <th>Lån</th>
                    <th>Registrert</th>
                  </tr>
                </thead>
                <tbody>
                  {allUsers.map((user) => (
                    <tr key={user.id}>
                      <td>{user.name}</td>
                      <td>{user.email}</td>
                      <td>
                        <span className={`status-badge ${user.role === 'ADMIN' ? 'status-returned' : 'status-active'}`}>
                          {user.role}
                        </span>
                      </td>
                      <td>
                        <span className={`status-badge ${user.isApproved ? 'status-active' : 'status-pending'}`}>
                          {user.isApproved ? 'Godkjent' : 'Venter'}
                        </span>
                      </td>
                      <td>{(user as any)._count?.loans || 0}</td>
                      <td>{formatDate(user.createdAt)}</td>
                    </tr>
                  ))}
                </tbody>
              </div>
            </div>
          )}

          {/* Stats Tab */}
          {activeTab === 'stats' && stats && (
            <div>
              <h2 style={{ marginBottom: '1.5rem' }}>Statistikk</h2>
              
              <div className="grid grid-2" style={{ marginBottom: '2rem' }}>
                <div className="card">
                  <div className="card-header">Lån statistikk</div>
                  <div className="card-body">
                    <div style={{ display: 'grid', gap: '1rem' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <span>Totalt:</span>
                        <strong>{stats.loans.total}</strong>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <span>Aktive:</span>
                        <strong style={{ color: '#27ae60' }}>{stats.loans.active}</strong>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <span>Returnerte:</span>
                        <strong style={{ color: '#3498db' }}>{stats.loans.returned}</strong>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <span>Forfalte:</span>
                        <strong style={{ color: '#e74c3c' }}>{stats.loans.overdue}</strong>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="card">
                  <div className="card-header">Bruker statistikk</div>
                  <div className="card-body">
                    <div style={{ display: 'grid', gap: '1rem' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <span>Totalt:</span>
                        <strong>{stats.users.total}</strong>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <span>Godkjente:</span>
                        <strong style={{ color: '#27ae60' }}>{stats.users.approved}</strong>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <span>Venter godkjenning:</span>
                        <strong style={{ color: '#f39c12' }}>{stats.users.pending}</strong>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}

export default AdminPage;