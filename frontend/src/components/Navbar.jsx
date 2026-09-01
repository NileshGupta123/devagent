import { Link, useLocation } from 'react-router-dom'

// ─────────────────────────────────────────
// Navbar — Fixed top navigation
// ─────────────────────────────────────────

const navLinks = [
  { path: '/',          label: 'Home',      icon: '🏠' },
  { path: '/dashboard', label: 'Dashboard', icon: '📊' },
  { path: '/analyze',   label: 'Analyze',   icon: '🔍' },
  { path: '/results',   label: 'Results',   icon: '📈' },
  { path: '/memory',    label: 'Memory',    icon: '🧠' },
  { path: '/about',     label: 'About',     icon: 'ℹ️'  },
]

export default function Navbar() {
  const location = useLocation()

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 border-b border-border bg-dark/80 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">

        {/* Logo */}
        <Link to="/" className="flex items-center gap-3 group">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-secondary
                          flex items-center justify-center text-xl shadow-lg
                          group-hover:shadow-primary/50 transition-all duration-300">
            🤖
          </div>
          <div>
            <h1 className="text-lg font-bold gradient-text leading-none">DevAgent</h1>
            <p className="text-xs text-gray-500 leading-none mt-0.5">
              Multi-Agent Code Intelligence
            </p>
          </div>
        </Link>

        {/* Nav Links */}
        <div className="hidden md:flex items-center gap-1">
          {navLinks.map((link) => {
            const isActive = location.pathname === link.path
            return (
              <Link
                key={link.path}
                to={link.path}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium
                            transition-all duration-200
                            ${isActive
                              ? 'bg-primary/20 text-primary border border-primary/30'
                              : 'text-gray-400 hover:text-white hover:bg-white/5'
                            }`}
              >
                <span>{link.icon}</span>
                <span>{link.label}</span>
              </Link>
            )
          })}
        </div>

        {/* Right side */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full
                          bg-green-500/10 border border-green-500/20">
            <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
            <span className="text-xs text-green-400 font-medium">Live</span>
          </div>
          
          
          <a
            href="https://github.com/NileshGupta123/devagent"
            target="_blank"
            rel="noreferrer"
            className="btn-secondary text-xs flex items-center gap-2"
          >
            <span>⭐</span>
            <span>GitHub</span>
          </a>

        </div>

      </div>

      {/* Mobile nav */}
      <div className="md:hidden flex items-center gap-1 px-4 pb-3 overflow-x-auto
                      scrollbar-none border-t border-border/50 pt-2">
        {navLinks.map((link) => {
          const isActive = location.pathname === link.path
          return (
            <Link
              key={link.path}
              to={link.path}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs
                          font-medium whitespace-nowrap transition-all duration-200
                          ${isActive
                            ? 'bg-primary/20 text-primary'
                            : 'text-gray-400 hover:text-white hover:bg-white/5'
                          }`}
            >
              <span>{link.icon}</span>
              <span>{link.label}</span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}