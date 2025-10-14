import { useState, useRef, useEffect } from "react";
import SearchBar from "./SearchBar";
import FlowerInfoCard from "./FlowerInfoCard";
import SavedFlowersPage from "./SavedFlowersPage";
import { mockFlowers } from "../data/mockData";

interface ConversationCard {
  flower: typeof mockFlowers[0];
  imageUrl?: string | null;
}

interface PastConversation {
  id: number;
  title: string;
  messages: ConversationCard[];
}

interface SavedFlower {
  flower: typeof mockFlowers[0];
  imageUrl?: string | null;
}

export default function ChatLayout() {
  const [currentConversation, setCurrentConversation] = useState<ConversationCard[]>([]);
  const [activeConversation, setActiveConversation] = useState<ConversationCard[]>([]);
  const [pastConversations, setPastConversations] = useState<PastConversation[]>([]);
  const [conversationId, setConversationId] = useState(1);
  const [savedFlowers, setSavedFlowers] = useState<SavedFlower[]>([]);
  const [showSavedPage, setShowSavedPage] = useState(false);
  const [viewingPastChat, setViewingPastChat] = useState(false);
  const [activePastChat, setActivePastChat] = useState<PastConversation | null>(null);
  const [showSaveMessage, setShowSaveMessage] = useState(false);
  const [showRemoveMessage, setShowRemoveMessage] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);

  // Auto-scroll
  useEffect(() => {
    if (chatContainerRef.current) {
      const timeout = setTimeout(() => {
        chatContainerRef.current?.scrollTo({ top: chatContainerRef.current.scrollHeight, behavior: "smooth" });
      }, 100);
      return () => clearTimeout(timeout);
    }
  }, [currentConversation]);

  // Search flower
  const handleSearch = (query: string) => {
    const result = mockFlowers.find((f) => f.name.toLowerCase() === query.toLowerCase());
    if (result) {
      const newMsg = { flower: result };
      setCurrentConversation((prev) => [...prev, newMsg]);
      setActiveConversation((prev) => [...prev, newMsg]);
      setViewingPastChat(false);
      setShowSavedPage(false);
    }
  };

  // File upload
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      const matchedFlower = mockFlowers[1]; // Mock prediction
      const newMsg = { flower: matchedFlower, imageUrl: url };
      setCurrentConversation((prev) => [...prev, newMsg]);
      setActiveConversation((prev) => [...prev, newMsg]);
      setViewingPastChat(false);
      setShowSavedPage(false);
    }
  };

  // Save or remove flower with notifications
  const handleSaveOrRemoveFlower = (flower: typeof mockFlowers[0], imageUrl?: string | null) => {
    setSavedFlowers((prev) => {
      const existsIndex = prev.findIndex((f) => f.flower.name === flower.name && f.imageUrl === imageUrl);

      if (existsIndex >= 0) {
        // Remove flower
        setShowRemoveMessage(true);
        setTimeout(() => setShowRemoveMessage(false), 2500);
        return prev.filter((_, i) => i !== existsIndex);
      }

      // Add flower
      setShowSaveMessage(true);
      setTimeout(() => setShowSaveMessage(false), 2500);
      return [...prev, { flower, imageUrl }];
    });
  };

  // New chat
  const handleNewChat = () => {
    if (!viewingPastChat && !showSavedPage && currentConversation.length > 0) {
      const firstFlower = currentConversation[0]?.flower?.name || "Untitled Chat";
      const newEntry: PastConversation = { id: conversationId, title: firstFlower, messages: currentConversation };
      setPastConversations((prev) => [...prev, newEntry]);
      setConversationId((id) => id + 1);
    }
    setCurrentConversation([]);
    setActiveConversation([]);
    setShowSavedPage(false);
    setViewingPastChat(false);
    setActivePastChat(null);
  };

  // View past chat
  const handleViewPastChat = (chat: PastConversation) => {
    setActiveConversation(currentConversation);
    setCurrentConversation(chat.messages);
    setActivePastChat(chat);
    setViewingPastChat(true);
    setShowSavedPage(false);
  };

  // Back to current chat
  const handleBackToCurrentChat = () => {
    setCurrentConversation(activeConversation);
    setViewingPastChat(false);
    setActivePastChat(null);
    setShowSavedPage(false);
  };

  return (
    <div className="h-screen w-screen flex">
      {/* Sidebar */}
      <div className="w-64 bg-blue p-4 flex flex-col border-r border-black">
        <div className="flex-1 overflow-y-auto">
          <button onClick={handleNewChat} className="w-full mb-4 px-4 py-2 bg-lightBlue text-black rounded-lg font-calistoga">
            New Chat
          </button>

          <button onClick={() => setShowSavedPage(true)} className="w-full mb-4 px-4 py-2 bg-lightBlue text-black rounded-lg font-calistoga">
            My Flowers
          </button>

          {viewingPastChat && !showSavedPage && (
            <button onClick={handleBackToCurrentChat} className="w-full mb-4 px-4 py-2 bg-lightBlue text-black rounded-lg font-calistoga">
              Back to Current Chat
            </button>
          )}

          <h2 className="font-calistoga text-lg mb-4">Past Conversations</h2>
          {pastConversations.length > 0 ? (
            <table className="w-full table-auto border-collapse">
              <thead>
                <tr className="bg-blue font-calistoga">
                  <th className="p-2 border-b w-10">#</th>
                  <th className="p-2 border-b text-left">Name</th>
                </tr>
              </thead>
              <tbody>
                {pastConversations.map((chat) => (
                  <tr
                    key={chat.id}
                    className={`hover:bg-lightBlue cursor-pointer ${activePastChat?.id === chat.id ? "bg-lightBlue" : ""}`}
                    onClick={() => handleViewPastChat(chat)}
                  >
                    <td className="p-2 border-b text-center font-times">{chat.id}</td>
                    <td className="p-2 border-b truncate font-times">{chat.title}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <p className="text-gray-500 text-sm font-calistoga">No past conversations yet.</p>
          )}
        </div>

        <button className="w-full py-2 rounded-lg font-calistoga bg-lightBlue text-black">Log Out</button>
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
            <div className="flex-1 overflow-y-auto p-4 flex flex-col space-y-4" ref={chatContainerRef}>
              {currentConversation.length > 0 ? (
                currentConversation.map((msg, i) => (
                  <FlowerInfoCard
                    key={`${msg.flower.name}-${msg.imageUrl}-${i}`}
                    flower={msg.flower}
                    imageUrl={msg.imageUrl}
                    onSaveOrRemove={() => handleSaveOrRemoveFlower(msg.flower, msg.imageUrl)}
                  />
                ))
              ) : (
                <p className="text-gray-500 text-center mt-10 font-calistoga">
                  Search or upload an image to start a conversation.
                </p>
              )}
            </div>

            {!viewingPastChat && (
              <div className="flex w-full border-t bg-blue p-4 gap-2">
                <div className="flex-1">
                  <SearchBar onSearch={handleSearch} />
                </div>
                <button onClick={() => fileInputRef.current?.click()} className="px-4 py-2 bg-lightBlue text-black rounded-lg font-calistoga">
                  Upload
                </button>
                <input type="file" accept="image/*" ref={fileInputRef} onChange={handleFileChange} className="hidden" />
              </div>
            )}
          </>
        ) : (
          <SavedFlowersPage savedFlowers={savedFlowers} onBack={() => setShowSavedPage(false)} onRemove={handleSaveOrRemoveFlower} />
        )}
      </div>
    </div>
  );
}