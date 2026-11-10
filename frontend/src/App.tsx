export default function App() {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col items-center justify-center p-6">
      <div className="max-w-md w-full bg-white rounded-xl shadow-md p-6 border border-slate-200 text-center">
        <div className="inline-flex items-center justify-center w-14 h-14 bg-indigo-100 text-indigo-600 rounded-full mb-4 font-bold text-2xl">
          MP
        </div>
        <h1 className="text-2xl font-bold text-slate-800 mb-2">Marketplace Bapak-Bapak</h1>
        <p className="text-slate-600 text-sm mb-4">
          Fase 0: Project Scaffolding
        </p>
        <div className="space-y-2 text-left text-xs bg-slate-100 p-3 rounded-lg">
          <div className="flex justify-between">
            <span className="font-medium text-slate-500">Frontend:</span>
            <span className="text-slate-700 font-semibold">React + Vite + TS + Tailwind</span>
          </div>
          <div className="flex justify-between">
            <span className="font-medium text-slate-500">Backend:</span>
            <span className="text-slate-700 font-semibold">Laravel 11 (API-only + Sanctum)</span>
          </div>
          <div className="flex justify-between">
            <span className="font-medium text-slate-500">Database:</span>
            <span className="text-slate-700 font-semibold">PostgreSQL (Docker Compose)</span>
          </div>
        </div>
        <p className="mt-4 text-xs text-emerald-600 font-medium">
          Ready for Fase 1 (Authentication)
        </p>
      </div>
    </div>
  )
}
