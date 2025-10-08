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
}

export default function FlowerInfoCard({ flower, imageUrl }: FlowerInfoCardProps) {
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
    </div>
  );
}