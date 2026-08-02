export default function NotFound() {
  return (
    <div className="flex h-screen w-screen items-center justify-center">
      <div className="p-10 border border-slate-300 rounded shadow">
        <h1 className="text-4xl font-semibold text-slate-900">404</h1>
        <p className="mt-2 text-lg text-slate-600">Page Not Found</p>
      </div>
    </div>
  );
}