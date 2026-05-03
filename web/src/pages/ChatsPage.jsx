import { useChats, useEnsureAiChat } from '@/hooks/useChats'
import { useSocketStore } from '@/lib/socketStore'
import { SignedIn, SignedOut, RedirectToSignIn, UserButton } from '@clerk/clerk-react'
import { Link, useNavigate } from 'react-router-dom'

export default function ChatsPage() {
  return (
    <>
      <SignedOut>
        <RedirectToSignIn signInUrl="/sign-in" />
      </SignedOut>
      <SignedIn>
        <ChatsShell />
      </SignedIn>
    </>
  )
}

function ChatsShell() {
  const navigate = useNavigate()
  const { data: chats, isLoading, refetch, isFetching } = useChats()
  const ensureAi = useEnsureAiChat()
  const unread = useSocketStore((s) => s.unreadChats)

  return (
    <div className="app-chat">
      <header className="app-chat-header">
        <Link to="/" className="app-chat-brand">
          Bornblix
        </Link>
        <div className="app-chat-actions">
          <button type="button" className="btn btn-ghost btn-sm" onClick={() => refetch()} disabled={isFetching}>
            Refresh
          </button>
          <UserButton afterSignOutUrl="/" />
        </div>
      </header>

      <main className="app-chat-main">
        <h1 className="app-chat-title">Chats</h1>

        <button
          type="button"
          className="btn-boons"
          disabled={ensureAi.isPending}
          onClick={async () => {
            const chat = await ensureAi.mutateAsync()
            const t = chat.title ?? 'Bōōns'
            navigate(`/chats/${String(chat._id)}?title=${encodeURIComponent(t)}`)
          }}
        >
          {ensureAi.isPending ? 'Opening…' : 'Open Bōōns (AI)'}
        </button>

        {isLoading ? (
          <p className="app-chat-muted">Loading…</p>
        ) : (
          <ul className="chat-list">
            {(chats ?? []).map((c) => {
              const title = c.title ?? (c.kind === 'ai' ? 'Bōōns' : 'Chat')
              const unreadDot = unread.has(String(c._id))
              return (
                <li key={String(c._id)}>
                  <Link
                    to={{
                      pathname: `/chats/${String(c._id)}`,
                      search: `?title=${encodeURIComponent(title)}`,
                    }}
                    className="chat-list-item"
                  >
                    <span className="chat-list-title">
                      {title}
                      {unreadDot ? <span className="chat-unread-dot" aria-hidden /> : null}
                    </span>
                    <span className="chat-list-preview">{c.lastMessage ?? 'Open thread'}</span>
                    <span className="chat-list-meta">{c.kind}</span>
                  </Link>
                </li>
              )
            })}
          </ul>
        )}

        {!isLoading && (chats ?? []).length === 0 ? (
          <p className="app-chat-muted">No threads yet — start with Bōōns above.</p>
        ) : null}
      </main>
    </div>
  )
}
