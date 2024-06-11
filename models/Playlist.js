// models/Playlist.js
const mongoose = require('mongoose');

const playlistSchema = new mongoose.Schema({
    name: { type: String, required: true },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }, // Reference to the User model
    movies: [
        {
            imdbID: { type: String, required: true },
            title: { type: String, required: true },
            poster: { type: String, required: true },
        },
    ],
    isPublic: { type: Boolean, default: true }, // Changed from "public" to "isPublic" to avoid reserved keyword issues
});

const Playlist = mongoose.model('Playlist', playlistSchema);

module.exports = Playlist;
