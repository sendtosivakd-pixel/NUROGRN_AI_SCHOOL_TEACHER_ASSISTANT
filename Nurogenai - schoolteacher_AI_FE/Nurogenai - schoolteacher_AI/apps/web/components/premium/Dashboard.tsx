import { motion } from 'motion/react';
import { LogOut, User, Sparkles, BookOpen, GraduationCap, Users } from 'lucide-react';
import { createClient } from '@supabase/supabase-js';
import { projectId, publicAnonKey } from '@/utils/supabase/info';
import { toast } from 'sonner';

interface DashboardProps {
  user: {
    id: string;
    email: string;
    role: string;
    userData: any;
  };
}

export function Dashboard({ user }: DashboardProps) {
  const handleLogout = async () => {
    const supabase = createClient(
      `https://${projectId}.supabase.co`,
      publicAnonKey
    );

    await supabase.auth.signOut();
    localStorage.removeItem('user');
    toast.success('Logged out successfully!');
    window.location.reload();
  };

  const getRoleIcon = () => {
    switch (user.role) {
      case 'student':
        return <GraduationCap className="w-8 h-8" />;
      case 'teacher':
        return <BookOpen className="w-8 h-8" />;
      case 'parent':
        return <Users className="w-8 h-8" />;
      default:
        return <User className="w-8 h-8" />;
    }
  };

  const getRoleBadgeColor = () => {
    switch (user.role) {
      case 'student':
        return 'from-blue-600 to-cyan-600';
      case 'teacher':
        return 'from-purple-600 to-pink-600';
      case 'parent':
        return 'from-green-600 to-emerald-600';
      default:
        return 'from-slate-600 to-slate-700';
    }
  };

  return (
    <div className="min-h-screen w-full relative overflow-hidden bg-gradient-to-br from-slate-950 via-slate-900 to-purple-950">
      {/* Glowing Orbs */}
      <div className="absolute top-20 left-20 w-96 h-96 bg-purple-600/30 rounded-full blur-[120px] animate-pulse" />
      <div className="absolute bottom-20 right-20 w-96 h-96 bg-pink-600/30 rounded-full blur-[120px] animate-pulse delay-1000" />

      {/* Navigation Bar */}
      <nav className="relative z-10 border-b border-white/5 bg-slate-900/30 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-purple-600 to-pink-600 rounded-xl flex items-center justify-center">
              <BookOpen className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                SCHOOL TEACHER
              </h1>
              <p className="text-xs text-slate-400 flex items-center gap-1">
                <Sparkles className="w-3 h-3" />
                AI-Powered Platform
              </p>
            </div>
          </div>

          <motion.button
            onClick={handleLogout}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="flex items-center gap-2 px-4 py-2 bg-slate-800/50 border border-slate-700 rounded-xl text-slate-300 hover:text-white hover:border-slate-600 transition-all duration-200"
          >
            <LogOut className="w-4 h-4" />
            <span className="text-sm font-medium">Logout</span>
          </motion.button>
        </div>
      </nav>

      {/* Main Content */}
      <div className="relative z-10 max-w-7xl mx-auto px-6 py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-8"
        >
          {/* Welcome Card */}
          <div className="relative group">
            <div className="absolute -inset-0.5 bg-gradient-to-r from-purple-600 via-pink-600 to-cyan-600 rounded-3xl opacity-75 blur" />
            <div className="relative bg-slate-900/60 backdrop-blur-xl rounded-3xl border border-white/10 p-8">
              <div className="flex items-start gap-6">
                <div className={`w-20 h-20 bg-gradient-to-br ${getRoleBadgeColor()} rounded-2xl flex items-center justify-center text-white shadow-lg`}>
                  {getRoleIcon()}
                </div>
                
                <div className="flex-1">
                  <h2 className="text-3xl font-bold text-white mb-2">
                    Welcome back, {user.userData?.fullName || 'User'}! 🎉
                  </h2>
                  <p className="text-slate-400 mb-4">
                    You're logged in as a <span className="text-purple-400 font-semibold capitalize">{user.role}</span>
                  </p>
                  
                  {/* User Details */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-slate-800/40 rounded-xl p-4 border border-slate-700/50">
                      <p className="text-xs text-slate-500 mb-1">Email</p>
                      <p className="text-sm text-white font-medium">{user.email}</p>
                    </div>
                    
                    {user.userData?.mobile && (
                      <div className="bg-slate-800/40 rounded-xl p-4 border border-slate-700/50">
                        <p className="text-xs text-slate-500 mb-1">Mobile</p>
                        <p className="text-sm text-white font-medium">{user.userData.mobile}</p>
                      </div>
                    )}

                    {user.role === 'student' && user.userData?.class && (
                      <>
                        <div className="bg-slate-800/40 rounded-xl p-4 border border-slate-700/50">
                          <p className="text-xs text-slate-500 mb-1">Class</p>
                          <p className="text-sm text-white font-medium">Class {user.userData.class}</p>
                        </div>
                        <div className="bg-slate-800/40 rounded-xl p-4 border border-slate-700/50">
                          <p className="text-xs text-slate-500 mb-1">Medium</p>
                          <p className="text-sm text-white font-medium capitalize">{user.userData.medium}</p>
                        </div>
                      </>
                    )}

                    {user.role === 'teacher' && (
                      <>
                        {user.userData?.subject && (
                          <div className="bg-slate-800/40 rounded-xl p-4 border border-slate-700/50">
                            <p className="text-xs text-slate-500 mb-1">Subject</p>
                            <p className="text-sm text-white font-medium">{user.userData.subject}</p>
                          </div>
                        )}
                        {user.userData?.experience && (
                          <div className="bg-slate-800/40 rounded-xl p-4 border border-slate-700/50">
                            <p className="text-xs text-slate-500 mb-1">Experience</p>
                            <p className="text-sm text-white font-medium">{user.userData.experience}</p>
                          </div>
                        )}
                      </>
                    )}

                    {user.role === 'parent' && (
                      <>
                        {user.userData?.childName && (
                          <div className="bg-slate-800/40 rounded-xl p-4 border border-slate-700/50">
                            <p className="text-xs text-slate-500 mb-1">Child's Name</p>
                            <p className="text-sm text-white font-medium">{user.userData.childName}</p>
                          </div>
                        )}
                        {user.userData?.childClass && (
                          <div className="bg-slate-800/40 rounded-xl p-4 border border-slate-700/50">
                            <p className="text-xs text-slate-500 mb-1">Child's Class</p>
                            <p className="text-sm text-white font-medium">Class {user.userData.childClass}</p>
                          </div>
                        )}
                      </>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Coming Soon Section */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {['AI Tutoring', 'Interactive Lessons', 'Progress Tracking'].map((feature, i) => (
              <motion.div
                key={feature}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                className="bg-slate-900/40 backdrop-blur-xl rounded-2xl border border-white/10 p-6 text-center"
              >
                <div className="w-12 h-12 bg-gradient-to-br from-purple-600 to-pink-600 rounded-xl mx-auto mb-4 flex items-center justify-center">
                  <Sparkles className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-lg font-semibold text-white mb-2">{feature}</h3>
                <p className="text-sm text-slate-400">Coming Soon</p>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
