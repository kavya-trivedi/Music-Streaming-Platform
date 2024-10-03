import React, { useCallback, useContext } from 'react'
import { useLocation } from 'react-router-dom';
import { MusicPlayer } from '../context/MusicPlayer';

const UserPlaylist = () => {

    const location = useLocation();
    const { songList } = location.state;
    const { playTrackById } = useContext(MusicPlayer);

    const handlePlayTrack = useCallback((trackId) => {
        playTrackById(trackId);
      }, [playTrackById]);

      const formatDuration = useCallback((durationMs) => {
        const minutes = Math.floor(durationMs / 60000);
        const seconds = ((durationMs % 60000) / 1000).toFixed(0);
        return `${minutes}:${seconds.padStart(2, '0')}`;
      }, []);
    
    //   const totalDuration = useMemo(() => {
    //     return songList ? songList.reduce((total, song) => total + song.durationMs, 0) : 0;
    //   }, [albumName]);
    
    //   const formattedTotalDuration = useMemo(() => formatDuration(totalDuration), [formatDuration, totalDuration]);

    if (!songList) {
        return <div>Loading...</div>;
      }

  return (
    <>
        {songList.map((item, index) => (
        <div 
          onClick={() => handlePlayTrack(item.id)} 
          key={item.id}
          className='grid grid-cols-3 sm:grid-cols-4 gap-2 p-2 items-center text-[#a7a7a7] hover:bg-[#ffffff2b] cursor-pointer'
        >
          <p className='text-white'>
            <b className='mr-4 text-[#a7a7a7]'>{index + 1}</b>
            {item.name}
          </p>
          <p className='text-[15px] hidden sm:block'>{item.name}</p>
          <p className='text-[15px] text-center'>{formatDuration(item.durationMs)}</p>
        </div>
      ))}
    </>
  )
}

export default UserPlaylist