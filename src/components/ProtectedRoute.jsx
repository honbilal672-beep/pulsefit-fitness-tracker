import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { Activity } from "lucide-react";
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, isLoading } = useAuth();
  const location = useLocation();
  if (isLoading) {
    return <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center text-slate-300">
        <Activity className="w-10 h-10 text-blue-500 animate-spin mb-4" />
        <p className="text-sm font-medium">Loading PulseFit...</p>
      </div>;
  }
  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }
  return <>{children}</>;
};
const AdminRoute = ({ children }) => {
  const { user, isAuthenticated, isLoading } = useAuth();
  const location = useLocation();
  if (isLoading) {
    return <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center text-slate-300">
        <Activity className="w-10 h-10 text-blue-500 animate-spin mb-4" />
        <p className="text-sm font-medium">Verifying Administrative Privileges...</p>
      </div>;
  }
  if (!isAuthenticated || user?.role !== "admin") {
    return <Navigate to="/dashboard" state={{ from: location }} replace />;
  }
  return <>{children}</>;
};
export {
  AdminRoute,
  ProtectedRoute
};
