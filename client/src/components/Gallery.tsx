import React, { useEffect, useState } from 'react';
import { fetchSavedTracksAsAlbums } from '../spotify';
import { extractDominantColor, rgbToHsv, sortAlbumsByColor } from '../utils/colors';
import type { HSV } from '../utils/colors';

interface Album {
    id: string;
    name: string;
    images: { url: string }[];
    artists: { name: string }[];
    dominantColor?: { r: number, g: number, b: number };
    hsv?: HSV;
}

interface GalleryProps {
    token: string;
}

type GridSize = 'small' | 'medium' | 'large';

const Gallery: React.FC<GalleryProps> = ({ token }) => {
    const [albums, setAlbums] = useState<Album[]>([]);
    const [loading, setLoading] = useState(false);
    const [isStarted, setIsStarted] = useState(false);
    const [status, setStatus] = useState<string>('Initializing...');
    const [progress, setProgress] = useState({ current: 0, total: 0 });
    const [gridSize, setGridSize] = useState<GridSize>('medium');

    useEffect(() => {
        if (!isStarted) return;

        const loadAlbums = async () => {
            try {
                setLoading(true);
                setStatus('Fetching liked songs...');
                const fetchedAlbums = await fetchSavedTracksAsAlbums(token);
                
                if (!fetchedAlbums || fetchedAlbums.length === 0) {
                    setStatus('No liked songs found.');
                    setLoading(false);
                    return;
                }
                
                setStatus('Analyzing colors...');
                setProgress({ current: 0, total: fetchedAlbums.length });
                
                const albumsWithColors: Album[] = [];
                
                for (let i = 0; i < fetchedAlbums.length; i++) {
                    const album = fetchedAlbums[i];
                    try {
                        const rgb = await extractDominantColor(album.images[0].url);
                        const hsv = rgbToHsv(rgb);
                        albumsWithColors.push({
                            ...album,
                            dominantColor: rgb,
                            hsv: hsv
                        });
                    } catch (err) {
                        console.error(`Failed to extract color for ${album.name}`, err);
                        albumsWithColors.push(album);
                    }
                    setProgress(prev => ({ ...prev, current: i + 1 }));
                }

                setStatus('Sorting by rainbow order...');
                const sorted = sortAlbumsByColor(albumsWithColors);
                setAlbums(sorted);
            } catch (err) {
                console.error('Error loading gallery', err);
                setStatus('Error loading your library.');
            } finally {
                setLoading(false);
            }
        };

        loadAlbums();
    }, [isStarted, token]);

    const handleGenerate = () => {
        setIsStarted(true);
    };

    if (!isStarted) {
        return (
            <div className="setup-container">
                <p className="setup-description">
                    Palette will analyze your library and create a grid sorted by color. 
                    Choose your grid size and click generate!
                </p>
                <div className="setup-controls">
                    <div className="control-group">
                        <label htmlFor="grid-size">Grid Size: </label>
                        <select 
                            id="grid-size" 
                            value={gridSize} 
                            onChange={(e) => setGridSize(e.target.value as GridSize)}
                            className="grid-size-select"
                        >
                            <option value="small">Small (No Scroll)</option>
                            <option value="medium">Medium</option>
                            <option value="large">Large</option>
                        </select>
                    </div>
                    <button onClick={handleGenerate} className="generate-button">
                        Generate Palette
                    </button>
                </div>
            </div>
        );
    }

    if (loading && progress.total === 0) {
        return <div className="loading">{status}</div>;
    }

    if (loading) {
        return (
            <div className="loading">
                {status} ({progress.current} / {progress.total})
            </div>
        );
    }

    return (
        <div className="gallery-container">
            <div className="controls">
                <label htmlFor="grid-size">Grid Size: </label>
                <select 
                    id="grid-size" 
                    value={gridSize} 
                    onChange={(e) => setGridSize(e.target.value as GridSize)}
                    className="grid-size-select"
                >
                    <option value="small">Small (No Scroll)</option>
                    <option value="medium">Medium</option>
                    <option value="large">Large</option>
                </select>
            </div>
            <div className={`album-grid grid-${gridSize}`}>
                {albums.map((album) => (
                    <div key={album.id} className="album-item" title={`${album.artists[0].name} - ${album.name}`}>
                        <img 
                            src={album.images[0].url} 
                            alt={album.name} 
                            className="album-cover" 
                            crossOrigin="anonymous"
                        />
                    </div>
                ))}
            </div>
        </div>
    );
};

export default Gallery;
