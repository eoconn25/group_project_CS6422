// used to select the state of if more info is shown
import { useState } from "react";
// blueprint for what a flower object looks like
// has name and the scientific name, what it symblises, what its care instructions are, and optional image url
interface Flower {
  color: string;
  name: string;
  scientific_name: string;
  symbolism: string[];
  petal_count: {
    min: number;
    max: number;
    typical: number;
  };
  average_diameter_cm: number;
  fragrance: {
    intensity: number;
    description: string;
  };
  blooming_season: string[];
  native_regions: string[];
  care: {
    light: string;
    water: string;
    soil: string;
  };
  image: string;
}

//blueprint for the props that the FlowerInfoCard component will receive
// the main flower object, a image url that is optional, a check to see of its saved (boolean), and a function to save or remove the flower that is also optional
interface FlowerInfoCardProps {
  flower: Flower;
  imageUrl?: string | null;
  isSaved?: boolean;
  onSaveOrRemove?: (flower: Flower, imageUrl?: string | null) => void;
}

// main component function for the flower info card
// destructuring -> to pull the peops that are passed (states earlier_)
export default function FlowerInfoCard({
  flower,
  imageUrl,
  // default value set to false, as do not want all to be saved
  isSaved = false,
  onSaveOrRemove,
}: FlowerInfoCardProps) {
  // state to track if more info is shown or not, default is false
  const [showMore, setShowMore] = useState(false);

  return (
    // the container for the card
    // the width size is limited to medium, has a padding and border, there is a border with rounded corners and a drop shadow, background is a lightpink
    <div className="max-w-md p-4 m-4 border rounded-2xl shadow bg-lightPink">
      {/* flower name is displaed with the text size 2xl, and be bold in a calistoga font */}
      <h2 className="text-2xl font-bold font-calistoga">{flower.color} {flower.name}</h2>
      {/*this is the scinetific name with italic font that is times and also gray */}
      <p className="italic text-gray-600 font-times">{flower.scientific_name}</p>

      {/* starts the section for the flower image */}
      {/* has a top margin, and the items get center and flexed */}
      <div className="mt-3 flex flex-col items-center">
        {/* the image gets displayed*/}
        {/* src -> uses the image if it exists, then a place for a default fallback */}
        {/* alt -> descrption of the flower */}
        <img
          src={flower.image || "/placeholder.png"}
          alt={flower.name}
          /* the image has a max width and height of 250px, the object is contained within that size, has rounded corners and a shadow */
          /* this solved the issues of the images being too big */
          className="max-w-[250px] max-h-[250px] object-contain rounded-lg shadow"
        />
      </div>

      {/* a section for the description of the flower*/}
      {/* it has a top margin, and there is spacing places between the paragraphs placed, and the font is georgia*/}
      {/* displays what it symbolises, the care and the llmtext*/}
      <div className="mt-3 space-y-1 font-georgia">
        <p><strong>Symbolism:</strong> </p>
        {/*<ul className="list-disc list-inside">
          {flower.symbolism.map((meaning, index) => (
            <li key={index}>{meaning}</li>
          ))}
        </ul>*/}
        {/* tags that show the flowers meaning individual */}
        {/* the container is flexed, wraps and has a gap between the items */}
        <div className="flex flex-wrap gap-2 mt-1">
        {/* maps through the symbolism array and creates a span for each meaning */}
        {flower.symbolism.map((meaning, index) => (
          <span
            // unique key for each span using the index, styles the span with purple background, black text, rounded full, padding, times font and a small shadow
            key={index}
            className="bg-purple text-black rounded-full px-3 py-1 font-times shadow-sm"
          >
            {meaning}
          </span>
        ))}
      </div>
        <p><strong>Care:</strong>  </p>
        <ul className="list-disc list-inside font-times">
          <li><strong>Light:</strong> {flower.care.light}</li>
          <li><strong>Water:</strong> {flower.care.water}</li>
          <li><strong>Soil:</strong> {flower.care.soil}</li>
        </ul>
        {/* this isn't a parameter anymore, need to change to receive data from LLM maybe */}
        {/* <p className="mt-3">{flower.llmText}</p> */}
      </div>

      {/* more info toggle */}
      {/* the button container is flexed and centered with a margin top of 4 */}
      <div className="flex justify-center mt-4">
        <button
          // when clicked it toggles the showMore state between true and false
          onClick={() => setShowMore(!showMore)}
          // the button has padding, purple background, black text, rounded corners, hover effect to change color and a transition effect
          className="px-4 py-2 bg-purple text-black rounded-lg hover:bg-blue transition"
        >
          {/* the button text changes depending on if more info is shown or not */}
          {showMore ? "Hide Info" : "More Info"}
        </button>
      </div>

      {/* expanded tnfo */}
      {showMore && (
        // the container for the extra info has a top margin, small text size, georgia font, spacing between the paragraphs, a top border and padding at the top
        <div className="mt-3 text-sm font-georgia space-y-2 border-t border-gray-300 pt-3">
          <p><strong>Petal Count:</strong> {flower.petal_count.typical} (range {flower.petal_count.min}–{flower.petal_count.max})</p>
          <p><strong>Average Diameter:</strong> {flower.average_diameter_cm} cm</p>
          <p><strong>Fragrance:</strong> {flower.fragrance.description} (Intensity: {flower.fragrance.intensity}/5)</p>
          <p><strong>Blooming Season:</strong> {flower.blooming_season.join(", ")}</p>
          <p><strong>Native Regions:</strong> {flower.native_regions.join(", ")}</p>
        </div>
      )}

      {/* renders the button for saving and deleting if the onSaveOrRemove function was passed */}
      {onSaveOrRemove && (
        // th button container is flexed and centered with a margin top of 4
        <div className="flex justify-center mt-4">
          {/* the actual button */}
          <button
            // the button has padding, purple background, black text, rounded corners, a shadow, hover effect to change color and a transition effect */}
            className="px-4 py-2 bg-purple text-black rounded-lg shadow hover:bg-pink-600 transition"
            // runs the function when clicked, passing the flower data and image url to be saved or removed
            onClick={() => onSaveOrRemove(flower, imageUrl)}
          >
            {/* the button text changes depending on if it was already saved or not*/}
            {isSaved ? "Remove" : "Save"}
          </button>
        </div>
      )}
    </div>
  );
}