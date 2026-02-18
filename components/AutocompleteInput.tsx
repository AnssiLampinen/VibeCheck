import React, { useState, useEffect } from 'react';
import { Song } from '../types';

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

  // Sync internal input value with prop value
  useEffect(() => {
    if (typeof value === 'string') {
      setInputValue(value);
    } else {
      setInputValue(`${value.title} - ${value.artist}`);
    }
  }, [value]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setInputValue(newValue);
    onChange(newValue); // Propagate string change to parent
  };

  return (
    <div className="space-y-2 group relative">
      <label className={`block text-sm font-medium ${colorClass}`}>
        {label}
      </label>
      <div className="relative">
        <input
          type="text"
          value={inputValue}
          onChange={handleInputChange}
          placeholder={placeholder}
          disabled={disabled}
          className="w-full px-4 py-3 bg-slate-800/50 border border-slate-700 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition-all disabled:opacity-50"
          autoComplete="off"
        />
        {/* Visual flair icon */}
        <div className="absolute right-4 top-3.5 text-slate-600 pointer-events-none">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" />
          </svg>
        </div>
      </div>
    </div>
  );
};