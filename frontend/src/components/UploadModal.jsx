import React, { useState, useRef, useEffect } from 'react';
import ReactDOM from 'react-dom';
import axios from 'axios';
import './UploadModal.css';
const API = process.env.REACT_APP_API_URL || 'http://localhost:5004';

const UploadModal = ({ onClose, onUploadSuccess }) => {
  const [file, setFile] = useState(null);
  const [title, setTitle] = useState('');
  const [error, setError] = useState('');
  const [uploading, setUploading] = useState(false);
  const [preview, setPreview] = useState(null);
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef(null);

  const handleFileChange = (selectedFile) => {
    if (selectedFile) {
      setFile(selectedFile);
      setError('');
      
      // Create preview
      if (selectedFile.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onloadend = () => {
          setPreview(reader.result);
        };
        reader.readAsDataURL(selectedFile);
      } else if (selectedFile.type.startsWith('video/')) {
        const reader = new FileReader();
        reader.onloadend = () => {
          setPreview(reader.result);
        };
        reader.readAsDataURL(selectedFile);
      }
    }
  };

  const handleInputChange = (e) => {
    const selectedFile = e.target.files[0];
    handleFileChange(selectedFile);
  };

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileChange(e.dataTransfer.files[0]);
    }
  };

  const handleSubmit = async () => {
    if (file) {
      const formData = new FormData();
      formData.append('media', file);
      formData.append('title', title);

      try {
        setUploading(true);
        setError('');
        const token = localStorage.getItem('token');
        
        if (!token) {
          setError('Please log in to upload posts.');
          setUploading(false);
          return;
        }

        const response = await axios.post(`${API}/api/posts`, formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
            'x-auth-token': token,
          },
        });
        
        // Verify the response contains valid post data
        if (response.data && response.data._id) {
          console.log('Post uploaded successfully:', response.data);
          onUploadSuccess();
          onClose();
        } else {
          throw new Error('Invalid response from server');
        }
      } catch (err) {
        console.error('Failed to upload post', err);
        setError(err.response?.data?.msg || 'Upload failed. Please try again.');
      } finally {
        setUploading(false);
      }
    }
  };

  const removeFile = () => {
    setFile(null);
    setPreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // Prevent body scroll when modal is open
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, []);

  const modalContent = (
    <div className="upload-modal-overlay" onClick={onClose}>
      <div className="upload-modal-content" onClick={(e) => e.stopPropagation()}>
        <button className="upload-modal-close" onClick={onClose}>×</button>
        
        <div className="upload-modal-header">
          <div className="upload-icon">📤</div>
          <h2>Upload Your Media</h2>
          <p>Share your photos and videos with the community</p>
        </div>

        <div className="upload-modal-body">
          {!preview ? (
            <div
              className={`upload-dropzone ${dragActive ? 'drag-active' : ''}`}
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
            >
              <div className="dropzone-content">
                <div className="dropzone-icon">📎</div>
                <h3>Drag & Drop your file here</h3>
                <p>or click to browse</p>
                <span className="dropzone-hint">Supports: JPG, PNG, GIF, MP4, MOV, AVI</span>
              </div>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*,video/*"
                onChange={handleInputChange}
                className="file-input-hidden"
              />
            </div>
          ) : (
            <div className="upload-preview">
              <button className="preview-remove" onClick={removeFile}>×</button>
              {file.type.startsWith('image/') ? (
                <img src={preview} alt="Preview" className="preview-image" />
              ) : (
                <video src={preview} controls className="preview-video" />
              )}
              <div className="preview-info">
                <p className="preview-filename">{file.name}</p>
                <p className="preview-size">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
              </div>
            </div>
          )}

          <div className="upload-form-group">
            <label htmlFor="title-input">Post Title (Optional)</label>
            <input
              id="title-input"
              type="text"
              placeholder="Add a caption or title..."
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="upload-title-input"
            />
          </div>

          {error && (
            <div className="upload-error-message">
              <span className="error-icon">⚠️</span>
              <span>{error}</span>
            </div>
          )}

          {uploading && (
            <div className="upload-progress">
              <div className="progress-spinner"></div>
              <p>Uploading your media...</p>
            </div>
          )}
        </div>

        <div className="upload-modal-actions">
          <button className="upload-btn-cancel" onClick={onClose} disabled={uploading}>
            Cancel
          </button>
          <button
            className="upload-btn-submit"
            onClick={handleSubmit}
            disabled={!file || uploading}
          >
            {uploading ? 'Uploading...' : 'Upload Post'}
          </button>
        </div>
      </div>
    </div>
  );

  // Render modal using React Portal to document.body
  return ReactDOM.createPortal(modalContent, document.body);
};

export default UploadModal;
