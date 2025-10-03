interface Flower {
  name: string;
  scientificName: string;
  symbolism: string;
  care: string;
  llmText: string;
}

export default function FlowerInfoCard({ flower }: { flower: Flower }) {
  return (
    <div className="max-w-md p-4 m-4 border rounded-2xl shadow">
      <h2 className="text-2xl font-bold">{flower.name}</h2>
      <p className="italic text-gray-600">{flower.scientificName}</p>
      <p className="mt-2"><strong>Symbolism:</strong> {flower.symbolism}</p>
      <p><strong>Care:</strong> {flower.care}</p>
      <p className="mt-3 text-pink-700">{flower.llmText}</p>
    </div>
  );
}