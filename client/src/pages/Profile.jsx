import { useEffect, useState } from 'react'
import axios from 'axios'
import { Link, useParams } from 'react-router-dom'

const apiUrl = import.meta.env.VITE_API_URL || 'https://codealpha-socialmedia-o22w.onrender.com'

function Profile() {
  const { id } = useParams()
  const [profile, setProfile] = useState(null)
  const [error, setError] = useState('')
  const loggedInUser = JSON.parse(localStorage.getItem('user') || 'null')

  useEffect(() => {
    const fetchProfile = async () => {
      setProfile(null)
      setError('')

      try {
        const response = await axios.get(`${apiUrl}/api/users/${id}`)
        setProfile(response.data)
      } catch (requestError) {
        setError(requestError.response?.data?.message || 'Unable to load profile')
      }
    }

    fetchProfile()
  }, [id])

  if (error) {
    return (
      <main className="flex min-h-[calc(100vh-73px)] items-center justify-center bg-slate-100 px-4 py-12">
        <section className="w-full max-w-md rounded-2xl bg-white p-8 text-center shadow-xl shadow-slate-200/70">
          <h1 className="text-2xl font-bold text-slate-900">Profile unavailable</h1>
          <p className="mt-3 text-slate-500">{error}</p>
        </section>
      </main>
    )
  }

  if (!profile) {
    return (
      <main className="flex min-h-[calc(100vh-73px)] items-center justify-center bg-slate-100 px-4 py-12">
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-orange-500">
          Loading profile...
        </p>
      </main>
    )
  }

  const username = profile.username || 'Unknown user'
  const sidebarUser = loggedInUser || { id: id, username: username }

  return (
    <main className="min-h-[calc(100vh-73px)] bg-slate-100 px-4 py-12">
      <div className="mx-auto grid max-w-7xl gap-8 xl:grid-cols-[220px_minmax(0,640px)]">
        <aside className="hidden xl:block">
          <div className="sticky top-24 space-y-5">
            <div className="mb-8 px-3">
              <p className="mb-2 text-xs font-bold uppercase tracking-[0.2em] text-orange-500">
                Your profile
              </p>
              <h1 className="text-5xl font-black leading-none tracking-tight text-slate-900">
                Profile
              </h1>
              <p className="mt-2 text-sm font-semibold text-slate-500">Your account and activity</p>
            </div>
            <nav className="rounded-2xl bg-white p-4 shadow-lg shadow-slate-200/50" aria-label="Profile navigation">
              <p className="px-3 pb-3 text-xs font-bold uppercase tracking-[0.2em] text-slate-400">Navigate</p>
              <Link className="flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-semibold text-slate-600 transition hover:bg-slate-50 hover:text-slate-900" to="/">
                <span aria-hidden="true">&#9673;</span>
                Feed
              </Link>
              <Link className="mt-1 flex items-center gap-3 rounded-xl bg-orange-50 px-3 py-3 text-sm font-bold text-orange-600" to={`/profile/${sidebarUser.id}`}>
                <span aria-hidden="true">&#9679;</span>
                My profile
              </Link>
              <Link className="mt-1 flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-semibold text-slate-600 transition hover:bg-slate-50 hover:text-slate-900" to="/notifications">
                <span aria-hidden="true">&#9673;</span>
                Notifications
              </Link>
            </nav>

            {loggedInUser && (
              <Link className="block rounded-2xl bg-slate-900 p-5 text-white shadow-lg shadow-slate-300/40 transition hover:-translate-y-0.5" to={`/profile/${loggedInUser.id}`}>
                <p className="text-xs font-bold uppercase tracking-[0.2em] text-orange-300">Signed in as</p>
                <p className="mt-3 truncate text-lg font-bold">@{loggedInUser.username}</p>
                <p className="mt-1 text-sm text-slate-300">View your profile</p>
              </Link>
            )}
          </div>
        </aside>

        <section className="w-full max-w-2xl rounded-2xl bg-white p-8 shadow-xl shadow-slate-200/70 sm:p-10">
        <div className="flex flex-col items-center text-center sm:flex-row sm:items-start sm:text-left">
          {profile.avatar ? (
            <img
              className="h-28 w-28 rounded-full object-cover ring-8 ring-orange-50"
              src={profile.avatar}
              alt={`${username}'s avatar`}
            />
          ) : (
            <div
              className="flex h-28 w-28 shrink-0 items-center justify-center rounded-full bg-orange-100 text-3xl font-bold text-orange-600 ring-8 ring-orange-50"
              aria-label="Avatar placeholder"
            >
              {username.charAt(0).toUpperCase()}
            </div>
          )}
          <div className="mt-6 sm:ml-7 sm:mt-2">
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-orange-500">
              Profile
            </p>
            <h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-900">
              @{username}
            </h1>
            <p className="mt-3 text-slate-500">
              {profile.bio || 'No bio yet.'}
            </p>
          </div>
        </div>

        <div className="mt-10 grid grid-cols-2 divide-x divide-slate-200 border-y border-slate-200 py-5 text-center">
          <div>
            <p className="text-2xl font-bold text-slate-900">{profile.followerCount}</p>
            <p className="mt-1 text-sm text-slate-500">Followers</p>
          </div>
          <div>
            <p className="text-2xl font-bold text-slate-900">{profile.followingCount}</p>
            <p className="mt-1 text-sm text-slate-500">Following</p>
          </div>
        </div>
        </section>
      </div>
    </main>
  )
}

export default Profile
