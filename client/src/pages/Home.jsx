import { useEffect, useState } from 'react'
import axios from 'axios'
import { Link } from 'react-router-dom'

function Avatar({ author, size = 'h-11 w-11' }) {
  if (author?.avatar) {
    return (
      <img
        className={`${size} rounded-full object-cover`}
        src={author.avatar}
        alt={`${author.username}'s avatar`}
      />
    )
  }

  return (
    <div
      className={`flex ${size} shrink-0 items-center justify-center rounded-full bg-orange-100 font-bold text-orange-600`}
      aria-label="Avatar placeholder"
    >
      {author?.username?.charAt(0).toUpperCase() || '?'}
    </div>
  )
}

const getPosts = () => axios.get('http://localhost:5000/api/posts')

function Home() {
  const [posts, setPosts] = useState([])
  const [form, setForm] = useState({ text: '', image: '' })
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState('')

  const fetchPosts = async () => {
    setIsLoading(true)
    try {
      const response = await getPosts()
      setPosts(response.data)
      setError('')
    } catch (requestError) {
      setError(requestError.response?.data?.message || 'Unable to load posts')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    getPosts()
      .then((response) => setPosts(response.data))
      .catch((requestError) => {
        setError(requestError.response?.data?.message || 'Unable to load posts')
      })
      .finally(() => setIsLoading(false))
  }, [])

  const handleChange = (event) => {
    setForm({ ...form, [event.target.name]: event.target.value })
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    setError('')
    setIsSubmitting(true)

    try {
      await axios.post('http://localhost:5000/api/posts', form, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      })
      setForm({ text: '', image: '' })
      await fetchPosts()
    } catch (requestError) {
      setError(requestError.response?.data?.message || 'Unable to create post')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <main className="min-h-[calc(100vh-73px)] bg-slate-100 px-4 py-10 sm:px-6">
      <div className="mx-auto max-w-2xl">
        <div className="mb-8">
          <p className="mb-3 text-sm font-bold uppercase tracking-[0.25em] text-orange-500">
            Your social space
          </p>
          <h1 className="text-4xl font-black tracking-tight text-slate-900 sm:text-5xl">
            Feed
          </h1>
        </div>

        <section className="rounded-2xl bg-white p-6 shadow-xl shadow-slate-200/70 sm:p-7">
          <div className="mb-5 flex items-center justify-between">
            <h2 className="text-xl font-bold text-slate-900">New Post</h2>
            {!localStorage.getItem('token') && (
              <Link className="text-sm font-semibold text-orange-600 hover:text-orange-500" to="/login">
                Log in to post
              </Link>
            )}
          </div>
          <form className="space-y-4" onSubmit={handleSubmit}>
            <textarea
              className="min-h-28 w-full resize-y rounded-lg border border-slate-200 px-4 py-3 text-slate-900 outline-none transition focus:border-orange-400 focus:ring-4 focus:ring-orange-100"
              name="text"
              placeholder="What is on your mind?"
              value={form.text}
              onChange={handleChange}
              required
            />
            <input
              className="w-full rounded-lg border border-slate-200 px-4 py-3 text-slate-900 outline-none transition focus:border-orange-400 focus:ring-4 focus:ring-orange-100"
              name="image"
              type="url"
              placeholder="Image URL (optional)"
              value={form.image}
              onChange={handleChange}
            />
            <button
              className="rounded-lg bg-slate-900 px-5 py-3 font-semibold text-white transition hover:bg-orange-500 disabled:cursor-not-allowed disabled:opacity-60"
              type="submit"
              disabled={isSubmitting || !localStorage.getItem('token')}
            >
              {isSubmitting ? 'Posting...' : 'Publish post'}
            </button>
          </form>
        </section>

        {error && (
          <p className="mt-5 rounded-lg bg-red-50 px-4 py-3 text-sm font-medium text-red-700" role="alert">
            {error}
          </p>
        )}

        <section className="mt-8 space-y-5" aria-label="Posts">
          {isLoading ? (
            <p className="py-8 text-center text-sm font-semibold uppercase tracking-[0.2em] text-orange-500">
              Loading posts...
            </p>
          ) : posts.length === 0 ? (
            <div className="rounded-2xl bg-white p-8 text-center text-slate-500 shadow-lg shadow-slate-200/60">
              No posts yet. Be the first to share something.
            </div>
          ) : (
            posts.map((post) => (
              <article className="rounded-2xl bg-white p-6 shadow-lg shadow-slate-200/60" key={post._id}>
                {post.author?._id ? (
                  <Link
                    className="group flex w-fit items-center gap-3 rounded-lg focus:outline-none focus:ring-4 focus:ring-orange-100"
                    to={`/profile/${post.author._id}`}
                  >
                    <Avatar author={post.author} />
                    <p className="font-bold text-slate-900 transition group-hover:text-orange-600">
                      @{post.author?.username || 'Unknown user'}
                    </p>
                  </Link>
                ) : (
                  <div className="flex w-fit items-center gap-3">
                    <Avatar author={post.author} />
                    <p className="font-bold text-slate-900">@{post.author?.username || 'Unknown user'}</p>
                  </div>
                )}
                <p className="mt-2 text-sm text-slate-400">
                  {new Date(post.createdAt).toLocaleString()}
                </p>
                <p className="mt-5 whitespace-pre-wrap leading-7 text-slate-700">{post.text}</p>
                {post.image && (
                  <img
                    className="mt-5 max-h-[28rem] w-full rounded-xl object-cover"
                    src={post.image}
                    alt="Post attachment"
                  />
                )}
              </article>
            ))
          )}
        </section>
      </div>
    </main>
  )
}

export default Home
