const axios = require('axios');
const Buffer = require('buffer').Buffer;

let tokenInfo = null;

const callback = async (req, res) => {
  const code = req.query.code;
  const tokenUrl = 'https://accounts.spotify.com/api/token';
  const clientId = process.env.SPOTIFY_CLIENT_ID;
  const clientSecret = process.env.SPOTIFY_CLIENT_SECRET;
  const redirectUri = process.env.SPOTIFY_REDIRECT_URI;

  const headers = {
    Authorization: `Basic ${Buffer.from(`${clientId}:${clientSecret}`).toString('base64')}`,
    'Content-Type': 'application/x-www-form-urlencoded',
  };

  const body = new URLSearchParams({
    grant_type: 'authorization_code',
    code: code,
    redirect_uri: redirectUri,
  });

  try {
    const response = await axios.post(tokenUrl, body.toString(), { headers });
    if (response.status === 200) {
      tokenInfo = response.data;
      res.redirect(`http://localhost:3000/auth/callback?token=${tokenInfo.access_token}`);
    } else {
      res.status(response.status).json({ error: 'Failed to get token' });
    }
  } catch (error) {
    console.error('Error fetching tokens:', error.message);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

const authorize = (req, res) => {
  const clientId = process.env.SPOTIFY_CLIENT_ID;
  const redirectUri = process.env.SPOTIFY_RECIRECT_URI;
  const scope = 'user-library-read streaming user-read-playback-state user-modify-playback-state';
  const responseType = 'code';

  const authUrl = `https://accounts.spotify.com/authorize?response_type=${responseType}&client_id=${clientId}&redirect_uri=${encodeURIComponent(redirectUri)}&scope=${scope}`;
  res.redirect(authUrl);
};

module.exports = {
  callback,
  authorize,
  tokenInfo,
};
