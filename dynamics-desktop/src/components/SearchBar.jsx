import { useState, useEffect } from 'react';
import { searchTracks } from '../services/api';
import SearchResultItem from './SearchResultItem';
import { Search } from 'lucide-react';

const SearchBar = () => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [currentTrack, setCurrentTrack] = useState(null);

  useEffect(() => {
    const delayDebounce = setTimeout(() => {
      if (query.trim()) {
        setLoading(true);
        (async () => {
          try {
            const res = await searchTracks(query);
            setResults(res.data);
          } catch (err) {
            console.error('Search error:', err);
            setResults([]);
          } finally {
            setLoading(false);
          }
        })();
      } else {
        setResults([]);
      }
    }, 400); // debounce time

    return () => clearTimeout(delayDebounce);
  }, [query]);

  return (
    <div className="w-full max-w-5xl mx-auto px-4 py-6">
      {/* Search Input */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
        <input
          type="text"
          value={query}
          placeholder="Search songs, artists..."
          onChange={(e) => setQuery(e.target.value)}
          className="w-full pl-10 pr-4 py-3 rounded-xl bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder:text-zinc-400"
        />
      </div>

      {/* Results */}
      {loading && (
        <div className="mt-6 text-center text-zinc-500 animate-pulse">Searching...</div>
      )}

      {!loading && results.length > 0 && (
        <div className="mt-6 flex flex-col gap-3">
          {results.map((track) => (
            <SearchResultItem key={track.id} track={track} onPlay={setCurrentTrack} />
          ))}
        </div>
      )}

      {/* No results */}
      {!loading && query && results.length === 0 && (
        <div className="mt-6 text-center text-zinc-500">No results found.</div>
      )}
    </div>
  );
};

export default SearchBar;
