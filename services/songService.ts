import { Song } from '../types';
import { MOCK_SONGS } from '../data/mockSongs';

// iTunes Search API does not require authentication
export const searchSongs = async (query: string): Promise<Song[]> => {
  if (!query || query.length < 2) return [];

  try {
    const response = await fetch(
      `https://itunes.apple.com/search?term=${encodeURIComponent(query)}&media=music&entity=song&limit=5`
    );

    if (!response.ok) {
      throw new Error(`iTunes Search Error: ${response.status}`);
    }

    const data = await response.json();

    if (data.results) {
      return data.results.map((track: any) => ({
        title: track.trackName,
        artist: track.artistName,
        externalUrl: track.trackViewUrl || track.collectionViewUrl
      }));
    }
    return [];
  } catch (e) {
    console.error("iTunes Search API failed, falling back to mocks", e);
    // Fallback to mocks if iTunes fails (e.g. network issues)
    const lowerQuery = query.toLowerCase();
    return MOCK_SONGS.filter(s => 
      s.title.toLowerCase().includes(lowerQuery) || 
      s.artist.toLowerCase().includes(lowerQuery)
    ).slice(0, 5);
  }
};