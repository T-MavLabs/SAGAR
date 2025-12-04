import React, { useEffect, useRef, useState, lazy, Suspense } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FiUser, FiMail, FiLock, FiArrowRight, FiX, FiCheck, FiUsers, 
  FiBarChart2, FiGlobe, FiDatabase, FiUpload, FiDownload, 
  FiAward, FiShield, FiCalendar, FiTrendingUp 
} from 'react-icons/fi';
import LoaderOverlay from './LoaderOverlay';

// Preload the WorldMap component immediately
let worldMapModule: any = null;
let worldMapLoadingPromise: Promise<any> | null = null;

const preloadWorldMap = async () => {
  if (!worldMapLoadingPromise) {
    worldMapLoadingPromise = import('./ui/world-map')
      .then(module => {
        worldMapModule = module;
        console.log('WorldMap preloaded successfully');
        return module;
      })
      .catch(error => {
        console.log('WorldMap preload failed:', error);
        return null;
      });
  }
  return worldMapLoadingPromise;
};

// Start preloading immediately (outside component)
preloadWorldMap();

// Use a non-lazy import for immediate access
const WorldMap = lazy(() => 
  worldMapModule 
    ? Promise.resolve(worldMapModule) 
    : import('./ui/world-map')
);

// Simple gradient background as fallback - This will show immediately
const GradientBackground = () => (
  <div className="absolute inset-0 bg-gradient-to-br from-marine-blue via-marine-dark to-marine-blue"></div>
);

// Optimized WorldMap placeholder - just the gradient
const WorldMapPlaceholder = () => <GradientBackground />;

