const models = require('../models/models');

const getAlbums = async (req, res) => {
  try {
    const albums = await models.Album.find({ albumType: 'album' })
      .populate({
        path: 'artistAlbums',
        populate: {
          path: 'artistId',
          model: 'Artist'
        }
      })
      .populate({
        path: 'songs',
        populate: {
          path: 'songId',
          model: 'Song'
        }
      });

    res.status(200).json(albums);
  } catch (error) {
    console.error('Error fetching albums:', error);
    res.status(500).json({ error: 'Failed to fetch albums' });
  }
};

const getAlbumById = async (req, res) => {
  try {
    const { id } = req.params;
    
    const album = await models.Album.findOne({ id })
      .populate({
        path: 'songs',
        populate: {
          path: 'songId',
          model: 'Song'
        }
      })
      .populate({
        path: 'artistAlbums',
        populate: {
          path: 'artistId',
          model: 'Artist'
        }
      });

      const album1 = await models.Album.findOne({ id })
      album.songs = album1.songs
      const songList = await models.Song.find({ _id : { $in : album.songs }}, {durationMs:1, imageUrl:1, lyrics:1, genre:1, artists:1, name:1, id:1})

    if (album) {
      if (album.albumType === 'album') {
        // console.log(songList)
        res.json({name: album.name, imageUrl: album.imageUrl, songList: songList, artists: album.artists, noOfLikes: album.noOfLikes});
      } else {
        res.status(404).json({ error: 'Album not found' });
      }
    } else {
      res.status(404).json({ error: 'Album not found' });
    }
  } catch (error) {
    console.error('Error fetching album:', error);
    res.status(500).json({ error: 'Error fetching album', details: error.message });
  }
};

module.exports = {getAlbums, getAlbumById};