require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bodyParser = require('body-parser');
const users = require('./routes/userRoutes');
const playlists = require('./routes/playlists');

const app = express();
app.use(cors());
app.use(bodyParser.json());
app.use('/api/users', users);
app.use('/api/playlists', playlists);

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost/movie-search', { 
    useNewUrlParser: true, 
    useUnifiedTopology: true 
})
.then(() => {
    console.log('Connected to MongoDB');
})
.catch((error) => {
    console.error('MongoDB connection error:', error);
});

// Handle errors if MongoDB connection fails
mongoose.connection.on('error', (err) => {
    console.error('MongoDB connection error:', err);
    process.exit(1); // Exit process with failure
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
