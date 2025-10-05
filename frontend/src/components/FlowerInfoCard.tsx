//info prestend 
interface Flower {
  name: string;
  scientificName: string;
  symbolism: string;
  care: string;
  llmText: string;
}

// Props for FlowerInfoCard component, including optional imageUrl
interface FlowerInfoCardProps {
  flower: Flower;
  imageUrl?: string | null;
}

// FlowerInfoCard react functional component to display flower details and optional image
// uses object destructuring to extract flower and imageUrl from props
export default function FlowerInfoCard({ flower, imageUrl }: FlowerInfoCardProps) {
  return (
    // card has card limit to medium size, padding, margin, border, rounded corners, shadow, white background
    // these are tailwind css classes
    <div className="max-w-md p-4 m-4 border rounded-2xl shadow bg-white">
      {/* Header */}
      {/*flowe name is bold and large*/}
      <h2 className="text-2xl font-bold">{flower.name}</h2>
      {/* its scientific name is italic and gray*/}
      <p className="italic text-gray-600">{flower.scientificName}</p>

      {/* Optional uploaded image and mock prediction */}
      {imageUrl && (
        /* margin top, flex column, center items */
        /* margin puts space between heading and image, and the then the flex and layout gives a vertical layour centered horizontally */
        <div className="mt-3 flex flex-col items-center">
          {/* displays the image */}
          <img
            src={imageUrl}
            alt="Uploaded flower"
            /* this limits the image size when they are too large*/
            /* also again rounded corners and a shaow */
            className="max-w-[250px] max-h-[250px] object-contain rounded-lg shadow"
          />
          {/* mock prediction text below image, gray and small */}
          <p className="text-gray-600 text-sm mt-2">
            Mock prediction: <strong>{flower.name} (92%)</strong>
          </p>
        </div>
      )}

      {/* Text content */}
      {/* margin for top spacing, and space-y-1 adds vertical spacing between lines */}
      <div className="mt-3 space-y-1">
        <p><strong>Symbolism:</strong> {flower.symbolism}</p>
        <p><strong>Care:</strong> {flower.care}</p>
        <p className="mt-3 text-pink-700">{flower.llmText}</p>
      </div>
    </div>
  );
}