// AuthModal Component
const AuthModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  mode: 'login' | 'signup';
  onSwitchMode: () => void;
  onSuccess: (userData: {
    email: string;
    name: string;
    type: 'researcher' | 'contributor' | 'admin';
    organization?: string;
    specialization?: string[];
  }) => void;
}> = ({ isOpen, onClose, mode, onSwitchMode, onSuccess }) => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    fullName: '',
    organization: '',
    userType: 'researcher' as 'researcher' | 'contributor',
    specialization: [] as string[]
  });
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const specializationOptions = [
    'Oceanography',
    'Marine Biology',
    'Fisheries Science',
    'Marine Ecology',
    'Climate Science',
    'Data Science',
    'Remote Sensing',
    'Conservation'
  ];

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.email) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email is invalid';
    }
    
    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }
    
    if (mode === 'signup') {
      if (!formData.fullName) {
        newErrors.fullName = 'Full name is required';
      }
      if (formData.password !== formData.confirmPassword) {
        newErrors.confirmPassword = 'Passwords do not match';
      }
      if (formData.userType === 'contributor' && !formData.organization) {
        newErrors.organization = 'Organization is required for data contributors';
      }
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;
    
    setIsLoading(true);
    
    try {
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      const userData = {
        email: formData.email,
        name: formData.fullName,
        type: formData.userType,
        organization: formData.organization || undefined,
        specialization: formData.specialization
      };
      
      console.log(`${mode} successful:`, userData);
      onSuccess(userData);
      onClose();
      
      setFormData({ 
        email: '', 
        password: '', 
        confirmPassword: '', 
        fullName: '', 
        organization: '',
        userType: 'researcher',
        specialization: []
      });
      setErrors({});
    } catch (error) {
      console.error('Auth error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const handleSpecializationChange = (specialization: string) => {
    setFormData(prev => ({
      ...prev,
      specialization: prev.specialization.includes(specialization)
        ? prev.specialization.filter(s => s !== specialization)
        : [...prev.specialization, specialization]
    }));
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <motion.div
          className="absolute inset-0 bg-black/80 backdrop-blur-sm"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
        />

        <motion.div
          className="relative bg-gray-900/95 backdrop-blur-sm border border-gray-700/50 rounded-2xl p-8 max-w-md w-full max-h-[90vh] overflow-y-auto"
          initial={{ opacity: 0, scale: 0.8, y: 50 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.8, y: 50 }}
          transition={{ type: "spring", damping: 25, stiffness: 300 }}
          onClick={(e) => e.stopPropagation()}
        >
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 text-gray-400 hover:text-white transition-colors duration-200"
          >
            <FiX className="w-6 h-6" />
          </button>

          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-marine-cyan/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <FiUser className="w-8 h-8 text-marine-cyan" />
            </div>
            <h2 className="text-2xl font-bold text-white mb-2">
              {mode === 'login' ? 'Welcome Back' : 'Join SAGAR'}
            </h2>
            <p className="text-gray-400">
              {mode === 'login' 
                ? 'Sign in to access your marine research projects' 
                : 'Create your research account to explore marine data'
              }
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {mode === 'signup' && (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Full Name *
                  </label>
                  <div className="relative">
                    <FiUser className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input
                      type="text"
                      value={formData.fullName}
                      onChange={(e) => handleInputChange('fullName', e.target.value)}
                      className={`w-full pl-10 pr-4 py-3 bg-gray-800/50 border rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-marine-cyan transition-colors ${
                        errors.fullName ? 'border-red-500' : 'border-gray-600'
                      }`}
                      placeholder="Enter your full name"
                    />
                  </div>
                  {errors.fullName && (
                    <p className="text-red-400 text-sm mt-1">{errors.fullName}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-3">
                    I want to join as:
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() => handleInputChange('userType', 'researcher')}
                      className={`p-4 border rounded-lg text-center transition-all ${
                        formData.userType === 'researcher'
                          ? 'border-marine-cyan bg-marine-cyan/10 text-marine-cyan'
                          : 'border-gray-600 bg-gray-800/30 text-gray-400 hover:border-gray-500'
                      }`}
                    >
                      <FiBarChart2 className="w-6 h-6 mx-auto mb-2" />
                      <div className="text-sm font-medium">Researcher</div>
                      <div className="text-xs opacity-80">Analyze Data</div>
                    </button>
                    
                    <button
                      type="button"
                      onClick={() => handleInputChange('userType', 'contributor')}
                      className={`p-4 border rounded-lg text-center transition-all ${
                        formData.userType === 'contributor'
                          ? 'border-marine-green bg-marine-green/10 text-marine-green'
                          : 'border-gray-600 bg-gray-800/30 text-gray-400 hover:border-gray-500'
                      }`}
                    >
                      <FiUpload className="w-6 h-6 mx-auto mb-2" />
                      <div className="text-sm font-medium">Data Contributor</div>
                      <div className="text-xs opacity-80">Share Data</div>
                    </button>
                  </div>
                </div>

                {formData.userType === 'contributor' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Organization *
                    </label>
                  <div className="relative">
                    <FiUsers className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input
                      type="text"
                      value={formData.organization}
                      onChange={(e) => handleInputChange('organization', e.target.value)}
                      className={`w-full pl-10 pr-4 py-3 bg-gray-800/50 border rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-marine-green transition-colors ${
                        errors.organization ? 'border-red-500' : 'border-gray-600'
                      }`}
                      placeholder="Your organization/institution"
                    />
                  </div>
                  {errors.organization && (
                    <p className="text-red-400 text-sm mt-1">{errors.organization}</p>
                  )}
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Research Specialization
                </label>
                <div className="flex flex-wrap gap-2">
                  {specializationOptions.map((spec) => (
                    <button
                      key={spec}
                      type="button"
                      onClick={() => handleSpecializationChange(spec)}
                      className={`px-3 py-2 text-sm rounded-lg border transition-all ${
                        formData.specialization.includes(spec)
                          ? 'bg-marine-cyan/20 border-marine-cyan text-marine-cyan'
                          : 'bg-gray-800/30 border-gray-600 text-gray-400 hover:border-gray-500'
                      }`}
                    >
                      {spec}
                    </button>
                  ))}
                </div>
              </div>
            </>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Email Address *
            </label>
            <div className="relative">
              <FiMail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="email"
                value={formData.email}
                onChange={(e) => handleInputChange('email', e.target.value)}
                className={`w-full pl-10 pr-4 py-3 bg-gray-800/50 border rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-marine-cyan transition-colors ${
                  errors.email ? 'border-red-500' : 'border-gray-600'
                }`}
                placeholder="Enter your email"
              />
            </div>
            {errors.email && (
              <p className="text-red-400 text-sm mt-1">{errors.email}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Password *
            </label>
            <div className="relative">
              <FiLock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="password"
                value={formData.password}
                onChange={(e) => handleInputChange('password', e.target.value)}
                className={`w-full pl-10 pr-4 py-3 bg-gray-800/50 border rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-marine-cyan transition-colors ${
                  errors.password ? 'border-red-500' : 'border-gray-600'
                }`}
                placeholder="Enter your password"
              />
            </div>
            {errors.password && (
              <p className="text-red-400 text-sm mt-1">{errors.password}</p>
            )}
          </div>

          {mode === 'signup' && (
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Confirm Password *
              </label>
              <div className="relative">
                <FiLock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="password"
                  value={formData.confirmPassword}
                  onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                  className={`w-full pl-10 pr-4 py-3 bg-gray-800/50 border rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-marine-cyan transition-colors ${
                    errors.confirmPassword ? 'border-red-500' : 'border-gray-600'
                  }`}
                  placeholder="Confirm your password"
                />
              </div>
              {errors.confirmPassword && (
                <p className="text-red-400 text-sm mt-1">{errors.confirmPassword}</p>
              )}
            </div>
          )}

          <button
            type="submit"
            disabled={isLoading}
            className={`w-full bg-gradient-to-r font-semibold py-3 px-6 rounded-lg hover:shadow-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2 ${
              formData.userType === 'contributor' 
                ? 'from-marine-green to-green-500 text-white hover:shadow-marine-green/25' 
                : 'from-marine-cyan to-marine-green text-marine-blue hover:shadow-marine-cyan/25'
            }`}
          >
            {isLoading ? (
              <>
                <div className={`w-5 h-5 border-2 rounded-full animate-spin ${
                  formData.userType === 'contributor' ? 'border-white border-t-transparent' : 'border-marine-blue border-t-transparent'
                }`} />
                <span>
                  {mode === 'login' 
                    ? 'Signing In...' 
                    : formData.userType === 'contributor' 
                      ? 'Creating Contributor Account...' 
                      : 'Creating Researcher Account...'
                  }
                </span>
              </>
            ) : (
              <>
                <span>
                  {mode === 'login' 
                    ? 'Sign In' 
                    : formData.userType === 'contributor' 
                      ? 'Create Contributor Account' 
                      : 'Create Researcher Account'
                  }
                </span>
                <FiArrowRight className="w-5 h-5" />
              </>
            )}
          </button>
        </form>

        <div className="text-center mt-6">
          <p className="text-gray-400">
            {mode === 'login' ? "Don't have an account? " : "Already have an account? "}
            <button
              onClick={onSwitchMode}
              className="text-marine-cyan hover:text-marine-green transition-colors font-semibold"
            >
              {mode === 'login' ? 'Sign up' : 'Sign in'}
            </button>
          </p>
        </div>
      </motion.div>
    </div>
  </AnimatePresence>
);
};

// FeatureCard Component
const FeatureCard: React.FC<{
  icon: React.ReactNode;
  title: string;
  description: string;
  delay: number;
  highlight?: boolean;
}> = ({ icon, title, description, delay, highlight = false }) => (
  <motion.div
    className={`backdrop-blur-sm border rounded-xl p-6 hover:transform hover:-translate-y-1 transition-all duration-300 ${
      highlight 
        ? 'bg-marine-green/5 border-marine-green/30 hover:border-marine-green/50' 
        : 'bg-white/5 border-white/10 hover:border-marine-cyan/30'
    }`}
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.5, delay }}
    whileHover={{ scale: 1.02 }}
  >
    <div className={`w-12 h-12 rounded-lg flex items-center justify-center mb-4 ${
      highlight ? 'bg-marine-green/20' : 'bg-marine-cyan/20'
    }`}>
      {icon}
    </div>
    <h3 className="text-xl font-semibold text-white mb-2">{title}</h3>
    <p className="text-gray-300 leading-relaxed">{description}</p>
  </motion.div>
);

// GettingStartedSection Component
const GettingStartedSection: React.FC = () => (
  <section id="getting-started" className="py-20 bg-gradient-to-b from-marine-blue to-marine-dark">
    <div className="max-w-6xl mx-auto px-6">
      <motion.div
        className="text-center mb-16"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h2 className="text-4xl font-bold text-white mb-4">
          Get Started with SAGAR
        </h2>
        <p className="text-xl text-gray-300 max-w-2xl mx-auto">
          Begin your marine research journey in three simple steps
        </p>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
        <motion.div
          className="text-center"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          <div className="w-20 h-20 bg-marine-cyan/20 rounded-full flex items-center justify-center mx-auto mb-6">
            <div className="w-12 h-12 bg-marine-cyan rounded-full flex items-center justify-center text-marine-blue font-bold text-xl">
              1
            </div>
          </div>
          <h3 className="text-xl font-semibold text-white mb-4">Create Account</h3>
          <p className="text-gray-300">
            Sign up as a Researcher or Data Contributor to join our marine science community.
          </p>
        </motion.div>

        <motion.div
          className="text-center"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <div className="w-20 h-20 bg-marine-cyan/20 rounded-full flex items-center justify-center mx-auto mb-6">
            <div className="w-12 h-12 bg-marine-cyan rounded-full flex items-center justify-center text-marine-blue font-bold text-xl">
              2
            </div>
          </div>
          <h3 className="text-xl font-semibold text-white mb-4">Choose Your Path</h3>
          <p className="text-gray-300">
            Explore data as a Researcher or contribute your datasets as a Data Contributor.
          </p>
        </motion.div>

        <motion.div
          className="text-center"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          <div className="w-20 h-20 bg-marine-cyan/20 rounded-full flex items-center justify-center mx-auto mb-6">
            <div className="w-12 h-12 bg-marine-cyan rounded-full flex items-center justify-center text-marine-blue font-bold text-xl">
              3
            </div>
          </div>
          <h3 className="text-xl font-semibold text-white mb-4">Collaborate & Discover</h3>
          <p className="text-gray-300">
            Join research projects, share findings, and advance marine science together.
          </p>
        </motion.div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <FeatureCard
          icon={<FiDatabase className="w-6 h-6 text-marine-cyan" />}
          title="Rich Data Sources"
          description="Access comprehensive marine datasets including ADCP, CTD, AWS, and species occurrence data from trusted sources."
          delay={0.4}
        />
        <FeatureCard
          icon={<FiBarChart2 className="w-6 h-6 text-marine-cyan" />}
          title="Advanced Analytics"
          description="Perform sophisticated analysis with AI-powered insights and customizable visualization tools."
          delay={0.5}
        />
        <FeatureCard
          icon={<FiUsers className="w-6 h-6 text-marine-cyan" />}
          title="Collaborative Research"
          description="Work together with researchers worldwide and share findings through our collaborative platform."
          delay={0.6}
        />
      </div>
    </div>
  </section>
);

// DataContributorSection Component
const DataContributorSection: React.FC<{ onBecomeContributor: () => void }> = ({ onBecomeContributor }) => (
  <section id="data-contributors" className="py-20 bg-gradient-to-b from-marine-dark to-marine-blue">
    <div className="max-w-6xl mx-auto px-6">
      <motion.div
        className="text-center mb-16"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="w-20 h-20 bg-marine-green/20 rounded-full flex items-center justify-center mx-auto mb-6">
          <FiUpload className="w-10 h-10 text-marine-green" />
        </div>
        <h2 className="text-4xl font-bold text-white mb-4">
          Become a Data Contributor
        </h2>
        <p className="text-xl text-gray-300 max-w-2xl mx-auto">
          Share your marine data with the global research community and get recognition for your contributions
        </p>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center mb-16">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <h3 className="text-2xl font-bold text-white mb-6">Why Contribute Data?</h3>
          
          <div className="space-y-6">
            <div className="flex items-start space-x-4">
              <div className="w-8 h-8 bg-marine-green/20 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                <FiAward className="w-4 h-4 text-marine-green" />
              </div>
              <div>
                <h4 className="text-lg font-semibold text-white mb-2">Get Recognition</h4>
                <p className="text-gray-300">
                  Receive proper attribution and citations for your data contributions. Build your reputation in the marine science community.
                </p>
              </div>
            </div>

            <div className="flex items-start space-x-4">
              <div className="w-8 h-8 bg-marine-green/20 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                <FiTrendingUp className="w-4 h-4 text-marine-green" />
              </div>
              <div>
                <h4 className="text-lg font-semibold text-white mb-2">Accelerate Research</h4>
                <p className="text-gray-300">
                  Your data helps advance marine science globally. Enable new discoveries and support conservation efforts.
                </p>
              </div>
            </div>

            <div className="flex items-start space-x-4">
              <div className="w-8 h-8 bg-marine-green/20 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                <FiShield className="w-4 h-4 text-marine-green" />
              </div>
              <div>
                <h4 className="text-lg font-semibold text-white mb-2">Data Preservation</h4>
                <p className="text-gray-300">
                  Ensure your valuable research data is preserved, standardized, and accessible for future generations.
                </p>
              </div>
            </div>

            <div className="flex items-start space-x-4">
              <div className="w-8 h-8 bg-marine-green/20 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                <FiUsers className="w-4 h-4 text-marine-green" />
              </div>
              <div>
                <h4 className="text-lg font-semibold text-white mb-2">Join the Community</h4>
                <p className="text-gray-300">
                  Connect with other data contributors and researchers. Collaborate on projects and share best practices.
                </p>
              </div>
            </div>
          </div>
        </motion.div>

        <motion.div
          className="bg-white/5 backdrop-blur-sm border border-marine-green/30 rounded-2xl p-8"
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
        >
          <h3 className="text-2xl font-bold text-white mb-6">Data You Can Contribute</h3>
          
          <div className="space-y-4 mb-8">
            <div className="flex items-center justify-between p-4 bg-marine-green/10 rounded-lg border border-marine-green/20">
              <div className="flex items-center space-x-3">
                <FiDatabase className="w-5 h-5 text-marine-green" />
                <span className="text-white font-medium">Oceanographic Data</span>
              </div>
              <span className="text-marine-green text-sm">CTD, ADCP, etc.</span>
            </div>

            <div className="flex items-center justify-between p-4 bg-marine-green/10 rounded-lg border border-marine-green/20">
              <div className="flex items-center space-x-3">
                <FiGlobe className="w-5 h-5 text-marine-green" />
                <span className="text-white font-medium">Species Observations</span>
              </div>
              <span className="text-marine-green text-sm">Marine biodiversity</span>
            </div>

            <div className="flex items-center justify-between p-4 bg-marine-green/10 rounded-lg border border-marine-green/20">
              <div className="flex items-center space-x-3">
                <FiBarChart2 className="w-5 h-5 text-marine-green" />
                <span className="text-white font-medium">Environmental Data</span>
              </div>
              <span className="text-marine-green text-sm">Temperature, salinity</span>
            </div>

            <div className="flex items-center justify-between p-4 bg-marine-green/10 rounded-lg border border-marine-green/20">
              <div className="flex items-center space-x-3">
                <FiCalendar className="w-5 h-5 text-marine-green" />
                <span className="text-white font-medium">Time Series Data</span>
              </div>
              <span className="text-marine-green text-sm">Long-term monitoring</span>
            </div>
          </div>

          <button
            onClick={onBecomeContributor}
            className="w-full bg-gradient-to-r from-marine-green to-green-500 text-white font-semibold py-4 px-6 rounded-lg hover:shadow-lg hover:shadow-marine-green/25 transition-all duration-200 flex items-center justify-center space-x-2"
          >
            <FiUpload className="w-5 h-5" />
            <span>Become a Data Contributor</span>
          </button>

          <p className="text-gray-400 text-sm text-center mt-4">
            Join 150+ organizations already contributing data
          </p>
        </motion.div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <FeatureCard
          icon={<FiUpload className="w-6 h-6 text-marine-green" />}
          title="Easy Data Upload"
          description="Use our automated ingestion pipeline to upload data in multiple formats with built-in validation and standardization."
          delay={0.6}
          highlight={true}
        />
        <FeatureCard
          icon={<FiShield className="w-6 h-6 text-marine-green" />}
          title="Data Quality Control"
          description="Our system automatically validates, cleans, and standardizes your data to ensure research-ready quality."
          delay={0.7}
          highlight={true}
        />
        <FeatureCard
          icon={<FiAward className="w-6 h-6 text-marine-green" />}
          title="Recognition & Impact"
          description="Get proper attribution, track your data's usage, and see the impact of your contributions on marine research."
          delay={0.8}
          highlight={true}
        />
      </div>
    </div>
  </section>
);

// Main LandingPage Component
interface LandingPageProps {
  onEnter: () => void;
  onUserLogin: (userData: {
    email: string;
    name: string;
    type: 'researcher' | 'contributor' | 'admin';
    organization?: string;
    specialization?: string[];
  }) => void;
}

const LandingPage: React.FC<LandingPageProps> = ({ onEnter, onUserLogin }) => {
  const titleRef = useRef<HTMLHeadingElement>(null);
  const subtitleRef = useRef<HTMLParagraphElement>(null);
  const ctaRef = useRef<HTMLButtonElement>(null);
  const [authModal, setAuthModal] = useState<{ isOpen: boolean; mode: 'login' | 'signup' }>({
    isOpen: false,
    mode: 'login'
  });
  const [isLoading, setIsLoading] = useState(true);
  const [backgroundLoaded, setBackgroundLoaded] = useState(false);

  // Single initialization effect
  useEffect(() => {
    console.log('App initialization started');
    
    // Start preloading WorldMap if not already done
    preloadWorldMap();
    
    // Show content immediately with gradient background
    setBackgroundLoaded(true);
    
    // Hide loader after minimum time (1 second for smooth UX)
    const timer = setTimeout(() => {
      setIsLoading(false);
      console.log('Loader hidden, content visible');
    }, 500);

    return () => clearTimeout(timer);
  }, []);

  const handleLoaderFinish = () => {
    setIsLoading(false);
  };

  // Animation effects after load
  useEffect(() => {
    if (!isLoading && backgroundLoaded) {
      const title = titleRef.current;
      const subtitle = subtitleRef.current;
      const cta = ctaRef.current;

      if (!title || !subtitle || !cta) return;

      title.animate([
        { transform: 'translateY(20px)', opacity: 0 },
        { transform: 'translateY(0)', opacity: 1 }
      ], { duration: 700, easing: 'ease-out', fill: 'forwards' });

      subtitle.animate([
        { transform: 'translateY(20px)', opacity: 0 },
        { transform: 'translateY(0)', opacity: 1 }
      ], { duration: 600, delay: 300, easing: 'ease-out', fill: 'forwards' });

      cta.animate([
        { transform: 'scale(0.9)', opacity: 0 },
        { transform: 'scale(1)', opacity: 1 }
      ], { duration: 500, delay: 550, easing: 'ease-out', fill: 'forwards' });
    }
  }, [isLoading, backgroundLoaded]);

  const openAuthModal = (mode: 'login' | 'signup') => {
    setAuthModal({ isOpen: true, mode });
  };

  const closeAuthModal = () => {
    setAuthModal({ isOpen: false, mode: 'login' });
  };

  const switchAuthMode = () => {
    setAuthModal(prev => ({
      isOpen: true,
      mode: prev.mode === 'login' ? 'signup' : 'login'
    }));
  };

  const handleAuthSuccess = (userData: any) => {
    onUserLogin(userData);
    onEnter();
  };

  const handleBecomeContributor = () => {
    openAuthModal('signup');
  };

  return (
    <>
      <LoaderOverlay 
        visible={isLoading} 
        onFinish={handleLoaderFinish}
        durationMs={500}
      />

      {(!isLoading || backgroundLoaded) && (
        <div className="min-h-screen text-white overflow-hidden relative">
          {/* Background layer - Renders immediately */}
          <div className="fixed inset-0 z-0">
            {/* Always show gradient background immediately */}
            <GradientBackground />
            
            {/* WorldMap loads on top of gradient, seamlessly */}
            <div className="absolute inset-0 opacity-70">
              <Suspense fallback={null}>
                <WorldMap />
              </Suspense>
            </div>
          </div>

          {/* Main content - Shows immediately with background */}
          <div className="relative z-10">
            <header className="relative">
              <div className="max-w-7xl mx-auto px-6 py-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 rounded-lg flex items-center justify-center overflow-hidden bg-marine-cyan/20">
                      <img 
                        src="/WhatsApp Image 2025-09-29 at 03.04.02.jpeg" 
                        alt="SAGAR Logo" 
                        className="w-8 h-8 object-contain"
                        loading="eager"
                      />
                    </div>
                    <span className="text-2xl font-bold">SAGAR</span>
                  </div>

                  <nav className="hidden md:flex items-center space-x-8">
                    <a href="#features" className="text-gray-300 hover:text-white transition-colors">
                      Features
                    </a>
                    <a href="#getting-started" className="text-gray-300 hover:text-white transition-colors">
                      Getting Started
                    </a>
                    <a href="#data-contributors" className="text-gray-300 hover:text-marine-green transition-colors">
                      Data Contributors
                    </a>
                  </nav>

                  <div className="flex items-center space-x-4">
                    <button 
                      onClick={() => openAuthModal('login')}
                      className="px-4 py-2 text-gray-300 hover:text-white transition-colors hidden sm:block"
                    >
                      Sign In
                    </button>
                    <button 
                      onClick={() => openAuthModal('signup')}
                      className="px-6 py-2 bg-marine-cyan text-marine-blue font-semibold rounded-lg hover:shadow-lg hover:shadow-marine-cyan/25 transition-all"
                    >
                      Get Started
                    </button>
                  </div>
                </div>
              </div>
            </header>

            <main>
              <section className="pt-20 pb-32">
                <div className="max-w-5xl mx-auto px-6 text-center">
                  <h1 ref={titleRef} className="text-5xl md:text-6xl font-extrabold tracking-tight mb-6" style={{ transform: 'translateY(20px)', opacity: 0 }}>
                    SAGAR
                  </h1>
                  <p ref={subtitleRef} className="text-xl md:text-2xl text-gray-300 mb-8" style={{ transform: 'translateY(20px)', opacity: 0 }}>
                    Spatio-temporal Analytics Gateway for Aquatic Resources
                  </p>
                  <p className="text-lg text-gray-400 max-w-2xl mx-auto mb-12">
                    Advanced platform for marine research, data analysis, and collaborative science. 
                    Explore species distributions, oceanographic data, and conduct cutting-edge research.
                  </p>
                  
                  <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16">
                    <button
                      ref={ctaRef}
                      onClick={() => openAuthModal('signup')}
                      className="px-8 py-4 bg-gradient-to-r from-marine-cyan to-marine-green text-marine-blue font-semibold rounded-lg hover:shadow-lg hover:shadow-marine-cyan/25 transition-all flex items-center space-x-2"
                      style={{ transform: 'scale(0.9)', opacity: 0 }}
                    >
                      <span>Start Your Research</span>
                      <FiArrowRight className="w-5 h-5" />
                    </button>
                    
                    <button
                      onClick={handleBecomeContributor}
                      className="px-8 py-4 bg-marine-green/20 border border-marine-green/30 text-marine-green rounded-lg hover:bg-marine-green/30 transition-all flex items-center space-x-2"
                    >
                      <FiUpload className="w-5 h-5" />
                      <span>Contribute Data</span>
                    </button>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-2xl mx-auto">
                    <motion.div
                      className="text-center"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.5, delay: 0.7 }}
                    >
                      <div className="text-2xl font-bold text-marine-cyan mb-1">
                        250K+
                      </div>
                      <div className="text-sm text-gray-400">Data Points</div>
                    </motion.div>
                    <motion.div
                      className="text-center"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.5, delay: 0.8 }}
                    >
                      <div className="text-2xl font-bold text-marine-cyan mb-1">
                        150+
                      </div>
                      <div className="text-sm text-gray-400">Data Contributors</div>
                    </motion.div>
                    <motion.div
                      className="text-center"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.5, delay: 0.9 }}
                    >
                      <div className="text-2xl font-bold text-marine-cyan mb-1">
                        50+
                      </div>
                      <div className="text-sm text-gray-400">Research Projects</div>
                    </motion.div>
                    <motion.div
                      className="text-center"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.5, delay: 1.0 }}
                    >
                      <div className="text-2xl font-bold text-marine-cyan mb-1">
                        24/7
                      </div>
                      <div className="text-sm text-gray-400">Data Access</div>
                    </motion.div>
                  </div>
                </div>
              </section>

              <GettingStartedSection />
              <DataContributorSection onBecomeContributor={handleBecomeContributor} />
            </main>

            <footer className="bg-marine-dark/90 border-t border-white/10 py-12 backdrop-blur-sm">
              <div className="max-w-6xl mx-auto px-6">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                  <div>
                    <div className="flex items-center space-x-2 mb-4">
                      <div className="w-8 h-8 rounded-lg flex items-center justify-center overflow-hidden bg-marine-cyan/20">
                        <img 
                          src="/WhatsApp Image 2025-09-29 at 03.04.02.jpeg" 
                          alt="SAGAR Logo" 
                          className="w-6 h-6 object-contain"
                          loading="eager"
                        />
                      </div>
                      <span className="text-xl font-bold">SAGAR</span>
                    </div>
                    <p className="text-gray-400 text-sm">
                      Advancing marine research through collaborative data analytics and visualization.
                    </p>
                  </div>
                  
                  <div>
                    <h4 className="text-white font-semibold mb-4">Platform</h4>
                    <ul className="space-y-2 text-sm text-gray-400">
                      <li><a href="#features" className="hover:text-marine-cyan transition-colors">Features</a></li>
                      <li><a href="#getting-started" className="hover:text-marine-cyan transition-colors">Getting Started</a></li>
                      <li><a href="#data-contributors" className="hover:text-marine-green transition-colors">Data Contributors</a></li>
                      <li><a href="#" className="hover:text-marine-cyan transition-colors">API</a></li>
                    </ul>
                  </div>
                  
                  <div>
                    <h4 className="text-white font-semibold mb-4">Resources</h4>
                    <ul className="space-y-2 text-sm text-gray-400">
                      <li><a href="#" className="hover:text-marine-cyan transition-colors">Data Sources</a></li>
                      <li><a href="#" className="hover:text-marine-cyan transition-colors">Research Papers</a></li>
                      <li><a href="#" className="hover:text-marine-cyan transition-colors">Tutorials</a></li>
                      <li><a href="#" className="hover:text-marine-cyan transition-colors">Community</a></li>
                    </ul>
                  </div>
                  
                  <div>
                    <h4 className="text-white font-semibold mb-4">Connect</h4>
                    <ul className="space-y-2 text-sm text-gray-400">
                      <li><a href="#" className="hover:text-marine-cyan transition-colors">Contact Us</a></li>
                      <li><a href="#" className="hover:text-marine-cyan transition-colors">Support</a></li>
                      <li><a href="#" className="hover:text-marine-cyan transition-colors">GitHub</a></li>
                      <li><a href="#" className="hover:text-marine-cyan transition-colors">Twitter</a></li>
                    </ul>
                  </div>
                </div>
                
                <div className="border-t border-white/10 mt-8 pt-8 text-center text-gray-400 text-sm">
                  <p>&copy; 2025 SAGAR - Spatio-temporal Analytics Gateway for Aquatic Resources. All rights reserved.</p>
                </div>
              </div>
            </footer>

            <AuthModal
              isOpen={authModal.isOpen}
              onClose={closeAuthModal}
              mode={authModal.mode}
              onSwitchMode={switchAuthMode}
              onSuccess={handleAuthSuccess}
            />
          </div>
        </div>
      )}
    </>
  );
};

export default LandingPage;