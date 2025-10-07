// add state to functional components
//here will store the current typed text in the search bar
import { useState } from "react";

// Props for SearchBar component
// onSearch is a function that takes a string and returns void
// send to parent component when user searches
interface SearchBarProps {
  onSearch: (query: string) => void;
}

//declare a functional component called SearchBar
// uses object destructuring to extract onSearch from props
export default function SearchBar({ onSearch }: SearchBarProps) {
  //state decleration
  // query = current text typed
  // setQuery = function to update the query state
  // initial state is an empty string
  const [query, setQuery] = useState("");

  // handle "Enter" key press to trigger search
  // function runs when a key is pressed while the input is focused
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    // that key is the enter key
    if (e.key === "Enter") {
      //calles on search with the typed query
      onSearch(query);
    }
  };

  // JSX to render the search bar
  return (
    // flex container to hold input and button and stretch to full width and aligns input and button horizontally
    <div className="flex w-full bg-purple rounded-lg shadow margin-2 font-times">
      {/* this is the input field */}
      <input
        // standard text input field
        type="text"
        // text when input is empty
        placeholder="Search for a flower..."
        // controlled component, displayed value will come from query state
        value={query}
        // update query state when user types
        onChange={(e) => setQuery(e.target.value)}
        // lias to handle key presses
        onKeyDown={handleKeyDown} 
        // tailwind css classes for styling
        // makes input take up all available space, padding, border, rounded left corners, gray border, focus styles
        className="flex-1 p-2 border rounded-lg border-gray-300 focus:outline-none focus:ring-2"
      />
    </div>
  );
}