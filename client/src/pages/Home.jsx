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

const getPosts = (token) => axios.get('http://localhost:5000/api/posts', {
  headers: token ? { Authorization: `Bearer ${token}` } : {},
})

const normalizePosts = (posts, userId) => posts.map((post) => ({
  ...post,
  likeCount: post.likes?.length || 0,
  liked: Boolean(userId && post.likes?.some((like) => like.toString() === userId)),
  comments: post.comments || [],
}))

function Home() {
  const [posts, setPosts] = useState([])
  const [form, setForm] = useState({ text: '', image: '' })
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [feedMode, setFeedMode] = useState('global')
  const [commentDrafts, setCommentDrafts] = useState({})
  const token = localStorage.getItem('token')
  const currentUser = JSON.parse(localStorage.getItem('user') || 'null')
  const currentUserId = currentUser?.id

  const fetchPosts = async () => {
    setIsLoading(true)
    try {
      const response = await getPosts(token)
      setPosts(normalizePosts(response.data, currentUserId))
      setFeedMode(response.headers['x-feed-mode'] || 'global')
      setError('')
    } catch (requestError) {
      setError(requestError.response?.data?.message || 'Unable to load posts')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    getPosts(token)
      .then((response) => {
        setPosts(normalizePosts(response.data, currentUserId))
        setFeedMode(response.headers['x-feed-mode'] || 'global')
      })
      .catch((requestError) => {
        setError(requestError.response?.data?.message || 'Unable to load posts')
      })
      .finally(() => setIsLoading(false))
  }, [token, currentUserId])

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

  const handleLike = async (postId) => {
    try {
      const response = await axios.post(
        `http://localhost:5000/api/posts/${postId}/like`,
        {},
        { headers: { Authorization: `Bearer ${token}` } },
      )
      setPosts((currentPosts) => currentPosts.map((post) => (
        post._id === postId
          ? { ...post, likeCount: response.data.likeCount, liked: response.data.liked }
          : post
      )))
    } catch (requestError) {
      setError(requestError.response?.data?.message || 'Unable to update like')
    }
  }

  const handleCommentChange = (postId, text) => {
    setCommentDrafts({ ...commentDrafts, [postId]: text })
  }

  const handleComment = async (event, postId) => {
    event.preventDefault()
    const text = commentDrafts[postId]?.trim()
    if (!text) return

    try {
      const response = await axios.post(
        `http://localhost:5000/api/posts/${postId}/comment`,
        { text },
        { headers: { Authorization: `Bearer ${token}` } },
      )
      setPosts((currentPosts) => currentPosts.map((post) => (
        post._id === postId ? { ...post, comments: response.data } : post
      )))
      setCommentDrafts({ ...commentDrafts, [postId]: '' })
    } catch (requestError) {
      setError(requestError.response?.data?.message || 'Unable to add comment')
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
          <p className="mt-3 text-sm font-semibold text-slate-500">
            {feedMode === 'following' ? 'Following feed' : 'Global feed'}
          </p>
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
                <div className="mt-6 border-t border-slate-100 pt-4">
                  <button
                    className={`text-sm font-semibold transition ${post.liked ? 'text-orange-600' : 'text-slate-500 hover:text-orange-600'}`}
                    type="button"
                    onClick={() => handleLike(post._id)}
                    disabled={!token}
                  >
                    {post.liked ? 'Liked' : 'Like'} ({post.likeCount})
                  </button>
                  <div className="mt-4 space-y-3">
                    {post.comments.map((comment) => (
                      <p className="text-sm text-slate-600" key={comment._id || `${comment.createdAt}-${comment.text}`}>
                        <span className="font-semibold text-slate-900">@{comment.user?.username || 'Unknown user'}</span>{' '}
                        {comment.text}
                      </p>
                    ))}
                  </div>
                  {token && (
                    <form className="mt-4 flex gap-2" onSubmit={(event) => handleComment(event, post._id)}>
                      <input
                        className="min-w-0 flex-1 rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-900 outline-none transition focus:border-orange-400 focus:ring-4 focus:ring-orange-100"
                        placeholder="Write a comment..."
                        value={commentDrafts[post._id] || ''}
                        onChange={(event) => handleCommentChange(post._id, event.target.value)}
                      />
                      <button
                        className="rounded-lg bg-slate-900 px-3 py-2 text-sm font-semibold text-white transition hover:bg-orange-500"
                        type="submit"
                      >
                        Comment
                      </button>
                    </form>
                  )}
                </div>
              </article>
            ))
          )}
        </section>
      </div>
    </main>
  )
}

export default Home
