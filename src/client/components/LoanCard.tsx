import React from 'react';
import { Loan, LoanStatus } from '@/shared/types';

interface LoanCardProps {
  loan: Loan;
  showUser?: boolean;
  onReturnClick?: (loan: Loan) => void;
}

function LoanCard({ loan, showUser = false, onReturnClick }: LoanCardProps) {
  const getStatusBadge = (status: LoanStatus) => {
    const statusClasses = {
      [LoanStatus.ACTIVE]: 'status-badge status-active',
      [LoanStatus.RETURNED]: 'status-badge status-returned',
      [LoanStatus.OVERDUE]: 'status-badge status-overdue',
      [LoanStatus.CANCELLED]: 'status-badge status-pending',
    };

    const statusTexts = {
      [LoanStatus.ACTIVE]: 'Aktiv',
      [LoanStatus.RETURNED]: 'Returnert',
      [LoanStatus.OVERDUE]: 'Forfalt',
      [LoanStatus.CANCELLED]: 'Kansellert',
    };

    return (
      <span className={statusClasses[status]}>
        {statusTexts[status]}
      </span>
    );
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

  const loanPhotos = loan.loanPhotos?.filter(photo => photo.type === 'LOAN') || [];
  const returnPhotos = loan.loanPhotos?.filter(photo => photo.type === 'RETURN') || [];

  return (
    <div className="card">
      <div className="card-header">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h3>{loan.itemName}</h3>
          {getStatusBadge(loan.status)}
        </div>
        {showUser && loan.user && (
          <p style={{ margin: '0.5rem 0 0 0', fontSize: '0.875rem', color: '#7f8c8d' }}>
            Lånt av: {loan.user.name} ({loan.user.email})
          </p>
        )}
      </div>
      
      <div className="card-body">
        {loan.description && (
          <p style={{ marginBottom: '1rem' }}>{loan.description}</p>
        )}
        
        <div className="grid grid-2" style={{ marginBottom: '1rem' }}>
          <div>
            <strong>Lånt:</strong> {formatDate(loan.loanedAt)}
            {loan.loanLocation && (
              <div style={{ fontSize: '0.875rem', color: '#7f8c8d' }}>
                Sted: {loan.loanLocation}
              </div>
            )}
          </div>
          
          {loan.returnedAt && (
            <div>
              <strong>Returnert:</strong> {formatDate(loan.returnedAt)}
              {loan.returnLocation && (
                <div style={{ fontSize: '0.875rem', color: '#7f8c8d' }}>
                  Sted: {loan.returnLocation}
                </div>
              )}
            </div>
          )}
        </div>

        {loan.notes && (
          <div style={{ marginBottom: '1rem' }}>
            <strong>Notater:</strong>
            <p style={{ fontSize: '0.875rem', marginTop: '0.25rem' }}>{loan.notes}</p>
          </div>
        )}

        {/* Lånbilder */}
        {loanPhotos.length > 0 && (
          <div style={{ marginBottom: '1rem' }}>
            <strong>Bilder ved låning:</strong>
            <div className="image-gallery">
              {loanPhotos.map((photo) => (
                <div key={photo.id} className="image-item">
                  <img src={photo.photoUrl} alt={photo.caption || 'Lånbilde'} />
                  {photo.caption && (
                    <div className="image-caption">{photo.caption}</div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Returbilder */}
        {returnPhotos.length > 0 && (
          <div style={{ marginBottom: '1rem' }}>
            <strong>Bilder ved retur:</strong>
            <div className="image-gallery">
              {returnPhotos.map((photo) => (
                <div key={photo.id} className="image-item">
                  <img src={photo.photoUrl} alt={photo.caption || 'Returbilde'} />
                  {photo.caption && (
                    <div className="image-caption">{photo.caption}</div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
      
      {loan.status === LoanStatus.ACTIVE && onReturnClick && (
        <div className="card-footer">
          <button 
            onClick={() => onReturnClick(loan)}
            className="btn btn-primary"
          >
            Registrer retur
          </button>
        </div>
      )}
    </div>
  );
}

export default LoanCard;