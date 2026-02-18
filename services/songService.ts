import { Song } from '../types';

// Helper to get environment variables safely
const getEnv = (key: string): string => {
  try {
    if (typeof process !== 'undefined' && process.env && process.env[key]) {
      return process.env[key];
    }
  } catch (e) {}
  try {
    // @ts-ignore
    if (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env[key]) {
      // @ts-ignore
      return import.meta.env[key];
    }
  } catch (e) {}
  return '';
};

const CLIENT_ID = getEnv('SPOTIFY_CLIENT_ID') || getEnv('VITE_SPOTIFY_CLIENT_ID') || ''; 
const CLIENT_SECRET = getEnv('SPOTIFY_CLIENT_SECRET') || getEnv('VITE_SPOTIFY_CLIENT_SECRET') || '';

// Token caching
let accessToken: string | null = null;
let tokenExpiration: number = 0;

const getAccessToken = async (): Promise<string | null> => {
  if (accessToken && Date.now() < tokenExpiration - 60000) {
    return accessToken;
  }

  if (!CLIENT_ID || !CLIENT_SECRET) {
    console.warn("Spotify credentials (VITE_SPOTIFY_CLIENT_ID, VITE_SPOTIFY_CLIENT_SECRET) are missing.");
    return null;
  }

  try {
    const response = await fetch('https://accounts.spotify.com/api/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        grant_type: 'client_credentials',
        client_id: CLIENT_ID,
        client_secret: CLIENT_SECRET,
      }),
    });

    if (!response.ok) {
      throw new Error(`Spotify Token Error: ${response.statusText}`);
    }

    const data = await response.json();
    accessToken = data.access_token;
    tokenExpiration = Date.now() + (data.expires_in * 1000);
    return accessToken;
  } catch (error) {
    console.error("Failed to get Spotify access token:", error);
    return null;
  }
};

export const searchSongs = async (query: string): Promise<Song[]> => {
  if (!query || query.length < 2) return [];

  const token = await getAccessToken();
  if (!token) return [];

  try {
    const response = await fetch(
      `https://api.spotify.com/v1/search?q=${encodeURIComponent(query)}&type=track&limit=5`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    
    if (!response.ok) {
      throw new Error("Spotify API response not ok");
    }

    const data = await response.json();
    
    if (data.tracks && data.tracks.items) {
      return data.tracks.items.map((track: any) => ({
        title: track.name,
        artist: track.artists.map((a: any) => a.name).join(', '),
        spotifyUrl: track.external_urls.spotify 
      }));
    }
    return [];
  } catch (e) {
    console.error("Spotify Search API failed", e);
    return [];
  }
};