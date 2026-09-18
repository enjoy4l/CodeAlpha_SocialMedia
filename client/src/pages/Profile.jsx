import { useEffect, useState } from 'react'
import axios from 'axios'
import { useParams } from 'react-router-dom'

function Profile() {
  const { id } = useParams()
  const [profile, setProfile] = useState(null)
  const [error, setError] = useState('')

  useEffect(() => {
    const fetchProfile = async () => {
      setProfile(null)
      setError('')

      try {
        const response = await axios.get(`http://localhost:5000/api/users/${id}`)
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

  return (
    <main className="min-h-[calc(100vh-73px)] bg-slate-100 px-4 py-12">
      <section className="mx-auto w-full max-w-2xl rounded-2xl bg-white p-8 shadow-xl shadow-slate-200/70 sm:p-10">
        <div className="flex flex-col items-center text-center sm:flex-row sm:items-start sm:text-left">
          {profile.avatar ? (
            <img
              className="h-28 w-28 rounded-full object-cover ring-8 ring-orange-50"
              src={profile.avatar}
              alt={`${profile.username}'s avatar`}
            />
          ) : (
            <div
              className="flex h-28 w-28 shrink-0 items-center justify-center rounded-full bg-orange-100 text-3xl font-bold text-orange-600 ring-8 ring-orange-50"
              aria-label="Avatar placeholder"
            >
              {profile.username.charAt(0).toUpperCase()}
            </div>
          )}
          <div className="mt-6 sm:ml-7 sm:mt-2">
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-orange-500">
              Profile
            </p>
            <h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-900">
              @{profile.username}
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
    </main>
  )
}

export default Profile
