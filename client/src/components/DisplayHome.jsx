import React, { useCallback, useEffect, useState } from 'react';
import AlbumItem from './AlbumItem';
import { useContext } from 'react';
import { MusicPlayer } from '../context/MusicPlayer';
import ArtistItem from './ArtistItem';
import SongItem from './SongItem';
import axios from 'axios';
import { assets } from '../assets/assets';
import { useNavigate } from 'react-router-dom';

const DisplayHome = () => {
  const { artists, albums, fetchTrackById } = useContext(MusicPlayer);
  const [recommendedPlaylists, setRecommendedPlaylists] = useState([]);
  const [playlistData, setPlaylistData] = useState([]);
  const [error, setError] = useState(null);
  const [songData, setSongData] = useState([]);
  const userId = localStorage.getItem('userId');
  const navigate = useNavigate()

  // useEffect(() => {
  //   const fetchRecommendedPlaylists = async () => {
  //     try {
  //       console.log(`Fetching recommendations for user: ${userId}`);
  //       const response = await axios.post(`http://127.0.0.1:8000/api/recommend/${userId}/`, {
  //         headers: {
  //           'Accept': 'application/json'
  //         }
  //       });
        
  //       if (response.data && Array.isArray(response.data)) {
  //         console.log('API Response:', response.data);
  //         setRecommendedPlaylists(response.data);
  //       } else {
  //         throw new Error('Unexpected response format');
  //       }
  //     } catch (error) {
  //       console.error('Error fetching recommendations:', error);
  //       setError(error.message);
  //       setRecommendedPlaylists([]);
  //     }
  //   };

  //   if (userId) {
  //     fetchRecommendedPlaylists();
  //   }
  // }, [userId]);

  // if (error) {
  //   return <div>Error: {error}</div>;
  // }

  // const fetchSongData = useCallback(async (songId) => {
  //   if (songId) {
  //     try {
  //       const data = await fetchTrackById(songId);
  //       setSongData((prevData) => [...prevData, data]);
  //       console.log('SONG DATA', songData)
  //     } catch (error) {
  //       console.error('Error fetching song data:', error);
  //     }
  //   }
  // }, []);

  
  // const getPlaylists = (playlistId) => {
  //   axios.post('http://localhost:4000/api/get-recommended-playlist', {playlistId}).then((res)=>{
  //     setPlaylistData(res.data.playlist_data);
  //   })
  // }
  
  // useEffect(() => {
  //   // Call fetchSongData for each recommended song when the component mounts
  //   recommendedPlaylists.forEach((item) => {
  //     // console.log('FETCHING PLAYLIST DATA', item)
  //     getPlaylists(item);
  //   });
  // }, [recommendedPlaylists, getPlaylists]);

  return (
    <>
      <div className='mb-4'>
        <h1 className='my-5 font-bold text-2xl'>Popular artists</h1>
        <div className='flex overflow-auto'>
          {artists.map((item, index) => (
            <ArtistItem key={index} name={item.name} desc="Artist" id={item.id} image={item.imageUrl} />
          ))}
        </div>
      </div>
      <div className='mb-4'>
        <h1 className='my-5 font-bold text-2xl'>Popular albums</h1>
        <div className='flex overflow-auto'>
          {albums.map((item, index) => (
            <AlbumItem key={index} name={item.name} desc="Album" id={item.id} image={item.imageUrl} />
          ))}
        </div>
      </div>
    </>
  );
};

export default DisplayHome;
