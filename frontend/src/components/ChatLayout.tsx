import { useState, useRef, useEffect } from "react";
import SearchBar from "./SearchBar";
import FlowerInfoCard from "./FlowerInfoCard";
import SavedFlowersPage from "./SavedFlowersPage";
import { mockFlowers } from "../data/mockData";

interface ConversationCard {
  flower: typeof mockFlowers[0];
  imageUrl?: string | null;
}

interface ConversationThread {
  id: number;
  title: string;
  messages: ConversationCard[];
}

interface SavedFlower {
  flower: typeof mockFlowers[0];
  imageUrl?: string | null;
}

export default function ChatLayout() {
  const [conversations, setConversations] = useState<ConversationThread[]>([]);
  const [activeId, setActiveId] = useState<number | null>(null);
  const [savedFlowers, setSavedFlowers] = useState<SavedFlower[]>([]);
  const [showSavedPage, setShowSavedPage] = useState(false);
  const [showSaveMessage, setShowSaveMessage] = useState(false);
  const [showRemoveMessage, setShowRemoveMessage] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const chatRef = useRef<HTMLDivElement>(null);

  const activeConversation = conversations.find((c) => c.id === activeId);

  // Auto-scroll
  useEffect(() => {
    if (!chatRef.current) return;
    const timeout = setTimeout(() => {
      chatRef.current?.scrollTo({ top: chatRef.current.scrollHeight, behavior: "smooth" });
    }, 100);
    return () => clearTimeout(timeout);
  }, [activeConversation?.messages]);

  // Append message
  const appendMessage = (msg: ConversationCard) => {
    if (!activeId) {
      const newId = Date.now();
      setConversations((prev) => [...prev, { id: newId, title: msg.flower.name, messages: [msg] }]);
      setActiveId(newId);
    } else {
      setConversations((prev) =>
        prev.map((conv) =>
          conv.id === activeId
            ? {
                ...conv,
                title: conv.title === "Untitled Chat" ? msg.flower.name : conv.title,
                messages: [...conv.messages, msg],
              }
            : conv
        )
      );
    }
  };

  // Search
  const handleSearch = (query: string) => {
    const result = mockFlowers.find((f) => f.name.toLowerCase() === query.toLowerCase());
    if (!result) return;
    appendMessage({ flower: result });
    setShowSavedPage(false);
  };

  // Upload
  const handleUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const url = URL.createObjectURL(file);
    const matchedFlower = mockFlowers[1]; // mock prediction
    appendMessage({ flower: matchedFlower, imageUrl: url });
    setShowSavedPage(false);
  };

  // Save/remove flower
  const handleSaveOrRemoveFlower = (flower: typeof mockFlowers[0], imageUrl?: string | null) => {
    setSavedFlowers((prev) => {
      const idx = prev.findIndex((f) => f.flower.name === flower.name); // check by name only
      if (idx >= 0) {
        setShowRemoveMessage(true);
        setTimeout(() => setShowRemoveMessage(false), 2500);
        return prev.filter((_, i) => i !== idx);
      }
      setShowSaveMessage(true);
      setTimeout(() => setShowSaveMessage(false), 2500);
      return [...prev, { flower, imageUrl }];
    });
  };

  // Check if flower is saved
  const isFlowerSaved = (flowerName: string) => {
    return savedFlowers.some((f) => f.flower.name === flowerName);
  };

  // New Chat
  const handleNewChat = () => {
    const newId = Date.now();
    setConversations((prev) => [...prev, { id: newId, title: "Untitled Chat", messages: [] }]);
    setActiveId(newId);
    setShowSavedPage(false);
  };

  return (
    <div className="flex h-screen w-screen">
      {/* Sidebar */}
      <div className="w-64 bg-blue p-4 flex flex-col border-r border-black">
        <button onClick={handleNewChat} className="mb-4 px-4 py-2 bg-lightBlue rounded-lg font-calistoga">
          New Chat
        </button>

        <button
          onClick={() => setShowSavedPage(true)}
          className="mb-4 px-4 py-2 bg-lightBlue rounded-lg font-calistoga"
        >
          My Flowers
        </button>

        <h2 className="font-calistoga text-lg mb-2">Conversations</h2>
        <div className="flex-1 overflow-y-auto space-y-1">
          {conversations.length > 0 ? (
            conversations.map((c) => (
              <button
                key={c.id}
                onClick={() => setActiveId(c.id)}
                className={`w-full text-left px-3 py-1 rounded-md font-times transition ${
                  activeId === c.id ? "bg-lightBlue font-bold" : "bg-blue hover:bg-lightBlue"
                }`}
              >
                {c.title}
              </button>
            ))
          ) : (
            <p className="text-gray-500 text-sm font-calistoga">No conversations yet.</p>
          )}
        </div>

        <button className="mt-auto w-full py-2 rounded-lg font-calistoga bg-lightBlue text-black">
          Log Out
        </button>
      </div>

      {/* Main Area */}
      <div className="flex-1 flex flex-col bg-pink relative">
        {/* Notifications */}
        {showSaveMessage && (
          <div className="absolute top-4 right-4 bg-lightBlue text-black px-4 py-2 rounded-lg shadow font-calistoga animate-fadeInOut">
            ✅ Saved successfully!
          </div>
        )}
        {showRemoveMessage && (
          <div className="absolute top-4 right-4 bg-red-400 text-white px-4 py-2 rounded-lg shadow font-calistoga animate-fadeInOut">
            ❌ Removed successfully!
          </div>
        )}

        {!showSavedPage ? (
          <>
            <div className="flex-1 overflow-y-auto p-4 flex flex-col space-y-4" ref={chatRef}>
              {activeConversation?.messages.length ? (
                activeConversation.messages.map((msg, i) => (
                  <FlowerInfoCard
                    key={`${msg.flower.name}-${msg.imageUrl}-${i}`}
                    flower={msg.flower}
                    imageUrl={msg.imageUrl}
                    isSaved={isFlowerSaved(msg.flower.name)}
                    onSaveOrRemove={() => handleSaveOrRemoveFlower(msg.flower, msg.imageUrl)}
                  />
                ))
              ) : (
                <p className="text-gray-500 text-center mt-10 font-calistoga">
                  Search or upload an image to start a conversation.
                </p>
              )}
            </div>

            {/* Search + Upload */}
            <div className="flex p-4 gap-2 bg-blue">
              <div className="flex-1">
                <SearchBar onSearch={handleSearch} />
              </div>
              <button
                onClick={() => fileInputRef.current?.click()}
                className="px-4 py-2 bg-lightBlue rounded-lg font-calistoga"
              >
                Upload
              </button>
              <input type="file" accept="image/*" ref={fileInputRef} onChange={handleUpload} className="hidden" />
            </div>
          </>
        ) : (
          <SavedFlowersPage
            savedFlowers={savedFlowers}
            onBack={() => setShowSavedPage(false)}
            onRemove={handleSaveOrRemoveFlower}
          />
        )}
      </div>
    </div>
  );
}