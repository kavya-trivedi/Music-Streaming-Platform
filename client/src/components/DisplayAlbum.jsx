import React, { useContext, useState, useEffect, useCallback, useMemo } from 'react';
import { useParams } from 'react-router-dom';
import { MusicPlayer } from '../context/MusicPlayer';
import { assets } from '../assets/assets';
import Navbar from './Navbar';
import axios from 'axios';

// Main Component
const DisplayAlbum = () => {
  // 1. State and Context Initialization
  const { id } = useParams();
  const [albumName, setAlbumName] = useState(null);
  const [albumImage, setAlbumImage] = useState('');
  const [albumArtists, setAlbumArtists] = useState('');
  const [albumLikes, setAlbumLikes] = useState('');
  const [songList, setSongList] = useState([]);
  const [song_id, setSong_id] = useState([]);
  const [song_img, setSong_img] = useState([]);
  const [dropdownOpen, setDropdownOpen] = useState(null);
  const [playlistDropdownOpen, setPlaylistDropdownOpen] = useState(false);
  const { playTrackById, fetchAlbumById, fetchTrackById, currentTrack } = useContext(MusicPlayer);
  const [playlists, setPlaylists] = useState([]);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const userId = localStorage.getItem('userId');
  const [currentSongId, setCurrentSongId] = useState('');
  const [playlistId, setPlaylistId] = useState('');

  // 2. Data Fetching Functions
  const fetchAlbumData = useCallback(async () => {
    if (id && !albumName) {
      try {
        const data = await fetchAlbumById(id);
        setAlbumName(data.name);
        setAlbumImage(data.imageUrl);
        setAlbumArtists(data.artists);
        setAlbumLikes(data.noOfLikes);
        setSongList(data.songList);
      } catch (error) {
        console.error('Error fetching album data:', error);
      }
    }
  }, [id, fetchAlbumById, albumName]);

  const fetchSongData = useCallback(async (songId) => {
    if (songId) {
      try {
        const data = await fetchTrackById(songId);
        setSong_id(data._id);
        setSong_img(data.imageUrl);
      } catch (error) {
        console.error('Error fetching song data:', error);
      }
    }
  }, []);

  const getPlaylists = async () => {
    try {
      const res = await axios.post('http://localhost:4000/api/get-playlist', { userId });
      setPlaylists(res.data.playlist_data);
    } catch (error) {
      console.error('Error fetching playlists:', error);
    }
  };

  // 3. Effects
  useEffect(() => {
    fetchAlbumData();
  }, [fetchAlbumData]);

  useEffect(() => {
    if (currentTrack && currentTrack.id) {
      setCurrentSongId(currentTrack.id);
      fetchSongData(currentSongId);
    }
  }, [currentTrack, fetchSongData]);

  useEffect(() => {
    getPlaylists();
  }, []);

  // 4. Event Handlers
  const handlePlayTrack = useCallback((trackId) => {
    playTrackById(trackId);
  }, [playTrackById]);

  const handleDropdownToggle = (index) => {
    setDropdownOpen(dropdownOpen === index ? null : index);
    setPlaylistDropdownOpen(false);
  };

  const handleAddToPlaylist = async (playlistId, song_id, song_img) => {
    setError('');
    setSuccess('');
    try {
      await axios.post('http://localhost:4000/api/add-to-playlist', { playlistId, song_id, song_img });
      setSuccess('Song added');
    } catch (err) {
      setError(err.response?.data?.message || 'Error adding to playlist');
    }
  };

  const handleAddToLikedSongs = async(song_id) => {
    console.log(song_id);
    console.log('GET LIKED SONGS')
    const likedSongs = await axios.post('http://localhost:4000/api/get-likedsongs', {userId});
    console.log(likedSongs.data);
    // if (likedSongs.data.length === 0) {
      console.log('CREATE PLAYLIST')
      const playlistId = await axios.post('http://localhost:4000/api/create-playlist', {
        userId,
        name: 'Liked Songs',
      });
      setPlaylistId(playlistId.data)
    // }
    console.log('ADD TO LIKED SONGS')
    await axios.post('http://localhost:4000/api/add-to-likedsongs', {userId, song_id, playlistId});
    // handleAddToPlaylist(playlistId, song_id, song_img)
    await axios.post('http://localhost:4000/api/add-likedsong-to-playlist', { playlistId, song_id });
  };

  const handlePlaylistDropdownToggle = () => {
    setPlaylistDropdownOpen(!playlistDropdownOpen);
  };

  // 5. Utility Functions
  const formatDuration = useCallback((durationMs) => {
    const minutes = Math.floor(durationMs / 60000);
    const seconds = ((durationMs % 60000) / 1000).toFixed(0);
    return `${minutes}:${seconds.padStart(2, '0')}`;
  }, []);

  const totalDuration = useMemo(() => {
    return songList.reduce((total, song) => total + song.durationMs, 0);
  }, [songList]);

  const formattedTotalDuration = useMemo(() => formatDuration(totalDuration), [formatDuration, totalDuration]);

  // 6. Dropdown Component
  const Dropdown = ({ onAddToPlaylist, onAddToLikedSongs, isAbove }) => (
    <div className={`absolute ${isAbove ? 'bottom-full mb-1' : 'top-full mt-1'} bg-gray-800 z-10 text-white rounded shadow-md`}>
      <button onClick={handlePlaylistDropdownToggle} className="block px-4 py-2 hover:bg-gray-700 w-full text-left">Add to Playlist</button>
      {playlistDropdownOpen && (
        <div className="bg-gray-700 rounded mt-1">
          {playlists.map((playlist) => (
            <button key={playlist._id} onClick={() => handleAddToPlaylist(playlist._id, song_id, song_img)} className="block px-4 py-2 hover:bg-gray-600 w-full text-left">
              {playlist.name}
            </button>
          ))}
        </div>
      )}
      <button onClick={onAddToLikedSongs} className="block px-4 py-2 hover:bg-gray-700 w-full text-left">Add to Liked Songs</button>
    </div>
  );

  const isDropdownAbove = (index) => {
    const dropdownHeight = 80;
    const screenBottom = window.innerHeight;
    const iconBottom = document.querySelector(`#track-${index}`).getBoundingClientRect().bottom;
    return iconBottom + dropdownHeight > screenBottom;
  };

  // 7. Main Render Method
  if (!albumName) {
    return <div>Loading...</div>;
  }

  return (
    <>
      {/* <Navbar /> */}
      <div className='mt-10 flex gap-8 flex-col md:flex-row md:items-end'>
        <img className='w-48 rounded' src={albumImage || assets.default_album} alt={albumName} />
        <div className='flex flex-col'>
          <p>Album</p>
          <h2 className='text-5xl font-bold mb-4 md:text-7xl'>{albumName}</h2>
          <p className='mt-1'>
            <img className='inline-block w-5 mr-1' src={assets.spotify_logo} alt="Spotify" />
            {/* <b>{albumArtists.map(artist => artist.name).join(', ')}</b> */}
            • {albumLikes} likes
            • <b>{songList.length} tracks, </b>
            {formattedTotalDuration}
          </p>
        </div>
      </div>
      <div className='grid grid-cols-3 sm:grid-cols-3 mt-10 mb-4 pl-2 text-[#a7a7a7]'>
        <p><b className='mr-4'>#</b>Title</p>
        {/* <p>Artist</p> */}
        <img className='m-auto w-4' src={assets.clock_icon} alt="Duration" />
      </div>
      <hr />
      {songList.map((item, index) => (
        <div
          id={`track-${index}`}
          onClick={() => handlePlayTrack(item.id)}
          key={item.id}
          className='relative grid grid-cols-3 sm:grid-cols-5 gap-2 p-2 items-center text-[#a7a7a7] hover:bg-[#ffffff2b] cursor-pointer'
        >
          <p className='text-white'>
            <b className='mr-4 text-[#a7a7a7]'>{index + 1}</b>
            {item.name}
          </p>
          <p className='text-[15px] hidden sm:block'>{item.artists.map(artist => artist.name)}</p>
          <p className='text-[15px] text-center'>{formatDuration(item.durationMs)}</p>
          
          <div className="relative">
            <img
              className='m-auto w-4 cursor-pointer'
              src={assets.dot_icon}
              alt="Options"
              onClick={(e) => {
                e.stopPropagation();
                handleDropdownToggle(index);
              }}
            />
            {dropdownOpen === index && (
              <Dropdown
                onAddToLikedSongs={() => handleAddToLikedSongs(item._id)}
                isAbove={isDropdownAbove(index)}
              />
            )}
          </div>
        </div>
      ))}
    </>
  );
};

export default React.memo(DisplayAlbum);
