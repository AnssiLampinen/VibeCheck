import { Song } from '../types';

// Helper to get environment variables safely
const getEnv = (key: string): string => {
  // @ts-ignore
  if (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env[key]) {
    // @ts-ignore
    return import.meta.env[key];
  }
  // @ts-ignore
  return typeof process !== 'undefined' && process.env ? process.env[key] : '';
};

let spotifyAccessToken: string | null = null;
let tokenExpiry: number = 0;

const getSpotifyToken = async (): Promise<string | null> => {
  const clientId = getEnv('VITE_SPOTIFY_CLIENT_ID');
  const clientSecret = getEnv('VITE_SPOTIFY_CLIENT_SECRET');

  if (!clientId || !clientSecret) {
    console.warn("Spotify credentials (VITE_SPOTIFY_CLIENT_ID/SECRET) are missing.");
    return null;
  }

  // Return cached token if still valid (minus 60s buffer)
  if (spotifyAccessToken && Date.now() < tokenExpiry - 60000) {
    return spotifyAccessToken;
  }

  try {
    const response = await fetch('https://accounts.spotify.com/api/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Authorization': 'Basic ' + btoa(`${clientId}:${clientSecret}`)
      },
      body: 'grant_type=client_credentials'
    });

    if (!response.ok) {
      console.error("Failed to fetch Spotify token:", response.statusText);
      return null;
    }

    const data = await response.json();
    spotifyAccessToken = data.access_token;
    tokenExpiry = Date.now() + (data.expires_in * 1000);
    return spotifyAccessToken;
  } catch (error) {
    console.error("Error authenticating with Spotify:", error);
    return null;
  }
};

export const searchSongs = async (query: string): Promise<Song[]> => {
  if (!query || query.length < 2) return [];

  const token = await getSpotifyToken();
  
  // If no token (credentials missing or auth failed), return empty array
  // This prevents the app from breaking if keys aren't set
  if (!token) {
    return [];
  }

  try {
    const response = await fetch(
      `https://api.spotify.com/v1/search?q=${encodeURIComponent(query)}&type=track&limit=5`,
      {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      }
    );

    if (!response.ok) return [];

    const data = await response.json();
    
    return data.tracks.items.map((track: any) => ({
      title: track.name,
      artist: track.artists.map((a: any) => a.name).join(', '),
      spotifyUrl: track.external_urls.spotify
    }));

  } catch (e) {
    console.warn("Spotify search failed", e);
    return [];
  }
};