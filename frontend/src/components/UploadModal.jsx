import React, { useState } from 'react';
import axios from 'axios';
import './UploadModal.css';
const API = process.env.REACT_APP_API_URL || 'http://localhost:5004';

const UploadModal = ({ onClose, onUploadSuccess }) => {
  const [file, setFile] = useState(null);
  const [title, setTitle] = useState('');
  const [error, setError] = useState('');
  const [uploading, setUploading] = useState(false);

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
