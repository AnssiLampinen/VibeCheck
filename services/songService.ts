import { Song } from '../types';
import { MOCK_SONGS } from '../data/mockSongs';

let cachedToken: string | null = null;
let tokenExpiration: number = 0;

const getSpotifyToken = async (): Promise<string | null> => {
  // If we have a valid cached token, use it
  if (cachedToken && Date.now() < tokenExpiration) {
    return cachedToken;
  }

  try {
    // Call our own serverless function
    const response = await fetch('/api/token');
    
    if (!response.ok) {
      throw new Error(`Backend token fetch failed: ${response.status}`);
    }

    const data = await response.json();
    
    if (data.access_token) {
      cachedToken = data.access_token;
      // Expires in is usually 3600 seconds. Subtract a 60s buffer.
      tokenExpiration = Date.now() + (data.expires_in * 1000) - 60000;
      return cachedToken;
    }
    return null;
  } catch (error) {
    console.error("Error fetching Spotify token:", error);
    return null;
  }
};

export const searchSongs = async (query: string): Promise<Song[]> => {
  if (!query || query.length < 2) return [];

  try {
    const token = await getSpotifyToken();

    if (!token) {
      throw new Error("No access token available. Check API keys.");
    }

    const response = await fetch(
      `https://api.spotify.com/v1/search?q=${encodeURIComponent(query)}&type=track&limit=5`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    if (!response.ok) {
      throw new Error(`Spotify Search API Error: ${response.status}`);
    }

    const data = await response.json();

    if (data.tracks && data.tracks.items) {
      return data.tracks.items.map((track: any) => ({
        title: track.name,
        artist: track.artists.map((a: any) => a.name).join(', '),
        externalUrl: track.external_urls.spotify
      }));
    }
    return [];

  } catch (e) {
    console.error("Spotify Search failed, falling back to mocks", e);
    const lowerQuery = query.toLowerCase();
    return MOCK_SONGS.filter(s => 
      s.title.toLowerCase().includes(lowerQuery) || 
      s.artist.toLowerCase().includes(lowerQuery)
    ).slice(0, 5);
  }
};