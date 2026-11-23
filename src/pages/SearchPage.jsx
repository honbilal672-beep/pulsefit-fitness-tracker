import { useState } from "react";
import { Link } from "react-router-dom";
import {
  Search as SearchIcon,
  Users,
  UserPlus,
  UserCheck
} from "lucide-react";
import API from "../utils/api";
import { useToast } from "../context/ToastContext";
import { useAuth } from "../context/AuthContext";
const SearchPage = () => {
  const [query, setQuery] = useState("");
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const { user: currentUser } = useAuth();
  const { showToast } = useToast();
  const handleSearch = async (searchStr) => {
    if (!searchStr.trim()) {
      setUsers([]);
      return;
    }
    try {
      setLoading(true);
      const res = await API.get(`/api/users/search?q=${encodeURIComponent(searchStr)}`);
      if (res.data?.success) {
        setUsers(res.data.users || []);
      }
    } catch {
      showToast("Search request failed.", "error");
    } finally {
      setLoading(false);
    }
  };
  const handleFollowToggle = async (targetUser) => {
    try {
      if (targetUser.isFollowedByMe) {
        await API.post(`/api/users/${targetUser._id}/unfollow`);
        showToast(`Unfollowed @${targetUser.username}`, "info");
      } else {
        await API.post(`/api/users/${targetUser._id}/follow`);
        showToast(`Followed @${targetUser.username}!`, "success");
      }
      setUsers(
        (prev) => prev.map(
          (u) => u._id === targetUser._id ? {
            ...u,
            isFollowedByMe: !u.isFollowedByMe,
            followersCount: u.isFollowedByMe ? u.followersCount - 1 : u.followersCount + 1
          } : u
        )
      );
    } catch (err) {
      showToast(err.response?.data?.message || "Action failed.", "error");
    }
  };
  return <div className="space-y-6">
      {
    /* Header */
  }
      <div>
        <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight flex items-center gap-2">
          <Users className="w-7 h-7 text-blue-500" /> Athlete Community & Search
        </h1>
        <p className="text-xs sm:text-sm text-slate-400 mt-1">
          Discover other athletes, view public fitness routines, and share training milestones
        </p>
      </div>

      {
    /* Search Input */
  }
      <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800">
        <div className="relative">
          <SearchIcon className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
          <input
    type="text"
    value={query}
    onChange={(e) => {
      setQuery(e.target.value);
      handleSearch(e.target.value);
    }}
    placeholder="Search athletes by username or name..."
    className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
  />
        </div>
      </div>

      {
    /* Results */
  }
      <div>
        {loading ? <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 animate-pulse">
            {[1, 2, 3].map((i) => <div key={i} className="h-40 bg-slate-900 rounded-2xl" />)}
          </div> : users.length === 0 ? <div className="p-12 text-center rounded-2xl bg-slate-900 border border-slate-800 text-slate-400">
            <Users className="w-10 h-10 mx-auto mb-2 text-slate-600" />
            <p className="text-sm font-semibold text-slate-300">
              {query ? "No matching users found." : "Find people to train with"}
            </p>
            <p className="text-xs text-slate-500 mt-1">
              Search by full name or username to view public profiles and follow friends.
            </p>
          </div> : <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {users.map((u) => {
    const isSelf = currentUser?._id === u._id;
    return <div
      key={u._id}
      className="p-5 rounded-2xl bg-slate-900 border border-slate-800 hover:border-slate-700 transition-all flex flex-col justify-between"
    >
                  <div className="flex items-start gap-3">
                    <img
      src={u.profilePicture || `https://api.dicebear.com/7.x/initials/svg?seed=${u.username}`}
      alt={u.name}
      className="w-12 h-12 rounded-xl object-cover ring-2 ring-blue-500/20"
    />
                    <div className="flex-1 min-w-0">
                      <Link
      to={`/profile/${u.username}`}
      className="text-sm font-bold text-white hover:text-blue-400 transition-colors block truncate"
    >
                        {u.name}
                      </Link>
                      <p className="text-xs text-slate-400">@{u.username}</p>
                      <span className="inline-block mt-1 text-[10px] font-bold uppercase px-2 py-0.5 rounded bg-blue-500/10 text-blue-400 border border-blue-500/20">
                        {u.fitnessGoal?.replace("_", " ") || "General Fitness"}
                      </span>
                    </div>
                  </div>

                  <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between">
                    <span className="text-xs text-slate-400">
                      <strong className="text-white">{u.followersCount}</strong> followers
                    </span>

                    {!isSelf && <button
      type="button"
      onClick={() => handleFollowToggle(u)}
      className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${u.isFollowedByMe ? "bg-slate-800 text-slate-300 hover:bg-rose-500/10 hover:text-rose-400 border border-slate-700" : "bg-blue-600 hover:bg-blue-500 text-white shadow-md shadow-blue-600/30"}`}
    >
                        {u.isFollowedByMe ? <>
                            <UserCheck className="w-3.5 h-3.5 text-emerald-400" /> Following
                          </> : <>
                            <UserPlus className="w-3.5 h-3.5" /> Follow
                          </>}
                      </button>}
                  </div>
                </div>;
  })}
          </div>}
      </div>
    </div>;
};
export {
  SearchPage
};
