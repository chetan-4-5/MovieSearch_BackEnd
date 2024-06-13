const authMiddleware = require('../middleware/auth');
const express = require('express');
const axios = require('axios');
const router = express.Router();
const Playlist = require('../models/Playlist');

// Add movie to public playlist
router.post('/public/add/:id', authMiddleware, async (req, res) => {
    try {
        const { id } = req.params; // Movie ID
        const userId = req.user.id; // User ID from auth middleware

        console.log(`Adding movie ID ${id} to public playlist for user ${userId}`);

        // Fetch movie details from OMDB API
        const movieResponse = await axios.get(`https://www.omdbapi.com/?apikey=6f1b1840&i=${id}`);
        if (movieResponse.data.Response !== 'True') {
            return res.status(404).json({ msg: 'Movie not found' });
        }

        const movie = {
            imdbID: movieResponse.data.imdbID,
            title: movieResponse.data.Title,
            poster: movieResponse.data.Poster
        };

        console.log('Movie details fetched:', movie);

        // Find the public playlist
        let playlist = await Playlist.findOne({ userId, isPublic: true });

        if (!playlist) {
            // If no public playlist exists, create one
            playlist = new Playlist({
                name: 'Public Playlist',
                userId,
                movies: [movie],
                isPublic: true
            });
        } else {
            // Add movie to the existing public playlist
            if (playlist.movies.some(m => m.imdbID === movie.imdbID)) {
                return res.status(400).json({ msg: 'Movie already in public playlist' });
            }
            playlist.movies.push(movie);
        }

        console.log('Saving playlist:', playlist);

        await playlist.save();
        res.json(playlist);
    } catch (err) {
        console.error('Error adding movie to public playlist:', err.message);
        res.status(500).send('Server Error');
    }
});

// Fetch public playlists
router.get('/public', async (req, res) => {
    try {
        console.log('Fetching public playlists');
        const playlists = await Playlist.find({ isPublic: true }).populate('userId', 'username').populate('movies');
        console.log('Public playlists fetched:', playlists);
        res.status(200).json(playlists);
    } catch (error) {
        console.error('Failed to fetch public playlists:', error);
        res.status(500).send('Failed to fetch public playlists');
    }
});

// Add movie to private playlist
router.post('/private/add/:id', authMiddleware, async (req, res) => {
    try {
        const { id } = req.params; // Movie ID
        const userId = req.user.id; // User ID from auth middleware

        console.log(`Adding movie ID ${id} to private playlist for user ${userId}`);

        // Fetch movie details from OMDB API
        const movieResponse = await axios.get(`https://www.omdbapi.com/?apikey=6f1b1840&i=${id}`);
        if (movieResponse.data.Response !== 'True') {
            return res.status(404).json({ msg: 'Movie not found' });
        }

        const movie = {
            imdbID: movieResponse.data.imdbID,
            title: movieResponse.data.Title,
            poster: movieResponse.data.Poster
        };

        console.log('Movie details fetched:', movie);

        // Find the user's private playlist
        let playlist = await Playlist.findOne({ userId, isPublic: false });

        if (!playlist) {
            // If no private playlist exists, create one
            playlist = new Playlist({
                name: 'Private Playlist',
                userId,
                movies: [movie],
                isPublic: false
            });
        } else {
            // Add movie to the existing private playlist
            if (playlist.movies.some(m => m.imdbID === movie.imdbID)) {
                return res.status(400).json({ msg: 'Movie already in private playlist' });
            }
            playlist.movies.push(movie);
        }

        console.log('Saving playlist:', playlist);

        await playlist.save();
        res.json(playlist);
    } catch (err) {
        console.error('Error adding movie to private playlist:', err.message);
        res.status(500).send('Server Error');
    }
});

// Fetch private playlists for the current user
router.get('/private', authMiddleware, async (req, res) => {
    try {
        const userId = req.user.id;
        console.log(`Fetching private playlists for user ${userId}`);
        const privatePlaylists = await Playlist.find({ userId, isPublic: false }).populate('userId', 'username');
        console.log('Private playlists fetched:', privatePlaylists);
        res.json(privatePlaylists);
    } catch (err) {
        console.error('Failed to fetch private playlists', err);
        res.status(500).send('Server Error');
    }
});

// Delete movie from public playlist
router.delete('/public/:playlistId/:movieId', authMiddleware, async (req, res) => {
    try {
        const { playlistId, movieId } = req.params;
        const userId = req.user.id;

        console.log(`Deleting movie ID ${movieId} from public playlist ID ${playlistId} for user ${userId}`);

        // Find the public playlist owned by the user
        const playlist = await Playlist.findOne({ _id: playlistId, userId, isPublic: true });
        if (!playlist) {
            console.log('Public playlist not found');
            return res.status(404).json({ msg: 'Public playlist not found' });
        }

        // Remove the movie from the playlist
        playlist.movies = playlist.movies.filter(movie => movie.imdbID !== movieId);

        console.log('Playlist after deletion:', playlist);

        await playlist.save();
        res.json(playlist);
    } catch (err) {
        console.error('Error deleting movie from public playlist:', err.message);
        res.status(500).send('Server Error');
    }
});

// Delete movie from private playlist
router.delete('/private/:playlistId/:movieId', authMiddleware, async (req, res) => {
    try {
        const { playlistId, movieId } = req.params;
        const userId = req.user.id;

        console.log(`Deleting movie ID ${movieId} from private playlist ID ${playlistId} for user ${userId}`);

        // Find the private playlist owned by the user
        const playlist = await Playlist.findOne({ _id: playlistId, userId, isPublic: false });
        if (!playlist) {
            return res.status(404).json({ msg: 'Private playlist not found' });
        }

        // Remove the movie from the playlist
        playlist.movies = playlist.movies.filter(movie => movie.imdbID !== movieId);

        console.log('Playlist after deletion:', playlist);

        await playlist.save();
        res.json(playlist);
    } catch (err) {
        console.error('Error deleting movie from private playlist:', err.message);
        res.status(500).send('Server Error');
    }
});

module.exports = router;
