import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion } from 'framer-motion';
import { FiLock, FiUser, FiLogIn } from 'react-icons/fi';
import WorldMap from './ui/world-map';

interface LoginProps {
  onLoginSuccess: () => void;
}

// Memoized WorldMap to prevent re-renders
const MemoizedWorldMap = React.memo(WorldMap);

const Login: React.FC<LoginProps> = ({ onLoginSuccess }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const usernameRef = useRef<HTMLInputElement>(null);
  const passwordRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    // Focus on username field when component mounts
    if (usernameRef.current) {
      usernameRef.current.focus();
    }
  }, []);

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    // Get credentials from environment variables with fallback defaults
    const validUsername = process.env.REACT_APP_LOGIN_USERNAME || 'CBSIR';
    const validPassword = process.env.REACT_APP_LOGIN_PASSWORD || 'LORD_CBSIR';

    // Check credentials immediately (no artificial delay)
    if (username === validUsername && password === validPassword) {
      // Store authentication state
      localStorage.setItem('sagar:authenticated', 'true');
      localStorage.setItem('sagar:username', username);
      // Small delay only for visual feedback
      setTimeout(() => {
        setIsLoading(false);
        onLoginSuccess();
      }, 100);
    } else {
      setError('Invalid username or password');
      setIsLoading(false);
      // Clear password field on error
      setPassword('');
      if (passwordRef.current) {
        passwordRef.current.focus();
      }
    }
  }, [username, password, onLoginSuccess]);

  return (
    <div className="min-h-screen bg-marine-blue text-white overflow-hidden relative">
      <div className="absolute inset-0 opacity-70">
        <div className="h-full w-full">
          <MemoizedWorldMap />
        </div>
      </div>
      <div className="relative z-10 flex items-center justify-center min-h-screen px-6 py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-md"
        >
          <div className="bg-black/30 backdrop-blur-md border border-white/20 rounded-2xl p-8 shadow-2xl">
            {/* Logo/Title */}
            <div className="text-center mb-8">
              <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight mb-2">
                SAGAR
              </h1>
              <p className="text-gray-300 text-sm mt-2">
                Marine Research Platform
              </p>
            </div>

            {/* Login Form */}
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Username Field */}
              <div>
                <label htmlFor="username" className="block text-sm font-medium text-gray-300 mb-2">
                  Username
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FiUser className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    ref={usernameRef}
                    id="username"
                    type="text"
                    value={username}
                    onChange={(e) => {
                      setUsername(e.target.value);
                      setError('');
                    }}
                    className="w-full pl-10 pr-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-marine-cyan focus:border-transparent transition-all"
                    placeholder="Enter your username"
                    required
                    autoComplete="username"
                  />
                </div>
              </div>

              {/* Password Field */}
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-300 mb-2">
                  Password
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FiLock className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    ref={passwordRef}
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => {
                      setPassword(e.target.value);
                      setError('');
                    }}
                    className="w-full pl-10 pr-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-marine-cyan focus:border-transparent transition-all"
                    placeholder="Enter your password"
                    required
                    autoComplete="current-password"
                  />
                </div>
              </div>

              {/* Error Message */}
              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="p-3 bg-red-500/20 border border-red-500/40 rounded-lg text-red-300 text-sm"
                >
                  {error}
                </motion.div>
              )}

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3 px-4 bg-marine-cyan/80 hover:bg-marine-cyan text-marine-blue font-semibold rounded-xl transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl hover:shadow-marine-cyan/25"
              >
                {isLoading ? (
                  <>
                    <div className="w-5 h-5 border-2 border-marine-blue border-t-transparent rounded-full animate-spin"></div>
                    <span>Logging in...</span>
                  </>
                ) : (
                  <>
                    <FiLogIn className="w-5 h-5" />
                    <span>Login</span>
                  </>
                )}
              </button>
            </form>

            {/* Footer */}
            <div className="mt-6 text-center text-sm text-gray-400">
              <p>© 2025 SAGAR - Marine Research Platform</p>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Login;
