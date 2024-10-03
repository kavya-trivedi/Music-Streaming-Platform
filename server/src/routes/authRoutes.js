const express = require('express');
const { authorize, callback } = require('../controllers/authControllers');

const router = express.Router();

router.get('/authorize', authorize);
router.get('/callback', callback);

module.exports = router;