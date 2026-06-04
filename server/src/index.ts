import express from 'express';
import cors from 'cors';
import axios from 'axios';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const port = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

const CLIENT_ID = process.env.SPOTIFY_CLIENT_ID;
const CLIENT_SECRET = process.env.SPOTIFY_CLIENT_SECRET;
const REDIRECT_URI = process.env.REDIRECT_URI;
const FRONTEND_URI = process.env.FRONTEND_URI || '';

// Serve static files from the React app
app.use(express.static(path.join(__dirname, '../../client/dist')));

app.get('/login', (req, res) => {
    const scope = 'user-library-read';
    const state = Math.random().toString(36).substring(7);
    
    const params = new URLSearchParams({
        response_type: 'code',
        client_id: CLIENT_ID!,
        scope: scope,
        redirect_uri: REDIRECT_URI!,
        state: state
    });

    res.redirect(`https://accounts.spotify.com/authorize?${params.toString()}`);
});

app.get('/callback', async (req, res) => {
    const code = req.query.code || null;
    const state = req.query.state || null;

    if (state === null) {
        res.redirect(`${FRONTEND_URI}/?error=state_mismatch`);
    } else {
        try {
            const params = new URLSearchParams({
                code: code as string,
                redirect_uri: REDIRECT_URI!,
                grant_type: 'authorization_code'
            });

            const response = await axios.post('https://accounts.spotify.com/api/token', params, {
                headers: {
                    'content-type': 'application/x-www-form-urlencoded',
                    'Authorization': 'Basic ' + Buffer.from(CLIENT_ID + ':' + CLIENT_SECRET).toString('base64')
                }
            });

            const { access_token, refresh_token, expires_in } = response.data;
            
            // Redirect back to frontend with tokens
            const queryParams = new URLSearchParams({
                access_token,
                refresh_token,
                expires_in: expires_in.toString()
            });

            res.redirect(`${FRONTEND_URI}/#${queryParams.toString()}`);
        } catch (error) {
            console.error('Error exchanging code for token', error);
            res.redirect(`${FRONTEND_URI}/?error=invalid_token`);
        }
    }
});

// Refresh token endpoint
app.get('/api/refresh_token', async (req, res) => {
// ... rest of logic
    const refresh_token = req.query.refresh_token;

    try {
        const params = new URLSearchParams({
            grant_type: 'refresh_token',
            refresh_token: refresh_token as string
        });

        const response = await axios.post('https://accounts.spotify.com/api/token', params, {
            headers: {
                'content-type': 'application/x-www-form-urlencoded',
                'Authorization': 'Basic ' + Buffer.from(CLIENT_ID + ':' + CLIENT_SECRET).toString('base64')
            }
        });

        res.json(response.data);
    } catch (error) {
        console.error('Error refreshing token', error);
        res.status(400).send({ error: 'invalid_refresh_token' });
    }
});

// Wildcard route to serve React's index.html for all other requests
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../../client/dist/index.html'));
});

app.listen(port, () => {
    console.log(`Server listening at http://localhost:${port}`);
});
