import React, { useState, useEffect, useRef } from 'react';
import { Song } from '../types';
import { searchSongs } from '../services/songService';

interface AutocompleteInputProps {
  label: string;
  value: Song | string;
  onChange: (value: Song | string) => void;
  placeholder: string;
  colorClass: string;
  disabled?: boolean;
}

export const AutocompleteInput: React.FC<AutocompleteInputProps> = ({
  label,
  value,
  onChange,
  placeholder,
  colorClass,
  disabled
}) => {
  const [inputValue, setInputValue] = useState('');
  const [suggestions, setSuggestions] = useState<Song[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  
  const wrapperRef = useRef<HTMLDivElement>(null);
  const timeoutRef = useRef<number | null>(null);

  // Sync internal input value with prop value
  useEffect(() => {
    if (typeof value === 'string') {
      setInputValue(value);
    } else if (value && typeof value === 'object') {
      setInputValue(`${value.title} - ${value.artist}`);
    }
  }, [value]);

  // Click outside handler to close dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setInputValue(newValue);
    onChange(newValue); // Propagate string change immediately

    // Debounce search logic
    if (timeoutRef.current) {
      window.clearTimeout(timeoutRef.current);
    }

    if (newValue.length > 2) {
      setIsLoading(true);
      timeoutRef.current = window.setTimeout(async () => {
        try {
          const results = await searchSongs(newValue);
          setSuggestions(results);
          setShowSuggestions(true);
        } catch (error) {
          console.error("Search failed", error);
        } finally {
          setIsLoading(false);
        }
      }, 400); // 400ms delay
    } else {
      setShowSuggestions(false);
      setIsLoading(false);
    }
  };

  const selectSong = (song: Song) => {
    setInputValue(`${song.title} - ${song.artist}`);
    onChange(song);
    setShowSuggestions(false);
    setSuggestions([]);
  };

  return (
    <div ref={wrapperRef} className="space-y-2 group relative z-10">
      <label className={`block text-sm font-medium ${colorClass}`}>
        {label}
      </label>
      <div className="relative">
        <input
          type="text"
          value={inputValue}
          onChange={handleInputChange}
          onFocus={() => inputValue.length > 2 && suggestions.length > 0 && setShowSuggestions(true)}
          placeholder={placeholder}
          disabled={disabled}
          className="w-full px-4 py-3 bg-slate-800/50 border border-slate-700 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition-all disabled:opacity-50"
          autoComplete="off"
        />
        
        {/* Loading Indicator or Search Icon */}
        <div className="absolute right-4 top-3.5 text-slate-600 pointer-events-none">
          {isLoading ? (
            <div className="w-5 h-5 border-2 border-slate-500 border-t-transparent rounded-full animate-spin"></div>
          ) : (
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          )}
        </div>

        {/* Suggestions Dropdown */}
        {showSuggestions && suggestions.length > 0 && (
          <div className="absolute w-full mt-2 bg-slate-900 border border-slate-700 rounded-xl shadow-xl overflow-hidden z-50 animate-in fade-in zoom-in-95 duration-200">
            <ul className="max-h-60 overflow-y-auto">
              {suggestions.map((song, idx) => (
                <li 
                  key={idx}
                  onClick={() => selectSong(song)}
                  className="px-4 py-3 hover:bg-slate-800 cursor-pointer border-b border-slate-800 last:border-0 transition-colors flex flex-col group/item"
                >
                  <span className="font-semibold text-slate-200 group-hover/item:text-cyan-400 transition-colors">{song.title}</span>
                  <span className="text-xs text-slate-500">{song.artist}</span>
                </li>
              ))}
            </ul>
            <div className="px-3 py-1 bg-black/40 text-[10px] text-slate-600 text-center border-t border-slate-800 flex justify-between items-center">
              <span>Suggestions via Spotify</span>
              <span className="w-1 h-1 rounded-full bg-green-500"></span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};