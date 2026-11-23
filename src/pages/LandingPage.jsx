import { useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import {
  Dumbbell,
  Activity,
  ArrowRight,
  BarChart2,
  Apple,
  FileCheck2,
  Users,
  CheckCircle2,
  Calendar,
  TrendingUp,
  BellRing
} from "lucide-react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useAuth } from "../context/AuthContext";
import { ScrollProgressBar } from "../components/ScrollProgressBar";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

const LandingPage = () => {
  const { isAuthenticated } = useAuth();
  const heroRef = useRef(null);
  const metricsRef = useRef(null);
  const stepsRef = useRef(null);
  const featuresRef = useRef(null);
  const floatCard1Ref = useRef(null);
  const floatCard2Ref = useRef(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      const tl = gsap.timeline({ defaults: { ease: "power3.out" } });

      tl.from(".hero-badge", {
        opacity: 0,
        y: -18,
        duration: 0.55
      })
        .from(
          ".hero-title",
          {
            opacity: 0,
            y: 28,
            duration: 0.75
          },
          "-=0.25"
        )
        .from(
          ".hero-subtitle",
          {
            opacity: 0,
            y: 18,
            duration: 0.65
          },
          "-=0.35"
        )
        .from(
          ".hero-preview-box",
          {
            opacity: 0,
            y: 36,
            duration: 0.85
          },
          "-=0.25"
        );

      if (floatCard1Ref.current && floatCard2Ref.current) {
        gsap.to(floatCard1Ref.current, {
          y: -10,
          duration: 2.6,
          repeat: -1,
          yoyo: true,
          ease: "sine.inOut"
        });
        gsap.to(floatCard2Ref.current, {
          y: 12,
          duration: 3.1,
          repeat: -1,
          yoyo: true,
          ease: "sine.inOut",
          delay: 0.4
        });
      }

      gsap.to(".hero-preview-box", {
        y: -26,
        ease: "none",
        scrollTrigger: {
          trigger: ".hero-preview-box",
          start: "top 65%",
          end: "bottom top",
          scrub: 1
        }
      });

      if (metricsRef.current) {
        gsap.from(".metric-card", {
          scrollTrigger: {
            trigger: metricsRef.current,
            start: "top 88%",
            once: true
          },
          opacity: 0,
          y: 34,
          stagger: 0.12,
          duration: 0.65,
          ease: "power2.out",
          clearProps: "transform,opacity"
        });
      }

      if (stepsRef.current) {
        gsap.from(".step-card", {
          scrollTrigger: {
            trigger: stepsRef.current,
            start: "top 85%",
            once: true
          },
          opacity: 0,
          y: 32,
          scale: 0.97,
          stagger: 0.14,
          duration: 0.7,
          ease: "power2.out",
          clearProps: "transform,opacity"
        });
      }

      if (featuresRef.current) {
        gsap.from(".feature-card", {
          scrollTrigger: {
            trigger: featuresRef.current,
            start: "top 85%",
            once: true
          },
          opacity: 0,
          y: 38,
          stagger: 0.14,
          duration: 0.75,
          ease: "power3.out",
          clearProps: "transform,opacity"
        });
      }

      gsap.from(".cta-banner", {
        scrollTrigger: {
          trigger: ".cta-banner",
          start: "top 88%",
          once: true
        },
        opacity: 0,
        scale: 0.96,
        y: 24,
        duration: 0.75,
        ease: "power2.out",
        clearProps: "transform,opacity"
      });
    }, heroRef);

    return () => ctx.revert();
  }, []);

  return (
    <div
      ref={heroRef}
      className="min-h-screen bg-slate-950 text-slate-100 flex flex-col selection:bg-blue-600 selection:text-white"
    >
      <ScrollProgressBar />

      {/* Header */}
      <header className="border-b border-slate-800/80 bg-slate-900/70 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-500 flex items-center justify-center text-white shadow-lg shadow-blue-500/25">
              <Dumbbell className="w-5 h-5" />
            </div>
            <span className="text-xl font-black tracking-tight bg-gradient-to-r from-white via-slate-100 to-blue-400 bg-clip-text text-transparent">
              PulseFit
            </span>
          </Link>

          <div className="flex items-center gap-3">
            {isAuthenticated ? (
              <Link
                to="/dashboard"
                className="px-4 py-2 rounded-xl text-xs font-bold bg-blue-600 text-white hover:bg-blue-500 transition-colors shadow-lg shadow-blue-600/30 flex items-center gap-1.5"
              >
                Go to Dashboard <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            ) : (
              <>
                <Link
                  to="/login"
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-300 hover:text-white hover:bg-slate-800 transition-colors"
                >
                  Sign In
                </Link>
                <Link
                  to="/register"
                  className="px-4 py-2.5 rounded-xl text-xs font-bold bg-blue-600 text-white hover:bg-blue-500 transition-all shadow-lg shadow-blue-600/30 hover:shadow-blue-600/50 hover:scale-[1.02]"
                >
                  Get Started
                </Link>
              </>
            )}
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative overflow-hidden pt-16 pb-20 sm:pt-24 sm:pb-28">
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[400px] bg-blue-600/15 blur-[140px] rounded-full pointer-events-none" />
        <div className="absolute top-2/3 right-1/4 w-[400px] h-[300px] bg-purple-600/10 blur-[120px] rounded-full pointer-events-none" />

        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          <div className="hero-badge inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-semibold mb-6">
            <Activity className="w-3.5 h-3.5" /> Personal Workout, Nutrition &amp; Progress Log
          </div>

          <h1 className="hero-title text-4xl sm:text-6xl font-black tracking-tight text-white leading-[1.08] mb-6">
            Build Stronger Habits,{" "}
            <span className="bg-gradient-to-r from-blue-400 via-indigo-300 to-emerald-400 bg-clip-text text-transparent">
              One Session at a Time
            </span>
          </h1>

          <p className="hero-subtitle text-base sm:text-lg text-slate-300 max-w-2xl mx-auto mb-10 leading-relaxed font-normal">
            Keep your workout splits, daily meals, body measurements, and training notes organized in one clean workspace—without clunky spreadsheets or distractions.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16">
            <Link
              to="/register"
              className="hero-cta-btn w-full sm:w-auto px-8 py-3.5 rounded-xl text-sm font-bold bg-blue-600 text-white hover:bg-blue-500 transition-all shadow-xl shadow-blue-600/30 hover:shadow-blue-600/50 hover:-translate-y-0.5 flex items-center justify-center gap-2"
            >
              Create Free Account <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              to="/login"
              className="hero-cta-btn w-full sm:w-auto px-7 py-3.5 rounded-xl text-sm font-semibold bg-slate-900 border border-slate-800 text-slate-200 hover:bg-slate-800 hover:border-slate-700 transition-colors flex items-center justify-center gap-2"
            >
              Sign In to Your Log
            </Link>
          </div>

          {/* Workspace Preview Showcase */}
          <div className="hero-preview-box max-w-4xl mx-auto relative rounded-3xl p-2 bg-gradient-to-b from-slate-800/80 to-slate-900/40 border border-slate-700/60 shadow-2xl backdrop-blur-xl">
            <div
              ref={floatCard1Ref}
              className="hidden md:flex absolute -top-6 -left-6 z-20 items-center gap-3 px-4 py-2.5 rounded-2xl bg-slate-900/95 border border-slate-700/80 shadow-2xl backdrop-blur-md"
            >
              <div className="w-9 h-9 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
                <CheckCircle2 className="w-5 h-5" />
              </div>
              <div className="text-left">
                <p className="text-xs font-bold text-white">Custom Splits</p>
                <p className="text-[10px] text-slate-400">Sets, reps &amp; progressive load</p>
              </div>
            </div>

            <div
              ref={floatCard2Ref}
              className="hidden md:flex absolute -bottom-6 -right-6 z-20 items-center gap-3 px-4 py-2.5 rounded-2xl bg-slate-900/95 border border-slate-700/80 shadow-2xl backdrop-blur-md"
            >
              <div className="w-9 h-9 rounded-xl bg-blue-500/20 text-blue-400 flex items-center justify-center">
                <BellRing className="w-5 h-5" />
              </div>
              <div className="text-left">
                <p className="text-xs font-bold text-white">Smart Reminders</p>
                <p className="text-[10px] text-slate-400">Stay on schedule daily</p>
              </div>
            </div>

            <div className="rounded-2xl bg-slate-950 p-6 text-left border border-slate-800/80 space-y-5">
              <div className="flex items-center justify-between border-b border-slate-800/80 pb-4">
                <div className="flex items-center gap-2.5">
                  <div className="w-2.5 h-2.5 rounded-full bg-slate-700" />
                  <div className="w-2.5 h-2.5 rounded-full bg-slate-700" />
                  <div className="w-2.5 h-2.5 rounded-full bg-slate-700" />
                  <span className="text-xs text-slate-400 font-medium ml-2">Your Training Workspace</span>
                </div>
                <span className="text-[11px] font-medium px-2.5 py-1 rounded-lg bg-slate-900 text-slate-300 border border-slate-800">
                  Private by default
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800">
                  <Dumbbell className="w-4 h-4 text-blue-400 mb-2" />
                  <p className="text-xs font-bold text-white">Workout Builder</p>
                  <p className="text-[11px] text-slate-400 mt-1">
                    Save routines by category, add exercises, and log completions.
                  </p>
                </div>
                <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800">
                  <Apple className="w-4 h-4 text-emerald-400 mb-2" />
                  <p className="text-xs font-bold text-white">Meal Tracking</p>
                  <p className="text-[11px] text-slate-400 mt-1">
                    Break meals into breakfast, lunch, dinner, and snacks.
                  </p>
                </div>
                <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800">
                  <TrendingUp className="w-4 h-4 text-purple-400 mb-2" />
                  <p className="text-xs font-bold text-white">Body &amp; PR Logs</p>
                  <p className="text-[11px] text-slate-400 mt-1">
                    Track weight, tape measurements, and max lifts over time.
                  </p>
                </div>
                <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800">
                  <FileCheck2 className="w-4 h-4 text-amber-400 mb-2" />
                  <p className="text-xs font-bold text-white">Own Your History</p>
                  <p className="text-[11px] text-slate-400 mt-1">
                    Export clean PDF summaries or raw CSV data anytime.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Core Capabilities Strip */}
      <section ref={metricsRef} className="py-12 border-y border-slate-800/80 bg-slate-900/40 relative z-10">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
            <div className="metric-card p-5 rounded-2xl bg-slate-900/80 border border-slate-800 text-center hover:border-blue-500/40 transition-colors">
              <Activity className="w-7 h-7 text-blue-400 mx-auto mb-2.5" />
              <p className="text-lg font-black text-white">Workout Splits</p>
              <p className="text-xs text-slate-400 mt-1 font-medium">Custom exercises, sets &amp; reps</p>
            </div>
            <div className="metric-card p-5 rounded-2xl bg-slate-900/80 border border-slate-800 text-center hover:border-emerald-500/40 transition-colors">
              <Apple className="w-7 h-7 text-emerald-400 mx-auto mb-2.5" />
              <p className="text-lg font-black text-white">Daily Macros</p>
              <p className="text-xs text-slate-400 mt-1 font-medium">Calories, protein, carbs &amp; fats</p>
            </div>
            <div className="metric-card p-5 rounded-2xl bg-slate-900/80 border border-slate-800 text-center hover:border-indigo-500/40 transition-colors">
              <BarChart2 className="w-7 h-7 text-indigo-400 mx-auto mb-2.5" />
              <p className="text-lg font-black text-white">Trend Charts</p>
              <p className="text-xs text-slate-400 mt-1 font-medium">7d, 30d, 90d &amp; 1y views</p>
            </div>
            <div className="metric-card p-5 rounded-2xl bg-slate-900/80 border border-slate-800 text-center hover:border-amber-500/40 transition-colors">
              <FileCheck2 className="w-7 h-7 text-amber-400 mx-auto mb-2.5" />
              <p className="text-lg font-black text-white">PDF &amp; CSV</p>
              <p className="text-xs text-slate-400 mt-1 font-medium">Download your logs anytime</p>
            </div>
          </div>
        </div>
      </section>

      {/* Workflow Steps */}
      <section ref={stepsRef} className="py-20 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <span className="text-xs font-bold uppercase tracking-wider text-blue-400 bg-blue-500/10 px-3 py-1 rounded-full border border-blue-500/20">
            How It Works
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white mt-3 tracking-tight">
            A simple rhythm for every training day
          </h2>
          <p className="text-sm text-slate-400 mt-3">
            Built to get out of your way so logging stays effortless even on busy days.
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="step-card p-6 rounded-2xl bg-slate-900/60 border border-slate-800 relative hover:border-blue-500/50 transition-all hover:-translate-y-1">
            <span className="text-4xl font-black text-blue-500/20 absolute top-4 right-4">01</span>
            <div className="w-10 h-10 rounded-xl bg-blue-500/10 text-blue-400 flex items-center justify-center mb-4">
              <Calendar className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-white mb-2">Plan your split</h3>
            <p className="text-xs text-slate-300 leading-relaxed">
              Organize strength, cardio, or mobility sessions with target sets, reps, and weights.
            </p>
          </div>

          <div className="step-card p-6 rounded-2xl bg-slate-900/60 border border-slate-800 relative hover:border-emerald-500/50 transition-all hover:-translate-y-1">
            <span className="text-4xl font-black text-emerald-500/20 absolute top-4 right-4">02</span>
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center mb-4">
              <Apple className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-white mb-2">Log your meals</h3>
            <p className="text-xs text-slate-300 leading-relaxed">
              Record what you eat across the day and watch your daily calories and macros add up automatically.
            </p>
          </div>

          <div className="step-card p-6 rounded-2xl bg-slate-900/60 border border-slate-800 relative hover:border-indigo-500/50 transition-all hover:-translate-y-1">
            <span className="text-4xl font-black text-indigo-500/20 absolute top-4 right-4">03</span>
            <div className="w-10 h-10 rounded-xl bg-indigo-500/10 text-indigo-400 flex items-center justify-center mb-4">
              <TrendingUp className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-white mb-2">Track real trends</h3>
            <p className="text-xs text-slate-300 leading-relaxed">
              Review body weight, measurements, and lift progression across any date range.
            </p>
          </div>

          <div className="step-card p-6 rounded-2xl bg-slate-900/60 border border-slate-800 relative hover:border-purple-500/50 transition-all hover:-translate-y-1">
            <span className="text-4xl font-black text-purple-500/20 absolute top-4 right-4">04</span>
            <div className="w-10 h-10 rounded-xl bg-purple-500/10 text-purple-400 flex items-center justify-center mb-4">
              <FileCheck2 className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-white mb-2">Export your data</h3>
            <p className="text-xs text-slate-300 leading-relaxed">
              Share a formatted PDF summary with a coach or keep a CSV backup for yourself.
            </p>
          </div>
        </div>
      </section>

      {/* Feature Pillars */}
      <section ref={featuresRef} className="py-20 border-t border-slate-800/80 bg-slate-900/30">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-3xl font-extrabold text-white tracking-tight">
              Everything you need, nothing you don&apos;t
            </h2>
            <p className="text-sm text-slate-400 mt-2">
              Focused tools for people who actually want to stick with their routine.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            <div className="feature-card p-7 rounded-2xl bg-slate-900 border border-slate-800 hover:border-blue-500/50 transition-all hover:-translate-y-1">
              <div className="w-12 h-12 rounded-xl bg-blue-500/10 text-blue-400 flex items-center justify-center mb-5">
                <Dumbbell className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-white mb-2">Strength &amp; Conditioning</h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                Save reusable workout routines, tag sessions by focus area, and mark workouts done with duration and notes.
              </p>
            </div>

            <div className="feature-card p-7 rounded-2xl bg-slate-900 border border-slate-800 hover:border-emerald-500/50 transition-all hover:-translate-y-1">
              <div className="w-12 h-12 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center mb-5">
                <Apple className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-white mb-2">Simple Macro Tracking</h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                Log breakfast, lunch, dinner, and snacks quickly while keeping an eye on protein, carbs, fats, and total calories.
              </p>
            </div>

            <div className="feature-card p-7 rounded-2xl bg-slate-900 border border-slate-800 hover:border-purple-500/50 transition-all hover:-translate-y-1">
              <div className="w-12 h-12 rounded-xl bg-purple-500/10 text-purple-400 flex items-center justify-center mb-5">
                <Users className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-white mb-2">Community &amp; Privacy</h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                Follow training partners when you want company, or keep your profile private with full control over your account data.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Bottom CTA */}
      <section className="py-16 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
        <div className="cta-banner rounded-3xl p-8 sm:p-12 bg-gradient-to-r from-blue-900/50 via-indigo-900/35 to-slate-900 border border-blue-500/30 text-center relative overflow-hidden shadow-2xl">
          <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 bg-blue-500/15 rounded-full blur-3xl pointer-events-none" />
          <h2 className="text-2xl sm:text-4xl font-black text-white tracking-tight mb-4">
            Start your training log today
          </h2>
          <p className="text-sm text-slate-300 max-w-xl mx-auto mb-8 leading-relaxed">
            Create an account in under a minute and keep every workout, meal, and milestone in one place.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              to="/register"
              className="w-full sm:w-auto px-8 py-3.5 rounded-xl text-sm font-bold bg-white text-slate-950 hover:bg-slate-100 transition-all shadow-xl hover:scale-[1.02] flex items-center justify-center gap-2"
            >
              Create Account <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              to="/login"
              className="w-full sm:w-auto px-7 py-3.5 rounded-xl text-sm font-semibold bg-slate-800/80 text-white border border-slate-700 hover:bg-slate-800 transition-colors"
            >
              Sign In
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="mt-auto border-t border-slate-800 py-8 text-center text-xs text-slate-400">
        <p className="font-semibold text-slate-300">PulseFit</p>
        <p className="mt-1 text-slate-500">Personal Fitness, Nutrition &amp; Progress Tracker</p>
      </footer>
    </div>
  );
};

export { LandingPage };
