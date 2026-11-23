import { useState, useEffect } from "react";
import {
  Bell,
  Check,
  Trash2,
  CheckCircle2,
  Clock,
  Filter
} from "lucide-react";
import API from "../utils/api";
import { useToast } from "../context/ToastContext";
const NotificationsPage = () => {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [unreadOnly, setUnreadOnly] = useState(false);
  const [loading, setLoading] = useState(true);
  const { showToast } = useToast();
  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const res = await API.get(`/api/notifications?unreadOnly=${unreadOnly}`);
      if (res.data?.success) {
        setNotifications(res.data.notifications || []);
        setUnreadCount(res.data.unreadCount || 0);
      }
    } catch {
      showToast("Failed to load notifications.", "error");
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    fetchNotifications();
  }, [unreadOnly]);
  const handleMarkAsRead = async (id) => {
    try {
      await API.patch(`/api/notifications/${id}/read`);
      setNotifications(
        (prev) => prev.map((n) => n._id === id ? { ...n, isRead: true } : n)
      );
      setUnreadCount((c) => Math.max(0, c - 1));
    } catch {
      showToast("Error updating notification.", "error");
    }
  };
  const handleMarkAllAsRead = async () => {
    try {
      await API.patch("/api/notifications/mark-all-read");
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
      setUnreadCount(0);
      showToast("All notifications marked as read.", "success");
    } catch {
      showToast("Error marking notifications as read.", "error");
    }
  };
  const handleDelete = async (id) => {
    try {
      await API.delete(`/api/notifications/${id}`);
      setNotifications((prev) => prev.filter((n) => n._id !== id));
      showToast("Notification removed.", "info");
    } catch {
      showToast("Error deleting notification.", "error");
    }
  };
  return <div className="space-y-6">
      {
    /* Header */
  }
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight flex items-center gap-2">
            <Bell className="w-7 h-7 text-blue-500" /> Activity Notifications
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Workout accomplishments, personal record milestones, community followers, and system reminders
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          {unreadCount > 0 && <button
    type="button"
    onClick={handleMarkAllAsRead}
    className="px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-xs font-semibold text-slate-200 transition-colors flex items-center gap-1.5 cursor-pointer"
  >
              <Check className="w-3.5 h-3.5 text-blue-400" /> Mark All Read
            </button>}

          <button
    type="button"
    onClick={() => setUnreadOnly(!unreadOnly)}
    className={`px-3.5 py-2 rounded-xl text-xs font-semibold transition-colors flex items-center gap-1.5 cursor-pointer ${unreadOnly ? "bg-blue-600 text-white" : "bg-slate-900 text-slate-300 border border-slate-800 hover:bg-slate-800"}`}
  >
            <Filter className="w-3.5 h-3.5" />
            {unreadOnly ? "Showing Unread" : "Filter Unread"}
          </button>
        </div>
      </div>

      {
    /* Notifications List */
  }
      <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800">
        {loading ? <div className="space-y-3 animate-pulse">
            {[1, 2, 3, 4].map((i) => <div key={i} className="h-16 bg-slate-950 rounded-xl" />)}
          </div> : notifications.length === 0 ? <div className="text-center py-12 text-slate-400">
            <Bell className="w-12 h-12 text-slate-600 mx-auto mb-2" />
            <p className="text-sm font-semibold text-white">No notifications to display</p>
            <p className="text-xs text-slate-500 mt-0.5">
              You're all caught up! New activity and reminder alerts will appear here.
            </p>
          </div> : <div className="divide-y divide-slate-800">
            {notifications.map((notif) => <div
    key={notif._id}
    className={`py-4 px-3 rounded-xl transition-colors flex items-start justify-between gap-4 ${!notif.isRead ? "bg-blue-500/5" : "hover:bg-slate-800/40"}`}
  >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm font-bold text-white">{notif.title}</h3>
                    {!notif.isRead && <span className="w-2 h-2 rounded-full bg-blue-500 shrink-0" title="Unread" />}
                    <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded bg-slate-800 text-slate-400">
                      {notif.type}
                    </span>
                  </div>
                  <p className="text-xs text-slate-300 leading-relaxed">{notif.message}</p>
                  <p className="text-[10px] text-slate-500 flex items-center gap-1 pt-1">
                    <Clock className="w-3 h-3" />
                    {new Date(notif.createdAt).toLocaleString()}
                  </p>
                </div>

                <div className="flex items-center gap-1.5 shrink-0">
                  {!notif.isRead && <button
    type="button"
    onClick={() => handleMarkAsRead(notif._id)}
    className="p-1.5 rounded-lg text-slate-400 hover:text-blue-400 hover:bg-slate-800 transition-colors"
    title="Mark as read"
  >
                      <CheckCircle2 className="w-4 h-4" />
                    </button>}
                  <button
    type="button"
    onClick={() => handleDelete(notif._id)}
    className="p-1.5 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-slate-800 transition-colors"
    title="Delete notification"
  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>)}
          </div>}
      </div>
    </div>;
};
export {
  NotificationsPage
};
