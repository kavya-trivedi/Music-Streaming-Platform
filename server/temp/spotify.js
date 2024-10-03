const mongoose = require('mongoose');
const axios = require('axios');
const cheerio = require('cheerio');
const dotenv = require('dotenv');
const SpotifyWebApi = require('spotify-web-api-node');
const models = require('../src/models/models.js');

dotenv.config();

mongoose.connect("mongodb://localhost:27017/music_player");

const spotifyApi = new SpotifyWebApi({
  clientId: process.env.SPOTIFY_CLIENT_ID,
  clientSecret: process.env.SPOTIFY_CLIENT_SECRET,
});

const GENIUS_ACCESS_TOKEN = process.env.GENIUS_ACCESS_TOKEN;

async function authenticateSpotify() {
  try {
    const data = await spotifyApi.clientCredentialsGrant();
    const accessToken = data.body.access_token;
    spotifyApi.setAccessToken(accessToken);
  } catch (error) {
    console.error('Error authenticating with Spotify:', error);
    throw error;
  }
}

async function getGenres(artistId) {
  try {
    const artistInfo = await spotifyApi.getArtist(artistId);
    return artistInfo.body.genres;
  } catch (error) {
    console.error(`Error fetching genres for artist ${artistId}:`, error);
    return [];
  }
}

async function searchSongOnGenius(artistName, trackName) {
  try {
    const response = await axios.get('https://api.genius.com/search', {
      headers: {
        'Authorization': `Bearer ${GENIUS_ACCESS_TOKEN}`,
      },
      params: {
        q: `${artistName} ${trackName}`,
      },
    });
    const hits = response.data.response.hits;
    if (hits.length > 0) {
      return hits[0].result.url;
    }
    console.log(`No Genius results found for "${trackName}" by ${artistName}`);
    return null;
  } catch (error) {
    console.error(`Error searching for "${trackName}" by ${artistName} on Genius:`, error.message);
    return null;
  }
}

async function getLyrics(url) {
  if (!url) return null;
  try {
    const response = await axios.get(url);
    const $ = cheerio.load(response.data);
    $('script').remove();
    let lyrics = $('.lyrics').text().trim();
    if (!lyrics) {
      lyrics = $('div[class^="Lyrics__Container"]').text().trim();
    }
    if (lyrics) {
      return lyrics.replace(/(\[.+?\])/g, '\n$1\n');
    }
    console.log(`No lyrics found at ${url}`);
    return null;
  } catch (error) {
    console.error(`Error fetching lyrics from ${url}:`, error.message);
    return null;
  }
}

async function processSong(track, albumId) {
  try {
    const fullTrackInfo = await spotifyApi.getTrack(track.id);
    const trackData = fullTrackInfo.body;
    console.log("Processing track:", trackData.name);
    const genres = await getGenres(trackData.artists[0].id);
    const primaryGenre = genres.length > 0 ? genres[0] : '';
    const geniusUrl = await searchSongOnGenius(trackData.artists[0].name, trackData.name);
    const lyrics = await getLyrics(geniusUrl);

    const song = await models.Song.findOneAndUpdate(
      { id: trackData.id },
      {
        id: trackData.id,
        name: trackData.name,
        durationMs: trackData.duration_ms,
        imageUrl: trackData.album.images[0]?.url || '',
        imageHeight: trackData.album.images[0]?.height || 0,
        imageWidth: trackData.album.images[0]?.width || 0,
        isExplicit: trackData.explicit,
        genre: primaryGenre,
        trackUri: trackData.uri,
        lyrics: lyrics,
        releaseDate: new Date(trackData.album.release_date),
        popularity: trackData.popularity,
        albums: [albumId],
      },
      { upsert: true, new: true }
    );

    const artistIds = [];
    const artistSongs = [];

    console.log('artist DATA',trackData.artists)
    for (const artistInfo of trackData.artists) {
      const fullArtistInfo = await spotifyApi.getArtist(artistInfo.id);
      console.log('FULL ARTIST DATA',fullArtistInfo)
      const artist = await models.Artist.findOneAndUpdate(
        { id: fullArtistInfo.body.id },
        { 
          id: fullArtistInfo.body.id,
          name: fullArtistInfo.body.name,
          genres: fullArtistInfo.body.genres,
          href: fullArtistInfo.body.href,
          followers: fullArtistInfo.body.followers.total,
          imageUrl: fullArtistInfo.body.images.length > 0 ? fullArtistInfo.body.images[0].url : '',
          uri: fullArtistInfo.body.uri,
          $addToSet: {
            artistSongs: song._id,
            artistAlbums: albumId
          }
        },
        { upsert: true, new: true }
      );

      artistIds.push(artist._id);
      
      // Get other songs by this artist
      const otherSongs = await models.Song.find({ 
        'artists': artist._id, 
        '_id': { $ne: song._id } 
      }).select('_id');
      artistSongs.push(...otherSongs.map(s => s._id));

      // Update artist's albums
      await models.Artist.updateOne(
        { _id: artist._id },
        { $addToSet: { artistAlbums: albumId } }
      );
    }

    // Update song with artist songs
    await models.Song.updateOne(
      { _id: song._id },
      { 
        $set: { artists: artistIds },
        $addToSet: { artistSongs: { $each: artistSongs } }
      }
    );

    // Update album
    await models.Album.updateOne(
      { _id: albumId },
      { 
        $addToSet: { 
          songs: song._id,
          artists: { $each: artistIds }
        }
      }
    );

    console.log(`Processed song: ${song.name} with ID: ${song.id}, genre: ${primaryGenre}, and lyrics ${lyrics ? 'found' : 'not found'}`);

    return song._id;
  } catch (error) {
    console.error(`Error processing song ${track.id}:`, error);
    return null;
  }
}

