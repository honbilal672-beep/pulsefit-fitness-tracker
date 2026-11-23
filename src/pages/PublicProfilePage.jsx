import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import {
  Dumbbell,
  Lock,
  UserPlus,
  UserCheck,
  Clock,
  Flame
} from "lucide-react";
import API from "../utils/api";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";
const PublicProfilePage = () => {
  const { username } = useParams();
  const [profile, setProfile] = useState(null);
  const [workouts, setWorkouts] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user: currentUser } = useAuth();
  const { showToast } = useToast();
  const fetchProfile = async () => {
    try {
      setLoading(true);
      const res = await API.get(`/api/users/${username}`);
      if (res.data?.success) {
        setProfile(res.data.user);
        setWorkouts(res.data.recentWorkouts || []);
      }
    } catch {
      showToast("Could not load profile.", "error");
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    fetchProfile();
  }, [username]);
  const handleFollowToggle = async () => {
    if (!profile) return;
    try {
      if (profile.isFollowedByMe) {
        await API.post(`/api/users/${profile._id}/unfollow`);
        showToast(`Unfollowed @${profile.username}`, "info");
      } else {
        await API.post(`/api/users/${profile._id}/follow`);
        showToast(`Followed @${profile.username}!`, "success");
      }
      fetchProfile();
    } catch (err) {
      showToast(err.response?.data?.message || "Action failed.", "error");
    }
  };
  if (loading) {
    return <div className="space-y-6 animate-pulse">
        <div className="h-44 bg-slate-900 rounded-2xl" />
        <div className="h-72 bg-slate-900 rounded-2xl" />
      </div>;
  }
  if (!profile) {
    return <div className="p-12 text-center rounded-2xl bg-slate-900 border border-slate-800">
        <p className="text-sm font-semibold text-white">Athlete profile not found.</p>
        <Link to="/search" className="mt-3 inline-block text-xs font-bold text-blue-400">
          ← Back to community search
        </Link>
      </div>;
  }
  const isSelf = currentUser?._id === profile._id;
  return <div className="space-y-6">
      {
    /* Profile Card Header */
  }
      <div className="p-6 sm:p-8 rounded-2xl bg-slate-900 border border-slate-800 relative overflow-hidden">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
          <div className="flex items-center gap-5">
            <img
    src={profile.profilePicture || `https://api.dicebear.com/7.x/initials/svg?seed=${profile.username}`}
    alt={profile.name}
    className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl object-cover ring-4 ring-blue-500/20"
  />
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl sm:text-2xl font-black text-white">{profile.name}</h1>
                {profile.role === "admin" && <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-amber-500/10 text-amber-400 border border-amber-500/20">
                    Admin
                  </span>}
              </div>
              <p className="text-xs text-slate-400 font-medium">@{profile.username}</p>

              <div className="flex flex-wrap items-center gap-4 mt-3 text-xs text-slate-300">
                <span>
                  <strong className="text-white font-bold">{profile.followersCount || 0}</strong> Followers
                </span>
                <span>•</span>
                <span>
                  <strong className="text-white font-bold">{profile.followingCount || 0}</strong> Following
                </span>
                <span>•</span>
                <span className="text-blue-400 font-semibold uppercase">
                  {profile.fitnessGoal?.replace("_", " ") || "General Fitness"}
                </span>
              </div>
            </div>
          </div>

          {!isSelf && <button
    type="button"
    onClick={handleFollowToggle}
    className={`px-5 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 self-start sm:self-auto cursor-pointer ${profile.isFollowedByMe ? "bg-slate-800 text-slate-300 hover:bg-rose-500/10 hover:text-rose-400 border border-slate-700" : "bg-blue-600 hover:bg-blue-500 text-white shadow-lg shadow-blue-600/30"}`}
  >
              {profile.isFollowedByMe ? <>
                  <UserCheck className="w-4 h-4 text-emerald-400" /> Following
                </> : <>
                  <UserPlus className="w-4 h-4" /> Follow Athlete
                </>}
            </button>}
        </div>
      </div>

      {
    /* Private Profile Notice */
  }
      {!profile.isProfilePublic && !isSelf ? <div className="p-12 text-center rounded-2xl bg-slate-900 border border-slate-800 text-slate-400">
          <Lock className="w-10 h-10 text-slate-600 mx-auto mb-2" />
          <h3 className="text-sm font-bold text-white mb-1">This athlete profile is private</h3>
          <p className="text-xs text-slate-500">Only the account owner can view their workout and nutrition logs.</p>
        </div> : (
    /* Completed Workouts Showcase */
    <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800">
          <h2 className="text-base font-bold text-white mb-4 flex items-center gap-2">
            <Dumbbell className="w-5 h-5 text-blue-400" /> Recent Completed Workouts
          </h2>

          {workouts.length === 0 ? <p className="text-xs text-slate-500 py-6 text-center">No completed workouts recorded yet.</p> : <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {workouts.map((w) => <div key={w._id} className="p-4 rounded-xl bg-slate-950/60 border border-slate-800/80">
                  <div className="flex items-start justify-between gap-2 mb-1">
                    <h3 className="text-sm font-bold text-white">{w.title}</h3>
                    <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded bg-blue-500/10 text-blue-400">
                      {w.category}
                    </span>
                  </div>
                  <div className="flex items-center gap-3 text-xs text-slate-400 mt-2">
                    <span className="flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5" /> {w.durationMinutes}m
                    </span>
                    {w.caloriesBurned > 0 && <span className="flex items-center gap-1 text-amber-400">
                        <Flame className="w-3.5 h-3.5" /> {w.caloriesBurned} kcal
                      </span>}
                    <span>•</span>
                    <span>{w.exercises?.length || 0} exercises</span>
                  </div>
                </div>)}
            </div>}
        </div>
  )}
    </div>;
};
export {
  PublicProfilePage
};
