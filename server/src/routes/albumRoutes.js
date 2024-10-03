// albumRoutes.js

const express = require('express');
const {getAlbums} = require('../controllers/albumControllers');
const {getAlbumById} = require('../controllers/albumControllers');

const router = express.Router();

router.get('/', getAlbums);
router.get('/:id', getAlbumById);

module.exports = router