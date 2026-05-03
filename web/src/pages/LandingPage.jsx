import { SignedIn, SignedOut, UserButton } from '@clerk/clerk-react'
import { useEffect } from 'react'
import { Link } from 'react-router-dom'
import ThemeToggle from '@/components/ThemeToggle.jsx'

const ICON = '/branding/bornblix-app-icon.png'
const COMMUNITY = '/branding/join-community.png'
const WORSHIP = '/branding/group-study.png'

/** @param {'system'|'light'|'dark'} pref */
function applyDomTheme(pref) {
  let dark = false
  if (pref === 'dark') dark = true
  else if (pref === 'light') dark = false
  else dark = window.matchMedia('(prefers-color-scheme: dark)').matches
  document.documentElement.setAttribute('data-theme', dark ? 'dark' : 'light')
}

export default function LandingPage() {
  useEffect(() => {
    applyDomTheme(localStorage.getItem('bornblix-theme') || 'system')
  }, [])

  return (
    <div className="site">
      <header className="nav">
        <a href="/" className="brand">
          <img src={ICON} alt="" className="brand-icon" width={40} height={40} />
          <span className="brand-name">Bornblix</span>
        </a>
        <nav className="nav-links" aria-label="Primary">
          <a href="#reading">Reading</a>
          <a href="#features">Features</a>
          <a href="#community">Community</a>
          <Link to="/chats">Web chats</Link>
        </nav>
        <div className="nav-actions">
          <ThemeToggle />
          <SignedIn>
            <UserButton afterSignOutUrl="/" />
            <Link to="/chats" className="btn btn-secondary btn-sm">
              Open chats
            </Link>
          </SignedIn>
          <SignedOut>
            <Link to="/sign-in" className="btn btn-ghost btn-sm">
              Sign in
            </Link>
          </SignedOut>
          <a href="#download" className="btn btn-primary">
            Get the app
          </a>
        </div>
      </header>

      <main>
        <section className="hero" id="download">
          <div className="hero-grid">
            <div className="hero-copy">
              <p className="eyebrow">Daily Bible · Journaling · Community</p>
              <h1 className="headline">Go deeper into Scripture—every day.</h1>
              <p className="subhead">
                Bornblix helps you read with clarity, reflect with purpose, and grow with others. Light and dark
                appearance—like today&apos;s best Bible experiences.
              </p>
              <div className="hero-ctas">
                <a href="http://localhost:8081" className="btn btn-primary btn-lg" target="_blank" rel="noreferrer">
                  Open in Expo Go
                </a>
                <a href="#features" className="btn btn-ghost btn-lg">
                  See features
                </a>
              </div>
              <p className="fine-print">Free to start. Streaks, guided quests, and Verse of the Day included.</p>
            </div>
            <div className="hero-art">
              <div className="device-frame">
                <img src={ICON} alt="Bornblix app icon" className="hero-icon" width={220} height={220} />
              </div>
              <p className="tagline-serif">&ldquo;Beyond the Verse. Into the Word.&rdquo;</p>
            </div>
          </div>
        </section>

        <section className="verse-strip" aria-label="Verse of the day">
          <blockquote className="verse">
            <p>&ldquo;Come to me, all you who labor and are heavy laden, and I will give you rest.&rdquo;</p>
            <cite>Matthew 11:28</cite>
          </blockquote>
        </section>

        <section className="features" id="features">
          <div className="section-header">
            <h2>Everything you need in one place</h2>
            <p>Reading, reflection, and connection—without the noise.</p>
          </div>
          <div className="feature-cards">
            <article className="card" id="reading">
              <div className="card-icon" aria-hidden>
                📖
              </div>
              <h3>Immersive reading</h3>
              <p>
                A distraction-free Bible reader with typography tuned for long sessions—light and dark modes that feel
                premium.
              </p>
            </article>
            <article className="card">
              <div className="card-icon" aria-hidden>
                ✍️
              </div>
              <h3>Daily journal &amp; streaks</h3>
              <p>Gentle prompts, gratitude, and streaks that motivate—clear rhythm for your faith.</p>
            </article>
            <article className="card">
              <div className="card-icon" aria-hidden>
                🗺️
              </div>
              <h3>Guided quests</h3>
              <p>Step through themed journeys with milestones you can finish—paths through Scripture.</p>
            </article>
          </div>
        </section>

        <section className="split" id="reading-detail">
          <div className="split-copy">
            <h2>Design that honors the text</h2>
            <p>Warm terracotta and gold accents, soft surfaces, and generous spacing—Word first.</p>
            <ul className="checks">
              <li>Verse-first layouts and serene reading themes</li>
              <li>Highlights, notes, and sharing when you need them</li>
              <li>Comfortable type sizes and contrast in light or dark</li>
            </ul>
          </div>
          <div className="split-media">
            <img src={WORSHIP} alt="Illustration of group Bible study" loading="lazy" />
          </div>
        </section>

        <section className="split reverse" id="community">
          <div className="split-media">
            <img src={COMMUNITY} alt="Illustration inviting you to join community" loading="lazy" />
          </div>
          <div className="split-copy">
            <h2>Faith is better together</h2>
            <p>Share encouragement and study alongside friends—community built for real life.</p>
            <a href="http://localhost:8081" className="btn btn-secondary" target="_blank" rel="noreferrer">
              Try the mobile experience
            </a>
          </div>
        </section>

        <section className="cta-band">
          <div className="cta-inner">
            <h2>Start today with Bornblix</h2>
            <p>Your next chapter in Scripture is one tap away.</p>
            <a href="http://localhost:8081" className="btn btn-on-accent btn-lg" target="_blank" rel="noreferrer">
              Launch Expo Go
            </a>
          </div>
        </section>
      </main>

      <footer className="footer">
        <div className="footer-inner">
          <div className="footer-brand">
            <img src={ICON} alt="" width={32} height={32} />
            <span>Bornblix</span>
          </div>
          <div className="footer-links">
            <a href="#">Privacy</a>
            <a href="#">Terms</a>
            <a href="#">Support</a>
          </div>
          <p className="copyright">&copy; {new Date().getFullYear()} Bornblix. All rights reserved.</p>
        </div>
      </footer>
    </div>
  )
}
