import { useState } from 'react';
import { motion } from 'motion/react';
import { Mail, Lock, Eye, EyeOff, GraduationCap, BookOpen, Users, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api';
import { useAuth } from '@/lib/auth';
import { SocialLogin } from './SocialLogin';

interface LoginFormProps {
  onSwitchToSignup: () => void;
}

type UserRole = 'student' | 'teacher' | 'parent';

export function LoginForm({ onSwitchToSignup }: LoginFormProps) {
  const router = useRouter();
  const { refreshUser } = useAuth();
  const [selectedRole, setSelectedRole] = useState<UserRole>('student');
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const roles: { value: UserRole; label: string; icon: typeof GraduationCap }[] = [
    { value: 'student', label: 'Student', icon: GraduationCap },
    { value: 'teacher', label: 'Teacher', icon: BookOpen },
    { value: 'parent', label: 'Parent', icon: Users },
  ];

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      await api.login({ email, password });
      await refreshUser();
      
      // Success!
      toast.success(`Welcome back! 🎉`);
      router.push('/dashboard');
    } catch (err) {
      console.error('Login error:', err);
      setError(err instanceof Error ? err.message : 'An error occurred during login');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2 transition-colors duration-500">Welcome Back!</h2>
        <p className="text-slate-500 dark:text-slate-400 text-sm transition-colors duration-500">Select your role and sign in</p>
      </div>

      <form onSubmit={handleLogin} className="space-y-6">
        {/* Role Selector */}
        <div className="space-y-3">
          <label className="text-sm font-medium text-slate-600 dark:text-slate-300 transition-colors duration-500">I am a...</label>
          <div className="grid grid-cols-3 gap-2">
            {roles.map((role) => {
              const Icon = role.icon;
              const isActive = selectedRole === role.value;
              
              return (
                <motion.button
                  key={role.value}
                  type="button"
                  onClick={() => setSelectedRole(role.value)}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className={`relative p-4 rounded-xl border-2 transition-all duration-300 overflow-hidden ${
                    isActive
                      ? 'border-purple-600 dark:border-purple-500 shadow-md dark:shadow-sm'
                      : 'border-slate-200 bg-white hover:border-slate-300 dark:border-slate-700 dark:bg-slate-800/30 dark:hover:border-slate-600 shadow-sm dark:shadow-none'
                  }`}
                >
                  {isActive && (
                    <motion.div
                      layoutId="roleBackground"
                      className="absolute inset-0 bg-purple-600 dark:bg-purple-500/20"
                      initial={false}
                      transition={{ type: "spring", stiffness: 300, damping: 30 }}
                    />
                  )}
                  {isActive && (
                    <motion.div
                      layoutId="roleGlow"
                      className="absolute -inset-0.5 bg-gradient-to-r from-purple-600 to-pink-600 rounded-xl blur opacity-30 dark:opacity-50"
                      initial={false}
                      transition={{ type: "spring", stiffness: 300, damping: 30 }}
                    />
                  )}
                  <div className="relative z-10 flex flex-col items-center gap-2">
                    <Icon className={`w-6 h-6 transition-colors duration-300 ${isActive ? 'text-white dark:text-purple-400' : 'text-slate-400 dark:text-slate-400'}`} />
                    <span className={`text-xs font-medium transition-colors duration-300 ${isActive ? 'text-white' : 'text-slate-500 dark:text-slate-400'}`}>
                      {role.label}
                    </span>
                  </div>
                </motion.button>
              );
            })}
          </div>
        </div>

        {/* Email Input */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-slate-600 dark:text-slate-300 transition-colors duration-500">Email</label>
          <div className="relative group">
            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-purple-400 transition-colors" />
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="Enter your email"
              className="w-full pl-12 pr-4 py-3 bg-white dark:bg-slate-800/50 border-2 border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-500/20 transition-all duration-200 shadow-sm dark:shadow-none"
            />
          </div>
        </div>

        {/* Password Input */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-slate-600 dark:text-slate-300 transition-colors duration-500">Password</label>
          <div className="relative group">
            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-purple-400 transition-colors" />
            <input
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              placeholder="Enter your password"
              className="w-full pl-12 pr-12 py-3 bg-white dark:bg-slate-800/50 border-2 border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-500/20 transition-all duration-200 shadow-sm dark:shadow-none"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-white transition-colors"
            >
              {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Forgot Password */}
        <div className="text-right">
          <button
            type="button"
            className="text-sm text-purple-600 hover:text-purple-700 dark:text-purple-400 dark:hover:text-purple-300 transition-colors"
          >
            Forgot Password?
          </button>
        </div>

        {/* Error Message */}
        {error && (
          <motion.div
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            className="p-4 bg-red-500/10 border border-red-500/50 rounded-xl"
          >
            <p className="text-red-400 text-sm font-medium text-center">{error}</p>
          </motion.div>
        )}

        {/* Login Button */}
        <motion.button
          type="submit"
          disabled={isLoading}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className="w-full py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-semibold rounded-xl shadow-lg shadow-purple-500/50 hover:shadow-purple-500/70 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {isLoading ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              Signing In...
            </>
          ) : (
            'LOGIN'
          )}
        </motion.button>

        {/* Social Login */}
        <SocialLogin />

        {/* Switch to Sign Up */}
        <div className="text-center pt-4 border-t border-slate-200 dark:border-slate-700/50 transition-colors duration-500">
          <p className="text-slate-500 dark:text-slate-400 text-sm">
            New to School Teacher?{' '}
            <button
              type="button"
              onClick={onSwitchToSignup}
              className="text-purple-600 hover:text-purple-700 dark:text-purple-400 dark:hover:text-purple-300 font-semibold transition-colors"
            >
              Sign Up
            </button>
          </p>
        </div>
      </form>
    </div>
  );
}
