import { Song } from '../types';

// NOTE: We have removed the direct Spotify API integration to improve security.
// Using 'Client Credentials Flow' (which requires a Client Secret) in the browser
// is unsafe. 
//
// The app now relies on the Gemini AI service (resolveSongMetadata) to 
// identify songs and generate Spotify URLs upon form submission.

export const searchSongs = async (query: string): Promise<Song[]> => {
  // This is a placeholder. 
  // In a future update, this could call a backend proxy or a public search API 
  // that doesn't require secret keys in the browser.
  return [];
};