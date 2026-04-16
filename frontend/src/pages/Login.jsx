import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { api } from '../services/api';
import { Activity, User } from 'lucide-react';

const Login = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({ email: '', password: '', name: '', rememberMe: false });
  const [recentEmails, setRecentEmails] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const navigate = useNavigate();
  const dropdownRef = useRef(null);

  useEffect(() => {
    // Load recent emails from local storage on mount
    const saved = localStorage.getItem('recent_emails');
    if (saved) {
      try {
        setRecentEmails(JSON.parse(saved));
      } catch (e) {
         console.warn("Could not parse recent emails");
      }
    }
    
    // Close dropdown globally when clicking outside
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const loadingToast = toast.loading(isLogin ? 'Authenticating...' : 'Creating profile...');
    try {
      let data;
      if (isLogin) {
        data = await api.login(formData.email, formData.password, formData.rememberMe);
      } else {
        data = await api.signup(formData.name, formData.email, formData.password);
      }
      
      toast.success(isLogin ? 'Login successful!' : 'Profile created!', { id: loadingToast });
      
      // Save recent email strategy strictly tracking last 5 distinct successful logins
      if (formData.email) {
        let updatedEmails = [formData.email, ...recentEmails.filter(e => e !== formData.email)];
        updatedEmails = updatedEmails.slice(0, 5); 
        localStorage.setItem('recent_emails', JSON.stringify(updatedEmails));
        setRecentEmails(updatedEmails);
      }

      // Navigate securely based on backend returned role
      if (data && data.role === 'admin') {
        navigate('/admin');
      } else {
        navigate('/dashboard');
      }
    } catch (err) {
      toast.error(err.message || 'Authentication failed', { id: loadingToast });
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#f8fafc] dark:bg-[#0b0f19] px-4 -mt-16">
      
      <motion.div 
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-[1000px] h-[650px] bg-white dark:bg-dark-800 rounded-3xl shadow-[0_20px_50px_rgb(0,0,0,0.1)] dark:shadow-none dark:border dark:border-gray-800 flex overflow-hidden relative"
      >
        
        {/* Left Interactive Branding Panel */}
        <div className="hidden lg:flex w-[45%] bg-[#0f172a] p-12 flex-col justify-between relative overflow-hidden">
          
          {/* Subtle Ambient Glow */}
          <div className="absolute top-[-50%] left-[-50%] w-full h-full bg-indigo-500/20 blur-[120px] rounded-full pointer-events-none"></div>

          <div className="relative z-10">
            <div className="flex items-center gap-3 mb-10">
              <div className="w-10 h-10 bg-indigo-500 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-500/30">
                <Activity className="w-6 h-6 text-white" />
              </div>
              <span className="font-bold text-xl text-white tracking-wide">Survey Quest</span>
            </div>

            <h1 className="text-3xl font-extrabold text-white leading-snug mb-4">
              Connect with your<br/>audience in <span className="text-indigo-400">real time</span>
            </h1>
            <p className="text-slate-400 text-[15px] max-w-[280px] leading-relaxed">
              Surveys, analytics, and insights<br/>— all in one place
            </p>
          </div>

          {/* Floating Aesthetic Chat Bubbles */}
          <div className="relative z-10 w-full mb-8 flex flex-col gap-4">
            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-slate-800/80 backdrop-blur-sm border border-slate-700 text-slate-300 rounded-2xl rounded-bl-sm p-4 text-[13px] font-medium max-w-[85%] self-start shadow-xl shadow-black/20"
            >
              back again? more responses waiting 👀
            </motion.div>
            
            <motion.div 
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.5 }}
              className="bg-indigo-500 text-white rounded-2xl rounded-br-sm p-4 text-[13px] font-medium max-w-[85%] self-end shadow-xl shadow-indigo-500/20"
            >
              dashboard updated in real time ⚡
            </motion.div>

            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.8 }}
              className="bg-slate-800/80 backdrop-blur-sm border border-slate-700 text-slate-300 rounded-2xl rounded-bl-sm p-4 text-[13px] font-medium max-w-[85%] self-start shadow-xl shadow-black/20"
            >
              you're closer to your goal than you think 🎯
            </motion.div>
          </div>

        </div>

        {/* Right Form Panel */}
        <div className="w-full lg:w-[55%] p-10 md:p-16 flex flex-col justify-center bg-white dark:bg-[#121212]">
          
          <div className="w-full max-w-[380px] mx-auto">
            <h2 className="text-[32px] font-extrabold text-slate-900 dark:text-white tracking-tight mb-2">
              {isLogin ? 'Welcome back' : 'Create an account'}
            </h2>
            <p className="text-slate-500 dark:text-slate-400 text-[15px] mb-10">
              {isLogin ? 'Sign in to your account to continue' : 'Sign up to start building surveys'}
            </p>

            <form onSubmit={handleSubmit} className="space-y-6">
              {!isLogin && (
                <div>
                  <label className="block text-[13px] font-bold text-slate-700 dark:text-slate-300 mb-2">Full Name</label>
                  <input
                    type="text"
                    name="name"
                    autoComplete="name"
                    required
                    className="w-full px-4 py-3 bg-[#f8fafc] dark:bg-[#1c1c1c] border border-slate-200 dark:border-[#333] rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all text-slate-900 dark:text-white"
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                  />
                </div>
              )}
              
              <div className="relative" ref={dropdownRef}>
                <label className="block text-[13px] font-bold text-slate-700 dark:text-slate-300 mb-2">Email Address</label>
                <input
                  type="email"
                  name="email"
                  autoComplete="email"
                  required
                  placeholder="you@example.com"
                  className="w-full px-4 py-3 bg-[#f8fafc] dark:bg-[#1c1c1c] border border-slate-200 dark:border-[#333] rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all text-slate-900 dark:text-white"
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                  onFocus={() => setShowSuggestions(true)}
                />
                
                {/* Auto Suggest Custom Dropdown */}
                <AnimatePresence>
                  {showSuggestions && recentEmails.filter(e => e.toLowerCase().includes(formData.email.toLowerCase())).length > 0 && (
                    <motion.div
                      initial={{ opacity: 0, y: -5 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -5 }}
                      transition={{ duration: 0.15 }}
                      className="absolute z-50 w-full mt-2 bg-white dark:bg-dark-800 rounded-xl shadow-xl border border-slate-200 dark:border-gray-700 overflow-hidden"
                    >
                      <div className="px-4 py-2 text-xs font-bold text-slate-400 dark:text-slate-500 border-b border-slate-100 dark:border-[#333] tracking-widest uppercase bg-slate-50/50 dark:bg-dark-900/50">
                        Recent Accounts
                      </div>
                      <ul className="max-h-48 overflow-y-auto w-full">
                        {recentEmails.filter(e => e.toLowerCase().includes(formData.email.toLowerCase())).map((email, idx) => (
                          <li 
                            key={idx}
                            onClick={() => {
                              setFormData({...formData, email});
                              setShowSuggestions(false);
                            }}
                            className="px-4 py-3 cursor-pointer hover:bg-indigo-50 dark:hover:bg-indigo-900/20 flex items-center gap-3 transition-colors text-slate-700 dark:text-slate-200 border-b border-slate-50 dark:border-gray-800/50 last:border-0 group"
                          >
                            <div className="w-8 h-8 rounded-full bg-slate-100 dark:bg-dark-900 flex items-center justify-center text-slate-400 group-hover:bg-indigo-100 dark:group-hover:bg-indigo-900/40 group-hover:text-indigo-500 transition-colors">
                              <User className="w-4 h-4" />
                            </div>
                            <span className="text-sm font-medium">{email}</span>
                          </li>
                        ))}
                      </ul>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
              
              <div>
                <label className="block text-[13px] font-bold text-slate-700 dark:text-slate-300 mb-2">Password</label>
                <input
                  type="password"
                  name="password"
                  autoComplete={isLogin ? "current-password" : "new-password"}
                  required
                  className="w-full px-4 py-3 bg-[#f8fafc] dark:bg-[#1c1c1c] border border-slate-200 dark:border-[#333] rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all tracking-widest text-slate-900 dark:text-white"
                  value={formData.password}
                  onChange={(e) => setFormData({...formData, password: e.target.value})}
                />
              </div>

              {isLogin && (
                <div className="flex items-center">
                  <label className="flex items-center gap-2 cursor-pointer group">
                    <div className="relative flex items-center justify-center w-4 h-4">
                      <input
                        type="checkbox"
                        className="peer appearance-none w-4 h-4 border border-slate-300 dark:border-gray-600 rounded bg-[#f8fafc] dark:bg-[#1c1c1c] checked:bg-indigo-500 checked:border-indigo-500 transition-all cursor-pointer"
                        checked={formData.rememberMe}
                        onChange={(e) => setFormData({...formData, rememberMe: e.target.checked})}
                      />
                      <svg className="absolute w-[10px] h-[10px] text-white pointer-events-none opacity-0 peer-checked:opacity-100 transition-opacity" viewBox="0 0 14 10" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M1 5L4.5 8.5L13 1" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    </div>
                    <span className="text-[13px] font-medium text-slate-600 dark:text-slate-400 group-hover:text-slate-800 dark:group-hover:text-slate-200 transition-colors">
                      Remember me
                    </span>
                  </label>
                </div>
              )}

              <button
                type="submit"
                className="w-full bg-indigo-500 hover:bg-indigo-600 active:scale-[0.98] text-white font-semibold py-3.5 rounded-xl transition-all shadow-lg shadow-indigo-500/30 mt-6 text-[15px]"
              >
                {isLogin ? 'Sign In' : 'Register Account'}
              </button>
            </form>

            <p className="mt-8 text-center text-[14px] text-slate-500 dark:text-slate-400 font-medium">
              {isLogin ? "Don't have an account? " : "Already have an account? "}
              <button
                onClick={() => setIsLogin(!isLogin)}
                className="text-indigo-500 hover:text-indigo-600 dark:text-indigo-400 hover:underline transition-all"
              >
                {isLogin ? 'Register here' : 'Sign in here'}
              </button>
            </p>
          </div>

        </div>

      </motion.div>
    </div>
  );
};

export default Login;
