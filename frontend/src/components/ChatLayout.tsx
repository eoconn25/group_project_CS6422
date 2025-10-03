import { useState, useRef } from "react";
import SearchBar from "./SearchBar";
import FlowerInfoCard from "./FlowerInfoCard";
import { mockFlowers } from "../data/mockData";

export default function ChatLayout() {
  const [selectedFlower, setSelectedFlower] = useState<typeof mockFlowers[0] | null>(null);
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleSearch = (query: string) => {
    const result = mockFlowers.find(
      (f) => f.name.toLowerCase() === query.toLowerCase()
    );
    setSelectedFlower(result || null);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setUploadedImage(url);
      // Mock: set a flower match
      setSelectedFlower(mockFlowers[1]); // e.g., Tulip
    }
  };

  return (
    <div className="h-screen w-screen flex">
      {/* Sidebar */}
      <div className="w-64 bg-gray-100 p-4 overflow-y-auto border-r border-gray-300">
        {/* New Chat Button */}
  <button
    onClick={() => {
      setSelectedFlower(null);
      setUploadedImage(null);
    }}
    className="w-full mb-4 px-4 py-2 text-white rounded-lg "
  >
    New Chat
  </button>

        <h2 className="font-bold text-lg mb-4">Past Conversations</h2>
        <table className="w-full table-auto border-collapse">
          <thead>
            <tr className="bg-gray-200">
              <th className="p-2 border-b">#</th>
              <th className="p-2 border-b">Name</th>
            </tr>
          </thead>
          <tbody>
            <tr className="hover:bg-gray-50">
              <td className="p-2 border-b text-center">1</td>
              <td className="p-2 border-b">Boquet for valentines?</td>
            </tr>
            <tr className="hover:bg-gray-50">
              <td className="p-2 border-b text-center">2</td>
              <td className="p-2 border-b">What is the meaning of tuplips?</td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* Right main area */}
<div className="flex-1 flex flex-col">
  {/* Results area */}
  <div className="flex-1 overflow-y-auto p-4 gap-4 flex flex-col">
    {selectedFlower ? (
      <div className="flex gap-4">
        {/* Left: card + mock prediction */}
        <div className="flex flex-col space-y-2">
          <FlowerInfoCard flower={selectedFlower} />
            {uploadedImage && (
            <p className="text-gray-600 text-sm">
              Mock prediction: <strong>{selectedFlower.name} (92%)</strong>
            </p>
          )}
        </div>

        {/* Right: uploaded image */}
        {uploadedImage && (
          <div className="flex-shrink-0 w-20 h-20">
            <img
              src={uploadedImage}
              alt="Uploaded flower"
                            className="rounded-lg shadow w-full h-full object-contain"
            />
          </div>
        )}
      </div>
    ) : (
      <p className="text-gray-500">
        Search or upload an image to see results.
      </p>
    )}
  </div>

        {/* Bottom pinned bar */}
        <div className="flex w-full border-t bg-white p-4 gap-2">
          <div className="flex-1">
            <SearchBar onSearch={handleSearch} />
          </div>
          <button
            onClick={() => fileInputRef.current?.click()}
            className="px-4 py-2 bg-pink-500 text-white rounded-lg hover:bg-pink-600"
          >
            Upload
          </button>
          <input
            type="file"
            accept="image/*"
            ref={fileInputRef}
            onChange={handleFileChange}
            className="hidden"
          />
        </div>
      </div>
    </div>
  );
}