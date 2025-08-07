import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import FileUpload from '../components/FileUpload';
import { createLoan } from '../utils/api';
import { useToast } from '../components/ui/Toast';

function CreateLoanPage() {
  const [itemName, setItemName] = useState('');
  const [description, setDescription] = useState('');
  const [loanLocation, setLoanLocation] = useState('');
  const [photos, setPhotos] = useState<File[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const { show } = useToast();
  
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!itemName.trim()) {
      setError('Navn på utstyr er påkrevd');
      return;
    }

    setLoading(true);

    try {
      const response = await createLoan({
        itemName: itemName.trim(),
        description: description.trim() || undefined,
        loanLocation: loanLocation.trim() || undefined,
      }, photos);

      if (response.success) {
        setSuccess('Lån opprettet!');
        show('Lån opprettet', 'success');
        setTimeout(() => {
          navigate('/loans');
        }, 1500);
      } else {
        const msg = response.error?.message || 'Kunne ikke opprette lån';
        setError(msg);
        show(msg, 'error');
      }
    } catch (err: any) {
      const msg = 'En feil oppstod ved opprettelse av lån';
      setError(msg);
      show(msg, 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    navigate('/dashboard');
  };

  return (
    <div className="container">
      <div style={{ maxWidth: '600px', margin: '2rem auto' }}>
        <h1 style={{ marginBottom: '2rem' }}>Opprett nytt lån</h1>

        {error && (
          <div className="alert alert-error" style={{ marginBottom: '1rem' }}>
            {error}
          </div>
        )}

        {success && (
          <div className="alert alert-success" style={{ marginBottom: '1rem' }}>
            {success}
          </div>
        )}

        <div className="form">
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="itemName" className="form-label">
                Navn på utstyr *
              </label>
              <input
                type="text"
                id="itemName"
                className="form-input"
                value={itemName}
                onChange={(e) => setItemName(e.target.value)}
                placeholder="F.eks. Canon EOS R5 kamera"
                required
                disabled={loading}
              />
            </div>

            <div className="form-group">
              <label htmlFor="description" className="form-label">
                Beskrivelse
              </label>
              <textarea
                id="description"
                className="form-textarea"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Tilstand, serienummer, tilbehør som følger med, etc."
                rows={4}
                disabled={loading}
              />
            </div>

            <div className="form-group">
              <label htmlFor="loanLocation" className="form-label">
                Sted/lokasjon for låning
              </label>
              <input
                type="text"
                id="loanLocation"
                className="form-input"
                value={loanLocation}
                onChange={(e) => setLoanLocation(e.target.value)}
                placeholder="F.eks. Kontoret, Studiorum 3, etc."
                disabled={loading}
              />
            </div>

            <div className="form-group">
              <label className="form-label">
                Bilder av utstyret
              </label>
              <FileUpload
                onFilesChange={setPhotos}
                maxFiles={5}
                acceptedTypes={['image/*']}
              />
              <div style={{ fontSize: '0.875rem', color: '#7f8c8d', marginTop: '0.5rem' }}>
                Last opp bilder som viser tilstanden på utstyret ved låning
              </div>
            </div>

            <div style={{ display: 'flex', gap: '1rem', marginTop: '2rem' }}>
              <button
                type="submit"
                className="btn btn-primary"
                disabled={loading}
                style={{ flex: 1 }}
              >
                {loading ? 'Oppretter lån...' : 'Opprett lån'}
              </button>
              
              <button
                type="button"
                onClick={handleCancel}
                className="btn btn-secondary"
                disabled={loading}
              >
                Avbryt
              </button>
            </div>
          </form>
        </div>

        <div className="alert alert-info" style={{ marginTop: '2rem' }}>
          <strong>Tips:</strong>
          <ul style={{ marginTop: '0.5rem', paddingLeft: '1.5rem' }}>
            <li>Ta tydelige bilder av utstyret før låning</li>
            <li>Noter eventuelle eksisterende skader eller slitasje</li>
            <li>Inkluder serienummer i beskrivelsen hvis relevant</li>
            <li>Spesifiser hvilket tilbehør som følger med</li>
          </ul>
        </div>
      </div>
    </div>
  );
}

export default CreateLoanPage;