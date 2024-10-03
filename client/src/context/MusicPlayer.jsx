// MusicPlayer.jsx

import React, { createContext, useState, useEffect, useCallback, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import axios from 'axios';

export const MusicPlayer = createContext();

// Format time helper function
const formatTime = (milliseconds) => {
    const totalSeconds = Math.floor(milliseconds / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
};

const MusicPlayerContext = (props) => {
    const location = useLocation(); // Get the location object
    const queryParams = new URLSearchParams(location.search);
    const queryToken = queryParams.get('token');

    const [accessToken, setAccessToken] = useState(queryToken || localStorage.getItem('accessToken'));
    const [player, setPlayer] = useState(null);
    const [deviceId, setDeviceId] = useState(null);
    const [tracks, setTracks] = useState([]);
    const [albums, setAlbums] = useState([]);
    const [artists, setArtists] = useState([]);
    const [currentTrack, setCurrentTrack] = useState(null);
    const [isPaused, setIsPaused] = useState(true);
    const [currentPosition, setCurrentPosition] = useState(0);
    const [trackDuration, setTrackDuration] = useState(0);
    const [currentTrackIndex, setCurrentTrackIndex] = useState(0);
    const [isAlbumsFetched, setIsAlbumsFetched] = useState(false);
    const [isArtistsFetched, setIsArtistsFetched] = useState(false);
    // const [isSDKReady, setIsSDKReady] = useState(false);
    // const [isInitialized, setIsInitialized] = useState(false);
    // const retryCount = useRef(0);

    useEffect(() => {
        if (queryToken) {
            // Store the token in localStorage for future use
            localStorage.setItem('accessToken', queryToken);
        }

        if (!accessToken) {
            console.error('No access token available.');
            return;
        }

        // Load Spotify's Web Playback SDK
        const scriptTag = document.getElementById('spotify-player');
        if (!scriptTag) {
            const script = document.createElement('script');
            script.id = 'spotify-player';
            script.src = 'https://sdk.scdn.co/spotify-player.js';
            script.async = true;
            document.body.appendChild(script);
        }

        // Setup Spotify Web Playback SDK
        window.onSpotifyWebPlaybackSDKReady = () => {
            const spotifyPlayer = new window.Spotify.Player({
                name: 'Web Playback SDK Player',
                getOAuthToken: cb => {
                    cb(accessToken);
                },
                volume: 0.5,
            });

            setPlayer(spotifyPlayer);


            spotifyPlayer.addListener('ready', ({ device_id }) => {
                console.log('Ready with Device ID', device_id);
                setDeviceId(device_id);
            });

            spotifyPlayer.addListener('not_ready', ({ device_id }) => {
                console.log('Device ID has gone offline', device_id);
            });

            spotifyPlayer.addListener('player_state_changed', (state) => {
                if (!state) return;
                // console.log(state.track_window);
                setCurrentTrack(state.track_window.current_track);
                setIsPaused(state.paused);
                setCurrentPosition(state.position);
                setTrackDuration(state.duration);
            });

            spotifyPlayer.addListener('initialization_error', ({ message }) => {
                console.error('Failed to initialize', message);
            });

            spotifyPlayer.addListener('authentication_error', ({ message }) => {
                console.error('Failed to authenticate', message);
            });

            spotifyPlayer.addListener('account_error', ({ message }) => {
                console.error('Account issue', message);
            });

            spotifyPlayer.connect().then(success => {
                if (success) {
                    console.log('The Web Playback SDK successfully connected to Spotify!');
                } else {
                    console.error('Failed to connect to Spotify');
                }
            });
        };

        return () => {
            if (player) {
                player.disconnect();
            }
        };
    }, [accessToken, player, queryToken]);

    try{useEffect(() => {
        // console.log(player['_getCurrentStateRequests']);
        let interval = null;
        if (!isPaused && player) {
            interval = setInterval(() => {
                player.getCurrentState().then(state => {
                    if (state) {
                        setCurrentPosition(state.position);
                    }
                });
            }, 1000);
        } else if (isPaused && interval) {
            clearInterval(interval);
        }
        return () => clearInterval(interval);
    }, [isPaused, player]);}
    catch(error){console.log(error);}

    const fetchTracks = useCallback(async () => {
        try {
            const response = await fetch('http://localhost:4000/api/songs');
            const data = await response.json();
            // console.log('Fetched songs:', data);
            setTracks(data);
            setCurrentTrackIndex(0);
        } catch (error) {
            console.error('Error fetching tracks:', error);
        }
    }, []);

    const fetchTrackById = useCallback(async (trackId) => {
        try {
            const response = await fetch(`http://localhost:4000/api/songs/${trackId}`);
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            const data = await response.json();
            // console.log('Fetched track:', data);
            return data;
        } catch (error) {
            console.error('Error fetching track:', error);
        }
    }, []);

    const fetchAlbums = useCallback(async () => {
        if (isAlbumsFetched) return;
        try {
            const response = await fetch('http://localhost:4000/api/albums');
            const data = await response.json();
            // console.log('Fetched albums:', data);
            setAlbums(data);
            setIsAlbumsFetched(true);
        } catch (error) {
            console.error('Error fetching albums:', error);
        }
    }, [isAlbumsFetched]);

    const fetchAlbumById = useCallback(async (albumId) => {
        try {
            const response = await fetch(`http://localhost:4000/api/albums/${albumId}`);
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            const data = await response.json();
            // console.log('Fetched album:', data);
            return data;
        } catch (error) {
            console.error('Error fetching album:', error);
        }
    }, []);

    const fetchArtists = useCallback(async () => {
        if (isArtistsFetched) return;
        try {
            const response = await fetch('http://localhost:4000/api/artists');
            const data = await response.json();
            // console.log('Fetched artists:', data);
            setArtists(data);
            setIsArtistsFetched(true);
        } catch (error) {
            console.error('Error fetching albums:', error);
        }
    }, [isArtistsFetched]);

    const fetchArtistById = useCallback(async (artistId) => {
        try {
            const response = await fetch(`http://localhost:4000/api/artists/${artistId}`);
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            const data = await response.json();
            console.log('Fetched artist:', data);
            return data;
        } catch (error) {
            console.error('Error fetching album:', error);
        }
    }, []);

    const playTrack = useCallback(async (trackUri) => {
        try {
            if (deviceId) {
                console.log(trackUri);
                await axios.put(
                    `https://api.spotify.com/v1/me/player/play?device_id=${deviceId}`,
                    {
                        uris: [trackUri],
                    },
                    {
                        headers: {
                            Authorization: `Bearer ${accessToken}`,
                        },
                    }
                );
            } else {
                console.error('Device ID is not set. Cannot play track.');
            }
        } catch (error) {
            console.error('Error playing track:', error);
        }
    }, [deviceId, accessToken]);

    const playTrackById = useCallback(async (trackId) => {
        try {
            if (deviceId) {
                console.log(`Playing track with ID: ${trackId}`);
                await axios.put(
                    `https://api.spotify.com/v1/me/player/play?device_id=${deviceId}`,
                    {
                        uris: [`spotify:track:${trackId}`],
                    },
                    {
                        headers: {
                            'Authorization': `Bearer ${accessToken}`,
                            'Content-Type': 'application/json',
                        },
                    }
                );
            } else {
                console.error('Device ID is not set. Cannot play track.');
            }
        } catch (error) {
            console.error('Error playing track:', error);
            if (error.response && error.response.status === 429) {
                console.log('Rate limit reached. Retrying after delay...');
                setTimeout(() => playTrackById(trackId), 5000);
            }
        }
    }, [deviceId, accessToken]);
    
    const togglePlayback = useCallback(() => {
        if (player) {
            player.togglePlay().catch(error => {
                console.error('Error toggling playback:', error);
            });
        }
    }, [player]);

    const seekToPosition = useCallback((positionMs) => {
        if (player) {
            player.seek(positionMs).then(() => {
                // console.log(`Seeked to position: ${positionMs}ms`);
            }).catch(error => {
                console.error('Error seeking track:', error);
            });
        } else {
            console.error('Player is not initialized');
        }
    }, [player]);

    const onSeek = useCallback((e) => {
        const progressBar = e.currentTarget;
        const clickPosition = e.nativeEvent.offsetX;
        const progressBarWidth = progressBar.offsetWidth;
        const newPosition = (clickPosition / progressBarWidth) * trackDuration;
    
        seekToPosition(newPosition);
    }, [trackDuration, seekToPosition]);

    const nextTrack = useCallback(() => {
        if (currentTrackIndex < tracks.length - 1) {
            setCurrentTrackIndex(currentTrackIndex + 1);
            playTrackById(tracks[currentTrackIndex + 1].id);
        }
    }, [currentTrackIndex, tracks, playTrackById]);

    const previousTrack = useCallback(() => {
        if (currentTrackIndex > 0) {
            setCurrentTrackIndex(currentTrackIndex - 1);
            playTrackById(tracks[currentTrackIndex - 1].id);
        }
    }, [currentTrackIndex, tracks, playTrackById]);

    const contextValue = {
        player,
        tracks,
        albums,
        artists,
        currentTrack,
        isPaused,
        currentPosition,
        trackDuration,
        currentTrackIndex,
        isAlbumsFetched,
        fetchTracks,
        fetchTrackById,
        fetchAlbums,
        fetchAlbumById,
        fetchArtists,
        fetchArtistById,
        playTrackById,
        togglePlayback,
        nextTrack,
        previousTrack,
        onSeek,
        formatTime,
    }
    return (
        <MusicPlayer.Provider value={contextValue}>
            {props.children}
        </MusicPlayer.Provider>
    );
};

export default MusicPlayerContext;