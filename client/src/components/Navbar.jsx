import { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'

function Navbar() {
  const navigate = useNavigate()
  useLocation()
  const [logoutVersion, setLogoutVersion] = useState(0)
  const savedUser = localStorage.getItem('user')
  const user = savedUser ? JSON.parse(savedUser) : null

  const handleLogout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    setLogoutVersion(logoutVersion + 1)
    navigate('/login')
  }

  return (
    <header className="border-b border-slate-200 bg-white">
      <nav className="mx-auto flex h-[73px] max-w-6xl items-center justify-between px-6">
        <Link className="text-xl font-black tracking-tight text-slate-900" to="/">
          pulse<span className="text-orange-500">.</span>
        </Link>
        {user && localStorage.getItem('token') ? (
          <div className="flex items-center gap-4">
            <Link
              className="text-sm font-semibold text-slate-600 transition hover:text-orange-600"
              to={`/profile/${user.id}`}
            >
              @{user.username}
            </Link>
            <button
              className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:border-orange-300 hover:text-orange-600"
              type="button"
              onClick={handleLogout}
            >
              Logout
            </button>
          </div>
        ) : (
          <div className="flex items-center gap-5 text-sm font-semibold">
            <Link className="text-slate-600 transition hover:text-orange-600" to="/login">
              Login
            </Link>
            <Link
              className="rounded-lg bg-slate-900 px-4 py-2 text-white transition hover:bg-orange-500"
              to="/signup"
            >
              Signup
            </Link>
          </div>
        )}
      </nav>
    </header>
  )
}

export default Navbar
