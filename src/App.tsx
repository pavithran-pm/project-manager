import { BrowserRouter, HashRouter, Navigate, Route, Routes } from 'react-router-dom'
import { IconRail } from './components/layout/IconRail'
import { Sidebar } from './components/layout/Sidebar'
import { TopBar } from './components/layout/TopBar'
import { SearchModal } from './components/ui/SearchModal'
import { SelectionBar } from './components/ui/SelectionBar'
import { ToastHost } from './components/ui/ToastHost'
import { InboxPage } from './features/inbox/InboxPage'
import { PlaceholderPage } from './features/placeholder/PlaceholderPage'
import { FolderPage } from './features/space/FolderPage'
import { ListPage } from './features/space/ListPage'
import { CustomizeViewPanel } from './features/space/CustomizeViewPanel'
import { NewTaskModal } from './features/task/NewTaskModal'
import { TaskModal } from './features/task/TaskModal'
import { WhiteboardPage } from './features/whiteboard/WhiteboardPage'
import { BrainPage } from './features/ai/BrainPage'
import { SpaceOverviewPage } from './features/space/SpaceOverviewPage'

// Hash routing lets the single-file build (artifact / static hosting) deep-link
// without a history-fallback server; the dev/production server keeps clean URLs.
const Router = import.meta.env.VITE_HASH_ROUTER === '1' ? HashRouter : BrowserRouter

export default function App() {
  return (
    <Router>
      <div className="flex h-full flex-col">
        <TopBar />
        <div className="flex min-h-0 flex-1">
          <IconRail />
          <Routes>
            <Route path="/" element={<Navigate to="/home" replace />} />
            <Route
              path="/home"
              element={
                <>
                  <Sidebar />
                  <InboxPage />
                </>
              }
            />
            <Route
              path="/space/:spaceId/folder/:folderId/:view?"
              element={
                <>
                  <Sidebar />
                  <FolderPage />
                </>
              }
            />
            <Route
              path="/space/:spaceId/list/:listId/:view?"
              element={
                <>
                  <Sidebar />
                  <ListPage />
                </>
              }
            />
            <Route
              path="/space/:spaceId"
              element={
                <>
                  <Sidebar />
                  <SpaceOverviewPage />
                </>
              }
            />
            <Route
              path="/whiteboard/:itemId"
              element={
                <>
                  <Sidebar />
                  <WhiteboardPage />
                </>
              }
            />
            <Route path="/planner" element={<PlaceholderPage title="Planner" />} />
            <Route path="/ai" element={<><Sidebar /><BrainPage /></>} />
            <Route path="/teams" element={<PlaceholderPage title="Teams" />} />
            <Route path="/dashboards" element={<PlaceholderPage title="Dashboards" />} />
            <Route path="/more" element={<PlaceholderPage title="More" />} />
            <Route path="*" element={<Navigate to="/home" replace />} />
          </Routes>
        </div>
        <SearchModal />
        <TaskModal />
        <NewTaskModal />
        <CustomizeViewPanel />
        <SelectionBar />
        <ToastHost />
      </div>
    </Router>
  )
}
