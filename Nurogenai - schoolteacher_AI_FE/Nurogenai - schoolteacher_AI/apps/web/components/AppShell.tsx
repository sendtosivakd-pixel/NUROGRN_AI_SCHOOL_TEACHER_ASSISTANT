"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "motion/react";
import { 
  LayoutDashboard, 
  FileText, 
  Search, 
  PlusCircle, 
  FileUp, 
  Settings, 
  LogOut, 
  BookOpen, 
  Sparkles,
  UserCircle,
  Brain
} from "lucide-react";
import { useAuth } from "@/lib/auth";
import { ThemeToggle } from "./ThemeToggle";

const navItems = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/reports", label: "Reports", icon: FileText },
  { href: "/teacher-assistant", label: "Teacher Assistant", icon: Brain },
  { href: "/textbooks", label: "Textbook Search", icon: Search },
  { href: "/exams/new", label: "Add Exam", icon: PlusCircle },
  { href: "/import", label: "CSV Import", icon: FileUp },
  { href: "/settings", label: "Settings", icon: Settings },
];

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { user, loading, logout } = useAuth();

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex transition-colors duration-500">
      {/* Sidebar background effects */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-purple-600/5 dark:bg-purple-600/10 blur-[100px] rounded-full" />
      </div>

      {/* Sidebar */}
      <aside className="w-80 flex-none sticky top-0 h-screen border-r border-slate-200 dark:border-white/5 bg-white/50 dark:bg-slate-900/20 backdrop-blur-3xl flex flex-col z-50 transition-colors duration-500">
        <div className="p-8 border-b border-slate-200 dark:border-white/5">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-10 h-10 bg-gradient-to-br from-purple-600 to-pink-600 rounded-xl flex items-center justify-center shadow-lg shadow-purple-500/20">
              <BookOpen className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-slate-900 dark:text-white tracking-tight">School Teacher</h1>
              <p className="text-[10px] text-purple-600 dark:text-purple-400 font-bold uppercase tracking-widest">Analytics OS</p>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-white dark:bg-white/[0.03] border border-slate-200 dark:border-white/5 flex items-center gap-3 shadow-sm dark:shadow-none transition-colors duration-500">
            <div className="w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-purple-600 dark:text-purple-400 border border-slate-200 dark:border-white/10">
              <UserCircle className="w-6 h-6" />
            </div>
            <div className="overflow-hidden">
              <p className="text-sm font-bold text-slate-900 dark:text-white truncate">{loading ? "Loading..." : user?.name ?? "Student"}</p>
              <p className="text-[10px] text-slate-500 truncate">{user?.email ?? "secure workspace"}</p>
            </div>
          </div>
        </div>

        <nav className="flex-1 p-6 space-y-1 overflow-y-auto custom-scrollbar">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            const Icon = item.icon;
            
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-colors group relative overflow-hidden ${
                  isActive 
                    ? 'text-purple-900 dark:text-white shadow-sm dark:shadow-none' 
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100 dark:text-slate-400 dark:hover:text-white dark:hover:bg-white/[0.02]'
                }`}
              >
                {isActive && (
                  <motion.div 
                    layoutId="activeNavBackground"
                    className="absolute inset-0 bg-purple-100 dark:bg-white/5 rounded-xl"
                    initial={false}
                    transition={{ type: "spring", stiffness: 300, damping: 30 }}
                  />
                )}
                {isActive && (
                  <motion.div 
                    layoutId="activeNavIndicator"
                    className="absolute left-0 w-1 h-6 bg-purple-500 rounded-full"
                    initial={false}
                    transition={{ type: "spring", stiffness: 300, damping: 30 }}
                  />
                )}
                <div className="relative z-10 flex items-center gap-3">
                  <Icon className={`w-5 h-5 transition-colors ${isActive ? 'text-purple-600 dark:text-purple-400' : 'text-slate-400 dark:text-slate-500 group-hover:text-purple-500 dark:group-hover:text-purple-400'}`} />
                  {item.label}
                </div>
              </Link>
            );
          })}
        </nav>

        <div className="p-6 border-t border-slate-200 dark:border-white/5 space-y-4">
          {user && !user.profileCompleted && (
            <div className="p-4 rounded-2xl bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-600/20 dark:to-pink-600/20 border border-purple-200 dark:border-purple-500/20 shadow-sm dark:shadow-none">
              <div className="flex items-center gap-2 mb-2">
                <Sparkles className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                <span className="text-xs font-bold text-slate-900 dark:text-white">Action Required</span>
              </div>
              <p className="text-[10px] text-slate-600 dark:text-purple-200/70 mb-3 leading-relaxed">
                Add your academic profile and subjects to unlock advanced analytics.
              </p>
              <Link href="/onboarding" className="block w-full py-2 bg-purple-600 hover:bg-purple-500 text-white text-[10px] font-bold rounded-lg text-center transition-colors">
                Complete Setup
              </Link>
            </div>
          )}

          <button 
            onClick={() => void logout()}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-500/10 transition-all group"
          >
            <LogOut className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            Log out
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 relative">
        {/* Top Gradient */}
        <div className="absolute top-0 right-0 w-1/2 h-64 bg-cyan-600/5 blur-[100px] pointer-events-none" />
        
        <div className="fixed top-8 right-8 z-50">
          <ThemeToggle />
        </div>

        <div className="p-8 max-w-7xl mx-auto min-h-screen pt-24 md:pt-8 overflow-hidden">
          <AnimatePresence mode="wait">
            <motion.div
              key={pathname}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3, ease: "easeOut" }}
            >
              {children}
            </motion.div>
          </AnimatePresence>
        </div>
      </main>

      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(148, 163, 184, 0.2);
          border-radius: 10px;
        }
        .dark .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(255, 255, 255, 0.05);
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(148, 163, 184, 0.4);
        }
        .dark .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(255, 255, 255, 0.1);
        }
      `}</style>
    </div>
  );
}
