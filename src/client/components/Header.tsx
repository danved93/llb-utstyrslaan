import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

function Header() {
  const { user, logout, isAuthenticated, isAdmin } = useAuth();
  const location = useLocation();

  const isActive = (path: string) => location.pathname === path;

  const handleLogout = () => {
    logout();
  };

  if (!isAuthenticated) {
    return null;
  }

  return (
    <header className="header">
      <div className="container">
        <div className="header-content">
          <div className="logo">
            <Link to="/dashboard" style={{ color: 'white', textDecoration: 'none' }}>
              LLB Utstyrslån
            </Link>
          </div>
          
          <nav className="nav" aria-label="Hovedmeny">
            <Link 
              to="/dashboard" 
              className={isActive('/dashboard') ? 'active' : ''}
            >
              Dashboard
            </Link>
            
            <Link 
              to="/loans" 
              className={isActive('/loans') ? 'active' : ''}
            >
              Mine lån
            </Link>
            
            {user?.isApproved && (
              <Link 
                to="/create-loan" 
                className={isActive('/create-loan') ? 'active' : ''}
              >
                Nytt lån
              </Link>
            )}
            
            {isAdmin && (
              <Link 
                to="/admin" 
                className={isActive('/admin') ? 'active' : ''}
              >
                Admin
              </Link>
            )}
            
            <div style={{ 
              marginLeft: '1rem', 
              padding: '0.5rem', 
              borderLeft: '1px solid rgba(255,255,255,0.2)' 
            }}>
              <span style={{ marginRight: '1rem' }}>
                {user?.name}
                {!user?.isApproved && user?.role !== 'ADMIN' && (
                  <span style={{ 
                    fontSize: '0.75rem', 
                    color: '#f39c12',
                    marginLeft: '0.5rem' 
                  }}>
                    (Venter godkjenning)
                  </span>
                )}
              </span>
              
              <button 
                onClick={handleLogout}
                className="btn btn-secondary"
                style={{ padding: '0.25rem 0.75rem', fontSize: '0.875rem' }}
              >
                Logg ut
              </button>
            </div>
          </nav>
        </div>
      </div>
    </header>
  );
}

export default Header;