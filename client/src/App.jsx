import { BrowserRouter, Link, Route, Routes } from 'react-router-dom'
import Navbar from './components/Navbar'
import Login from './pages/Login'
import Profile from './pages/Profile'
import Signup from './pages/Signup'

function Home() {
  return (
    <main className="min-h-[calc(100vh-73px)] bg-slate-100 px-6 py-16">
      <div className="mx-auto max-w-6xl">
        <div className="max-w-2xl">
          <p className="mb-4 text-sm font-bold uppercase tracking-[0.25em] text-orange-500">
            Your social space
          </p>
          <h1 className="text-5xl font-black tracking-tight text-slate-900 sm:text-6xl">
            Feed
          </h1>
          <p className="mt-5 max-w-lg text-lg leading-8 text-slate-500">
            Your community is ready when you are. Share what is on your mind and
            stay close to the people who matter.
          </p>
          <Link
            className="mt-8 inline-block rounded-lg bg-orange-500 px-5 py-3 font-semibold text-white transition hover:bg-orange-600"
            to="/signup"
          >
            Start posting
          </Link>
        </div>
      </div>
    </main>
  )
}

function App() {
  return (
    <BrowserRouter>
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/login" element={<Login />} />
        <Route path="/profile/:id" element={<Profile />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
