import React, { useState, useRef } from 'react';

interface FileUploadProps {
  onFilesChange: (files: File[]) => void;
  maxFiles?: number;
  acceptedTypes?: string[];
  maxFileSize?: number; // i bytes
}

function FileUpload({ 
  onFilesChange, 
  maxFiles = 5, 
  acceptedTypes = ['image/*'],
  maxFileSize = 5 * 1024 * 1024 // 5MB default
}: FileUploadProps) {
  const [dragOver, setDragOver] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [errors, setErrors] = useState<string[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const validateFile = (file: File): string | null => {
    // Sjekk filtype
    const isValidType = acceptedTypes.some(type => {
      if (type === 'image/*') {
        return file.type.startsWith('image/');
      }
      return file.type === type;
    });

    if (!isValidType) {
      return `Filtype ikke støttet: ${file.type}`;
    }

    // Sjekk filstørrelse
    if (file.size > maxFileSize) {
      return `Fil for stor: ${file.name} (maks ${Math.round(maxFileSize / 1024 / 1024)}MB)`;
    }

    return null;
  };

  const handleFiles = (files: FileList | File[]) => {
    const fileArray = Array.from(files);
    const newErrors: string[] = [];
    const validFiles: File[] = [];

    // Valider hver fil
    fileArray.forEach(file => {
      const error = validateFile(file);
      if (error) {
        newErrors.push(error);
      } else {
        validFiles.push(file);
      }
    });

    // Sjekk at vi ikke overskrider maks antall filer
    const totalFiles = selectedFiles.length + validFiles.length;
    if (totalFiles > maxFiles) {
      newErrors.push(`Maks ${maxFiles} filer tillatt`);
      validFiles.splice(maxFiles - selectedFiles.length);
    }

    setErrors(newErrors);
    const updatedFiles = [...selectedFiles, ...validFiles];
    setSelectedFiles(updatedFiles);
    onFilesChange(updatedFiles);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    handleFiles(e.dataTransfer.files);
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      handleFiles(e.target.files);
    }
  };

  const removeFile = (index: number) => {
    const updatedFiles = selectedFiles.filter((_, i) => i !== index);
    setSelectedFiles(updatedFiles);
    onFilesChange(updatedFiles);
  };

  const openFileDialog = () => {
    fileInputRef.current?.click();
  };

  return (
    <div>
      <div
        className={`file-upload ${dragOver ? 'dragover' : ''}`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={openFileDialog}
      >
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept={acceptedTypes.join(',')}
          onChange={handleFileInputChange}
          style={{ display: 'none' }}
        />
        
        <div>
          <svg
            width="48"
            height="48"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            style={{ color: '#3498db', marginBottom: '1rem' }}
          >
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
            <polyline points="7,10 12,15 17,10" />
            <line x1="12" y1="15" x2="12" y2="3" />
          </svg>
          
          <p>
            <strong>Klikk for å velge filer</strong> eller dra og slipp her
          </p>
          <p style={{ fontSize: '0.875rem', color: '#7f8c8d', marginTop: '0.5rem' }}>
            Maks {maxFiles} filer, {Math.round(maxFileSize / 1024 / 1024)}MB per fil
          </p>
        </div>
      </div>

      {/* Feilmeldinger */}
      {errors.length > 0 && (
        <div style={{ marginTop: '1rem' }}>
          {errors.map((error, index) => (
            <div key={index} className="alert alert-error">
              {error}
            </div>
          ))}
        </div>
      )}

      {/* Valgte filer */}
      {selectedFiles.length > 0 && (
        <div style={{ marginTop: '1rem' }}>
          <h4>Valgte filer:</h4>
          <div style={{ marginTop: '0.5rem' }}>
            {selectedFiles.map((file, index) => (
              <div
                key={index}
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '0.5rem',
                  background: '#f8f9fa',
                  border: '1px solid #e1e8ed',
                  borderRadius: '4px',
                  marginBottom: '0.5rem',
                }}
              >
                <div>
                  <strong>{file.name}</strong>
                  <span style={{ fontSize: '0.875rem', color: '#7f8c8d', marginLeft: '0.5rem' }}>
                    ({Math.round(file.size / 1024)}KB)
                  </span>
                </div>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    removeFile(index);
                  }}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: '#e74c3c',
                    cursor: 'pointer',
                    fontSize: '1.2rem',
                  }}
                >
                  ×
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default FileUpload;