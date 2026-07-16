import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { IconRail } from './components/layout/IconRail'
import { Sidebar } from './components/layout/Sidebar'
import { TopBar } from './components/layout/TopBar'
import { InboxPage } from './features/inbox/InboxPage'
import { PlaceholderPage } from './features/placeholder/PlaceholderPage'

function HomeLayout() {
  return (
    <>
      <Sidebar />
      <InboxPage />
    </>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <div className="flex h-full flex-col">
        <TopBar />
        <div className="flex min-h-0 flex-1">
          <IconRail />
          <Routes>
            <Route path="/" element={<Navigate to="/home" replace />} />
            <Route path="/home" element={<HomeLayout />} />
            <Route path="/planner" element={<PlaceholderPage title="Planner" />} />
            <Route path="/ai" element={<PlaceholderPage title="AI" />} />
            <Route path="/teams" element={<PlaceholderPage title="Teams" />} />
            <Route path="/dashboards" element={<PlaceholderPage title="Dashboards" />} />
            <Route path="/more" element={<PlaceholderPage title="More" />} />
            <Route path="*" element={<Navigate to="/home" replace />} />
          </Routes>
        </div>
      </div>
    </BrowserRouter>
  )
}
