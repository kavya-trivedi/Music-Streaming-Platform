import React, { useEffect, useRef, useContext, useMemo, useCallback } from 'react';
import { Route, Routes, useLocation } from 'react-router-dom';
import DisplayHome from './DisplayHome';
import DisplayAlbum from './DisplayAlbum';
import { MusicPlayer } from '../context/MusicPlayer';
import SongPage from '../pages/SongPage';
import SearchResults from '../pages/SearchResults';
import DisplayArtist from './DisplayArtist';
import UserPlaylist from '../pages/UserPlaylist';

const Display = React.memo(() => {
  const { albums, fetchAlbums, isAlbumsFetched, tracks, fetchTracks, fetchArtists, isArtistsFetched } = useContext(MusicPlayer);
  const displayRef = useRef();
  const location = useLocation();

  useEffect(() => {
    if (!isAlbumsFetched) {
      fetchAlbums();
    }
    if (!isArtistsFetched) {
      fetchArtists();
    }
  }, [fetchAlbums, isAlbumsFetched, fetchArtists, isArtistsFetched]);

  useEffect(() => {
    if (tracks.length === 0) {
      fetchTracks();
    }
  }, [fetchTracks, tracks.length]);

  const isAlbumRoute = useMemo(() => location.pathname.startsWith('/albums/'), [location.pathname]);

  const updateBackground = useCallback(() => {
    displayRef.current.style.background = isAlbumRoute ? 'linear-gradient(#000000, #121212)' : '#121212';
  }, [isAlbumRoute]);

  useEffect(() => {
    updateBackground();
  }, [updateBackground]);

  return (
    <div ref={displayRef} className='flex-grow ml-2 px-6 pt-4 rounded bg-[#121212] text-white overflow-auto'>
      <Routes>
        <Route path='/' element={<DisplayHome />} />
        <Route path='/albums/:id' element={<DisplayAlbum />} />
        <Route path='/artists/:id' element={<DisplayArtist />} />
        <Route path='/get-recommended-playlist/:id' element={<UserPlaylist />} />
        <Route path="/search-results" element={<SearchResults />} />
        <Route path="/songs/:id" element={<SongPage />} />
      </Routes>
    </div>
  );
});

export default Display;
