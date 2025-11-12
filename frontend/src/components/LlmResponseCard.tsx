interface LlmResponseCardProps {
  content: string;
}

export default function LlmResponseCard({ content }: LlmResponseCardProps) {
  return (
    <div className="max-w-md p-4 m-4 border rounded-2xl shadow bg-white">
      <h2 className="text-xl font-bold font-calistoga text-purple-700">
        LLM Response
      </h2>
      <p className="mt-2 text-gray-800 font-georgia whitespace-pre-line">
        {content}
      </p>
    </div>
  );
}
