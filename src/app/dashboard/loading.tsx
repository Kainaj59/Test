export default function DashboardLoading() {
  return (
    <div className="animate-pulse">
      {/* Barre de titre */}
      <div className="flex items-center gap-4 border-b border-border px-5 py-4 lg:px-8">
        <div className="h-6 w-40 rounded-md bg-surface-2" />
        <div className="ml-auto h-9 w-64 rounded-xl bg-surface-2" />
      </div>

      <div className="space-y-6 p-5 lg:p-8">
        {/* KPIs */}
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="card h-28 p-5">
              <div className="h-10 w-10 rounded-xl bg-surface-2" />
              <div className="mt-4 h-6 w-20 rounded bg-surface-2" />
              <div className="mt-2 h-3 w-28 rounded bg-surface-2" />
            </div>
          ))}
        </div>

        {/* Blocs */}
        <div className="grid gap-4 lg:grid-cols-3">
          <div className="card h-64 lg:col-span-2" />
          <div className="card h-64" />
        </div>
      </div>
    </div>
  );
}
