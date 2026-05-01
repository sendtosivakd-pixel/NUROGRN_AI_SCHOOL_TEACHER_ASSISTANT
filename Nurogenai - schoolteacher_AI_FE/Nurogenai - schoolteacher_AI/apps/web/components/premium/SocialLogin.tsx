import { motion } from 'motion/react';
import { FaGoogle, FaFacebook, FaInstagram } from 'react-icons/fa';
import { FaXTwitter } from 'react-icons/fa6';

export function SocialLogin() {
  const socialButtons = [
    { name: 'Google', icon: FaGoogle, color: 'from-red-500 to-orange-500' },
    { name: 'Facebook', icon: FaFacebook, color: 'from-blue-600 to-blue-700' },
    { name: 'X', icon: FaXTwitter, color: 'from-slate-700 to-slate-900' },
    { name: 'Instagram', icon: FaInstagram, color: 'from-purple-600 to-pink-600' },
  ];

  const handleSocialLogin = (provider: string) => {
    // Placeholder for social login implementation
    console.log(`Login with ${provider}`);
  };

  return (
    <div className="space-y-4">
      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-slate-200 dark:border-slate-700/50 transition-colors duration-500" />
        </div>
        <div className="relative flex justify-center text-sm">
          <span className="px-4 bg-slate-50 dark:bg-slate-900/40 text-slate-500 dark:text-slate-400 transition-colors duration-500">Or continue with</span>
        </div>
      </div>

      <div className="grid grid-cols-4 gap-3">
        {socialButtons.map((social) => {
          const Icon = social.icon;
          
          return (
            <motion.button
              key={social.name}
              type="button"
              onClick={() => handleSocialLogin(social.name)}
              whileHover={{ scale: 1.1, y: -2 }}
              whileTap={{ scale: 0.95 }}
              className="relative group p-3 bg-white dark:bg-slate-800/50 border-2 border-slate-200 dark:border-slate-700 rounded-xl hover:border-slate-300 dark:hover:border-slate-600 transition-all duration-200 shadow-sm dark:shadow-none"
            >
              <div className={`absolute inset-0 bg-gradient-to-r ${social.color} opacity-0 group-hover:opacity-10 dark:group-hover:opacity-20 rounded-xl transition-opacity duration-200`} />
              <Icon className="w-5 h-5 text-slate-500 dark:text-slate-400 group-hover:text-slate-900 dark:group-hover:text-white transition-colors mx-auto" />
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}
