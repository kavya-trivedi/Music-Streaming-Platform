const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const models = require('../src/models/models');

mongoose.connect('mongodb://localhost:27017/music_player');

async function generateRandomUsers() {
  try {
    const songs = await models.Song.find(); // Get all songs
    if (songs.length === 0) {
      throw new Error('No songs found in the Song collection');
    }

    for (let i = 0; i < 100; i++) {
      // Generate random user details
      const userName = `User_${i}`;
      const email = `user_${i}@example.com`;
      const password = await bcrypt.hash('123', 10); // Encrypt password

      // Upsert the user
      const user = await models.User.findOneAndUpdate(
        { email: email }, // Filter by email
        {
          name: userName,
          email: email,
          password: password,
          followers: Math.floor(Math.random() * 500),
          following: Math.floor(Math.random() * 500),
          playlists: [],
          likedSongs: [],
        },
        { upsert: true, new: true, setDefaultsOnInsert: true }
      );

      // Random songs for liked songs
      const numberOfLikedSongs = Math.floor(Math.random() * 5) + 1; // Between 1 to 5 liked songs
      const likedSongs = [];
      for (let j = 0; j < numberOfLikedSongs; j++) {
        const randomSong = songs[Math.floor(Math.random() * songs.length)];
        likedSongs.push(randomSong._id); // Add song _id to likedSongs
      }

      // Create the "Liked Songs" playlist
      const likedSongsPlaylist = await models.Playlist.findOneAndUpdate(
        { name: "Liked Songs", userId: user._id },
        {
          name: "Liked Songs",
          userId: user._id,
          createdBy: user._id,
          totalDurationMs: 0,
          songs: likedSongs, // Add liked songs to the playlist
        },
        { upsert: true, new: true, setDefaultsOnInsert: true }
      );

      // Add the "Liked Songs" playlist to the UserLikedSong collection
      await models.UserLikedSong.findOneAndUpdate(
        { userId: user._id.toString(), playlistId: likedSongsPlaylist._id.toString() },
        {
          id: new mongoose.Types.ObjectId(), // Unique id for the UserLikedSong document
          userId: user._id.toString(),
          playlistId: likedSongsPlaylist._id.toString(),
        },
        { upsert: true, new: true, setDefaultsOnInsert: true }
      );

      // Add the "Liked Songs" playlist _id to the user's playlists field
      user.playlists.push(likedSongsPlaylist._id);

      // Create additional playlists with names other than "Liked Songs"
      const playlist = await models.Playlist.findOneAndUpdate(
        { name: `${userName}'s Playlist`, userId: user._id },
        {
          name: `${userName}'s Playlist`,
          userId: user._id,
          createdBy: user._id,
          totalDurationMs: 0,
          songs: [],
        },
        { upsert: true, new: true, setDefaultsOnInsert: true }
      );

      const numberOfSongsInPlaylist = Math.floor(Math.random() * 20) + 1; // Between 1 to 20 songs
      for (let j = 0; j < numberOfSongsInPlaylist; j++) {
        const randomSong = songs[Math.floor(Math.random() * songs.length)];
        playlist.songs.push(randomSong._id);
        playlist.totalDurationMs += randomSong.durationMs;
      }

      await playlist.save();

      // Add this additional playlist's _id to the user's playlists field
      user.playlists.push(playlist._id);

      // Update the user with playlists and likedSongs
      await models.User.updateOne(
        { _id: user._id },
        { $set: { playlists: user.playlists, likedSongs: likedSongs } }
      );

      console.log(`User ${userName} added/updated with "Liked Songs" and other playlists.`);
    }

    console.log('1000 users, "Liked Songs", and additional playlists added/updated successfully.');
  } catch (error) {
    console.error('Error generating users:', error);
  } finally {
    mongoose.connection.close();
  }
}

generateRandomUsers();
