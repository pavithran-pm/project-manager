import { useParams } from 'react-router-dom'

export function WhiteboardPage() {
  const { itemId } = useParams()
  void itemId
  return <main className="flex min-w-0 flex-1 flex-col bg-white" />
}