async function processAlbum(album) {
  try {
    const albumData = await spotifyApi.getAlbum(album.id);
    const tracks = albumData.body.tracks.items;

    const albumDoc = await models.Album.findOneAndUpdate(
      { id: album.id },
      {
        id: album.id,
        name: album.name,
        albumType: album.album_type,
        releaseDate: new Date(album.release_date),
        totalSongs: album.total_tracks,
        imageUrl: album.images[0]?.url || '',
        imageHeight: album.images[0]?.height || 0,
        imageWidth: album.images[0]?.width || 0,
      },
      { upsert: true, new: true }
    );

    const songIds = [];
    for (const track of tracks) {
      const songId = await processSong(track, albumDoc._id);
      if (songId) songIds.push(songId);
    }

    // Update album with songs
    await models.Album.updateOne(
      { _id: albumDoc._id },
      { $set: { songs: songIds } }
    );

    // Get all artists of this album
    const artists = await models.Artist.find({ artistAlbums: albumDoc._id });

    // For each artist, get their other albums
    for (const artist of artists) {
      const otherAlbums = await models.Album.find({ 
        'artists': artist._id, 
        '_id': { $ne: albumDoc._id } 
      }).select('_id');

      // Update album with artist's other albums
      await models.Album.updateOne(
        { _id: albumDoc._id },
        { $addToSet: { artistAlbums: { $each: otherAlbums.map(a => a._id) } } }
      );
    }

    console.log(`Processed album: ${album.name} with ID: ${album.id}`);
  } catch (error) {
    console.error(`Error processing album ${album.id}:`, error);
  }
}

async function fetchAndStoreSongs() {
  try {
    await authenticateSpotify();
    let allNewReleases = [];
    let offset = 0;
    const limit = 50;

    while (true) {
      const newReleases = await spotifyApi.getNewReleases({ limit: limit, offset: offset, country: 'US' });
      allNewReleases = allNewReleases.concat(newReleases.body.albums.items);

      if (newReleases.body.albums.next === null) {
        break;
      }

      for (const album of newReleases.body.albums.items) {
        await processAlbum(album);
      }

      offset += limit;
    }
    // const newReleases = await spotifyApi.getNewReleases({ limit: 20, offset: 0, country: 'US' });
    console.log('Finished processing albums and songs');
  } catch (error) {
    console.error('Error in fetchAndStoreSongs:', error);
  } finally {
    await mongoose.disconnect();
  }
}


async function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function fetchGenreAlbums(genre) {
  await authenticateSpotify();
  let offset = 0;
  const limit = 50;
  const targetCount = 1000; // Target number of albums
  let allAlbums = [];

  while (allAlbums.length < targetCount) {
    try {
      const result = await spotifyApi.search(genre, ['album'], { limit, offset });
      allAlbums = allAlbums.concat(result.body.albums.items);

      for (const album of result.body.albums.items) {
        await processAlbum(album);
      }

      if (!result.body.albums.next) {
        break; // No more albums in this genre
      }

      offset += limit;

      // Delay to avoid hitting rate limits
      await delay(1000); // 1 second delay
    } catch (error) {
      if (error.statusCode === 429) {
        // Handle rate limit error
        const retryAfter = parseInt(error.headers['retry-after'], 10) || 5; // Get retry time
        console.log(`Rate limit exceeded. Retrying after ${retryAfter} seconds.`);
        await delay(retryAfter * 1000); // Wait for the specified time before retrying
      } else {
        console.error(`Error fetching albums for genre ${genre}:`, error);
        break; // Break out of the loop on other errors
      }
    }
  }
  console.log(`Finished fetching ${allAlbums.length} albums for genre ${genre}`);
}

const genres = ["acoustic","afrobeat","alt-rock","alternative","ambient","anime","black-metal","bluegrass","blues","bossanova","brazil","breakbeat","british","cantopop","chicago-house","children","chill","classical","club","comedy","country","dance","dancehall","death-metal","deep-house","detroit-techno","disco","disney","drum-and-bass","dub","dubstep","edm","electro","electronic","emo","folk","forro","french","funk","garage","german","gospel","goth","grindcore","groove","grunge","guitar","happy","hard-rock","hardcore","hardstyle","heavy-metal","hip-hop","holidays","honky-tonk","house","idm","indian","indie","indie-pop","industrial","iranian","j-dance","j-idol","j-pop","j-rock","jazz","k-pop","kids","latin","latino","malay","mandopop","metal","metal-misc","metalcore","minimal-techno","movies","mpb","new-age","new-release","opera","pagode","party","philippines-opm","piano","pop","pop-film","post-dubstep","power-pop","progressive-house","psych-rock","punk","punk-rock","r-n-b","rainy-day","reggae","reggaeton","road-trip","rock","rock-n-roll","rockabilly","romance","sad","salsa","samba","sertanejo","show-tunes","singer-songwriter","ska","sleep","songwriter","soul","soundtracks","spanish","study","summer","swedish","synth-pop","tango","techno","trance","trip-hop","turkish","work-out","world-music"]

async function fetchAllGenres() {
  for (let genre of genres) {
    try {
      await fetchGenreAlbums(genre);
      console.log(`Finished fetching albums for genre: ${genre}`);
    } catch (error) {
      console.error(`Error fetching albums for genre ${genre}:`, error);
    }
  }
}

// Call the fetchAllGenres function
fetchAllGenres();

// fetchAndStoreSongs().catch(error => {
//   console.error('Unhandled error in main execution:', error);
//   process.exit(1);
// });