import { Link } from 'react-router-dom'

function Notifications() {
  const user = JSON.parse(localStorage.getItem('user') || 'null')

  return (
    <main className="min-h-[calc(100vh-73px)] bg-slate-100 px-4 py-12 sm:px-6">
      <div className="mx-auto grid max-w-7xl gap-8 xl:grid-cols-[260px_minmax(0,640px)]">
        <aside className="hidden xl:block">
          <div className="sticky top-24 space-y-5">
            <div className="mb-8 px-3">
              <p className="mb-2 text-xs font-bold uppercase tracking-[0.2em] text-orange-500">
                Stay in the loop
              </p>
              <h1 className="max-w-full break-words text-4xl font-black leading-tight tracking-tight text-slate-900">Notifications</h1>
              <p className="mt-2 text-sm font-semibold text-slate-500">Your activity and updates</p>
            </div>
            <nav className="rounded-2xl bg-white p-4 shadow-lg shadow-slate-200/50" aria-label="Notifications navigation">
              <p className="px-3 pb-3 text-xs font-bold uppercase tracking-[0.2em] text-slate-400">Navigate</p>
              <Link className="flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-semibold text-slate-600 transition hover:bg-slate-50 hover:text-slate-900" to="/">
                <span aria-hidden="true">&#9673;</span>
                Feed
              </Link>
              {user && (
                <Link className="mt-1 flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-semibold text-slate-600 transition hover:bg-slate-50 hover:text-slate-900" to={`/profile/${user.id}`}>
                  <span aria-hidden="true">&#9679;</span>
                  My profile
                </Link>
              )}
              <Link className="mt-1 flex items-center gap-3 rounded-xl bg-orange-50 px-3 py-3 text-sm font-bold text-orange-600" to="/notifications">
                <span aria-hidden="true">&#9673;</span>
                Notifications
              </Link>
            </nav>
            {user && (
              <Link className="block rounded-2xl bg-slate-900 p-5 text-white shadow-lg shadow-slate-300/40 transition hover:-translate-y-0.5" to={`/profile/${user.id}`}>
                <p className="text-xs font-bold uppercase tracking-[0.2em] text-orange-300">Signed in as</p>
                <p className="mt-3 truncate text-lg font-bold">@{user.username}</p>
                <p className="mt-1 text-sm text-slate-300">View your profile</p>
              </Link>
            )}
          </div>
        </aside>

        <div className="min-w-0">
        <section className="rounded-2xl bg-white p-10 text-center shadow-xl shadow-slate-200/70 sm:p-14">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-orange-100 text-2xl text-orange-600" aria-hidden="true">
            &#9673;
          </div>
          <h2 className="mt-6 text-2xl font-bold text-slate-900">You are all caught up</h2>
          <p className="mx-auto mt-3 max-w-sm leading-7 text-slate-500">
            New likes, comments, and follows will appear here when people connect with you.
          </p>
        </section>
        </div>
      </div>
    </main>
  )
}

export default Notifications
