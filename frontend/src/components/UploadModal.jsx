import React, { useState } from 'react';
import axios from 'axios';
import './UploadModal.css';
const API = process.env.REACT_APP_API_BASE_URL || 'http://localhost:5004';

const UploadModal = ({ onClose, onUploadSuccess }) => {
  const [file, setFile] = useState(null);
  const [title, setTitle] = useState('');
  const [error, setError] = useState('');

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      setFile(selectedFile);
      setError('');
    }
  };

  const handleSubmit = async () => {
    if (file) {
      const formData = new FormData();
      formData.append('media', file);
      formData.append('title', title);

      try {
        await axios.post(`${API}/api/posts`, formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        });
        onUploadSuccess();
        onClose();
      } catch (err) {
        console.error('Failed to upload post', err);
        setError('Upload failed. Please try again.');
      }
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <h2>Upload Media</h2>
        <input
          type="text"
          placeholder="Post title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="title-input"
        />
        <input type="file" accept="image/*,video/*" onChange={handleFileChange} />
        {error && <p className="error-message">{error}</p>}
        <div className="modal-actions">
          <button onClick={handleSubmit} disabled={!file}>Submit</button>
          <button onClick={onClose}>Cancel</button>
        </div>
      </div>
    </div>
  );
};

export default UploadModal;
