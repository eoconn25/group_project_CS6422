// useState -> component state management
// useRef -> to reference DOM elements
// useEffect -> to handle side effects like auto-scrolling
import { useState, useRef, useEffect } from "react";
// brings in all the other components needed for the chat layout to run
import SearchBar from "./SearchBar";
import FlowerInfoCard from "./FlowerInfoCard";
import SavedFlowersPage from "./SavedFlowersPage";
import LlmResponseCard from "./LlmResponseCard";
// the mock data to display for flowers for now
// import { mockFlowers } from "../data/mockData";
import flowerDataset from '../data/flowerDataset.json';
import type { FlowerVariant, FlowerDataset } from '../types/flowerTypes';



// // Optionally type your import:
// const dataset: FlowerDataset = flowerDataset;


// blueprint for what a conversation card looks like
// can be either a flower info card or a string response from the llm
// optionally uses the flower type from the mock data
// an optional image url to display a image uploaded by the user
interface ConversationCard {
  id: number; // unique id for the message, use Date.now()
  type: "flower" | "string" | "user" | "loading"; // type of message, either a flower object or string response (from llm), the users prompt, loading
  content?: string; // string response content from llm
  flower?: FlowerVariant;
  imageUrl?: string | ""; // image url for flower image
}

// blueprint for what a conversation thread looks like, and will hold all convos made
// has a unique id, a title for the convo, and an array of messages (conversation cards)
interface ConversationThread {
  id: number;
  title: string;
  messages: ConversationCard[];
}

// blueprint for what a saved flower object looks like
// the flower data and an optional image url
interface SavedFlower {
  flower: FlowerVariant;
  imageUrl?: string | null;
}

