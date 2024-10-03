import React, { useContext, useState, useEffect, useCallback } from 'react';
import { assets } from '../assets/assets';
import { MusicPlayer } from '../context/MusicPlayer';
import '../styles/Player.css';

const Player = () => {
  const {
    currentTrack,
    isPaused,
    trackDuration,
    currentPosition,
    nextTrack,
    previousTrack,
    onSeek,
    togglePlayback,
    formatTime,
    fetchTrackById,
  } = useContext(MusicPlayer);

  const [songName, setSongName] = useState('');
  const [songImage, setSongImage] = useState('');

  var id;

  // Define the fetchSongData function to fetch song data only when the current track is available
  const fetchSongData = useCallback(async (id) => {
    if (id) {
      try {
        const data = await fetchTrackById(id);
        setSongName(data.name);
        setSongImage(data.imageUrl);
      } catch (error) {
        console.error('Error fetching song data:', error);
      }
    }
  }, [id, songName]);

  useEffect(() => {
    if (currentTrack && currentTrack.id) {
      id = currentTrack.id;
      fetchSongData(id);
    }
  }, [currentTrack, fetchSongData]);

  // Handles the playback toggle (play/pause)
  const handleTogglePlayback = () => {
    togglePlayback();
  };

  return currentTrack ? (
    <div className='h-[10%] bg-black flex justify-between items-center text-white px-4 fixed bottom-0 left-0 w-full'>
      <div className='hidden lg:flex items-center gap-4'>
        <img className='w-12' src={songImage} alt="" />
        <div>
          <p>{currentTrack.name}</p>
          <p className='text-[#a7a7a7]'>{currentTrack.artists.map(artist => artist.name).join(', ')}</p>
        </div>
        <img className='w-4' src={assets.like_icon} alt="Like" />
      </div>

      <div className='flex flex-col items-center gap-1 m-auto'>
        <div className='flex gap-4'>
          <img className='w-4 cursor-pointer' src={assets.shuffle_icon} alt="Shuffle" />
          <img onClick={previousTrack} className='w-4 cursor-pointer' src={assets.prev_icon} alt="Previous" />
          
          {isPaused ? (
            <img onClick={handleTogglePlayback} className='w-4 cursor-pointer' src={assets.play_icon} alt="Play" />
          ) : (
            <img onClick={handleTogglePlayback} className='w-4 cursor-pointer' src={assets.pause_icon} alt="Pause" />
          )}

          <img onClick={nextTrack} className='w-4 cursor-pointer' src={assets.next_icon} alt="Next" />
          <img className='w-4 cursor-pointer' src={assets.loop_icon} alt="Loop" />
        </div>

        <div className='flex items-center gap-5'>
            <p>{formatTime(currentPosition)}</p>
            <div 
                onClick={onSeek} 
                className='w-[60vw] max-w-[500px] bg-gray-300 rounded-full cursor-pointer'>
                <div
                    style={{ width: `${(currentPosition / trackDuration) * 100}%` }}
                    className='h-1 bg-green-800 rounded-full'>
                </div>
            </div>
            <p>{formatTime(trackDuration)}</p>
        </div>
        
      </div>

      <div className='hidden lg:flex items-center gap-2 opacity-75'>
        <img className='w-4' src={assets.plays_icon} alt="Plays" />
        <img className='w-4' src={assets.mic_icon} alt="Mic" />
        <img className='w-4' src={assets.queue_icon} alt="Queue" />
        <img className='w-4' src={assets.speaker_icon} alt="Speaker" />
        <img className='w-4' src={assets.volume_icon} alt="Volume" />
        <div className='w-20 bg-slate-50 h-1 rounded'></div>
        <img className='w-4' src={assets.mini_player_icon} alt="Mini Player" />
        <img className='w-4' src={assets.zoom_icon} alt="Zoom" />
      </div>
    </div>
  ) : null;
};

export default Player;
