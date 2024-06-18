export const UserPrompt = ({ prompt }: { prompt: { name: string; content: string } }) => {
  return (
    <div className="flex flex-col rounded border shadow p-2">
      <h3 className="font-medium">{prompt.name}</h3>
      <p className="text-sm text-gray-600">{prompt.content}</p>
    </div>
  )
}
