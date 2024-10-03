import React, { useEffect, useState } from 'react'
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { assets } from '../assets/assets';

const UserLibrary = () => {

    const navigate = useNavigate()
    const userId = localStorage.getItem('userId');
    const [playlists, setPlaylists] = useState([]);

    
    const getPlaylists = () => {
      axios.post('http://localhost:4000/api/get-playlist', {userId}).then((res)=>{
        setPlaylists(res.data.playlist_data);
      })
    }
    
    useEffect(() => {
        console.log('useEffect')
        getPlaylists()
    }, [])
    return (
      <>
        <div className='mb-4'>
          <h1 className='my-5 font-bold text-2xl'>My Playlists</h1>
          <div className='flex overflow-auto'>
            {playlists.map((playlist, index) => (
              <div onClick={()=>navigate(`/user-library-details/${playlist._id}`, { state: { songList: playlist.songList } })} className='w-[180px] p-2 px-3 rounded cursor-pointer hover:bg-[#ffffff26]' key={index}>
                {playlist.name==='Liked Songs' && <img className='rounded' src={assets.liked_songs} alt="Image" />}
                {playlist.name!=='Liked Songs' && <img className='rounded' src={playlist.imageUrl || assets.music_placeholder} alt="Image" />}
              <p className='font-bold text-white mt-2 mb-1'>{playlist.name}</p>
            </div>
            ))}
          </div>
        </div>
      </>
    );
}

export default UserLibrary