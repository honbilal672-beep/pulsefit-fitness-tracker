import { useState, useEffect } from "react";
import {
  ShieldCheck,
  Send,
  MessageSquare,
  Filter,
  User
} from "lucide-react";
import API from "../utils/api";
import { useToast } from "../context/ToastContext";
const AdminSupportPage = () => {
  const [tickets, setTickets] = useState([]);
  const [statusFilter, setStatusFilter] = useState("");
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [adminReply, setAdminReply] = useState("");
  const [loading, setLoading] = useState(true);
  const { showToast } = useToast();
  const fetchAdminTickets = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (statusFilter) params.append("status", statusFilter);
      const res = await API.get(`/api/support/admin/all?${params.toString()}`);
      if (res.data?.success) {
        setTickets(res.data.tickets || []);
      }
    } catch {
      showToast("Error loading administrative tickets.", "error");
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    fetchAdminTickets();
  }, [statusFilter]);
  const handleSelectTicket = async (id) => {
    try {
      const res = await API.get(`/api/support/${id}`);
      if (res.data?.success) {
        setSelectedTicket(res.data.ticket);
      }
    } catch {
      showToast("Could not load ticket.", "error");
    }
  };
  const handleStatusChange = async (newStatus) => {
    if (!selectedTicket) return;
    try {
      const res = await API.patch(`/api/support/admin/${selectedTicket._id}/status`, {
        status: newStatus
      });
      if (res.data?.success) {
        setSelectedTicket(res.data.ticket);
        fetchAdminTickets();
        showToast(`Ticket status updated to ${newStatus.toUpperCase()}`, "success");
      }
    } catch {
      showToast("Error updating status.", "error");
    }
  };
  const handleSendAdminReply = async (e) => {
    e.preventDefault();
    if (!adminReply.trim() || !selectedTicket) return;
    try {
      const res = await API.post(`/api/support/${selectedTicket._id}/reply`, {
        message: adminReply.trim()
      });
      if (res.data?.success) {
        setSelectedTicket(res.data.ticket);
        setAdminReply("");
        fetchAdminTickets();
        showToast("Official admin response sent.", "success");
      }
    } catch {
      showToast("Failed to post reply.", "error");
    }
  };
  return <div className="space-y-6">
      {
    /* Header */
  }
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight flex items-center gap-2">
            <ShieldCheck className="w-7 h-7 text-amber-500" /> Administrative Helpdesk Panel
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Review user feedback tickets, respond to inquiries, and manage resolution statuses
          </p>
        </div>

        {
    /* Status Filter */
  }
        <div className="flex items-center gap-1.5 p-1 rounded-xl bg-slate-900 border border-slate-800">
          <Filter className="w-4 h-4 text-slate-400 ml-2" />
          {["", "open", "in_progress", "resolved", "closed"].map((st) => <button
    key={st}
    type="button"
    onClick={() => setStatusFilter(st)}
    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${statusFilter === st ? "bg-amber-600 text-white" : "text-slate-400 hover:text-white"}`}
  >
              {st === "" ? "All" : st.replace("_", " ").toUpperCase()}
            </button>)}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {
    /* Ticket Feed */
  }
        <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800">
          <h2 className="text-sm font-bold text-white mb-4">All User Inquiries ({tickets.length})</h2>

          {loading ? <div className="space-y-3 animate-pulse">
              {[1, 2, 3, 4].map((i) => <div key={i} className="h-20 bg-slate-950 rounded-xl" />)}
            </div> : tickets.length === 0 ? <p className="text-xs text-slate-500 py-6 text-center">No tickets matching filter.</p> : <div className="space-y-2.5 max-h-[650px] overflow-y-auto pr-1">
              {tickets.map((t) => <button
    key={t._id}
    type="button"
    onClick={() => handleSelectTicket(t._id)}
    className={`w-full text-left p-3.5 rounded-xl border transition-all cursor-pointer ${selectedTicket?._id === t._id ? "bg-amber-500/10 border-amber-500/50" : "bg-slate-950/60 border-slate-800/80 hover:border-slate-700"}`}
  >
                  <div className="flex items-start justify-between gap-2">
                    <p className="text-xs font-bold text-white line-clamp-1">{t.subject}</p>
                    <span
    className={`text-[9px] font-bold uppercase px-1.5 py-0.5 rounded ${t.status === "resolved" ? "bg-emerald-500/10 text-emerald-400" : t.status === "in_progress" ? "bg-amber-500/10 text-amber-400" : "bg-blue-500/10 text-blue-400"}`}
  >
                      {t.status.replace("_", " ")}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-[10px] text-slate-400 mt-2">
                    <span>By: <strong className="text-slate-300">@{t.user?.username || "user"}</strong></span>
                    <span>{new Date(t.updatedAt).toLocaleDateString()}</span>
                  </div>
                </button>)}
            </div>}
        </div>

        {
    /* Ticket Conversation & Status Manager */
  }
        <div className="lg:col-span-2 p-6 rounded-2xl bg-slate-900 border border-slate-800 flex flex-col justify-between min-h-[500px]">
          {selectedTicket ? <div className="flex flex-col h-full justify-between">
              <div>
                <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-800 mb-4 gap-4">
                  <div>
                    <h2 className="text-base font-bold text-white">{selectedTicket.subject}</h2>
                    <p className="text-xs text-slate-400 mt-0.5">
                      User: <strong className="text-white">{selectedTicket.user?.name}</strong> (@{selectedTicket.user?.username}) • {selectedTicket.user?.email}
                    </p>
                  </div>

                  {
    /* Status Dropdown */
  }
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-slate-400 font-semibold">Status:</span>
                    <select
    value={selectedTicket.status}
    onChange={(e) => handleStatusChange(e.target.value)}
    className="px-3 py-1.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white font-bold"
  >
                      <option value="open">Open</option>
                      <option value="in_progress">In Progress</option>
                      <option value="resolved">Resolved</option>
                      <option value="closed">Closed</option>
                    </select>
                  </div>
                </div>

                {
    /* Messages Feed */
  }
                <div className="space-y-3.5 max-h-[380px] overflow-y-auto pr-2 my-4">
                  {selectedTicket.messages?.map((msg, idx) => {
    const isAdmin = msg.senderRole === "admin";
    return <div
      key={idx}
      className={`p-3.5 rounded-xl text-xs ${isAdmin ? "bg-amber-500/10 border border-amber-500/20 ml-6 text-amber-100" : "bg-slate-950 border border-slate-800 mr-6 text-slate-200"}`}
    >
                        <div className="flex items-center justify-between font-bold mb-1.5">
                          <span className="flex items-center gap-1.5">
                            {isAdmin ? <ShieldCheck className="w-3.5 h-3.5 text-amber-400" /> : <User className="w-3.5 h-3.5 text-blue-400" />}
                            {msg.senderName} {isAdmin && "(Staff Admin)"}
                          </span>
                          <span className="text-[10px] text-slate-400 font-normal">
                            {new Date(msg.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                          </span>
                        </div>
                        <p className="leading-relaxed whitespace-pre-wrap">{msg.message}</p>
                      </div>;
  })}
                </div>
              </div>

              {
    /* Admin Reply Box */
  }
              <form onSubmit={handleSendAdminReply} className="pt-4 border-t border-slate-800 flex gap-2">
                <input
    type="text"
    required
    placeholder="Respond as Administrator to user..."
    value={adminReply}
    onChange={(e) => setAdminReply(e.target.value)}
    className="flex-1 px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-sm text-slate-100 focus:outline-none focus:ring-2 focus:ring-amber-500"
  />
                <button
    type="submit"
    className="px-5 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-500 text-white text-xs font-bold flex items-center gap-1.5 shadow-lg shadow-amber-600/30 cursor-pointer"
  >
                  <Send className="w-3.5 h-3.5" /> Post Official Response
                </button>
              </form>
            </div> : <div className="flex flex-col items-center justify-center h-full text-slate-500 py-16">
              <MessageSquare className="w-12 h-12 mb-2 text-slate-700" />
              <p className="text-xs">Select any user ticket to reply or update resolution state.</p>
            </div>}
        </div>
      </div>
    </div>;
};
export {
  AdminSupportPage
};
