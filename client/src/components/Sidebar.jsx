import React, { useState } from 'react';
import { assets } from '../assets/assets';
import { useNavigate } from 'react-router-dom';
import PlaylistPopup from '../pages/PlaylistPopup';

const Sidebar = () => {
  const [isPopupOpen, setPopupOpen] = useState(false);
  const navigate = useNavigate();

  const handleOpenPopup = () => setPopupOpen(true);
  const handleClosePopup = () => setPopupOpen(false);

  return (
    <div className="w-64 h-full p-2 rounded flex flex-col gap-4 text-white hidden lg:flex bg-[#121212]">
      <div className="flex flex-col justify-around h-[15%] rounded">
        <div onClick={() => navigate('/')} className="flex items-center gap-3 pl-4 cursor-pointer hover:bg-[#1f1f1f] p-2 rounded">
          <img className="w-6" src={assets.home_icon} alt="Home" />
          <p className="font-bold">Home</p>
        </div>
        <div className="flex items-center gap-3 pl-4 cursor-pointer hover:bg-[#1f1f1f] p-2 rounded">
          <img className="w-6" src={assets.search_icon} alt="Search" />
          <p className="font-bold">Search</p>
        </div>
      </div>
      <div className="flex-grow rounded overflow-hidden">
        <div className="flex items-center justify-between p-4">
          <button className="flex items-center gap-3" onClick={() => navigate('/user-library')}>
            <img className="w-8" src={assets.stack_icon} alt="Your Library" />
            <p className="font-semibold">Your Library</p>
          </button>
          <div className="flex items-center gap-3">
            <img 
              className="w-5 cursor-pointer" 
              src={assets.plus_icon} 
              alt="Plus" 
              onClick={handleOpenPopup}
            />
            <img className="w-5" src={assets.arrow_icon} alt="Arrow" />
          </div>
        </div>
        <div className="p-4 m-2 bg-[#242424] rounded font-semibold flex flex-col gap-2">
          <h1>Let's find some podcasts to follow</h1>
          <p className="font-light">We'll keep you updated on new episodes</p>
          <button className="px-4 py-1.5 bg-white text-[15px] text-black rounded-full mt-2">Browse Podcasts</button>
        </div>
      </div>

      <PlaylistPopup isOpen={isPopupOpen} onClose={handleClosePopup} />
    </div>
  );
};

export default Sidebar;
