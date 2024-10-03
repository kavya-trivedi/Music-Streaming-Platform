const express = require('express');
const {searchSongs} = require('../controllers/songControllers');
const {getSongs} = require('../controllers/songControllers');
const {songController} = require('../controllers/songControllers');

const router = express.Router();

router.get('/', getSongs);
router.get('/search', searchSongs);
router.get('/:id', songController.getSongById);
router.get('/test', (req, res) => {
    res.send('Test route is working!');
  });

module.exports = router;