const express = require('express');
const User = require('../models/models');
const bcrypt = require('bcrypt');
const mongoose = require('mongoose');
const { Types, model } = require('mongoose');
const models = require('../models/models');
const ObjectId = Types.ObjectId;

const router = express.Router();

// Route to save user
router.post('/u-signup', async (req, res) => {
  const { name, email, password } = req.body;

  try {
    // Check if the email is already in use
    const existingUser = await models.User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'Email already in use' });
    }

    // Hash the password before saving it
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create a new user
    const newUser = new models.User({
      name,
      email,
      password: hashedPassword,
    });

    // Save the user to the database
    await newUser.save();

    res.status(201).json({ message: 'User created successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Something went wrong' });
  }
});

router.post('/u-login', async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await models.User.findOne({ email });
    if (!user) {
      return res.status(400).json({ error: 'Invalid email or password' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ error: 'Invalid email or password' });
    }

    const userId = user._id.toString();
    res.json({ message: 'Login successful', userId });
  } catch (error) {
    res.status(500).json({ error: 'Something went wrong' });
  }
});

router.post('/get-playlist', async(req, res) => {
  const { userId } = req.body;
  const playlistData = await models.Playlist.find({ userId : new ObjectId(userId) })
  var counter = 0;
  var playlist_data = [];
  for (const playlist in playlistData) {

    const songs = await models.Song.find({
        _id: { $in: playlistData[playlist].songs }
    });

    var songData = {};
    const playlist1 = playlistData[playlist];
    const playlistDoc = playlist1._doc || playlist1;

    for (const [key, value] of Object.entries(playlistDoc)) {
      // console.log(`${key}: ${JSON.stringify(value)}`);
      songData[key] = value;
    }

    songData.songList = songs;
    playlist_data.push(songData);

  }
  res.json({ playlist_data: playlist_data });
});

router.post('/create-playlist', async(req, res) => {
  const { userId, name } = req.body;
  console.log(userId, name);

  var playlistId;
  
  const existingPlaylist = await models.Playlist.findOne({ name, userId });
    if (existingPlaylist) {
      return res.json(existingPlaylist._id);
    }

    // Create a new user
    const newPlaylist = new models.Playlist({
      userId,
      name,
    });

    const addPlaylistToUser = async (userId, playlistName) => {
      try {
        const playlist = await models.Playlist.findOne({ name: playlistName });
    
        if (!playlist) {
          throw new Error('Playlist not found');
        }
    
        // Add the playlist's _id to the user's playlists
        const user = await models.User.findByIdAndUpdate(
          userId,
          { $addToSet: { playlists: playlist._id } },
          { new: true } // Return the updated user document
        );

        playlistId = playlist._id;

        if (!user) {
          throw new Error('User not found');
        }
    
        return user; // Return the updated user document
      } catch (error) {
        console.error(error);
        throw error;
      }
    };

    await newPlaylist.save();
    
    addPlaylistToUser(userId, name)
    .then(user => console.log('Updated User:', user))
    .catch(err => console.error(err));

    // res.status(201).json({ message: 'Playlist created successfully' });
    res.json(playlistId)
})

router.post('/add-to-playlist', async (req, res) => {
  const { playlistId, song_id, song_img } = req.body;
  // const newPlaylistId = play
  console.log('ADD TO PLAYLIST',playlistId, song_id)

  try {
    const playlist = await models.Playlist.findById(playlistId);

    if (!playlist) {
      return res.status(404).json({ message: 'Playlist not found' });
    }

    // Update imageUrl only if it's empty
    if (!playlist.imageUrl || playlist.imageUrl=='') {
      playlist.imageUrl = song_img;
    }

    playlist.songs.addToSet(song_id);

    const updatedPlaylist = await playlist.save();

    res.json(updatedPlaylist);
  } catch (error) {
    console.error('Error adding song to playlist:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

router.post('/add-likedsong-to-playlist', async (req, res) => {
  const { playlistId, song_id } = req.body;
  const newPlaylistId = playlistId.data
  console.log('ADD TO PLAYLIST',newPlaylistId, 'songID =',song_id)

  try {
    const playlist = await models.Playlist.findById(newPlaylistId);

    if (!playlist) {
      return res.status(404).json({ message: 'Playlist not found' });
    }

    playlist.songs.addToSet(song_id);

    const updatedPlaylist = await playlist.save();

    res.json(updatedPlaylist);
  } catch (error) {
    console.error('Error adding song to playlist:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

router.post('/get-likedsongs', async(req, res) => {
  const { userId } = req.body;
  const likedSongs = await models.UserLikedSong.find({ userId : new ObjectId(userId) })
  console.log(likedSongs)
  res.json( likedSongs );
});

router.post('/add-to-likedsongs', async (req, res) => {
  const { userId, song_id, playlistId } = req.body;

  // console.log('Inputs:', { userId, song_id, playlistId: playlistId.data });

  // Validate the userId and playlistId (as strings)
  if (!userId || !playlistId || !song_id) {
    return res.status(400).send({ message: 'userId, song_id, and playlistId are required' });
  }

  // console.log('Validated IDs:', { userId, song_id, playlistId: playlistId.data });

  try {
    // Update user with the liked song
    const user = await models.User.findByIdAndUpdate(
      userId,
      { $addToSet: { likedSongs: new ObjectId(song_id) } },
      { new: true }
    );

    
    const likedSong = new models.UserLikedSong({
      id: new ObjectId(), // Generate a new ObjectId
      userId: userId,
      playlistId: playlistId.data
    });
    
    await likedSong.save();
    console.log('console', likedSong);
    console.log('Saved to Liked Songs!');

    res.status(200).send({ message: 'Added to liked songs successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).send({ message: 'Error adding to liked songs', error });
  }
});

router.post('/get-recommended-playlist', async(req, res) => {
  const { userId } = req.body;
  const playlistData = await models.Playlist.find({ userId : { $ne : new ObjectId(userId)} })
  var counter = 0;
  var playlist_data = [];
  for (const playlist in playlistData) {

    const songs = await models.Song.find({
        _id: { $in: playlistData[playlist].songs }
    });

    var songData = {};
    const playlist1 = playlistData[playlist];
    const playlistDoc = playlist1._doc || playlist1;

    for (const [key, value] of Object.entries(playlistDoc)) {
      // console.log(`${key}: ${JSON.stringify(value)}`);
      songData[key] = value;
    }

    songData.songList = songs;
    playlist_data.push(songData);

  }
  res.json({ playlist_data: playlist_data });
});

router.post('/get-recommended-playlist/:id', async(req, res) => {
  const { userId } = req.body;
  const playlistData = await models.Playlist.find({ userId : { $ne : new ObjectId(userId)} })
  var counter = 0;
  var playlist_data = [];
  if (counter < 5) {
  for (const playlist in playlistData) {

    const songs = await models.Song.find({
        _id: { $in: playlistData[playlist].songs }
    });

    var songData = {};
    const playlist1 = playlistData[playlist];
    const playlistDoc = playlist1._doc || playlist1;

    for (const [key, value] of Object.entries(playlistDoc)) {
      // console.log(`${key}: ${JSON.stringify(value)}`);
      songData[key] = value;
    }

    songData.songList = songs;
    playlist_data.push(songData);
    counter = counter + 1;
  }
}
  res.json({ playlist_data: playlist_data });
});


module.exports = router;