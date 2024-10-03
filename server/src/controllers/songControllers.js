const models = require('../models/models')

const getSongs = async (req, res) => {
  try {
    console.log('Attempting to fetch songs...');
    const songs = await models.Song.find()
      .populate({
        path: 'artistSongs',
        populate: {
          path: 'artistId',
          model: 'Artist'
        }
      })
      .populate('albums');
    
    console.log('Songs fetched successfully:', songs.length);
    res.json(songs);
  } catch (error) {
    console.error('Error fetching songs:', error);
    res.status(500).json({ error: 'Error fetching songs', details: error.message });
  }
};

const songController = {
  getSongById: async (req, res) => {
    try {
      const { id } = req.params;
      const song = await models.Song.findOne({ id })
        .populate('albums');

      if (!song) {
        return res.status(404).json({ message: 'Song not found' });
      }

      const transformedSong = {
        ...song.toObject(),
        albumName: song.albums[0]?.name || null,
        imageUrl: song.imageUrl,
      };

      res.json(transformedSong);
    } catch (error) {
      res.status(500).json({ message: 'Error fetching song', error: error.message });
    }
  },

  getAllSongs: async (req, res) => {
    try {
      const { page = 1, limit = 10 } = req.query;
      const skip = (page - 1) * limit;

      const songs = await models.Song.find()
        .skip(parseInt(skip))
        .limit(parseInt(limit))
        .populate('albums');

      const transformedSongs = songs.map(song => ({
        ...song.toObject(),
        albumName: song.albums[0]?.name || null,
      }));

      res.json(transformedSongs);
    } catch (error) {
      res.status(500).json({ message: 'Error fetching songs', error: error.message });
    }
  }
};

const searchSongs = async (req, res) => {
  try {
    const { query } = req.query;
    const songs = await models.Song.find({
      $or: [
        { name: { $regex: query, $options: 'i' } },
        { 'artistSongs.artistId.name': { $regex: query, $options: 'i' } }
      ]
    })
    .populate({
      path: 'artistSongs',
      populate: {
        path: 'artistId',
        model: 'Artist'
      }
    })
    .populate('albums');

    res.json(songs);
  } catch (error) {
    console.error('Error searching songs:', error);
    res.status(500).json({ error: 'Error searching songs', details: error.message });
  }
};

module.exports = {songController, getSongs, searchSongs};