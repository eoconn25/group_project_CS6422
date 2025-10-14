interface Flower {
  name: string;
  scientificName: string;
  symbolism: string;
  care: string;
  llmText: string;
}

interface FlowerInfoCardProps {
  flower: Flower;
  imageUrl?: string | null;
  isSaved?: boolean; // optional flag to indicate if the flower is saved
  onSaveOrRemove?: (flower: Flower, imageUrl?: string | null) => void; // optional callback with image
}

export default function FlowerInfoCard({
  flower,
  imageUrl,
  isSaved = false,
  onSaveOrRemove,
}: FlowerInfoCardProps) {
  return (
    <div className="max-w-md p-4 m-4 border rounded-2xl shadow bg-lightPink">
      {/* Header */}
      <h2 className="text-2xl font-bold font-calistoga">{flower.name}</h2>
      <p className="italic text-gray-600 font-times">{flower.scientificName}</p>

      {/* Optional uploaded image */}
      {imageUrl && (
        <div className="mt-3 flex flex-col items-center">
          <img
            src={imageUrl}
            alt="Uploaded flower"
            className="max-w-[250px] max-h-[250px] object-contain rounded-lg shadow"
          />
          <p className="text-gray-600 font-times text-sm mt-2">
            Mock prediction: <strong>{flower.name} (92%)</strong>
          </p>
        </div>
      )}

      {/* Text content */}
      <div className="mt-3 space-y-1 font-georgia">
        <p><strong>Symbolism:</strong> {flower.symbolism}</p>
        <p><strong>Care:</strong> {flower.care}</p>
        <p className="mt-3">{flower.llmText}</p>
      </div>

      {/* Save/Remove button */}
      {onSaveOrRemove && (
        <div className="flex justify-center mt-4">
          <button
            className="px-4 py-2 bg-purple text-black rounded-lg shadow hover:bg-pink-600 transition"
            onClick={() => onSaveOrRemove(flower, imageUrl)}
          >
            {isSaved ? "Remove" : "Save"}
          </button>
        </div>
      )}
    </div>
  );
}