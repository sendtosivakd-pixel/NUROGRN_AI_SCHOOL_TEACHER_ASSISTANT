import { useState } from 'react';
import { motion } from 'motion/react';
import { Mail, Lock, Eye, EyeOff, User, Phone, GraduationCap, BookOpen, Users, Briefcase, Clock, Baby, Loader2 } from 'lucide-react';
import confetti from 'canvas-confetti';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api';
import { useAuth } from '@/lib/auth';
import { SocialLogin } from './SocialLogin';

interface SignUpFormProps {
  onSwitchToLogin: () => void;
}

type UserRole = 'student' | 'teacher' | 'parent';

export function SignUpForm({ onSwitchToLogin }: SignUpFormProps) {
  const router = useRouter();
  const { refreshUser } = useAuth();
  const [selectedRole, setSelectedRole] = useState<UserRole>('student');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  
  // Common fields
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [mobile, setMobile] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  // Student specific
  const [studentClass, setStudentClass] = useState('');
  const [medium, setMedium] = useState('');
  
  // Teacher specific
  const [subject, setSubject] = useState('');
  const [experience, setExperience] = useState('');
  
  // Parent specific
  const [childName, setChildName] = useState('');
  const [childClass, setChildClass] = useState('');

  const roles: { value: UserRole; label: string; icon: typeof GraduationCap }[] = [
    { value: 'student', label: 'Student', icon: GraduationCap },
    { value: 'teacher', label: 'Teacher', icon: BookOpen },
    { value: 'parent', label: 'Parent', icon: Users },
  ];

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (password !== confirmPassword) {
      toast.error('Passwords do not match!');
      return;
    }
    
    if (!agreedToTerms) {
      toast.error('Please agree to Terms & Conditions');
      return;
    }

    setIsLoading(true);

    try {
      if (selectedRole !== 'student') {
        toast.info(`${selectedRole} accounts are coming soon! Registering as Student for now.`);
      }

      await api.signup({ name: fullName, email, password });
      await refreshUser();

      // Success! Show confetti
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#a855f7', '#ec4899', '#06b6d4'],
      });

      toast.success('Account created successfully! 🎉');
      router.push('/onboarding');
    } catch (err) {
      console.error('Sign up error:', err);
      toast.error(err instanceof Error ? err.message : 'An error occurred during sign up');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2 transition-colors duration-500">Create Account</h2>
        <p className="text-slate-500 dark:text-slate-400 text-sm transition-colors duration-500">Join our AI-powered learning platform</p>
      </div>

      <form onSubmit={handleSignUp} className="space-y-5">
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
                  className={`relative p-3 rounded-xl border-2 transition-all duration-300 overflow-hidden ${
                    isActive
                      ? 'border-purple-600 dark:border-purple-500 shadow-md dark:shadow-sm'
                      : 'border-slate-200 bg-white hover:border-slate-300 dark:border-slate-700 dark:bg-slate-800/30 dark:hover:border-slate-600 shadow-sm dark:shadow-none'
                  }`}
                >
                  {isActive && (
                    <motion.div
                      layoutId="roleBackgroundSignup"
                      className="absolute inset-0 bg-purple-600 dark:bg-purple-500/20"
                      initial={false}
                      transition={{ type: "spring", stiffness: 300, damping: 30 }}
                    />
                  )}
                  {isActive && (
                    <motion.div
                      layoutId="roleGlowSignup"
                      className="absolute -inset-0.5 bg-gradient-to-r from-purple-600 to-pink-600 rounded-xl blur opacity-30 dark:opacity-50"
                      initial={false}
                      transition={{ type: "spring", stiffness: 300, damping: 30 }}
                    />
                  )}
                  <div className="relative z-10 flex flex-col items-center gap-1">
                    <Icon className={`w-5 h-5 transition-colors duration-300 ${isActive ? 'text-white dark:text-purple-400' : 'text-slate-400 dark:text-slate-400'}`} />
                    <span className={`text-xs font-medium transition-colors duration-300 ${isActive ? 'text-white' : 'text-slate-500 dark:text-slate-400'}`}>
                      {role.label}
                    </span>
                  </div>
                </motion.button>
              );
            })}
          </div>
        </div>

        {/* Common Fields */}
        <div className="space-y-4">
          {/* Full Name */}
          <div className="relative group">
            <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-purple-400 transition-colors" />
            <input
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              required
              placeholder="Full Name"
              className="w-full pl-10 pr-3 py-2.5 bg-white dark:bg-slate-800/50 border-2 border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white text-sm placeholder-slate-400 dark:placeholder-slate-500 focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-500/20 transition-all duration-200 shadow-sm dark:shadow-none"
            />
          </div>

          {/* Email */}
          <div className="relative group">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-purple-400 transition-colors" />
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="Email Address"
              className="w-full pl-10 pr-3 py-2.5 bg-white dark:bg-slate-800/50 border-2 border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white text-sm placeholder-slate-400 dark:placeholder-slate-500 focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-500/20 transition-all duration-200 shadow-sm dark:shadow-none"
            />
          </div>

          {/* Mobile */}
          <div className="relative group">
            <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-purple-400 transition-colors" />
            <input
              type="tel"
              value={mobile}
              onChange={(e) => setMobile(e.target.value)}
              required
              placeholder="Mobile Number"
              className="w-full pl-10 pr-3 py-2.5 bg-white dark:bg-slate-800/50 border-2 border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white text-sm placeholder-slate-400 dark:placeholder-slate-500 focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-500/20 transition-all duration-200 shadow-sm dark:shadow-none"
            />
          </div>
        </div>

        {/* Role Specific Fields */}
        <motion.div
          key={selectedRole}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-4"
        >
          {selectedRole === 'student' && (
            <>
              <div className="grid grid-cols-2 gap-3">
                <select
                  value={studentClass}
                  onChange={(e) => setStudentClass(e.target.value)}
                  required
                  className="px-3 py-2.5 bg-slate-800/50 border-2 border-slate-700 rounded-xl text-white text-sm focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-500/20 transition-all duration-200"
                >
                  <option value="">Class</option>
                  {Array.from({ length: 12 }, (_, i) => (
                    <option key={i + 1} value={i + 1}>Class {i + 1}</option>
                  ))}
                </select>
                
                <select
                  value={medium}
                  onChange={(e) => setMedium(e.target.value)}
                  required
                  className="px-3 py-2.5 bg-slate-800/50 border-2 border-slate-700 rounded-xl text-white text-sm focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-500/20 transition-all duration-200"
                >
                  <option value="">Medium</option>
                  <option value="tamil">Tamil</option>
                  <option value="english">English</option>
                  <option value="cbse">CBSE</option>
                </select>
              </div>
            </>
          )}

          {selectedRole === 'teacher' && (
            <>
              <div className="relative group">
                <Briefcase className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-purple-400 transition-colors" />
                <input
                  type="text"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  required
                  placeholder="Subject (e.g., Mathematics)"
                  className="w-full pl-10 pr-3 py-2.5 bg-white dark:bg-slate-800/50 border-2 border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white text-sm placeholder-slate-400 dark:placeholder-slate-500 focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-500/20 transition-all duration-200 shadow-sm dark:shadow-none"
                />
              </div>
              
              <div className="relative group">
                <Clock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-purple-400 transition-colors" />
                <input
                  type="text"
                  value={experience}
                  onChange={(e) => setExperience(e.target.value)}
                  required
                  placeholder="Experience (e.g., 5 years)"
                  className="w-full pl-10 pr-3 py-2.5 bg-white dark:bg-slate-800/50 border-2 border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white text-sm placeholder-slate-400 dark:placeholder-slate-500 focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-500/20 transition-all duration-200 shadow-sm dark:shadow-none"
                />
              </div>
            </>
          )}

          {selectedRole === 'parent' && (
            <>
              <div className="relative group">
                <Baby className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-purple-400 transition-colors" />
                <input
                  type="text"
                  value={childName}
                  onChange={(e) => setChildName(e.target.value)}
                  required
                  placeholder="Child's Name"
                  className="w-full pl-10 pr-3 py-2.5 bg-white dark:bg-slate-800/50 border-2 border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white text-sm placeholder-slate-400 dark:placeholder-slate-500 focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-500/20 transition-all duration-200 shadow-sm dark:shadow-none"
                />
              </div>
              
              <select
                value={childClass}
                onChange={(e) => setChildClass(e.target.value)}
                required
                className="w-full px-3 py-2.5 bg-slate-800/50 border-2 border-slate-700 rounded-xl text-white text-sm focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-500/20 transition-all duration-200"
              >
                <option value="">Child's Class</option>
                {Array.from({ length: 12 }, (_, i) => (
                  <option key={i + 1} value={i + 1}>Class {i + 1}</option>
                ))}
              </select>
            </>
          )}
        </motion.div>

        {/* Password Fields */}
        <div className="space-y-4">
          <div className="relative group">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-purple-400 transition-colors" />
            <input
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              placeholder="Password"
              className="w-full pl-10 pr-10 py-2.5 bg-white dark:bg-slate-800/50 border-2 border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white text-sm placeholder-slate-400 dark:placeholder-slate-500 focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-500/20 transition-all duration-200 shadow-sm dark:shadow-none"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-white transition-colors"
            >
              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>

          <div className="relative group">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-purple-400 transition-colors" />
            <input
              type={showConfirmPassword ? 'text' : 'password'}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              placeholder="Confirm Password"
              className="w-full pl-10 pr-10 py-2.5 bg-white dark:bg-slate-800/50 border-2 border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white text-sm placeholder-slate-400 dark:placeholder-slate-500 focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-500/20 transition-all duration-200 shadow-sm dark:shadow-none"
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-white transition-colors"
            >
              {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* Terms Checkbox */}
        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            id="terms"
            checked={agreedToTerms}
            onChange={(e) => setAgreedToTerms(e.target.checked)}
            className="w-4 h-4 rounded border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-purple-600 focus:ring-2 focus:ring-purple-500/20"
          />
          <label htmlFor="terms" className="text-sm text-slate-500 dark:text-slate-400">
            I agree to{' '}
            <span className="text-purple-600 hover:text-purple-700 dark:text-purple-400 dark:hover:text-purple-300 cursor-pointer transition-colors">
              Terms & Conditions
            </span>
          </label>
        </div>

        {/* Sign Up Button */}
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
              Creating Account...
            </>
          ) : (
            'SIGN UP'
          )}
        </motion.button>

        {/* Social Login */}
        <SocialLogin />

        {/* Switch to Login */}
        <div className="text-center pt-2 border-t border-slate-200 dark:border-slate-700/50 transition-colors duration-500">
          <p className="text-slate-500 dark:text-slate-400 text-sm">
            Already have an account?{' '}
            <button
              type="button"
              onClick={onSwitchToLogin}
              className="text-purple-600 hover:text-purple-700 dark:text-purple-400 dark:hover:text-purple-300 font-semibold transition-colors"
            >
              Login
            </button>
          </p>
        </div>
      </form>
    </div>
  );
}
