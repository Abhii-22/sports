import React, { useState } from 'react';
import axios from 'axios';
import './EditProfileModal.css';

const EditProfileModal = ({ user, onClose, onSave }) => {
  const [name, setName] = useState(user.name || '');
  const [bio, setBio] = useState(user.bio || '');
  const [profilePicture, setProfilePicture] = useState(null);
  const API = process.env.REACT_APP_API_BASE_URL || 'http://localhost:5004';

  const handleSave = async () => {
    try {
      let profilePictureUrl = user.profilePictureUrl;

      if (profilePicture) {
        const formData = new FormData();
        formData.append('profilePicture', profilePicture);
        const res = await axios.post(`${API}/api/profile/picture`, formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        });
        profilePictureUrl = res.data.profilePictureUrl;
      }

      const updatedProfile = { name, bio, profilePictureUrl };
      await axios.put(`${API}/api/profile`, updatedProfile);

      onSave({ ...user, ...updatedProfile });
      onClose();
    } catch (error) {
      console.error('Failed to update profile', error);
    }
  };

  return (
    <div className="modal-backdrop">
      <div className="modal-content">
        <h2>Edit Profile</h2>
        <div className="form-group">
          <label>Profile Picture</label>
          <input 
            type="file" 
            accept="image/*" 
            onChange={(e) => setProfilePicture(e.target.files[0])} 
          />
        </div>
        <div className="form-group">
          <label>Name</label>
          <input 
            type="text" 
            value={name} 
            onChange={(e) => setName(e.target.value)} 
          />
        </div>
        <div className="form-group">
          <label>Bio</label>
          <textarea 
            value={bio} 
            onChange={(e) => setBio(e.target.value)} 
          />
        </div>
        <div className="modal-actions">
          <button onClick={onClose} className="btn-cancel">Cancel</button>
          <button onClick={handleSave} className="btn-save">Save</button>
        </div>
      </div>
    </div>
  );
};

export default EditProfileModal;
