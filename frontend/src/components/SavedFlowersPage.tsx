// imports the flowe card component to display the saved flowers
import FlowerInfoCard from "./FlowerInfoCard";
//uses the mocjk data for flower type definition
import { mockFlowers } from "../data/mockData";

//blueprint for what the saved flower object looks like
interface SavedFlower {
  //have the same structure as the flower in mock data
  flower: typeof mockFlowers[0];
  //the image url can be a string or null (optional)
  imageUrl?: string | null;
}

//blueprint for the props that the SavedFlowersPage component will receive
interface SavedFlowersPageProps {
  //array the holds the saved folowers
  savedFlowers: SavedFlower[];
  //this goes back to the chatpage with no return, when clicked
  onBack: () => void;
  // this removes the flower with the data and image as parameters to remove
  onRemove: (flower: typeof mockFlowers[0], imageUrl?: string | null) => void;
}

// this is the main component function for the saved flowers page
// destructuring -> extraaxts the savedFlowes, onBack, and onRemove from the props
//so it can render the list and also the back button 
export default function SavedFlowersPage({ savedFlowers, onBack, onRemove }: SavedFlowersPageProps) {
  return (
    //main continer with a flexbox layout, full height, and pink background
    <div className="flex flex-col h-full bg-pink">
      {/* the header section*/}
      {/* the title and button are on opposite sides, has padding and a border line and a light pink background */}
      <div className="flex justify-between items-center p-4 border-b bg-lightPink">
        {/* the text thats get placed in the header with 2xl large and the calistoga font*/}
        <h2 className="text-2xl font-calistoga">My Saved Flowers</h2>
        {/* button that uses the onBack passed earlier */}
        {/*hass padding, roounded courners, calistoga font, and the background was lightblue */}
        <button onClick={onBack} className="px-4 py-2 bg-lightBlue rounded-lg font-calistoga">
          {/* text for button */}
          Back to Chat
        </button>
      </div>
      {/* the section that will contain the saved flowers */}
      {/* fills reamining space under the header, has vertical scrolling if the flowers grow, wrapping flexbox centers the cards, and padding*/}
      <div className="flex-1 overflow-y-auto p-4 flex flex-wrap justify-center">
        {/* checks if there is flower display*/}
        {/* if not shows a message saying this (0) */}
        {/* if there is (more then 0) renders */}
        {savedFlowers.length > 0 ? (
          // loops through the flowers in the array and returns and renders each one
          savedFlowers.map((item, i) => (
            // has a key for react to use a render list, passes the flower data to the card, pass the image url to display, then check if its already save (button will be remove now), when clicked when will remove
            <FlowerInfoCard
              key={`${item.flower.name}-${item.imageUrl}-${i}`}
              flower={item.flower}
              imageUrl={item.imageUrl}
              isSaved={true}
              onSaveOrRemove={() => onRemove(item.flower, item.imageUrl)}
            />
          ))
        ) : (
          // if no flowers this is the text, grey color, centered, has a margin top 10 and lastly calistoga font
          <p className="text-gray-500 text-center mt-10 font-calistoga">No saved flowers yet.</p>
        )}
      </div>
    </div>
  );
}