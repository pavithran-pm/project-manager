import { useParams } from 'react-router-dom'

export function FolderPage() {
  const { folderId } = useParams()
  void folderId
  return <main className="flex min-w-0 flex-1 flex-col bg-white" />
}
