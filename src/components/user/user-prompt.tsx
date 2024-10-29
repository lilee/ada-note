export const UserPrompt = ({ prompt }: { prompt: { name: string; content: string } }) => {
  return (
    <div className="flex flex-col rounded-lg border shadow p-4">
      <h3 className="font-medium mb-2">{prompt.name}</h3>
      <pre className="text-sm text-gray-600 leading-6 font-sans break-all text-wrap whitespace-pre-wrap">
        {prompt.content}
      </pre>
    </div>
  )
}
