// SongPage.jsx

import React, { useEffect, useState, useContext } from 'react';
import { useParams } from 'react-router-dom';
import { MusicPlayer } from '../context/MusicPlayer';
import axios from 'axios';

const SongPage = React.memo(() => {
  const { id } = useParams();
  const { playTrackById, currentTrack, isPaused, formatTime, trackDuration } = useContext(MusicPlayer);
  const [songDetails, setSongDetails] = useState(null);

  // Fetch song details from the backend
  useEffect(() => {
    const fetchSongDetails = async () => {
      try {
        const response = await axios.get(`api/songs/${id}`);
        setSongDetails(response.data);
        console.log(response.data)
      } catch (error) {
        console.error('Error fetching song details:', error);
      }
    };

    if (id) {
      fetchSongDetails();
    }
  }, [id]);

  useEffect(() => {
    if (id && typeof playTrackById === 'function') {
      console.log("Attempting to play track:", id);
      playTrackById(id);
    }
  }, [id, playTrackById]);

  if (!currentTrack || !songDetails) {
    return <div className="p-4">Loading...</div>;
  }

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold">{songDetails.name}</h1>
      <p className="text-lg">{currentTrack.album.name}</p>
      <p className="text-md text-gray-300">
        {currentTrack.artists.map(artist => artist.name).join(', ')}
      </p>
      <p className="text-sm text-gray-400">
        Status: {isPaused ? 'Paused' : 'Playing'}
      </p>
      <p className="text-sm text-gray-400">
        Duration: {formatTime(trackDuration)}
      </p>

      <div className="mt-4">
        <h2 className="text-xl font-bold">Lyrics</h2>
        {songDetails.lyrics ? (
          <p>{songDetails.lyrics}</p>
        ) : (
          <p>Lyrics not available</p>
        )}
      </div>
    </div>
  );
});

export default SongPage;
