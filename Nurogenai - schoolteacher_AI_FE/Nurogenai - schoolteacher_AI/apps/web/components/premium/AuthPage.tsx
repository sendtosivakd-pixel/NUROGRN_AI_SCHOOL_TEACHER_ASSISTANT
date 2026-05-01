"use client";
import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { BookOpen, Sparkles } from 'lucide-react';
import { LoginForm } from './LoginForm';
import { SignUpForm } from './SignUpForm';
import { FloatingParticles } from './FloatingParticles';
import { ThemeToggle } from '../ThemeToggle';

interface AuthPageProps {
  defaultTab?: 'login' | 'signup';
}

export function AuthPage({ defaultTab = 'login' }: AuthPageProps) {
  const [activeTab, setActiveTab] = useState<'login' | 'signup'>(defaultTab);

  return (
    <div className="min-h-screen w-full relative overflow-hidden bg-gradient-to-br from-slate-50 via-slate-100 to-purple-50 dark:from-slate-950 dark:via-slate-900 dark:to-purple-950 transition-colors duration-500">
      <div className="fixed top-8 right-8 z-50">
        <ThemeToggle />
      </div>
      {/* Animated Background */}
      <FloatingParticles />
      
      {/* Glowing Orbs */}
      <div className="absolute top-20 left-20 w-96 h-96 bg-purple-600/10 dark:bg-purple-600/30 rounded-full blur-[120px] animate-pulse transition-colors duration-500" />
      <div className="absolute bottom-20 right-20 w-96 h-96 bg-pink-600/10 dark:bg-pink-600/30 rounded-full blur-[120px] animate-pulse delay-1000 transition-colors duration-500" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-cyan-600/10 dark:bg-cyan-600/20 rounded-full blur-[120px] animate-pulse delay-500 transition-colors duration-500" />

      {/* Main Container */}
      <div className="relative z-10 min-h-screen flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, y: 20, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="w-full max-w-md"
        >
          {/* Glassmorphic Card */}
          <div className="relative group">
            {/* Neon Border Glow */}
            <div className="absolute -inset-0.5 bg-gradient-to-r from-purple-600 via-pink-600 to-cyan-600 rounded-3xl opacity-75 group-hover:opacity-100 blur transition-opacity duration-300" />
            
            {/* Main Card */}
            <div className="relative bg-white/80 dark:bg-slate-900/40 backdrop-blur-xl rounded-3xl border border-slate-200 dark:border-white/10 shadow-xl dark:shadow-2xl overflow-hidden transition-colors duration-500">
              {/* Header */}
              <div className="p-8 text-center border-b border-slate-200 dark:border-white/5 transition-colors duration-500">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
                  className="inline-flex items-center justify-center w-16 h-16 mb-4 bg-gradient-to-br from-purple-600 to-pink-600 rounded-2xl shadow-lg shadow-purple-500/50"
                >
                  <BookOpen className="w-8 h-8 text-white" />
                </motion.div>
                
                <motion.h1
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.3 }}
                  className="text-3xl font-bold bg-gradient-to-r from-purple-700 via-pink-600 to-cyan-600 dark:from-purple-400 dark:via-pink-400 dark:to-cyan-400 bg-clip-text text-transparent mb-2 transition-colors duration-500"
                >
                  SCHOOL TEACHER
                </motion.h1>
                
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.4 }}
                  className="flex items-center justify-center gap-2 text-sm text-purple-700 dark:text-purple-300/80 transition-colors duration-500"
                >
                  <Sparkles className="w-4 h-4" />
                  <span>AI-Powered Learning Platform</span>
                  <Sparkles className="w-4 h-4" />
                </motion.div>
              </div>

              {/* Tab Switcher */}
              <div className="p-4">
                <div className="relative bg-slate-100 dark:bg-slate-800/50 rounded-2xl p-1 backdrop-blur-sm transition-colors duration-500">
                  <motion.div
                    layoutId="activeTab"
                    className="absolute inset-y-1 bg-gradient-to-r from-purple-600 to-pink-600 rounded-xl shadow-lg shadow-purple-500/50"
                    initial={false}
                    animate={{
                      left: activeTab === 'login' ? '4px' : 'calc(50% + 2px)',
                      width: 'calc(50% - 6px)',
                    }}
                    transition={{ type: "spring", stiffness: 300, damping: 30 }}
                  />
                  
                  <div className="relative z-10 grid grid-cols-2 gap-1">
                    <button
                      onClick={() => setActiveTab('login')}
                      className={`py-3 px-6 rounded-xl font-semibold transition-all duration-200 ${
                        activeTab === 'login'
                          ? 'text-white'
                          : 'text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'
                      }`}
                    >
                      Login
                    </button>
                    <button
                      onClick={() => setActiveTab('signup')}
                      className={`py-3 px-6 rounded-xl font-semibold transition-all duration-200 ${
                        activeTab === 'signup'
                          ? 'text-white'
                          : 'text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'
                      }`}
                    >
                      Sign Up
                    </button>
                  </div>
                </div>
              </div>

              {/* Form Content */}
              <div className="p-8 pt-4">
                <AnimatePresence mode="wait">
                  {activeTab === 'login' ? (
                    <motion.div
                      key="login"
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 20 }}
                      transition={{ duration: 0.3 }}
                    >
                      <LoginForm onSwitchToSignup={() => setActiveTab('signup')} />
                    </motion.div>
                  ) : (
                    <motion.div
                      key="signup"
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      transition={{ duration: 0.3 }}
                    >
                      <SignUpForm onSwitchToLogin={() => setActiveTab('login')} />
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
