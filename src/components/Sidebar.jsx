import { NavLink } from "react-router-dom";
import {
  LayoutDashboard,
  Dumbbell,
  Apple,
  LineChart,
  BarChart3,
  Search,
  BellRing,
  FileDown,
  LifeBuoy,
  Settings,
  ShieldCheck,
  X
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
const Sidebar = ({ isOpen, onClose }) => {
  const { user } = useAuth();
  const navigationItems = [
    { name: "Dashboard", path: "/dashboard", icon: LayoutDashboard },
    { name: "Workouts", path: "/workouts", icon: Dumbbell },
    { name: "Nutrition", path: "/nutrition", icon: Apple },
    { name: "Body Progress", path: "/progress", icon: LineChart },
    { name: "Analytics", path: "/analytics", icon: BarChart3 },
    { name: "Community", path: "/search", icon: Search },
    { name: "Reminders", path: "/reminders", icon: BellRing },
    { name: "Reports & Export", path: "/reports", icon: FileDown },
    { name: "Support Tickets", path: "/support", icon: LifeBuoy },
    { name: "Settings", path: "/settings", icon: Settings }
  ];
  return <>
      {
    /* Mobile backdrop */
  }
      {isOpen && <div
    className="fixed inset-0 z-40 bg-slate-950/70 backdrop-blur-sm lg:hidden transition-opacity"
    onClick={onClose}
  />}

      {
    /* Sidebar container */
  }
      <aside
    className={`fixed top-0 bottom-0 left-0 z-50 w-64 bg-slate-900 border-r border-slate-800 flex flex-col transition-transform duration-300 ease-in-out lg:static lg:translate-x-0 ${isOpen ? "translate-x-0" : "-translate-x-full"}`}
  >
        {
    /* Sidebar Header */
  }
        <div className="flex h-16 items-center justify-between px-6 border-b border-slate-800 lg:hidden">
          <span className="text-lg font-bold text-white flex items-center gap-2">
            <Dumbbell className="w-5 h-5 text-blue-500" /> PulseFit Navigation
          </span>
          <button
    type="button"
    onClick={onClose}
    className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
    aria-label="Close menu"
  >
            <X className="w-5 h-5" />
          </button>
        </div>

        {
    /* Navigation list */
  }
        <div className="flex-1 overflow-y-auto px-4 py-6 space-y-1.5">
          <p className="px-3 text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-2">
            Fitness Tracking
          </p>
          {navigationItems.map((item) => {
    const Icon = item.icon;
    return <NavLink
      key={item.path}
      to={item.path}
      onClick={onClose}
      className={({ isActive }) => `flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition-all ${isActive ? "bg-blue-600 text-white shadow-md shadow-blue-600/30 font-bold" : "text-slate-300 hover:text-white hover:bg-slate-800/80"}`}
    >
                <Icon className="w-4 h-4 shrink-0" />
                <span>{item.name}</span>
              </NavLink>;
  })}

          {
    /* Admin section if applicable */
  }
          {user?.role === "admin" && <div className="pt-4 mt-4 border-t border-slate-800">
              <p className="px-3 text-[11px] font-semibold text-amber-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5" /> Administration
              </p>
              <NavLink
    to="/admin/support"
    onClick={onClose}
    className={({ isActive }) => `flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition-all ${isActive ? "bg-amber-600 text-white shadow-md shadow-amber-600/30" : "text-amber-200/80 hover:text-white hover:bg-amber-500/10"}`}
  >
                <ShieldCheck className="w-4 h-4 shrink-0 text-amber-400" />
                <span>Helpdesk Tickets</span>
              </NavLink>
            </div>}
        </div>

        {
    /* Sidebar Footer User Info */
  }
        <div className="p-4 border-t border-slate-800 bg-slate-950/40">
          <div className="flex items-center gap-3">
            <img
    src={user?.profilePicture || `https://api.dicebear.com/7.x/initials/svg?seed=${user?.username || "User"}`}
    alt={user?.name || "User"}
    className="w-8 h-8 rounded-lg object-cover ring-1 ring-blue-500/40"
  />
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold text-white truncate">{user?.name}</p>
              <p className="text-[10px] text-slate-400 truncate">@{user?.username}</p>
            </div>
          </div>
        </div>
      </aside>
    </>;
};
export {
  Sidebar
};
