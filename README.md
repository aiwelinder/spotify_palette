# Spotify Palette

A web application that visualizes your Spotify library as a grid of album covers, sorted in rainbow order.

## Prerequisites

1.  **Spotify Developer Account:** Go to [Spotify for Developers](https://developer.spotify.com/dashboard/) and create an app.
2.  **Redirect URI:** In your Spotify app settings, add `http://127.0.0.1:3001/callback` to the Redirect URIs.
3.  **Client ID & Secret:** Note down your Client ID and Client Secret.

## Setup

### Backend

1.  Navigate to the `server` directory:
    ```bash
    cd server
    ```
2.  Copy `.env.example` to `.env`:
    ```bash
    cp .env.example .env
    ```
3.  Fill in your `SPOTIFY_CLIENT_ID` and `SPOTIFY_CLIENT_SECRET` in the `.env` file.
4.  Install dependencies:
    ```bash
    npm install
    ```
5.  Start the server:
    ```bash
    npm run dev
    ```

### Frontend

1.  Navigate to the `client` directory:
    ```bash
    cd client
    ```
2.  Install dependencies:
    ```bash
    npm install
    ```
3.  Start the development server:
    ```bash
    npm run dev
    ```

## How it works

1.  **Authentication:** The app uses Spotify OAuth 2.0 to securely access your saved albums.
2.  **Color Extraction:** Once logged in, the app fetches your library and uses `colorthief` to find the dominant color of each album cover.
3.  **Sorting:** Albums are converted from RGB to HSV (Hue, Saturation, Value) and sorted primarily by Hue to create a beautiful rainbow spectrum.
