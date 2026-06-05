// Spotify API utility functions

const getHashParams = () => {
  const hashParams: any = {};
  let e, r = /([^&;=]+)=?([^&;]*)/g,
      q = window.location.hash.substring(1);
  while ( e = r.exec(q)) {
     hashParams[e[1]] = decodeURIComponent(e[2]);
  }
  return hashParams;
};

export const getAccessToken = () => {
    const params = getHashParams();
    const access_token = params.access_token;
    
    if (access_token) {
        window.localStorage.setItem('spotify_access_token', access_token);
        window.localStorage.setItem('spotify_token_timestamp', Date.now().toString());
        window.localStorage.setItem('spotify_expires_in', params.expires_in);
        // Clear hash
        window.history.pushState(null, '', window.location.pathname);
        return access_token;
    }

    const localToken = window.localStorage.getItem('spotify_access_token');
    const timestamp = window.localStorage.getItem('spotify_token_timestamp');
    const expiresIn = window.localStorage.getItem('spotify_expires_in');

    if (localToken && timestamp && expiresIn) {
        if (Date.now() - parseInt(timestamp) < parseInt(expiresIn) * 1000) {
            return localToken;
        }
    }

    return null;
};

export const logout = () => {
    window.localStorage.removeItem('spotify_access_token');
    window.localStorage.removeItem('spotify_token_timestamp');
    window.localStorage.removeItem('spotify_expires_in');
    window.localStorage.removeItem('spotify_refresh_token');
    window.location.href = window.location.origin;
};

export const fetchSavedTracksAsAlbums = async (token: string) => {
    let albumsMap = new Map<string, any>();
    let url = 'https://api.spotify.com/v1/me/tracks?limit=50';

    console.log("Spotify: Starting liked songs fetch...");
    while (url) {
        console.log(`Spotify: Fetching from ${url}`);
        const response = await fetch(url, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        
        if (!response.ok) {
            console.error(`Spotify: API error ${response.status}`);
            if (response.status === 401) logout();
            throw new Error('Failed to fetch tracks');
        }

        const data = await response.json();
        console.log(`Spotify: Received ${data.items.length} tracks. Total in library: ${data.total}`);
        
        data.items.forEach((item: any) => {
            const album = item.track.album;
            if (!albumsMap.has(album.id)) {
                albumsMap.set(album.id, album);
            }
        });

        url = data.next || null;
        
        // Safety cap to avoid infinite loading if library is massive
        if (albumsMap.size > 500) {
            console.log("Spotify: Cap reached (500 unique albums).");
            break;
        }
    }

    const uniqueAlbums = Array.from(albumsMap.values());
    console.log(`Spotify: Finished. Unique albums collected from liked songs: ${uniqueAlbums.length}`);
    return uniqueAlbums;
};
