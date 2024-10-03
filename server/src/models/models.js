// models.js

const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  followers: { type: Number, default: 0 },
  following: { type: Number, default: 0 },
  playlists: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Playlist' }],
  likedSongs: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Song' }],
  savedAlbums: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Album' }]
});

const songSchema = new mongoose.Schema({
  id: { type: String, required: true, _id: true },
  name: { type: String, required: true },
  durationMs: { type: Number, required: true },
  imageUrl: { type: String, required: true },
  imageHeight: { type: Number, required: true },
  imageWidth: { type: Number, required: true },
  isExplicit: { type: Boolean, default: false },
  genre: { type: String },
  trackUri: { type: String },
  lyrics: { type: String },
  releaseDate: { type: Date, required: true },
  noOfLikes: { type: Number, default: 0 },
  popularity: { type: Number, default: 0 },
  artists: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Artist' }],
  artistSongs: [{ type: mongoose.Schema.Types.ObjectId, ref: 'ArtistSong' }],
  albums: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Album' }],
});

const artistSchema = new mongoose.Schema({
  id: { type: String, required: true, _id: true },
  name: { type: String, required: true },
  followers: { type: Number, default: 0 },
  genres: [{ type: String }],
  href: { type: String },
  imageUrl: { type: String },
  uri: { type: String },
  artistSongs: [{ type: mongoose.Schema.Types.ObjectId, ref: 'ArtistSong' }],
  artistAlbums: [{ type: mongoose.Schema.Types.ObjectId, ref: 'ArtistAlbum' }]
});

const albumSchema = new mongoose.Schema({
  id: { type: String, required: true, _id: true },
  name: { type: String, required: true },
  albumType: { type: String, required: true },
  releaseDate: { type: Date, required: true },
  totalSongs: { type: Number, default: 0 },
  noOfLikes: { type: Number, default: 0 },
  imageUrl: { type: String, required: true },
  imageHeight: { type: Number, required: true },
  imageWidth: { type: Number, required: true },
  artists: [{ type: mongoose.Schema.Types.ObjectId, ref: 'SongArtist' }],
  songs: [{ type: mongoose.Schema.Types.ObjectId, ref: 'AlbumSong' }],
  artistAlbums: [{ type: mongoose.Schema.Types.ObjectId, ref: 'ArtistAlbum' }],
  savedBy: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }]
});

const playlistSchema = new mongoose.Schema({
  name: { type: String, required: true },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  totalDurationMs: { type: Number, default: 0 },
  imageUrl: { type: String },
  isPrivate: { type: Boolean, default: false },
  songs: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Song' }],
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

const userLikedSongSchema = new mongoose.Schema({
  id: { type: mongoose.Schema.Types.ObjectId, required: true, _id: true },
  userId: { type: String },
  playlistId: { type: String }
});

const userSavedAlbumSchema = new mongoose.Schema({
  id: { type: mongoose.Schema.Types.ObjectId, required: true, _id: true },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  albumId: { type: mongoose.Schema.Types.ObjectId, ref: 'Album' }
}, { unique: ['userId', 'albumId'] });

const songArtistSchema = new mongoose.Schema({
  id: { type: mongoose.Schema.Types.ObjectId, required: true, _id: true },
  songId: { type: mongoose.Schema.Types.ObjectId, ref: 'Song' },
  artistId: { type: mongoose.Schema.Types.ObjectId, ref: 'Artist' }
}, { unique: ['songId', 'artistId'] });

const albumSongSchema = new mongoose.Schema({
  id: { type: mongoose.Schema.Types.ObjectId, required: true, _id: true },
  albumId: { type: mongoose.Schema.Types.ObjectId, ref: 'Album' },
  songId: { type: mongoose.Schema.Types.ObjectId, ref: 'Song' }
}, { unique: ['albumId', 'songId'] });

const artistSongSchema = new mongoose.Schema({
  id: { type: mongoose.Schema.Types.ObjectId, required: true, _id: true },
  artistId: { type: mongoose.Schema.Types.ObjectId, ref: 'Artist' },
  songId: { type: mongoose.Schema.Types.ObjectId, ref: 'Song' }
}, { unique: ['artistId', 'songId'] });

const artistAlbumSchema = new mongoose.Schema({
  id: { type: mongoose.Schema.Types.ObjectId, required: true, _id: true },
  artistId: { type: mongoose.Schema.Types.ObjectId, ref: 'Artist' },
  albumId: { type: mongoose.Schema.Types.ObjectId, ref: 'Album' }
}, { unique: ['artistId', 'albumId'] });

mongoose.pluralize(null);

module.exports = models = {
  User: mongoose.model('User', userSchema),
  Song: mongoose.model('Song', songSchema),
  Artist: mongoose.model('Artist', artistSchema),
  Album: mongoose.model('Album', albumSchema),
  Playlist: mongoose.model('Playlist', playlistSchema),
  UserLikedSong: mongoose.model('UserLikedSong', userLikedSongSchema),
  UserSavedAlbum: mongoose.model('UserSavedAlbum', userSavedAlbumSchema),
  SongArtist: mongoose.model('SongArtist', songArtistSchema),
  AlbumSong: mongoose.model('AlbumSong', albumSongSchema),
  ArtistSong: mongoose.model('ArtistSong', artistSongSchema),
  ArtistAlbum: mongoose.model('ArtistAlbum', artistAlbumSchema)
};
