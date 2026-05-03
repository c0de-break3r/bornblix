import { SignIn } from '@clerk/clerk-react'
import { Link } from 'react-router-dom'

export default function SignInPage() {
  return (
    <div className="clerk-auth-shell">
      <div className="clerk-auth-inner">
        <Link to="/" className="auth-back-link">
          ← Back to Bornblix
        </Link>
        <SignIn
          path="/sign-in"
          routing="path"
          signUpUrl="/sign-up"
          forceRedirectUrl="/chats"
          fallbackRedirectUrl="/chats"
        />
      </div>
    </div>
  )
}
