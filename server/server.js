// index.js

const express = require('express');
const connectDB = require('./src/config/database');
const userRoutes = require('./src/routes/userRoutes');
const cors = require('cors');
const bodyParser = require('body-parser');
const songRoutes = require('./src/routes/songRoutes');
const albumRoutes = require('./src/routes/albumRoutes');
const artistRoutes = require('./src/routes/artistRoutes');
const authRoutes = require('./src/routes/authRoutes');

console.log('starting');

const app = express();
app.use(cors());

// Middleware to parse JSON data
app.use(express.json());

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.use('/api/songs', songRoutes);
app.use('/api/albums', albumRoutes);
app.use('/api/artists', artistRoutes);
app.use('/spotify', authRoutes);

// Connect to MongoDB
connectDB();

// Use the user routes
app.use('/api', userRoutes);

// Start the Express server
const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
