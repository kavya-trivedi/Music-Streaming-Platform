import React from 'react';
import { assets } from '../assets/assets';
import { Link } from 'react-router-dom';
import SearchBar from './SearchBar';

const Navbar = ({ token, setToken }) => {
  return (
    <div className="w-full flex justify-between items-center py-2 px-6 bg-black text-white">
      {/* Logo */}
      <img src={assets.spotify_logo} alt="Spotify Logo" className="w-8 h-8" />
      
      {/* Search bar */}
      <SearchBar />

      {/* Auth buttons */}
      <div className="flex gap-4">
        <Link to="/user-signup" className="no-underline">
          <button className="text-white px-4 py-2 rounded-full">Sign up</button>
        </Link>
        <Link to="/user-login" className="no-underline">
          <button className="text-black bg-white px-4 py-2 rounded-full">Log in</button>
        </Link>
        {(
          <button
            onClick={() => {
              setToken('');
              localStorage.removeItem('accessToken');
            }}
            className="text-black bg-white px-4 py-2 rounded-full"
          >
            LogoutToken
          </button>
        )}
      </div>
    </div>
  );
};

export default Navbar;
