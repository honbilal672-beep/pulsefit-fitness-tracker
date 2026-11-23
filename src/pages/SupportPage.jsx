import { useState, useEffect } from "react";
import {
  LifeBuoy,
  Plus,
  Send,
  MessageSquare,
  X,
  User,
  ShieldCheck
} from "lucide-react";
import API from "../utils/api";
import { useToast } from "../context/ToastContext";
import { useAuth } from "../context/AuthContext";
const SupportPage = () => {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [replyMessage, setReplyMessage] = useState("");
  const [subject, setSubject] = useState("");
  const [category, setCategory] = useState("bug");
  const [priority, setPriority] = useState("medium");
  const [message, setMessage] = useState("");
  const { user } = useAuth();
  const { showToast } = useToast();
  const fetchTickets = async () => {
    try {
      setLoading(true);
      const res = await API.get("/api/support/my-tickets");
      if (res.data?.success) {
        setTickets(res.data.tickets || []);
      }
    } catch {
      showToast("Failed to load tickets.", "error");
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    fetchTickets();
  }, []);
  const handleCreateTicket = async (e) => {
    e.preventDefault();
    if (!subject.trim() || !message.trim()) {
      showToast("Please provide a subject and message.", "warning");
      return;
    }
    try {
      const res = await API.post("/api/support", {
        subject: subject.trim(),
        category,
        priority,
        message: message.trim()
      });
      if (res.data?.success) {
        showToast("Support ticket submitted successfully!", "success");
        setIsModalOpen(false);
        setSubject("");
        setMessage("");
        fetchTickets();
      }
    } catch {
      showToast("Error submitting ticket.", "error");
    }
  };
  const handleSelectTicket = async (ticketId) => {
    try {
      const res = await API.get(`/api/support/${ticketId}`);
      if (res.data?.success) {
        setSelectedTicket(res.data.ticket);
      }
    } catch {
      showToast("Could not load ticket thread.", "error");
    }
  };
  const handleSendReply = async (e) => {
    e.preventDefault();
    if (!replyMessage.trim() || !selectedTicket) return;
    try {
      const res = await API.post(`/api/support/${selectedTicket._id}/reply`, {
        message: replyMessage.trim()
      });
      if (res.data?.success) {
        setSelectedTicket(res.data.ticket);
        setReplyMessage("");
        fetchTickets();
        showToast("Reply sent.", "success");
      }
    } catch {
      showToast("Error posting reply.", "error");
    }
  };
  return <div className="space-y-6">
      {
    /* Header */
  }
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight flex items-center gap-2">
            <LifeBuoy className="w-7 h-7 text-blue-500" /> Support & Feedback Helpdesk
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Submit bugs, request feature enhancements, or ask for evaluation assistance
          </p>
        </div>

        <button
    type="button"
    onClick={() => setIsModalOpen(true)}
    className="px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold transition-all shadow-lg shadow-blue-600/30 flex items-center gap-2 self-start sm:self-auto cursor-pointer"
  >
          <Plus className="w-4 h-4" /> Open New Ticket
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {
    /* Tickets List Column */
  }
        <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800">
          <h2 className="text-sm font-bold text-white mb-4">My Inquiries & Tickets</h2>

          {loading ? <div className="space-y-3 animate-pulse">
              {[1, 2, 3].map((i) => <div key={i} className="h-20 bg-slate-950 rounded-xl" />)}
            </div> : tickets.length === 0 ? <div className="text-center py-8 text-slate-500 text-xs">
              No tickets submitted yet.
            </div> : <div className="space-y-2.5 max-h-[600px] overflow-y-auto pr-1">
              {tickets.map((t) => <button
    key={t._id}
    type="button"
    onClick={() => handleSelectTicket(t._id)}
    className={`w-full text-left p-3.5 rounded-xl border transition-all cursor-pointer ${selectedTicket?._id === t._id ? "bg-blue-600/10 border-blue-500/50 shadow" : "bg-slate-950/60 border-slate-800/80 hover:border-slate-700"}`}
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
                    <span className="capitalize">{t.category}</span>
                    <span>{new Date(t.updatedAt).toLocaleDateString()}</span>
                  </div>
                </button>)}
            </div>}
        </div>

        {
    /* Selected Ticket Conversation Thread */
  }
        <div className="lg:col-span-2 p-6 rounded-2xl bg-slate-900 border border-slate-800 flex flex-col justify-between min-h-[500px]">
          {selectedTicket ? <div className="flex flex-col h-full justify-between">
              <div>
                <div className="flex items-start justify-between pb-4 border-b border-slate-800 mb-4">
                  <div>
                    <h2 className="text-base font-bold text-white">{selectedTicket.subject}</h2>
                    <div className="flex items-center gap-3 text-xs text-slate-400 mt-1">
                      <span>Category: <strong className="text-slate-300 capitalize">{selectedTicket.category}</strong></span>
                      <span>•</span>
                      <span>Priority: <strong className="text-slate-300 capitalize">{selectedTicket.priority}</strong></span>
                    </div>
                  </div>
                  <span
    className={`text-xs font-bold uppercase px-2.5 py-1 rounded-full ${selectedTicket.status === "resolved" ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20" : selectedTicket.status === "in_progress" ? "bg-amber-500/10 text-amber-400 border border-amber-500/20" : "bg-blue-500/10 text-blue-400 border border-blue-500/20"}`}
  >
                    {selectedTicket.status.replace("_", " ")}
                  </span>
                </div>

                {
    /* Messages Stream */
  }
                <div className="space-y-3.5 max-h-[350px] overflow-y-auto pr-2 my-4">
                  {selectedTicket.messages?.map((msg, idx) => {
    const isAdmin = msg.senderRole === "admin";
    return <div
      key={idx}
      className={`p-3.5 rounded-xl text-xs ${isAdmin ? "bg-amber-500/10 border border-amber-500/20 ml-6 text-amber-100" : "bg-slate-950 border border-slate-800 mr-6 text-slate-200"}`}
    >
                        <div className="flex items-center justify-between font-bold mb-1.5">
                          <span className="flex items-center gap-1.5">
                            {isAdmin ? <ShieldCheck className="w-3.5 h-3.5 text-amber-400" /> : <User className="w-3.5 h-3.5 text-blue-400" />}
                            {msg.senderName} {isAdmin && "(Support Staff)"}
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
    /* Reply Form */
  }
              <form onSubmit={handleSendReply} className="pt-4 border-t border-slate-800 flex gap-2">
                <input
    type="text"
    required
    placeholder="Type a reply..."
    value={replyMessage}
    onChange={(e) => setReplyMessage(e.target.value)}
    className="flex-1 px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-sm text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
  />
                <button
    type="submit"
    className="px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold flex items-center gap-1.5 shadow-lg shadow-blue-600/30 cursor-pointer"
  >
                  <Send className="w-3.5 h-3.5" /> Reply
                </button>
              </form>
            </div> : <div className="flex flex-col items-center justify-center h-full text-slate-500 py-16">
              <MessageSquare className="w-12 h-12 mb-2 text-slate-700" />
              <p className="text-xs">Select a ticket from the left panel to inspect discussion.</p>
            </div>}
        </div>
      </div>

      {
    /* New Ticket Modal */
  }
      {isModalOpen && <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 w-full max-w-lg rounded-2xl p-6 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-4">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <LifeBuoy className="w-5 h-5 text-blue-500" /> Open Support Ticket
              </h3>
              <button
    type="button"
    onClick={() => setIsModalOpen(false)}
    className="p-1 text-slate-400 hover:text-white"
  >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateTicket} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Subject *</label>
                <input
    type="text"
    required
    value={subject}
    onChange={(e) => setSubject(e.target.value)}
    placeholder="e.g. Issue calculating workout calories or feature request"
    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-sm text-slate-100"
  />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Category</label>
                  <select
    value={category}
    onChange={(e) => setCategory(e.target.value)}
    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-sm text-slate-100"
  >
                    <option value="bug">Bug Report</option>
                    <option value="feedback">Feedback / Improvement</option>
                    <option value="account">Account & Privacy</option>
                    <option value="general">General Inquiry</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Priority</label>
                  <select
    value={priority}
    onChange={(e) => setPriority(e.target.value)}
    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-sm text-slate-100"
  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                    <option value="urgent">Urgent</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Message Description *</label>
                <textarea
    rows={4}
    required
    value={message}
    onChange={(e) => setMessage(e.target.value)}
    placeholder="Explain the issue or feedback in detail..."
    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-sm text-slate-100"
  />
              </div>

              <div className="pt-3 border-t border-slate-800 flex justify-end gap-3">
                <button
    type="button"
    onClick={() => setIsModalOpen(false)}
    className="px-4 py-2 rounded-xl text-xs font-semibold bg-slate-800 text-slate-300"
  >
                  Cancel
                </button>
                <button
    type="submit"
    className="px-5 py-2 rounded-xl text-xs font-bold bg-blue-600 text-white hover:bg-blue-500 shadow-lg shadow-blue-600/30"
  >
                  Submit Ticket
                </button>
              </div>
            </form>
          </div>
        </div>}
    </div>;
};
export {
  SupportPage
};
