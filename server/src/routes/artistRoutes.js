const express = require('express');
const {getArtists} = require('../controllers/artistControllers');
const {getArtistById} = require('../controllers/artistControllers');

const router = express.Router();

router.get('/', getArtists);
router.get('/:id', getArtistById);

module.exports = router