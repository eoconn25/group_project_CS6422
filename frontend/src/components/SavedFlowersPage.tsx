import FlowerInfoCard from "./FlowerInfoCard";
import { mockFlowers } from "../data/mockData";

interface SavedFlower {
  flower: typeof mockFlowers[0];
  imageUrl?: string | null;
}

interface SavedFlowersPageProps {
  savedFlowers: SavedFlower[];
  onBack: () => void;
  onRemove: (flower: typeof mockFlowers[0], imageUrl?: string | null) => void;
}

export default function SavedFlowersPage({ savedFlowers, onBack, onRemove }: SavedFlowersPageProps) {
  return (
    <div className="flex flex-col h-full bg-pink">
      <div className="flex justify-between items-center p-4 border-b bg-lightPink">
        <h2 className="text-2xl font-calistoga">My Saved Flowers</h2>
        <button onClick={onBack} className="px-4 py-2 bg-lightBlue rounded-lg font-calistoga">
          Back to Chat
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-4 flex flex-wrap justify-center">
        {savedFlowers.length > 0 ? (
          savedFlowers.map((item, i) => (
            <FlowerInfoCard
              key={`${item.flower.name}-${item.imageUrl}-${i}`}
              flower={item.flower}
              imageUrl={item.imageUrl}
              isSaved={true}
              onSaveOrRemove={() => onRemove(item.flower, item.imageUrl)}
            />
          ))
        ) : (
          <p className="text-gray-500 text-center mt-10 font-calistoga">No saved flowers yet.</p>
        )}
      </div>
    </div>
  );
}