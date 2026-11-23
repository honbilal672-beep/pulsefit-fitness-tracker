import { Link } from "react-router-dom";
import { Dumbbell, Home, ArrowLeft } from "lucide-react";
const NotFoundPage = () => {
  return <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col items-center justify-center p-4 text-center">
      <div className="w-16 h-16 rounded-3xl bg-blue-600/10 border border-blue-500/20 text-blue-400 flex items-center justify-center mb-6">
        <Dumbbell className="w-8 h-8" />
      </div>

      <h1 className="text-6xl font-black text-white tracking-tight mb-2">404</h1>
      <h2 className="text-xl font-bold text-slate-200 mb-2">Route Not Found</h2>
      <p className="text-xs text-slate-400 max-w-sm mb-6 leading-relaxed">
        The fitness tracking page or resource you requested does not exist or may have been relocated.
      </p>

      <div className="flex items-center gap-3">
        <Link
    to="/dashboard"
    className="px-5 py-2.5 rounded-xl text-xs font-bold bg-blue-600 text-white hover:bg-blue-500 transition-colors shadow-lg shadow-blue-600/30 flex items-center gap-1.5"
  >
          <Home className="w-4 h-4" /> Go to Dashboard
        </Link>
        <Link
    to="/"
    className="px-4 py-2.5 rounded-xl text-xs font-semibold bg-slate-900 border border-slate-800 text-slate-300 hover:text-white hover:bg-slate-800 transition-colors flex items-center gap-1.5"
  >
          <ArrowLeft className="w-4 h-4" /> Home
        </Link>
      </div>
    </div>;
};
export {
  NotFoundPage
};
