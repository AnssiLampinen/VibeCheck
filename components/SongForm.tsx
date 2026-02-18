import React, { useState } from 'react';
import { Song } from '../types';
import { AutocompleteInput } from './AutocompleteInput';
import { resolveSongMetadata } from '../services/geminiService';

interface SongFormProps {
  onSubmit: (data: { current: Song; favorite: Song; underrated: Song }) => void;
  roomId: string;
  roomName?: string; // Support displaying friendly room name
}

export const SongForm: React.FC<SongFormProps> = ({ onSubmit, roomId, roomName }) => {
  // State can hold a string (user typing) or a Song object (user selected from dropdown)
  const [current, setCurrent] = useState<Song | string>('');
  const [favorite, setFavorite] = useState<Song | string>('');
  const [underrated, setUnderrated] = useState<Song | string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [statusMessage, setStatusMessage] = useState('Processing...');

  // Helper to convert raw input into a valid Song object (Fallback)
  const processInputFallback = (input: Song | string): Song => {
    if (typeof input === 'object') {
      return input;
    }
    return {
      title: input,
      artist: 'Unknown Artist',
      spotifyUrl: `https://open.spotify.com/search/${encodeURIComponent(input)}`
    };
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const hasValue = (val: Song | string) => typeof val === 'string' ? val.trim().length > 0 : true;

    if (hasValue(current) && hasValue(favorite) && hasValue(underrated) && !isSubmitting) {
      setIsSubmitting(true);
      setStatusMessage('Consulting the oracle...');
      
      try {
        // Attempt to use AI to resolve exact metadata and spotify links
        const metadata = await resolveSongMetadata(current, favorite, underrated);
        onSubmit(metadata);
      } catch (error) {
        console.error("AI Resolution failed, falling back to local processing", error);
        // Fallback to local processing if AI fails
        const entryData = {
          current: processInputFallback(current),
          favorite: processInputFallback(favorite),
          underrated: processInputFallback(underrated)
        };
        onSubmit(entryData);
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  return (
    <div className="w-full max-w-lg mx-auto p-4">
      <div className="mb-8 text-center">
        <span className="inline-block px-3 py-1 bg-slate-800 rounded-full text-xs font-mono text-cyan-400 border border-slate-700 mb-2">
          ROOM: {roomName || roomId.substring(0, 8)}
        </span>
        <h2 className="text-2xl font-bold text-white">Fill in the blanks</h2>
        <p className="text-slate-400 text-sm mt-1">Contribute to the room's soundscape.</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <AutocompleteInput
          label="🎧 Currently listening to..."
          value={current}
          onChange={setCurrent}
          placeholder="Start typing a song name..."
          colorClass="text-purple-300"
          disabled={isSubmitting}
        />

        <AutocompleteInput
          label="❤️ All-time favorite..."
          value={favorite}
          onChange={setFavorite}
          placeholder="Start typing a song name..."
          colorClass="text-pink-300"
          disabled={isSubmitting}
        />

        <AutocompleteInput
          label="💎 Underrated gem..."
          value={underrated}
          onChange={setUnderrated}
          placeholder="Start typing a song name..."
          colorClass="text-amber-300"
          disabled={isSubmitting}
        />

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full py-4 mt-4 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-bold rounded-xl shadow-lg shadow-cyan-900/20 transform hover:-translate-y-0.5 transition-all disabled:opacity-70 disabled:hover:translate-y-0 flex items-center justify-center gap-2"
        >
          {isSubmitting ? (
            <>
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
              <span>{statusMessage}</span>
            </>
          ) : (
            <span>Contribute & Check Vibe</span>
          )}
        </button>
      </form>
    </div>
  );
};