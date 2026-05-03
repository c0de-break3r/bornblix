import { useEffect, useState } from 'react'

/** @param {'system'|'light'|'dark'} pref */
function applyDomTheme(pref) {
  let dark = false
  if (pref === 'dark') dark = true
  else if (pref === 'light') dark = false
  else dark = window.matchMedia('(prefers-color-scheme: dark)').matches
  document.documentElement.setAttribute('data-theme', dark ? 'dark' : 'light')
}

export default function ThemeToggle() {
  const [pref, setPref] = useState('system')

  useEffect(() => {
    try {
      const s = localStorage.getItem('bornblix-theme')
      if (s === 'light' || s === 'dark' || s === 'system') setPref(s)
    } catch {
      /* ignore */
    }

    const mq = window.matchMedia('(prefers-color-scheme: dark)')
    const onChange = () => {
      const current = localStorage.getItem('bornblix-theme')
      if (current === 'system' || !current) applyDomTheme('system')
    }
    mq.addEventListener('change', onChange)
    return () => mq.removeEventListener('change', onChange)
  }, [])

  const cycle = () => {
    const order = ['system', 'light', 'dark']
    const next = order[(order.indexOf(pref) + 1) % order.length]
    setPref(next)
    localStorage.setItem('bornblix-theme', next)
    applyDomTheme(next)
  }

  const label = pref === 'system' ? 'Theme: System' : pref === 'light' ? 'Theme: Light' : 'Theme: Dark'

  return (
    <button type="button" className="theme-toggle" onClick={cycle} aria-label={label}>
      {pref === 'dark' ? '☾' : pref === 'light' ? '☀' : '◐'}
      <span className="theme-toggle-label">{label}</span>
    </button>
  )
}
