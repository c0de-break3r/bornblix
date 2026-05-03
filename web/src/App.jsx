import { useAuth } from '@clerk/clerk-react'
import { Navigate, Route, Routes } from 'react-router-dom'
import SocketConnection from '@/components/SocketConnection'
import ChatThreadPage from './pages/ChatThreadPage.jsx'
import ChatsPage from './pages/ChatsPage.jsx'
import LandingPage from './pages/LandingPage.jsx'
import SignInPage from './pages/SignInPage.jsx'
import SignUpPage from './pages/SignUpPage.jsx'

function AuthenticatedSocket() {
  const { isSignedIn } = useAuth()
  if (!isSignedIn) return null
  return <SocketConnection />
}

export default function App() {
  const { isLoaded } = useAuth()

  if (!isLoaded) {
    return (
      <div className="page-loader">
        <p>Loading…</p>
      </div>
    )
  }

  return (
    <>
      <AuthenticatedSocket />
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/sign-in/*" element={<SignInPage />} />
        <Route path="/sign-up/*" element={<SignUpPage />} />
        <Route path="/chats" element={<ChatsPage />} />
        <Route path="/chats/:chatId" element={<ChatThreadPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </>
  )
}
