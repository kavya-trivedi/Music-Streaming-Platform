import React, { useState } from 'react';
import { assets } from '../assets/assets';
import { useNavigate } from 'react-router-dom';

const SearchBar = () => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const navigate = useNavigate(); // Use useNavigate instead of useHistory

  const handleSearch = async (query) => {
    setQuery(query);
    if (!query) {
      setResults([]);
      return;
    }
  
    try {
      const response = await fetch(`http://localhost:4000/api/songs/search?query=${encodeURIComponent(query)}`);
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      const data = await response.json();
      
      // Navigate to the search results page with the data
      navigate('/search-results', { state: { results: data } });
    } catch (error) {
      console.error('Fetch error:', error);
    }
  };

  const handleSongClick = (song) => {
    // Navigate to song details page and pass song data
    navigate(`/song/${song._id}`, { state: { song } });
  };

  return (
    <div className="relative flex items-center bg-gray-800 rounded-full px-4 py-2 w-1/3">
      <input
        type="text"
        className="bg-transparent text-white outline-none placeholder-white w-full"
        placeholder="What do you want to play?"
        value={query}
        onChange={(e) => handleSearch(e.target.value)}
      />
      <img src={assets.search_icon} alt="Search" className="w-6 h-6 ml-2" />
      {/* Display search results */}
      {results.length > 0 && (
        <div className="absolute bg-gray-900 rounded mt-2 p-4 w-full z-10">
          {results.map(song => (
            <div
              key={song._id}
              className="text-white cursor-pointer hover:bg-gray-700 p-2"
              onClick={() => handleSongClick(song)} // Redirect on click
            >
              {song.name} - {song.artistSongs.map(artist => artist.artistId.name).join(', ')}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default SearchBar;
