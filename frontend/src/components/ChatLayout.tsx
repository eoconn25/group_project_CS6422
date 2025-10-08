//useState -> mahe component state like the messages and pat convo
//useRef -> create references to DOM elements like file input and messages end for scrolling
//useEffect -> perform side effects like auto scrolling to bottom when new message is added
import { useState, useRef, useEffect } from "react";
//import child compontnts made earlier and mock data
import SearchBar from "./SearchBar";
import FlowerInfoCard from "./FlowerInfoCard";
import { mockFlowers } from "../data/mockData";

// represent a single message in the conversation, flow and optional image
interface ConversationCard {
  flower: typeof mockFlowers[0];
  imageUrl?: string | null;
}

// represent a past conversation with id, title and array of messages
interface PastConversation {
  id: number;
  title: string;
  messages: ConversationCard[];
}

// state and references for chat layout component
export default function ChatLayout() {
  // holds the messages in the current conversation
  const [currentConversation, setCurrentConversation] = useState<ConversationCard[]>([]);
  // store the previous conversations for the sidebar
  const [pastConversations, setPastConversations] = useState<PastConversation[]>([]);
  // unique id for each conversation
  const [conversationId, setConversationId] = useState(1);

  // references to the hidden file input afor image upload
  const fileInputRef = useRef<HTMLInputElement>(null);
  // referece to the end of the messages list for auto scrolling
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Scroll to bottom when new message appears
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [currentConversation]);

  // handle text search
  // searched mockflowers by name for a exact match, it is case sensitive
  // when found, add to current conversation
  const handleSearch = (query: string) => {
    const result = mockFlowers.find(
      (f) => f.name.toLowerCase() === query.toLowerCase()
    );
    if (result) {
      setCurrentConversation((prev) => [...prev, { flower: result }]);
    }
  };

  // handle image upload
  //when a file is selected, create a URL for it and add to current conversation with a mock prediction
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      const matchedFlower = mockFlowers[1]; // Mock prediction (Tulip)
      setCurrentConversation((prev) => [
        ...prev,
        { flower: matchedFlower, imageUrl: url },
      ]);
    }
  };

  // handle New Chat
  // saves current conversation to past conversations with title of the first flower, future can change to query
  // wont add if empty then wont add
  // resets current conversation to start a new chat
  const handleNewChat = () => {
    if (currentConversation.length > 0) {
      const firstFlower = currentConversation[0]?.flower?.name || "Untitled Chat";
      const newEntry: PastConversation = {
        id: conversationId,
        title: firstFlower,
        messages: currentConversation,
      };

      setPastConversations((prev) => [...prev, newEntry]);
      setConversationId((id) => id + 1);
    }

    setCurrentConversation([]); // reset chat
  };

  return (
    /* JSX Lauout */
    <div className="h-screen w-screen flex">
      {/* Sidebar */}
      {/* has new chat button, past conversations list and account button at bottom */}
      <div className="w-64 bg-blue p-4 flex flex-col border-r border-gray-300">
        {/* Top Section (New Chat + Past Conversations) */}
        <div className="flex-1 overflow-y-auto">
          <button
            onClick={handleNewChat}
            className="w-full mb-4 px-4 py-2 bg-lightBlue text-black rounded-lg font-calistoga"
          >
            New Chat
          </button>
          {/* Past Conversations List */}
          {/* maps padt conversations to a table, click on a row to load that conversation */}
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
                    className="hover:bg-gray-50 cursor-pointer"
                    onClick={() => setCurrentConversation(chat.messages)}
                  >
                    <td className="p-2 border-b text-cente font-times">{chat.id}</td>
                    <td className="p-2 border-b truncate font-times">{chat.title}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <p className="text-gray-500 text-sm">No past conversations yet.</p>
          )}
        </div>

        {/* Bottom Account Button */}
        <div className="border-t pt-3 mt-3">
          <button
            className="w-full py-2 rounded-lg font-calistoga bg-lightBlue text-black"
          >
            Account Details
          </button>
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col bg-pink">
        {/* Scrollable Chat Messages */}
        {/* loops current conversation messages to display each flower info card */
        /* renders flower info card component for each message in the current conversation, empty shows place holder text */}
        <div className="flex-1 overflow-y-auto p-4 flex flex-col space-y-4">
          {currentConversation.length > 0 ? (
            currentConversation.map((msg, i) => (
              <FlowerInfoCard key={i} flower={msg.flower} imageUrl={msg.imageUrl} />
            ))
          ) : (
            <p className="text-gray-500 text-center mt-10 font-calistoga">
              Search or upload an image to start a conversation.
            </p>
          )}
          {/*ensures auto scroll to bottom */}
          <div ref={messagesEndRef} />
        </div>

        {/* Bottom Input Bar */}
        <div className="flex w-full border-t bg-blue p-4 gap-2">
          <div className="flex-1">
            {/* triggers handlesearch in parent component */}
            <SearchBar onSearch={handleSearch} />
          </div>
          {/* upload button that triggers hidden file input */}
          <button
            onClick={() => fileInputRef.current?.click()}
            className="px-4 py-2 bg-lightBlue text-black rounded-lg font-calistoga"
          >
            Upload
          </button>
          {/* hidden file input for image upload, handles actual file selection */}
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