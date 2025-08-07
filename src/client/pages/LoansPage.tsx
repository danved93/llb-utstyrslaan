import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import PageHeader from '../components/ui/PageHeader';
import { useAuth } from '../contexts/AuthContext';
import LoadingSpinner from '../components/LoadingSpinner';
import LoanCard from '../components/LoanCard';
import FileUpload from '../components/FileUpload';
import Drawer from '../components/ui/Drawer';
import { getLoans, returnLoan } from '../utils/api';
import { Loan, LoanStatus } from '@/shared/types';
import { useToast } from '../components/ui/Toast';
import Tabs from '../components/ui/Tabs';

function LoansPage() {
  const [loans, setLoans] = useState<Loan[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<string>('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  
  // Return modal state
  const [returnModal, setReturnModal] = useState<{
    show: boolean;
    loan: Loan | null;
    returnLocation: string;
    notes: string;
    photos: File[];
    loading: boolean;
  }>({
    show: false,
    loan: null,
    returnLocation: '',
    notes: '',
    photos: [],
    loading: false,
  });

  const { isAdmin } = useAuth();
  const { show } = useToast();

  useEffect(() => {
    loadLoans();
  }, [selectedStatus, currentPage]);

  const loadLoans = async () => {
    try {
      setLoading(true);
      const response = await getLoans(selectedStatus || undefined, currentPage, 10);
      
      if (response.success && response.data) {
        setLoans(response.data.loans);
        setTotalPages(response.data.pagination.pages);
      } else {
        setError(response.error?.message || 'Kunne ikke laste lån');
      }
    } catch (err: any) {
      setError('En feil oppstod ved lasting av lån');
    } finally {
      setLoading(false);
    }
  };

  const handleReturnClick = (loan: Loan) => {
    setReturnModal({
      show: true,
      loan,
      returnLocation: '',
      notes: '',
      photos: [],
      loading: false,
    });
  };

  const handleReturnSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!returnModal.loan) return;

    setReturnModal(prev => ({ ...prev, loading: true }));

    try {
      const response = await returnLoan({
        loanId: returnModal.loan.id,
        returnLocation: returnModal.returnLocation.trim() || undefined,
        notes: returnModal.notes.trim() || undefined,
      }, returnModal.photos);

      if (response.success) {
        // Oppdater loan i listen
        setLoans(prev => prev.map(loan => 
          loan.id === returnModal.loan!.id 
            ? { ...loan, status: LoanStatus.RETURNED, returnedAt: new Date() }
            : loan
        ));
        show('Retur registrert', 'success');
        
        // Lukk modal
        setReturnModal({
          show: false,
          loan: null,
          returnLocation: '',
          notes: '',
          photos: [],
          loading: false,
        });
        
        // Last inn lån på nytt for å få oppdaterte data
        loadLoans();
      } else {
        const msg = response.error?.message || 'Kunne ikke registrere retur';
        setError(msg);
        show(msg, 'error');
      }
    } catch (err: any) {
      const msg = 'En feil oppstod ved registrering av retur';
      setError(msg);
      show(msg, 'error');
    } finally {
      setReturnModal(prev => ({ ...prev, loading: false }));
    }
  };

  const closeReturnModal = () => {
    setReturnModal({
      show: false,
      loan: null,
      returnLocation: '',
      notes: '',
      photos: [],
      loading: false,
    });
  };

  if (loading && loans.length === 0) {
    return <LoadingSpinner message="Laster lån..." />;
  }

  return (
    <div className="container">
      <PageHeader
        title={isAdmin ? 'Alle lån' : 'Mine lån'}
        actions={<Link to="/create-loan" className="btn btn-primary">Nytt lån</Link>}
      />

      {error && (
        <div className="alert alert-error" style={{ marginBottom: '2rem' }}>
          {error}
        </div>
      )}

      {/* Filtre */}
      <div className="card" style={{ marginBottom: '2rem' }}>
        <div className="card-body" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16, flexWrap: 'wrap' }}>
          <Tabs
            tabs={[
              { key: '', label: 'Alle' },
              { key: LoanStatus.ACTIVE, label: 'Aktive' },
              { key: LoanStatus.RETURNED, label: 'Returnerte' },
              { key: LoanStatus.OVERDUE, label: 'Forfalte' },
            ]}
            value={selectedStatus}
            onChange={(v) => { setSelectedStatus(v); setCurrentPage(1); }}
          />
        </div>
      </div>

      {/* Lånliste */}
      {loans.length > 0 ? (
        <div>
          <div className="grid grid-2">
            {loans.map((loan) => (
              <LoanCard 
                key={loan.id} 
                loan={loan} 
                showUser={isAdmin}
                onReturnClick={handleReturnClick}
              />
            ))}
          </div>

          {/* Paginering */}
          {totalPages > 1 && (
            <div style={{ 
              display: 'flex', 
              justifyContent: 'center', 
              gap: '0.5rem',
              marginTop: '2rem' 
            }}>
              <button
                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                disabled={currentPage === 1}
                className="btn btn-outline"
              >
                Forrige
              </button>
              
              <span style={{ 
                padding: '0.75rem 1rem',
                background: '#f8f9fa',
                borderRadius: '4px' 
              }}>
                Side {currentPage} av {totalPages}
              </span>
              
              <button
                onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                disabled={currentPage === totalPages}
                className="btn btn-outline"
              >
                Neste
              </button>
            </div>
          )}
        </div>
      ) : (
        <div className="card">
          <div className="card-body" style={{ textAlign: 'center', padding: '3rem' }}>
            <h3>Ingen lån funnet</h3>
            <p style={{ marginBottom: '1.5rem' }}>
              {selectedStatus 
                ? `Ingen lån med status "${selectedStatus}" funnet.`
                : 'Ingen lån registrert ennå.'
              }
            </p>
            <Link to="/create-loan" className="btn btn-primary">
              Opprett nytt lån
            </Link>
          </div>
        </div>
      )}

      {/* Return Modal */}
      {returnModal.show && returnModal.loan && (
        <Drawer open={returnModal.show} onClose={closeReturnModal} title={`Registrer retur: ${returnModal.loan.itemName}`}>
          <form onSubmit={handleReturnSubmit}>
            <div className="form-group">
              <label htmlFor="returnLocation" className="form-label">
                Leveringssted
              </label>
              <input
                type="text"
                id="returnLocation"
                className="form-input"
                value={returnModal.returnLocation}
                onChange={(e) => setReturnModal(prev => ({ 
                  ...prev, 
                  returnLocation: e.target.value 
                }))}
                placeholder="Hvor ble utstyret levert?"
                disabled={returnModal.loading}
              />
            </div>

            <div className="form-group">
              <label htmlFor="notes" className="form-label">
                Notater
              </label>
              <textarea
                id="notes"
                className="form-textarea"
                value={returnModal.notes}
                onChange={(e) => setReturnModal(prev => ({ 
                  ...prev, 
                  notes: e.target.value 
                }))}
                placeholder="Tilstand ved retur, eventuelle skader, etc."
                rows={4}
                disabled={returnModal.loading}
              />
            </div>

            <div className="form-group">
              <label className="form-label">
                Bilder ved retur
              </label>
              <FileUpload
                onFilesChange={(files) => setReturnModal(prev => ({ 
                  ...prev, 
                  photos: files 
                }))}
                maxFiles={5}
                acceptedTypes={['image/*']}
              />
            </div>

            <div style={{ display: 'flex', gap: '1rem', marginTop: '2rem' }}>
              <button
                type="submit"
                className="btn btn-primary"
                disabled={returnModal.loading}
                style={{ flex: 1 }}
              >
                {returnModal.loading ? 'Registrerer retur...' : 'Registrer retur'}
              </button>
              
              <button
                type="button"
                onClick={closeReturnModal}
                className="btn btn-secondary"
                disabled={returnModal.loading}
              >
                Avbryt
              </button>
            </div>
          </form>
        </Drawer>
      )}
    </div>
  );
}

export default LoansPage;