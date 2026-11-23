import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Dumbbell,
  Bell,
  Sun,
  Moon,
  LogOut,
  User,
  Settings,
  Menu,
  ShieldCheck,
  Check
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";
import API from "../utils/api";
const Navbar = ({ onToggleSidebar }) => {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  useEffect(() => {
    let isMounted = true;
    const fetchNotifications = async () => {
      try {
        const res = await API.get("/api/notifications?limit=5");
        if (isMounted && res.data?.success) {
          setNotifications(res.data.notifications || []);
          setUnreadCount(res.data.unreadCount || 0);
        }
      } catch {
      }
    };
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 3e4);
    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, []);
  const handleMarkAllRead = async () => {
    try {
      await API.patch("/api/notifications/mark-all-read");
      setUnreadCount(0);
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
    } catch (e) {
      console.error(e);
    }
  };
  return <header className="sticky top-0 z-40 w-full border-b border-slate-800 bg-slate-900/90 backdrop-blur-md">
      <div className="flex h-16 items-center justify-between px-4 sm:px-6 lg:px-8">
        {
    /* Brand & Mobile Hamburger */
  }
        <div className="flex items-center gap-3">
          <button
    type="button"
    onClick={onToggleSidebar}
    className="lg:hidden p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
    aria-label="Toggle Navigation Menu"
  >
            <Menu className="w-5 h-5" />
          </button>

          <Link to="/dashboard" className="flex items-center gap-2.5 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-500 flex items-center justify-center text-white shadow-lg shadow-blue-500/25 group-hover:scale-105 transition-transform">
              <Dumbbell className="w-5 h-5" />
            </div>
            <span className="text-xl font-bold tracking-tight bg-gradient-to-r from-white via-slate-100 to-blue-400 bg-clip-text text-transparent">
              PulseFit
            </span>
          </Link>
        </div>

        {
    /* Right Controls */
  }
        <div className="flex items-center gap-2 sm:gap-4">
          {
    /* Theme Toggle */
  }
          <button
    type="button"
    onClick={toggleTheme}
    className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
    title={`Switch to ${theme === "dark" ? "light" : "dark"} mode`}
    aria-label="Toggle Theme"
  >
            {theme === "dark" ? <Sun className="w-5 h-5 text-amber-400" /> : <Moon className="w-5 h-5 text-blue-400" />}
          </button>

          {
    /* Notifications Dropdown */
  }
          <div className="relative">
            <button
    type="button"
    onClick={() => {
      setIsNotifOpen(!isNotifOpen);
      setIsUserMenuOpen(false);
    }}
    className="relative p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
    aria-label="Notifications"
  >
              <Bell className="w-5 h-5" />
              {unreadCount > 0 && <span className="absolute top-1.5 right-1.5 flex h-4 min-w-[16px] px-1 items-center justify-center rounded-full bg-rose-500 text-[10px] font-bold text-white shadow">
                  {unreadCount > 9 ? "9+" : unreadCount}
                </span>}
            </button>

            {isNotifOpen && <div className="absolute right-0 mt-2 w-80 sm:w-96 rounded-2xl border border-slate-800 bg-slate-900 shadow-2xl p-4 text-slate-200 z-50 animate-in fade-in zoom-in-95">
                <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold text-sm text-white">Notifications</h3>
                    {unreadCount > 0 && <span className="px-1.5 py-0.5 text-xs rounded bg-blue-500/20 text-blue-400 font-medium">
                        {unreadCount} new
                      </span>}
                  </div>
                  {unreadCount > 0 && <button
    type="button"
    onClick={handleMarkAllRead}
    className="text-xs text-blue-400 hover:text-blue-300 flex items-center gap-1 font-medium"
  >
                      <Check className="w-3.5 h-3.5" /> Mark all read
                    </button>}
                </div>

                <div className="divide-y divide-slate-800/60 max-h-72 overflow-y-auto py-2">
                  {notifications.length === 0 ? <p className="text-xs text-slate-400 text-center py-6">No notifications yet.</p> : notifications.map((notif) => <div
    key={notif._id}
    className={`py-2.5 px-2 rounded-lg transition-colors ${!notif.isRead ? "bg-blue-500/5" : "hover:bg-slate-800/50"}`}
  >
                        <div className="flex items-start justify-between gap-2">
                          <p className="text-xs font-semibold text-white">{notif.title}</p>
                          <span className="text-[10px] text-slate-500 whitespace-nowrap">
                            {new Date(notif.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                          </span>
                        </div>
                        <p className="text-xs text-slate-300 mt-0.5 leading-relaxed">{notif.message}</p>
                      </div>)}
                </div>

                <div className="pt-2 border-t border-slate-800 text-center">
                  <Link
    to="/notifications"
    onClick={() => setIsNotifOpen(false)}
    className="text-xs font-semibold text-blue-400 hover:text-blue-300 transition-colors"
  >
                    View all notifications →
                  </Link>
                </div>
              </div>}
          </div>

          {
    /* User Profile Badge & Menu */
  }
          <div className="relative">
            <button
    type="button"
    onClick={() => {
      setIsUserMenuOpen(!isUserMenuOpen);
      setIsNotifOpen(false);
    }}
    className="flex items-center gap-2.5 p-1 rounded-xl hover:bg-slate-800/80 transition-colors text-left"
    aria-label="User Menu"
  >
              <img
    src={user?.profilePicture || `https://api.dicebear.com/7.x/initials/svg?seed=${user?.username || "User"}`}
    alt={user?.name || "User avatar"}
    className="w-9 h-9 rounded-xl object-cover ring-2 ring-blue-500/30"
  />
              <div className="hidden md:block">
                <p className="text-xs font-semibold text-white leading-tight flex items-center gap-1">
                  {user?.name || "Athlete"}
                  {user?.role === "admin" && <ShieldCheck className="w-3.5 h-3.5 text-amber-400" />}
                </p>
                <p className="text-[11px] text-slate-400 leading-tight">@{user?.username}</p>
              </div>
            </button>

            {isUserMenuOpen && <div className="absolute right-0 mt-2 w-56 rounded-2xl border border-slate-800 bg-slate-900 shadow-2xl p-2 text-slate-200 z-50 animate-in fade-in zoom-in-95">
                <div className="px-3 py-2 border-b border-slate-800 mb-1">
                  <p className="text-xs font-bold text-white">{user?.name}</p>
                  <p className="text-[11px] text-slate-400 truncate">{user?.email}</p>
                  <span className="inline-block mt-1 text-[10px] font-semibold uppercase px-1.5 py-0.5 rounded bg-blue-500/20 text-blue-300">
                    {user?.fitnessGoal?.replace("_", " ") || "Goal: General Health"}
                  </span>
                </div>

                <Link
    to={`/profile/${user?.username}`}
    onClick={() => setIsUserMenuOpen(false)}
    className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium text-slate-300 hover:text-white hover:bg-slate-800 transition-colors"
  >
                  <User className="w-4 h-4 text-blue-400" />
                  Public Profile
                </Link>

                <Link
    to="/settings"
    onClick={() => setIsUserMenuOpen(false)}
    className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium text-slate-300 hover:text-white hover:bg-slate-800 transition-colors"
  >
                  <Settings className="w-4 h-4 text-slate-400" />
                  Settings & Preferences
                </Link>

                {user?.role === "admin" && <Link
    to="/admin/support"
    onClick={() => setIsUserMenuOpen(false)}
    className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium text-amber-300 hover:bg-amber-500/10 transition-colors"
  >
                    <ShieldCheck className="w-4 h-4 text-amber-400" />
                    Admin Support Helpdesk
                  </Link>}

                <div className="pt-1 mt-1 border-t border-slate-800">
                  <button
    type="button"
    onClick={() => {
      setIsUserMenuOpen(false);
      logout();
      navigate("/login");
    }}
    className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium text-rose-400 hover:bg-rose-500/10 transition-colors"
  >
                    <LogOut className="w-4 h-4" />
                    Sign Out
                  </button>
                </div>
              </div>}
          </div>
        </div>
      </div>
    </header>;
};
export {
  Navbar
};
