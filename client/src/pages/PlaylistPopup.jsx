import axios from 'axios';
import React, { useState } from 'react';

const PlaylistPopup = ({ isOpen, onClose }) => {
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const userId = localStorage.getItem('userId');

  const handleCreate = async(e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (name == '') {
      setError("Name shouldn't be empty");
      return;
    }

    try {
        const response = await axios.post('http://localhost:4000/api/create-playlist', {
        userId,
        name,
      });
      console.log('Playlist created successfully');
      setSuccess('Playlist created successfully');
      setName('');
    } catch (err) {
      setError(err.response?.data?.message || 'Error creating playlist');
    }
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-[#242424] bg-opacity-50">
      <div className="bg-black p-6 rounded-lg shadow-lg">
        <h2 className="text-white text-lg mb-4">Create a New Playlist</h2>
        <input
          type="text"
          placeholder="Playlist name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="border bg-[#242424] border-gray-600 p-2 mb-4 w-full rounded text-white"
        />
        <div className="flex justify-between">
          <button
            onClick={onClose}
            className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
          >
            Cancel
          </button>
          <button
            onClick={handleCreate}
            className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
          >
            Create
          </button>
        </div>
      </div>
    </div>
  );
};

export default PlaylistPopup;
