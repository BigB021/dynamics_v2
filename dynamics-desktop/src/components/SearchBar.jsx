import { useState } from 'react';
import { searchTracks } from '../services/api';
import SearchResultItem from './SearchResultItem';

const SearchBar = () => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!query.trim()) return;

    setLoading(true);
    try {
      const res = await searchTracks(query);
      setResults(res.data);
    } catch (err) {
      console.error('Search error:', err);
      setResults([]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto p-4">
      <form onSubmit={handleSearch} className="flex gap-2">
        <input
          type="text"
          value={query}
          placeholder="Search for a song..."
          onChange={(e) => setQuery(e.target.value)}
          className="flex-grow p-2 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <button
          type="submit"
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
        >
          Search
        </button>
      </form>

      {loading && <p className="mt-4 text-gray-500">Loading...</p>}

      <div className="mt-6 space-y-4">
        {results.map((track) => (
          <SearchResultItem key={track.id} track={track} />
        ))}
      </div>
    </div>
  );
};

export default SearchBar;
