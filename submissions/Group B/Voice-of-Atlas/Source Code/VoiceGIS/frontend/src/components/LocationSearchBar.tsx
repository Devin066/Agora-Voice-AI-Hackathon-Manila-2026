'use client';

import { useState, useRef, useEffect } from 'react';
import { Map as LeafletMap } from 'leaflet';
import { Search } from 'lucide-react';

const API_KEY = process.env.NEXT_PUBLIC_GEOAPIFY_API_KEY;
const AUTOCOMPLETE_URL = 'https://api.geoapify.com/v1/geocode/autocomplete';

type GeoapifyResult = {
  lat: number;
  lon: number;
  formatted: string;
  address_line1?: string;
  address_line2?: string;
};

type LocationSearchBarProps = {
  map: LeafletMap | null;
  onLocationSelect: (position: { lat: number; lon: number }) => void;
  /** When provided, the search bar is controlled (e.g. so parent can clear it on reset) */
  value?: string;
  onQueryChange?: (query: string) => void;
};

export default function LocationSearchBar({ map, onLocationSelect, value, onQueryChange }: LocationSearchBarProps) {
  const [internalQuery, setInternalQuery] = useState('');
  const isControlled = value !== undefined;
  const query = isControlled ? value : internalQuery;
  const setQuery = isControlled ? (onQueryChange ?? (() => {})) : setInternalQuery;
  const [suggestions, setSuggestions] = useState<GeoapifyResult[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!query.trim()) {
      setSuggestions([]);
      setIsOpen(false);
      return;
    }
    if (!API_KEY) {
      setSuggestions([]);
      return;
    }
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(async () => {
      setLoading(true);
      try {
        const params = new URLSearchParams({
          text: query.trim(),
          format: 'json',
          apiKey: API_KEY,
          limit: '8',
        });
        const res = await fetch(`${AUTOCOMPLETE_URL}?${params}`);
        const data = await res.json();
        const results: GeoapifyResult[] = (data.results || []).map((r: GeoapifyResult) => ({
          lat: r.lat,
          lon: r.lon,
          formatted: r.formatted || r.address_line1 || '',
          address_line1: r.address_line1,
          address_line2: r.address_line2,
        }));
        setSuggestions(results);
        setIsOpen(results.length > 0);
      } catch {
        setSuggestions([]);
      } finally {
        setLoading(false);
      }
    }, 300);
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [query]);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelect = (item: GeoapifyResult) => {
    setQuery(item.formatted);
    setIsOpen(false);
    setSuggestions([]);
    onLocationSelect({ lat: item.lat, lon: item.lon });
    if (map) {
      map.flyTo([item.lat, item.lon], 14, { duration: 0.8 });
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setQuery(e.target.value);
  };

  return (
    <div ref={wrapperRef} className="absolute left-3 top-3 z-10 w-full max-w-xs">
      <div className="flex items-center gap-1.5 rounded-md bg-gray-800 bg-opacity-90 shadow-md ring-1 ring-white/10">
        <Search size={14} className="ml-2 shrink-0 text-gray-400" aria-hidden />
        <input
          type="text"
          value={query}
          onChange={handleInputChange}
          onFocus={() => suggestions.length > 0 && setIsOpen(true)}
          placeholder="Search location..."
          className="min-w-0 flex-1 bg-transparent py-2 pr-2 text-xs text-white placeholder-gray-400 focus:outline-none"
          aria-autocomplete="list"
          aria-expanded={isOpen}
          aria-controls="location-suggestions"
          id="location-search"
        />
        {loading && (
          <div className="mr-2 h-3.5 w-3.5 shrink-0 animate-spin rounded-full border-2 border-gray-400 border-t-white" aria-hidden />
        )}
      </div>
      {isOpen && suggestions.length > 0 && (
        <ul
          id="location-suggestions"
          role="listbox"
          className="mt-1 max-h-52 overflow-auto rounded-md bg-gray-800 bg-opacity-95 py-0.5 shadow-md ring-1 ring-white/10"
        >
          {suggestions.map((item, i) => (
            <li
              key={`${item.lat}-${item.lon}-${i}`}
              role="option"
              tabIndex={0}
              className="cursor-pointer px-3 py-2 text-xs text-gray-200 hover:bg-white/10 focus:bg-white/10 focus:outline-none"
              onClick={() => handleSelect(item)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') handleSelect(item);
              }}
            >
              {item.formatted}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
