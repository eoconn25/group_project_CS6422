import { useState } from "react";

interface SearchBarProps {
  onSearch: (query: string) => void;
}

export default function SearchBar({ onSearch }: SearchBarProps) {
  const [query, setQuery] = useState("");

  return (
    <div className="flex w-full">
      <input
        type="text"
        placeholder="Search for a flower..."
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        className="flex-1 p-2 border rounded-l-lg border-gray-300 focus:outline-none focus:ring-2 focus:ring-pink-400"
      />
      <button
        onClick={() => onSearch(query)}
        className="px-4 py-2 bg-pink-500 text-white rounded-r-lg hover:bg-pink-600"
      >
        Search
      </button>
    </div>
  );
}