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
  type: "flower" | "string"; // type of message, either a flower object or string response (from llm)
  content?: string; // string response content from llm
  flower?: FlowerVariant;
  imageUrl?: string | null; // image url for flower image
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
  flower: typeof flowerDataset[0];
  imageUrl?: string | null;
}

// main component function for the chat layout
//declares and exports the main component function for the chat layout
export default function ChatLayout() {
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

  const appendMessage = (msg: Partial<ConversationCard>) => {
  setConversations((prev) => {
    // if no active conversation exists, create one
    if (!activeId) {
      const newId = Date.now();

      // derive a title
      const title =
        msg.type === "flower" && msg.flower
          ? `${msg.flower.color} ${msg.flower.name}`
          : "Untitled Chat";

      const newConv: ConversationThread = {
        id: newId,
        title,
        messages: [
          {
            id: msg.id ?? Date.now(),
            type: msg.type || "string",
            content: msg.content || "",
            flower: msg.flower,
            imageUrl: msg.imageUrl ?? null,
          },
        ],
      };

      setActiveId(newId);
      return [...prev, newConv];
    }

    // otherwise, append to the existing active conversation
    return prev.map((conv) => {
      if (conv.id !== activeId) return conv;

      // update title only if it’s "Untitled Chat" and we have a new flower
      let newTitle = conv.title;
      if (conv.title === "Untitled Chat" && msg.flower) {
        newTitle = msg.flower.name;
      }

      const newMessage: ConversationCard = {
        id: msg.id ?? Date.now(),
        type: msg.type || "string",
        content: msg.content || "",
        flower: msg.flower,
        imageUrl: msg.imageUrl ?? null,
      };

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

    try {
    console.log("Sending query to backend...");

    const API_BASE =
      window.location.hostname === "localhost"
        ? "http://localhost:5001"
        : "http://backend:5001";

    console.log("API_BASE: ", API_BASE);



    const response = await fetch(`${API_BASE}/ask`, 
			{ method: "POST", 
				headers: {"Content-Type": "application/json"}, 
				body: JSON.stringify({prompt: query}) 
		})

    // const response = await fetch("http://localhost:5001/ask", 
    //       { method: "POST", 
    //         headers: {"Content-Type": "application/json"}, 
    //         body: JSON.stringify({prompt: query}) 
    //     })


    if (!response.ok) {
      console.error("Server returned error:", response.status);
      return;
    }

    
		const data = await response.json()
    //const result = flowerDataset.find((f) => f.name.toLowerCase() === query.toLowerCase());
    //if (!result) return;
    //appendMessage(data.response);
		
        
    console.log("Received: ", data);

    appendMessage({ id: Date.now(), type: "string", content: data.response });
    setShowSavedPage(false);


    } catch (error) {
      console.error("Error during upload:", error);
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
    console.log("entered handleUpload")
    
    const file = e.target.files?.[0];
    console.log("Selected:", file);


    if (!file) return;

    const url = URL.createObjectURL(file);
    console.log(url)

    // new from here
    // Prepare data for backend
    const formData = new FormData();
    formData.append("image", file);
    console.log("form data: ", formData)

    try {
    console.log("Sending image to backend...");
    // const response = await fetch("http://localhost:5001/predict", {
    //   method: "POST",
    //   body: formData,
    // });

    const API_BASE =
      window.location.hostname === "localhost"
        ? "http://localhost:5001"
        : "http://backend:5001";

    console.log("API_BASE: ", API_BASE);

    const response = await fetch(`${API_BASE}/predict`, {
      method: "POST",
      body: formData,
    });



    if (!response.ok) {
      console.error("Server returned error:", response.status);
      return;
    }

    const data = await response.json();
    console.log("Backend response:", data); // {color, species}

    if (data.species) {
      const matchedFlower = findMatchingFlower(data);
      console.log("matchedFlower: ", matchedFlower)
          
    
      // Update your UI / message list
      appendMessage({ id: Date.now(), type: "flower", flower: matchedFlower, imageUrl: url });

    } else {
      console.log("No flower was detected in photo upload")
      setShowErrorMessage(true);
      setTimeout(() => setShowErrorMessage(false), 3000);
    }

    } catch (error) {
      console.error("Error during upload:", error);
    }

    // old version
    // const matchedFlower = mockFlowers[2]; // mock prediction
    // appendMessage({ flower: matchedFlower, imageUrl: url });
    // setShowSavedPage(false);  // commented this for now
  };

  // Save/remove flower
  // if its found, it will show remove message and remove it from saved flowers
  // if its not founds, will show save message and add it to saved flowers
  const handleSaveOrRemoveFlower = (flower: typeof flowerDataset[0], imageUrl?: string | null) => {
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
      if (msg.type === "flower" && msg.flower) { // check to see if flower type and flower data exist
        return (
          <FlowerInfoCard
            key={`${msg.flower.name}-${msg.imageUrl}-${i}`}
            flower={msg.flower}
            imageUrl={msg.imageUrl}
            isSaved={isFlowerSaved(msg.flower.name)}
            onSaveOrRemove={() => handleSaveOrRemoveFlower(msg.flower, msg.imageUrl)}
          />
        );
      } else if (msg.type === "string" && msg.content) { // if not flower object, check for string type and content
        return (
          <LlmResponseCard
            key={`string-${msg.id}-${i}`}
            content={msg.content}
          />
        );
      } else { // otherwise, return null (and panic)
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
        </div>
        {/* the logout button at the bottom of the sidebar */}
        {/* the button has margin top auto to push it to the bottom, full width, padding on top and bottom of 2, rounded corners, calistoga font, light blue background and black text */}
        {/* at the moment does not cause no login had been made, for the future reference*/}
        <button className="mt-auto w-full py-2 rounded-lg font-calistoga bg-lightBlue text-black">
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
            <div className="flex p-4 gap-2 bg-blue">
              {/* the search bar takes the remaining space in its section */}
              <div className="flex-1">
                {/* calls the search bar component and passes the handleSearch function to it */}
                <SearchBar onSearch={handleSearch} />
              </div>
              {/* the upload button and hidden file input */}
              {/* the button has padding, light blue background, rounded corners and calistoga font */}
              <button
                /* when clicked it triggers the hidden file input to open the file dialog */
                onClick={() => fileInputRef.current?.click()}
                // button styling is padding on left axis of 4 and right its 2, light blue background, rounded corners and calistoga font
                className="px-4 py-2 bg-lightBlue rounded-lg font-calistoga"
              >
                Upload
              </button>
              {/* the file input accepts image files only, references the fileInputRef and calls handleUpload when a file is selected */}
              <input type="file" accept="image/*" ref={fileInputRef} onChange={handleUpload} className="hidden" />
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
}
