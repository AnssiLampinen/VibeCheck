import { Song } from '../types';
import { MOCK_SONGS } from '../data/mockSongs';

export const searchSongs = async (query: string): Promise<Song[]> => {
  if (!query || query.length < 2) return [];

  // Helper to process iTunes results
  const mapResults = (data: any) => {
    if (data.results) {
      return data.results.map((track: any) => ({
        title: track.trackName,
        artist: track.artistName,
        externalUrl: track.trackViewUrl || track.collectionViewUrl
      }));
    }
    return [];
  };

  // Helper to return mocks
  const getMocks = () => {
     const lowerQuery = query.toLowerCase();
     return MOCK_SONGS.filter(s => 
       s.title.toLowerCase().includes(lowerQuery) || 
       s.artist.toLowerCase().includes(lowerQuery)
     ).slice(0, 5);
  };

  const itunesUrl = `https://itunes.apple.com/search?term=${encodeURIComponent(query)}&media=music&entity=song&limit=5`;

  try {
    // 1. Try Direct Fetch
    // Note: iTunes usually supports CORS, but strict browser/network policies might block it.
    const response = await fetch(itunesUrl);
    
    if (!response.ok) {
      throw new Error(`Direct iTunes fetch failed: ${response.status}`);
    }
    
    const data = await response.json();
    return mapResults(data);

  } catch (directError) {
    console.warn("Direct iTunes search failed, attempting proxy fallback...", directError);
    
    try {
      // 2. Try via AllOrigins Proxy
      // using 'get' wrapper which returns JSON with a 'contents' string property
      // This is often more robust against CORS than raw piping on some networks
      const proxyUrl = `https://api.allorigins.win/get?url=${encodeURIComponent(itunesUrl)}`;
      const response = await fetch(proxyUrl);
      
      if (!response.ok) {
        throw new Error(`Proxy fetch failed: ${response.status}`);
      }
      
      const proxyWrapper = await response.json();
      if (!proxyWrapper.contents) {
        throw new Error("Proxy response empty");
      }

      const data = JSON.parse(proxyWrapper.contents);
      return mapResults(data);

    } catch (proxyError) {
      console.error("iTunes Proxy search failed, falling back to mocks.", proxyError);
      return getMocks();
    }
  }
};