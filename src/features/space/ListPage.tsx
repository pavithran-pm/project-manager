import { useParams } from 'react-router-dom'

export function ListPage() {
  const { listId } = useParams()
  void listId
  return <main className="flex min-w-0 flex-1 flex-col bg-white" />
}
