import { BOON_SENDER_ID } from '@/constants/boon'
import { useMessages } from '@/hooks/useMessages'
import { useSocketStore } from '@/lib/socketStore'
import { SignedIn, SignedOut, RedirectToSignIn, useAuth } from '@clerk/clerk-react'
import { useCallback, useEffect, useRef, useState } from 'react'
import { Link, useParams, useSearchParams } from 'react-router-dom'

export default function ChatThreadPage() {
  return (
    <>
      <SignedOut>
        <RedirectToSignIn signInUrl="/sign-in" />
      </SignedOut>
      <SignedIn>
        <ChatThreadShell />
      </SignedIn>
    </>
  )
}

function ChatThreadShell() {
  const { chatId } = useParams()
  const [searchParams] = useSearchParams()
  const title = searchParams.get('title') ?? 'Chat'

  const { userId } = useAuth()
  const { data: messages, isLoading } = useMessages(chatId)
  const joinChat = useSocketStore((s) => s.joinChat)
  const leaveChat = useSocketStore((s) => s.leaveChat)
  const sendMessage = useSocketStore((s) => s.sendMessage)
  const sendTyping = useSocketStore((s) => s.sendTyping)
  const isConnected = useSocketStore((s) => s.isConnected)

  const [text, setText] = useState('')
  const typingTimer = useRef(null)

  useEffect(() => {
    if (!chatId || !isConnected) return
    joinChat(chatId)
    return () => leaveChat(chatId)
  }, [chatId, isConnected, joinChat, leaveChat])

  const onChange = useCallback(
    (e) => {
      const v = e.target.value
      setText(v)
      if (!chatId || !isConnected) return
      if (v.length > 0) {
        sendTyping(chatId, true)
        if (typingTimer.current) clearTimeout(typingTimer.current)
        typingTimer.current = setTimeout(() => sendTyping(chatId, false), 1200)
      } else {
        sendTyping(chatId, false)
      }
    },
    [chatId, isConnected, sendTyping]
  )

  const onSubmit = (e) => {
    e.preventDefault()
    const t = text.trim()
    if (!t || !chatId || !userId) return
    setText('')
    sendTyping(chatId, false)
    sendMessage(chatId, t, userId)
  }

  if (!chatId) {
    return (
      <div className="app-chat">
        <p className="app-chat-muted">Invalid chat.</p>
        <Link to="/chats">Back</Link>
      </div>
    )
  }

  return (
    <div className="app-chat">
      <header className="app-chat-header">
        <Link to="/chats" className="auth-back-link">
          ← Chats
        </Link>
        <span className="app-chat-title-inline">{title}</span>
        {!isConnected ? <span className="app-chat-muted">Offline</span> : null}
      </header>

      <div className="chat-thread">
        {isLoading ? (
          <p className="app-chat-muted">Loading messages…</p>
        ) : (
          <div className="chat-messages">
            {(messages ?? []).map((m) => {
              const self = m.senderId === userId
              const boon = m.senderId === BOON_SENDER_ID || m.type === 'ai'
              const cls = self ? 'msg self' : boon ? 'msg boon' : 'msg'
              return (
                <div key={String(m._id)} className={cls}>
                  <p className="msg-text">{m.content}</p>
                </div>
              )
            })}
          </div>
        )}

        <form className="chat-composer" onSubmit={onSubmit}>
          <input
            type="text"
            className="chat-input"
            placeholder="Message…"
            value={text}
            onChange={onChange}
            autoComplete="off"
          />
          <button type="submit" className="btn btn-primary btn-sm" disabled={!text.trim()}>
            Send
          </button>
        </form>
      </div>
    </div>
  )
}
