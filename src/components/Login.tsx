import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion } from 'framer-motion';
import { FiLock, FiUser, FiLogIn, FiBriefcase } from 'react-icons/fi';
import WorldMap from './ui/world-map';

interface LoginProps {
  onLoginSuccess: () => void;
}

// Memoized WorldMap to prevent re-renders
const MemoizedWorldMap = React.memo(WorldMap);

const Login: React.FC<LoginProps> = ({ onLoginSuccess }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const usernameRef = useRef<HTMLInputElement>(null);
  const passwordRef = useRef<HTMLInputElement>(null);

  // Scientist roles
  const scientistRoles = [
    { value: '', label: 'Select your role' },
    { value: 'principal_scientist', label: 'Principal Scientist' },
    { value: 'senior_scientist', label: 'Senior Scientist' },
    { value: 'scientist', label: 'Scientist' },
    { value: 'junior_scientist', label: 'Junior Scientist' },
    { value: 'researcher', label: 'Researcher' },
    { value: 'research_associate', label: 'Research Associate' },
    { value: 'postdoc', label: 'Postdoctoral Researcher' },
    { value: 'phd_student', label: 'PhD Student' },
    { value: 'masters_student', label: 'Masters Student' },
    { value: 'intern', label: 'Intern' },
  ];

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
    const validUsername = process.env.REACT_APP_LOGIN_USERNAME || 'ADMIN';
    const validPassword = process.env.REACT_APP_LOGIN_PASSWORD || 'ADMIN123';

    // Validate role selection
    if (!role) {
      setError('Please select your role');
      setIsLoading(false);
      return;
    }

    // Check credentials immediately (no artificial delay)
    if (username === validUsername && password === validPassword) {
      // Store authentication state
      localStorage.setItem('sagar:authenticated', 'true');
      localStorage.setItem('sagar:username', username);
      localStorage.setItem('sagar:role', role);
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
  }, [username, password, role, onLoginSuccess]);

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

            {/* Login Instructions */}
            <div className="mb-6 p-4 bg-marine-cyan/20 border border-marine-cyan/40 rounded-xl">
              <p className="text-sm text-gray-200 leading-relaxed">
                <strong className="text-marine-cyan">Login Instructions:</strong> Use the credentials shown below as your login and password, and select <strong className="text-marine-cyan">Principal Scientist</strong> to access all features.
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
                    className="w-full pl-10 pr-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-marine-cyan focus:border-transparent transition-all"
                    required
                    autoComplete="username"
                  />
                </div>
                <p className="mt-1 text-xs text-gray-400">
                  ID: {process.env.REACT_APP_LOGIN_USERNAME || 'ADMIN'}
                </p>
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
                    className="w-full pl-10 pr-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-marine-cyan focus:border-transparent transition-all"
                    required
                    autoComplete="current-password"
                  />
                </div>
                <p className="mt-1 text-xs text-gray-400">
                  Password: {process.env.REACT_APP_LOGIN_PASSWORD || 'ADMIN123'}
                </p>
              </div>

              {/* Role Selection Field */}
              <div>
                <label htmlFor="role" className="block text-sm font-medium text-gray-300 mb-2">
                  Role
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FiBriefcase className="h-5 w-5 text-gray-400" />
                  </div>
                  <select
                    id="role"
                    value={role}
                    onChange={(e) => {
                      setRole(e.target.value);
                      setError('');
                    }}
                    className="w-full pl-10 pr-10 py-3 bg-white/10 border border-white/20 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-marine-cyan focus:border-transparent transition-all appearance-none cursor-pointer"
                    style={{
                      color: role ? 'white' : 'rgba(156, 163, 175, 0.6)',
                    }}
                    required
                  >
                    {scientistRoles.map((roleOption) => (
                      <option
                        key={roleOption.value}
                        value={roleOption.value}
                        style={{ backgroundColor: '#111827', color: 'white' }}
                      >
                        {roleOption.label}
                      </option>
                    ))}
                  </select>
                  {/* Custom dropdown arrow */}
                  <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                    <svg
                      className="h-5 w-5 text-gray-400"
                      fill="none"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
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
