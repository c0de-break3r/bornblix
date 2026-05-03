import { SignUp } from '@clerk/clerk-react'
import { Link } from 'react-router-dom'

export default function SignUpPage() {
  return (
    <div className="clerk-auth-shell">
      <div className="clerk-auth-inner">
        <Link to="/" className="auth-back-link">
          ← Back to Bornblix
        </Link>
        <SignUp
          path="/sign-up"
          routing="path"
          signInUrl="/sign-in"
          forceRedirectUrl="/chats"
          fallbackRedirectUrl="/chats"
        />
      </div>
    </div>
  )
}
