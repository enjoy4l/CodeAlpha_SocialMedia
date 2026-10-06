function Notifications() {
  return (
    <main className="min-h-[calc(100vh-73px)] bg-slate-100 px-4 py-12 sm:px-6">
      <div className="mx-auto max-w-3xl">
        <div className="mb-8">
          <p className="mb-2 text-xs font-bold uppercase tracking-[0.2em] text-orange-500">
            Stay in the loop
          </p>
          <h1 className="text-5xl font-black leading-none tracking-tight text-slate-900">
            Notifications
          </h1>
          <p className="mt-3 text-sm font-semibold text-slate-500">
            See what is happening around your posts and profile.
          </p>
        </div>

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
    </main>
  )
}

export default Notifications