// main component function for the chat layout
//declares and exports the main component function for the chat layout
//export default function ChatLayout() {
//OLD VERSION
export default function ChatLayout({
    // object destructuring to get the username and logout function from props
    username,
    onLogout,
  }: {
    // the username is optional string
    username?: string;
    // the logout function has no return value
    onLogout: () => void;
  }) 
{
  //state declarations
  //holds all the conversations made
  const [conversations, setConversations] = useState<ConversationThread[]>([]);
  //holds the id of the currently active conversation
  const [activeId, setActiveId] = useState<number | null>(null);
  //holds all the saved flowers by the user
  const [savedFlowers, setSavedFlowers] = useState<SavedFlower[]>([]);
  //controls whether the saved flowers page is shown
  const [showSavedPage, setShowSavedPage] = useState(false);
  //controls the display of save notifications
  const [showSaveMessage, setShowSaveMessage] = useState(false);
  //controls the display of remove notifications
  const [showRemoveMessage, setShowRemoveMessage] = useState(false);
  //control the display of upload error message
  const [showErrorMessage, setShowErrorMessage] = useState(false);

  //references for file input and chat container (scrollable area)
  const fileInputRef = useRef<HTMLInputElement>(null);
  const chatRef = useRef<HTMLDivElement>(null);

  //finds the currently active conversation based on the activeId
  const activeConversation = conversations.find((c) => c.id === activeId);

  // Auto-scroll
  // the is to go to the most recent card given when a new message is added
  // it waits 100 milliseconds to ensure the new message is rendered before scrolling
  // and does a smooth scroll to the bottom of the chat container
  // it cleans up the timeout to prevent memory leaks
  useEffect(() => {
    if (!chatRef.current) return;
    const timeout = setTimeout(() => {
      chatRef.current?.scrollTo({ top: chatRef.current.scrollHeight, behavior: "smooth" });
    }, 100);
    return () => clearTimeout(timeout);
  }, [activeConversation?.messages]);

  // Append message
  // to active convo or new one
  // if no active convo, creates a new one with a unique id and the flower name as the title
  // if there is an active convo, appends the new message to it and updates the title if it was "Untitled Chat"
  // const appendMessage = (msg: ConversationCard) => {
  //   if (!activeId) {
  //     const newId = Date.now();
  //     setConversations((prev) => [...prev, { id: newId, title: `${msg.flower.color} ${msg.flower.name}`, messages: [msg] }]);
  //     setActiveId(newId);
  //   } else {
  //     setConversations((prev) =>
  //       prev.map((conv) =>
  //         conv.id === activeId
  //           ? {
  //               ...conv,
  //               title: conv.title === "Untitled Chat" ? msg.flower.name : conv.title,
  //               messages: [...conv.messages, msg],
  //             }
  //           : conv
  //       )
  //     );
  //   }
  // };
  const waitForState = () =>
  new Promise(resolve => setTimeout(resolve, 0));

  const appendMessage = (
  msg: Partial<ConversationCard>,
  targetId?: number       // ⭐ NEW: force message into correct conversation
) => {
  setConversations(prev => {
    const id = targetId ?? activeId;  // use explicit ID or fallback

    if (!id) {
      console.error("appendMessage called with no active conversation!");
      return prev;
    }

    return prev.map(conv => {
      if (conv.id !== id) return conv;

      const newMessage: ConversationCard = {
        id: msg.id ?? Date.now(),
        type: msg.type || "string",
        content: msg.content || "",
        flower: msg.flower,
        imageUrl: msg.imageUrl ?? "",
      };

      // ⭐ TITLE LOGIC
      let newTitle = conv.title;

      // If the chat has no messages yet → the first message determines the title
      if (conv.messages.length === 0) {
        if (msg.type === "user" && msg.content) {
          newTitle = msg.content;                 // user prompt becomes title
        } 
        else if (msg.type === "flower" && msg.flower) {
          newTitle = `${msg.flower.color} ${msg.flower.name}`;   // flower becomes title
        }
      }

      return {
        ...conv,
        title: newTitle,
        messages: [...conv.messages, newMessage],
      };
    });
  });
};


	// ===================== 2025-11-05================
	// This is a somewhat working version of communication, it only console.logs the response now
  // Search
  // looks for a flower by name will append a message with that flower if found
  // and hides the saved flowers page if it was open
  // ignores case when searching
  // does nothing if no match is found
  const handleSearch = async (query: string) => {
  console.log("query string: ", query);

  let convId = activeId;

  // Ensure conversation exists
  if (!convId) {
    convId = Date.now();
    setActiveId(convId);

    setConversations(prev => [
      ...prev,
      {
        id: convId,
        title: "Untitled Chat",
        messages: []
      }
    ]);
  }

  // 1️⃣ Append user message ONCE
  appendMessage(
    {
      id: Date.now(),
      type: "user",
      content: query
    },
    convId
  );

  // 2️⃣ Insert loading bubble
  const loadingId = Date.now() + 1;
  appendMessage(
    {
      id: loadingId,
      type: "loading"
    },
    convId
  );

  try {
    console.log("Sending query to backend...");

    const API_BASE =
      window.location.hostname === "localhost"
        ? "http://localhost:5001"
        : "http://backend:5001";

    const response = await fetch(`${API_BASE}/ask`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ prompt: query })
    });

    if (!response.ok) {
      console.error("Server returned error:", response.status);
      throw new Error("Bad server response");
    }

    const data = await response.json();

    // 3️⃣ Remove loading bubble
    setConversations(prev =>
      prev.map(conv =>
        conv.id === convId
          ? {
              ...conv,
              messages: conv.messages.filter(m => m.id !== loadingId)
            }
          : conv
      )
    );

    // 4️⃣ Append final LLM response
    appendMessage(
      {
        id: Date.now() + 2,
        type: "string",
        content: data.response
      },
      convId
    );

    setShowSavedPage(false);

  } catch (error) {
    console.error("Error during search:", error);

    // Remove loading bubble even if error
    setConversations(prev =>
      prev.map(conv =>
        conv.id === convId
          ? {
              ...conv,
              messages: conv.messages.filter(m => m.id !== loadingId)
            }
          : conv
      )
    );
  }
};
	// ==============================================




  // Upload
  // handles image upload by the user
  // gets the first file from the input
  // creates a URL for the uploaded image coverts to FormData
  // sends FormData to backend to communicate AI and awaits json response
  // searches for json response in dataset
  // appends matched item in dataset to message
  // then goes back to the main chat view
  // make async to talk to AI
    const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
  console.log("entered handleUpload");

  const file = e.target.files?.[0];
  console.log("Selected:", file);
  if (!file) return;

  const allowedTypes = ["image/jpeg", "image/png", "image/webp"];
  const allowedExts = [".jpg", ".jpeg", ".png", ".webp"];
  const ext = file.name.toLowerCase().slice(file.name.lastIndexOf("."));

  if (!allowedTypes.includes(file.type) && !allowedExts.includes(ext)) {
    setShowErrorMessage(true);
    return;
  }

  const url = URL.createObjectURL(file);
  const formData = new FormData();
  formData.append("image", file);

  // Ensure conversation exists
  let convId = activeId;
  if (!convId) {
    convId = Date.now();
    setActiveId(convId);

    setConversations(prev => [
      ...prev,
      {
        id: convId,
        title: "*Image Upload*",
        messages: []
      }
    ]);
  }

  // 1️⃣ User upload message
  appendMessage(
    {
      id: Date.now(),
      type: "user",
      content: `*Uploaded image:* _${file.name}_`
    },
    convId
  );

  // 2️⃣ Add loading bubble
  const loadingId = Date.now() + 1;
  appendMessage(
    {
      id: loadingId,
      type: "loading"
    },
    convId
  );

  try {
    console.log("Sending image to backend...");

    const API_BASE =
      window.location.hostname === "localhost"
        ? "http://localhost:5001"
        : "http://backend:5001";

    const response = await fetch(`${API_BASE}/predict`, {
      method: "POST",
      body: formData
    });

    if (!response.ok) {
      console.error("Server returned error:", response.status);
      throw new Error("Bad response from server");
    }

    const data = await response.json();
    console.log("Backend response:", data);

    const matchedFlower = findMatchingFlower(data);

    // 3️⃣ Remove loading bubble
    setConversations(prev =>
      prev.map(conv =>
        conv.id === convId
          ? {
              ...conv,
              messages: conv.messages.filter(m => m.id !== loadingId)
            }
          : conv
      )
    );

    // 4️⃣ Append flower card
    appendMessage(
      {
        id: Date.now() + 2,
        type: "flower",
        flower: matchedFlower,
        imageUrl: url
      },
      convId
    );
  } catch (err) {
    console.error("Upload failed:", err);
    setShowErrorMessage(true);

    // Cleanup: remove loading bubble
    setConversations(prev =>
      prev.map(conv =>
        conv.id === convId
          ? {
              ...conv,
              messages: conv.messages.filter(m => m.id !== loadingId)
            }
          : conv
      )
    );
  }
  if (fileInputRef.current) {
  fileInputRef.current.value = "";
}
};

  // Save/remove flower
  // if its found, it will show remove message and remove it from saved flowers
  // if its not founds, will show save message and add it to saved flowers
  const handleSaveOrRemoveFlower = (flower: FlowerVariant, imageUrl?: string | null) => {
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
  // will return true if the flower is already in the saved flowers list
  const isFlowerSaved = (flowerName: string) => {
    return savedFlowers.some((f) => f.flower.name === flowerName);
  };

  // New Chat
  // creates a new conversation with a unique id and "Untitled Chat" as the title for now
  const handleNewChat = () => {
    const newId = Date.now();
    setConversations((prev) => [...prev, { id: newId, title: "Untitled Chat", messages: [] }]);
    setActiveId(newId);
    setShowSavedPage(false);
  };

  // before your main return() — right after defining activeConversation, etc.
const renderedMessages = activeConversation?.messages.length
  ? activeConversation.messages.map((msg, i) => {
      if (msg.type === "flower" && msg.flower) {
        return (
          <FlowerInfoCard
            key={`${msg.flower.name}-${msg.imageUrl}-${i}`}
            flower={msg.flower}
            imageUrl={msg.imageUrl}
            isSaved={isFlowerSaved(msg.flower.name)}
            onSaveOrRemove={() => handleSaveOrRemoveFlower(msg.flower, msg.imageUrl)}
          />
        );
      } else if (msg.type === "user" && msg.content) {
        return (
          <div
            key={`user-${msg.id}-${i}`}
            className="self-end bg-purple text-black font-calistoga 
                       p-3 rounded-xl max-w-xs shadow"
          >
            {msg.content}
          </div>
        );
      }
      else if (msg.type === "loading") {
        return (
          <div
            key={`loading-${msg.id}-${i}`}
            className="self-start bg-white/70 text-black font-calistoga 
                      p-3 rounded-xl max-w-xs shadow flex items-center gap-2"
          >
            <span className="animate-pulse">Thinking</span>
            <div className="w-2 h-2 bg-gray-600 rounded-full animate-bounce"></div>
            <div className="w-2 h-2 bg-gray-600 rounded-full animate-bounce delay-150"></div>
            <div className="w-2 h-2 bg-gray-600 rounded-full animate-bounce delay-300"></div>
          </div>
        );
      } 
      else if (msg.type === "string" && msg.content) {
        return (
          <LlmResponseCard
            key={`string-${msg.id}-${i}`}
            content={msg.content}
          />
        );
      } else {
        return null;
      }
    })
  : (
      <p className="text-gray-500 text-center mt-10 font-calistoga">
        Search or upload an image to start a conversation.
      </p>
    );

  // where "renderedMessages" is used, used to be:
  // {/* checks if there is an active conversation and if it has messages to display */}
  //             {activeConversation?.messages.length ? (
  //               /* maps through the messages in the active conversation and renders a FlowerInfoCard for each one */
  //               activeConversation.messages.map((msg, i) => (
  //                 if (msg.type === "flower" && msg.flower) {
  //                   return (
  //                     <FlowerInfoCard
  //                       key={`${msg.flower.name}-${msg.imageUrl}-${i}`}
  //                       flower={msg.flower}
  //                       imageUrl={msg.imageUrl}
  //                       isSaved={isFlowerSaved(msg.flower.name)}
  //                       onSaveOrRemove={() => handleSaveOrRemoveFlower(msg.flower, msg.imageUrl)}
  //                     />
  //                   );
  //                 } else if (msg.type === "string" && msg.content) {
  //                   return (
  //                     <LlmResponseCard
  //                       key={`string-${msg.id}-${i}`}
  //                       content={msg.content}
  //                     />
  //                   );
  //                 } else {
  //                   return null;
  //                 }
  //               })
  //             ) : (
  //               <p className="text-gray-500 text-center mt-10 font-calistoga">
  //                 Search or upload an image to start a conversation.
  //               </p>
  //             )}




  function findMatchingFlower(data: { species: string; color: string }) {
    // Find the species
    const matchedSpecies = flowerDataset.flowers.find(
      f => f.species.toLowerCase() === data.species.toLowerCase()
    );

    // If no species match, return first variant of first species
    if (!matchedSpecies) {
      return flowerDataset.flowers[0].variants[0];
    }

    // find variant of that species with color
    const matchedVariant = matchedSpecies.variants.find(
      v => v.color.toLowerCase() === data.color.toLowerCase()
    );

    // If color not found return first variant of that species
    return matchedVariant || matchedSpecies.variants[0];
  }

  return (
    // main container for the chat layout
    // its a flexbox with full screen height and width
    <div className="flex h-screen w-screen">
      {/* Sidebar */}
      {/* has a fixed width of 64, with a blue background, and the flex is vertical and will have a right border that is black */}
      <div className="w-64 bg-blue p-4 flex flex-col border-r border-black">
        {/* this is the left sidebar */}
        {/* this is the button to starts a new conversation */}
        {/* the the margin bottom is set to 4, the padding on the sides is set to 4 and the passing for top and bottom is 2, the background is light blue and the button will have rounded corners, and the font is calistoga */}
        <button onClick={handleNewChat} className="mb-4 px-4 py-2 bg-lightBlue rounded-lg font-calistoga">
          New Chat
        </button>

        {/* button to view saved flowers */}
        {/* the styling is the same as the new chat button*/}
        <button
          onClick={() => setShowSavedPage(true)}
          className="mb-4 px-4 py-2 bg-lightBlue rounded-lg font-calistoga"
        >
          My Flowers
        </button>

        {/* Conversation List - title for it*/}
        {/* the font is catlistoga, the text will be large with a margin bottom of 2*/}
        <h2 className="font-calistoga text-lg mb-2">Conversations</h2>
        {/* this is a scorllable list to fill the reaming height */}
        <div className="flex-1 overflow-y-auto space-y-1">
          {/* this renders the conversations as buttons to access again */}
          {/* this checks if there are conversations to be displayed*/}
          {conversations.length > 0 ? (
            // maps through the conversations and creates a button for each one
            conversations.map((c) => (
              <button
                // the key is the unique id of the convor
                key={c.id}
                // when it is clicked (the button) it sets the active id to that convo id, meaning it will be displayed
                onClick={() => setActiveId(c.id)}
                // the current active convo will have a different style
                // which is a light blue background and bold font and a full width, text aligned left, padding on the left 3 and right is 1, rounded corners, times font and a transition effect
                className={`w-full text-left px-3 py-1 rounded-md font-times transition ${
                  // when it is hovered over it will change to light blue
                  activeId === c.id ? "bg-lightBlue font-bold" : "bg-blue hover:bg-lightBlue"
                }`}
              >
                {/*the title of the convo is displayed*/}
                {c.title}
              </button>
            ))
          ) : (
            // if no conversations this is the text, grey color, small size, and calistoga font
            <p className="text-gray-500 text-sm font-calistoga">No conversations yet.</p>
          )}
        </div >
        {/* Welcome message with username */}
        {username && (
          <p className="text-black font-calistoga mb-2 text-sm">
            🌸 Welcome, <span className="font-bold">{username}</span>!
          </p>
        )}
        {/* the logout button at the bottom of the sidebar */}
        {/* the button has margin top auto to push it to the bottom, full width, padding on top and bottom of 2, rounded corners, calistoga font, light blue background and black text */}
        {/* at the moment does not cause no login had been made, for the future reference*/}
        <button
          onClick={onLogout}
          className="mt-auto w-full py-2 rounded-lg font-calistoga bg-lightBlue text-black"
        >
          Log Out
        </button>
      </div>

      {/* Main Area */}
      {/* the main area takes the remaining space, is a flexbox with vertical layout and has a pink background, its positioned relative for the toasts */}
      <div className="flex-1 flex flex-col bg-pink relative">
        {/* Notifications */}
        {/* shows a save success message t when a flower is saved */}
        {showSaveMessage && (
          // the message box is positioned absolute at the top right with a light blue background, black text, padding, rounded corners, shadow, calistoga font and a fade in/out animation
          <div className="absolute top-4 right-4 bg-lightBlue text-black px-4 py-2 rounded-lg shadow font-calistoga animate-fadeInOut">
            ✅ Saved successfully!
          </div>
        )}
        {/* shows a remove success message when a flower is removed from saved */}
        {showRemoveMessage && (
          // the message box is positioned absolute at the top right with a red background, white text, padding, rounded corners, shadow, calistoga font and a fade in/out animation
          <div className="absolute top-4 right-4 bg-red-400 text-white px-4 py-2 rounded-lg shadow font-calistoga animate-fadeInOut">
            ❌ Removed successfully!
          </div>
        )}
        {/* conditionl for chat or saved flowers page view */}
        {!showSavedPage ? (
          <>
          {/*this is the chat view */}
          {/*the chat container takes the remaining space above the search/upload area, is scrollable vertically, has padding, uses flexbox with vertical layout and spacing between messages, and references the chatRef for auto-scrolling */}
            <div className="flex-1 overflow-y-auto p-4 flex flex-col space-y-4" ref={chatRef}>
              {renderedMessages}
            </div>

            {/* Search + Upload */}
            {/* has a flexbox layout with padding, gap between items and a blue background */}
            {/* placed under the chat container */}
            {/* Search + Upload */}
            <div className="flex p-4 gap-2 bg-blue relative z-20">
              {/* the upload button and hidden file input */}
              {/* the button has padding, light blue background, rounded corners and calistoga font */}
              <button
                onClick={() => fileInputRef.current?.click()}
                className="relative group px-4 py-2 bg-lightBlue rounded-lg font-calistoga"
              >
                +
                {/* Custom tooltip */}
                <div
                  className="
                    absolute bottom-full left-1/2 -translate-x-1/2 mb-2
                    bg-black text-white text-xs px-2 py-1 rounded pointer-events-none
                    opacity-0 group-hover:opacity-100 transition-opacity
                  "
                >
                Image Upload
                </div>
              </button>
              {/* the file input accepts image files only, references the fileInputRef and calls handleUpload when a file is selected */}
              <input
                type="file"
                accept=".jpg,.jpeg,.png,.webp,image/jpeg,image/png,image/webp"
                ref={fileInputRef}
                onChange={handleUpload}
                className="hidden"
              />
              {/* the search bar takes the remaining space in its section */}
              <div className="flex-1">
                {/* calls the search bar component and passes the handleSearch function to it */}
                <SearchBar onSearch={handleSearch} />
              </div>
            </div>
            {showErrorMessage && (
                <div className="absolute top-4 right-4 bg-red-400 text-white px-4 py-2 rounded-lg shadow font-calistoga animate-fadeInOut">
                  No flower was detected in photo upload
                </div>
              )}
          </>
        ) : (
          // shows the saved flowers page when showSavedPage is true
          <SavedFlowersPage
            // passes the saved flowers, a function to go back to chat view and a function to remove a flower from saved
            savedFlowers={savedFlowers}
            onBack={() => setShowSavedPage(false)}
            onRemove={handleSaveOrRemoveFlower}
          />
        )}
      </div>
    </div>
  );
};