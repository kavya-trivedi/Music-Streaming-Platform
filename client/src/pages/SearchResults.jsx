import React, { useCallback, useContext } from 'react';
import { useLocation } from 'react-router-dom';
import { MusicPlayer } from '../context/MusicPlayer';

const SearchResults = () => {
  const location = useLocation();
  const { playTrackById, fetchAlbumById, fetchTrackById, currentTrack } = useContext(MusicPlayer);
  // ask later
  const { results } = location.state || {}; // Retrieve results from state
  console.log('RESULTS', results);

  if (!results) {
    return <div>No results found.</div>;
  }

  const handlePlayTrack = useCallback((trackId) => {
    playTrackById(trackId);
  }, [playTrackById]);

  return (
    <div className="p-4 rounded-lg">
      <h1 className="text-2xl font-bold text-white mb-4">Search Results</h1>
      <div>
        {results.map((song, index) => (
          <div 
            id={`track-${index}`}
            onClick={() => handlePlayTrack(song.id)}
            key={song._id} 
            className="grid grid-cols-3 sm:grid-cols-4 gap-2 p-2 items-center text-[#a7a7a7] hover:bg-[#ffffff2b] cursor-pointer"
          >
            <p className="text-white">
              <b className="mr-4 text-[#a7a7a7]">{index + 1}</b>
              {song.name}
            </p>
            <p className="text-[15px] hidden sm:block">
              {song.artistSongs.map(artist => artist.artistId.name).join(', ')}
            </p>
            <p className="text-[15px] text-center">
              {song.durationMs ? formatDuration(song.durationMs) : ''}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
};

const formatDuration = (durationMs) => {
  const minutes = Math.floor(durationMs / 60000);
  const seconds = ((durationMs % 60000) / 1000).toFixed(0);
  return `${minutes}:${seconds.padStart(2, '0')}`;
};

export default SearchResults;
