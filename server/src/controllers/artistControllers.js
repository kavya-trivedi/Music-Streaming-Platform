const models = require('../models/models');

const getArtists = async (req, res) => {
  try {
    const artists = await models.Artist.find()
      .populate({
        path: 'artistAlbums',
        populate: {
          path: 'albumId',
          model: 'Album'
        }
      })
      .populate({
        path: 'artistSongs',
        populate: {
          path: 'songId',
          model: 'Song'
        }
      });

    res.status(200).json(artists);
  } catch (error) {
    console.error('Error fetching albums:', error);
    res.status(500).json({ error: 'Failed to fetch albums' });
  }
};

const getArtistById = async (req, res) => {
  try {
    const { id } = req.params;
    console.log('THIS IS GET ARTIST BY ID', id)
    
    const artist = await models.Artist.findOne({ id })
      .populate({
        path: 'artistSongs',
        populate: {
          path: 'songId',
          model: 'Song'
        }
      })
      .populate({
        path: 'artistAlbums',
        populate: {
          path: 'albumId',
          model: 'Album'
        }
      });

      const artist1 = await models.Artist.findOne({ id })
      artist.artistSongs = artist1.artistSongs
      const songList = await models.Song.find({ _id : { $in : artist.artistSongs }}, {durationMs:1, imageUrl:1, lyrics:1, genre:1, artists:1, name:1, id:1})

    if (artist) {
      // console.log(songList)
      res.json({name: artist.name, imageUrl: artist.imageUrl, songList: songList, albums: artist.albums});
    } else {
      res.status(404).json({ error: 'Album not found' });
    }
  } catch (error) {
    console.error('Error fetching album:', error);
    res.status(500).json({ error: 'Error fetching album', details: error.message });
  }
};

module.exports = {getArtists, getArtistById};