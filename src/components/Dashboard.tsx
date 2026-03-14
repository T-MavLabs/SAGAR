import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiPlus, FiArrowLeft, FiHome, FiInfo, FiDatabase, FiDollarSign, FiX, FiGlobe, FiAward } from 'react-icons/fi';
import ProjectCard from './ProjectCard';
import { Project } from '../App';
import { supabase } from '../services/supabaseClient';

interface DashboardProps {
  onProjectSelect: (project: Project) => void;
  onNavigateToAPI: () => void;
  onNavigateToDataSources: () => void;
  onNavigateToLanding?: () => void;
}

const Dashboard: React.FC<DashboardProps> = ({ onProjectSelect, onNavigateToAPI, onNavigateToDataSources, onNavigateToLanding }) => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [isLoadingProjects, setIsLoadingProjects] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formTitle, setFormTitle] = useState('');
  const [formDescription, setFormDescription] = useState('');
  const [formWaterBody, setFormWaterBody] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [isAboutOpen, setIsAboutOpen] = useState(false);

  const openModal = () => setIsModalOpen(true);
  const closeModal = () => {
    if (isSaving) return;
    setIsModalOpen(false);
    setFormTitle('');
    setFormDescription('');
    setFormWaterBody('');
    setError(null);
  };

  const handleCreateProject = async () => {
    if (!formTitle.trim()) {
      setError('Title is required');
      return;
    }
    setIsSaving(true);
    setError(null);
    try {
      // Insert into Supabase 'projects' table (id serial/uuid default)
      const { data, error: dbError } = await supabase
        .from('projects')
        .insert([
          {
            title: formTitle,
            description: formDescription,
            water_body: formWaterBody,
            progress: 0,
            date: new Date().toISOString().slice(0, 10)
          }
        ])
        .select()
        .single();

      if (dbError) throw dbError;

      // Update local list for immediate UX
      const newProject: Project = {
        id: String((data as any).id ?? crypto.randomUUID()),
        title: (data as any).title ?? formTitle,
        description: (data as any).description ?? formDescription,
        date: (data as any).date ?? new Date().toISOString().slice(0, 10),
        tags: ['New'],
        progress: (data as any).progress ?? 0,
        waterBody: (data as any).water_body ?? formWaterBody
      };
      setProjects(prev => [newProject, ...prev]);
      closeModal();
    } catch (e: any) {
      setError(e.message || 'Failed to create project');
    } finally {
      setIsSaving(false);
    }
  };

  // Load projects from Supabase on mount
  useEffect(() => {
    const load = async () => {
      setIsLoadingProjects(true);
      setLoadError(null);
      try {
        const { data, error } = await supabase
          .from('projects')
          .select('id, title, description, water_body, progress, date')
          .order('date', { ascending: false });
        if (error) throw error;
        const mapped: Project[] = (data || []).map((p: any) => ({
          id: String(p.id),
          title: p.title,
          description: p.description ?? '',
          date: p.date ?? new Date().toISOString().slice(0, 10),
          tags: ['Project'],
          progress: Number(p.progress ?? 0),
          waterBody: p.water_body ?? ''
        }));
        setProjects(mapped);
      } catch (e: any) {
        setLoadError(e.message || 'Failed to load projects');
      } finally {
        setIsLoadingProjects(false);
      }
    };
    load();
  }, []);

  return (
    <div className="min-h-screen bg-marine-blue">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-marine-blue/95 backdrop-blur-sm border-b border-marine-cyan/20">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <motion.div 
              className="flex items-center space-x-2"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5 }}
            >
              <div className="w-8 h-8 rounded-lg flex items-center justify-center overflow-hidden">
                <img 
                  src="/WhatsApp Image 2025-09-29 at 03.04.02.jpeg" 
                  alt="SAGAR Logo" 
                  className="w-full h-full object-contain"
                />
              </div>
              <span className="text-xl font-bold text-white">SAGAR</span>
            </motion.div>

            {/* Navigation */}
            <nav className="hidden md:flex items-center space-x-8">
              {(() => {
                // Get user role from localStorage
                const userRole = localStorage.getItem('sagar:role') || '';
                
                // Allowed roles that can see Data Sources
                const allowedRoles = ['principal_scientist', 'senior_scientist', 'scientist', 'junior_scientist'];
                const canAccessDataSources = allowedRoles.includes(userRole);
                
                // Build navigation items array
                const navItems = [
                  { name: 'Home', icon: FiHome, href: '#', onClick: undefined, isExternal: false, active: true },
                  ...(canAccessDataSources ? [{ name: 'Data Sources', icon: FiDatabase, href: 'https://data-ingestion-frontend-sagar.netlify.app/', onClick: undefined, isExternal: true }] : []),
                  { name: 'API Documentation', icon: FiDollarSign, href: '#', onClick: onNavigateToAPI, isExternal: false }
                ];
                
                return navItems;
              })().map((item, index) => (
                item.isExternal ? (
                  <motion.a
                    key={item.name}
                    href={item.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center space-x-2 text-gray-300 hover:text-marine-cyan transition-colors duration-200"
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                  >
                    <item.icon className="w-4 h-4" />
                    <span>{item.name}</span>
                  </motion.a>
                ) : (
                  <motion.button
                    key={item.name}
                    onClick={item.onClick}
                    className={`flex items-center space-x-2 transition-colors duration-200 ${
                      item.active 
                        ? 'text-marine-cyan' 
                        : 'text-gray-300 hover:text-marine-cyan'
                    }`}
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                  >
                    <item.icon className="w-4 h-4" />
                    <span>{item.name}</span>
                  </motion.button>
                )
              ))}
              
              <button
                onClick={() => setIsAboutOpen(true)}
                className="flex items-center space-x-2 text-gray-300 hover:text-marine-cyan transition-colors duration-200"
              >
                <FiInfo className="w-4 h-4" />
                <span>About</span>
              </button>
            </nav>

            {/* User Info & Back Button */}
            <motion.div 
              className="flex items-center space-x-4"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5 }}
            >
              <span className="text-sm text-gray-300">Welcome, Dr. Vinu</span>
              {onNavigateToLanding && (
                <button 
                  onClick={onNavigateToLanding}
                  className="flex items-center space-x-2 px-4 py-2 bg-marine-cyan/20 hover:bg-marine-cyan/30 border border-marine-cyan/30 rounded-lg transition-colors duration-200 text-white"
                >
                  <FiArrowLeft className="w-4 h-4" />
                  <span>Back</span>
                </button>
              )}
            </motion.div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="pt-24 px-6">
        <div className="max-w-7xl mx-auto">
          {/* Page Header */}
          <motion.div 
            className="flex items-center justify-between mb-8"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <h1 className="text-4xl font-bold text-white">
              Manage your Marine Research Projects
            </h1>
            <motion.button
              onClick={openModal}
              className="flex items-center space-x-2 px-6 py-3 bg-marine-cyan text-marine-blue font-semibold rounded-lg hover:shadow-lg hover:shadow-marine-cyan/25 transition-all duration-200"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <FiPlus className="w-5 h-5" />
              <span>New Project</span>
            </motion.button>
          </motion.div>

          {/* Projects Grid / Empty / Loading */}
          {isLoadingProjects ? (
            <div className="py-16 text-center text-gray-400">Loading projects...</div>
          ) : loadError ? (
            <div className="py-16 text-center text-red-400">{loadError}</div>
          ) : projects.length === 0 ? (
            <div className="py-16 text-center text-gray-400">No projects yet. Create your first project.</div>
          ) : (
            <motion.div 
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.4 }}
            >
              {projects.map((project, index) => (
                <motion.div
                  key={project.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.1 * index }}
                >
                  <ProjectCard 
                    project={project} 
                    onSelect={() => onProjectSelect(project)}
                  />
                </motion.div>
              ))}
            </motion.div>
          )}
        </div>
      </main>

      {/* New Project Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[100] bg-black/70 flex items-center justify-center p-4">
          <div className="w-full max-w-lg bg-gray-900 border border-gray-700 rounded-xl p-6">
            <h2 className="text-xl font-semibold text-white mb-4">Create New Project</h2>
            {error && (
              <div className="mb-3 text-sm text-red-400">{error}</div>
            )}
            <div className="space-y-4">
              <div>
                <label className="block text-xs text-gray-400 mb-1">Title</label>
                <input
                  value={formTitle}
                  onChange={(e) => setFormTitle(e.target.value)}
                  className="w-full px-3 py-2 bg-gray-800/50 border border-gray-700 rounded text-white focus:border-marine-cyan focus:outline-none"
                  placeholder="e.g., Andaman Deep Sea Survey"
                />
              </div>
              <div>
                <label className="block text-xs text-gray-400 mb-1">Description</label>
                <textarea
                  value={formDescription}
                  onChange={(e) => setFormDescription(e.target.value)}
                  className="w-full px-3 py-2 bg-gray-800/50 border border-gray-700 rounded text-white focus:border-marine-cyan focus:outline-none"
                  placeholder="Short description"
                  rows={3}
                />
              </div>
              <div>
                <label className="block text-xs text-gray-400 mb-1">Water Body</label>
                <input
                  value={formWaterBody}
                  onChange={(e) => setFormWaterBody(e.target.value)}
                  className="w-full px-3 py-2 bg-gray-800/50 border border-gray-700 rounded text-white focus:border-marine-cyan focus:outline-none"
                  placeholder="e.g., Andaman Sea"
                />
              </div>
            </div>
            <div className="mt-6 flex items-center justify-end gap-3">
              <button
                onClick={closeModal}
                disabled={isSaving}
                className="px-4 py-2 rounded border border-gray-600 text-gray-200 hover:bg-gray-800 disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={handleCreateProject}
                disabled={isSaving}
                className="px-4 py-2 rounded bg-marine-cyan text-marine-blue font-semibold hover:opacity-90 disabled:opacity-50"
              >
                {isSaving ? 'Creating...' : 'Create Project'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* About Modal */}
      <AnimatePresence>
        {isAboutOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/70 backdrop-blur-sm"
              onClick={() => setIsAboutOpen(false)}
            />
            <motion.div 
              className="relative w-full max-w-2xl bg-gray-900 border border-marine-cyan/30 rounded-2xl shadow-2xl overflow-hidden"
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              transition={{ duration: 0.3 }}
            >
              {/* Modal Header */}
              <div className="relative h-32 bg-gradient-to-r from-marine-blue to-marine-teal/30 p-8 flex items-end">
                <div className="absolute top-4 right-4">
                  <button
                    onClick={() => setIsAboutOpen(false)}
                    className="p-2 text-white/50 hover:text-white bg-black/20 hover:bg-black/40 rounded-full transition-colors"
                  >
                    <FiX className="w-5 h-5" />
                  </button>
                </div>
                <div className="flex items-center space-x-4">
                  <div className="w-16 h-16 rounded-xl overflow-hidden shadow-xl border-2 border-marine-cyan/50 bg-black">
                    <img 
                      src="/WhatsApp Image 2025-09-29 at 03.04.02.jpeg" 
                      alt="SAGAR Logo" 
                      className="w-full h-full object-contain"
                    />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-white">About SAGAR</h2>
                    <p className="text-marine-cyan text-sm font-medium">Spatio-temporal Analytics Gateway for Aquatic Resources</p>
                  </div>
                </div>
              </div>

              {/* Modal Content */}
              <div className="p-8 space-y-8">
                {/* Platform Description */}
                <div>
                  <h3 className="text-lg font-semibold text-white mb-3 flex items-center">
                    <FiGlobe className="w-5 h-5 mr-2 text-marine-cyan" />
                    Platform Overview
                  </h3>
                  <p className="text-gray-300 leading-relaxed text-sm">
                    SAGAR is a comprehensive, cloud-native platform designed to revolutionize marine biological research. 
                    By integrating advanced data processing engines, Retrieval-Augmented Generation (RAG) capabilities, 
                    and specialized AI/ML services, we provide researchers with powerful tools to analyze, visualize, 
                    and understand oceanographic data and marine biodiversity patterns.
                  </p>
                </div>

                {/* Data Sources & Acknowledgements */}
                <div>
                  <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
                    <FiAward className="w-5 h-5 mr-2 text-marine-cyan" />
                    Data Sources & Acknowledgements
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-gray-800/50 rounded-lg p-4 border border-gray-700/50 hover:border-marine-cyan/30 transition-colors">
                      <div className="flex items-start justify-between mb-2">
                        <h4 className="font-medium text-white">CLMRE</h4>
                        <span className="text-xs px-2 py-0.5 bg-blue-500/20 text-blue-400 rounded-full">Partner</span>
                      </div>
                      <p className="text-xs text-gray-400 mb-2">Centre for Learning in Marine and Earth Sciences</p>
                      <ul className="text-xs text-gray-300 space-y-1 list-disc list-inside">
                        <li>ADCP (Acoustic Doppler Current Profiler) Data</li>
                        <li>AWS (Automatic Weather Station) Data</li>
                        <li>CTD (Conductivity, Temperature, Depth) Data</li>
                      </ul>
                    </div>

                    <div className="bg-gray-800/50 rounded-lg p-4 border border-gray-700/50 hover:border-marine-cyan/30 transition-colors">
                      <div className="flex items-start justify-between mb-2">
                        <h4 className="font-medium text-white">GBIF</h4>
                        <span className="text-xs px-2 py-0.5 bg-green-500/20 text-green-400 rounded-full">Global</span>
                      </div>
                      <p className="text-xs text-gray-400 mb-2">Global Biodiversity Information Facility</p>
                      <p className="text-xs text-gray-300">
                        Primary source for marine species occurrence records and taxonomic backbones.
                      </p>
                    </div>

                    <div className="bg-gray-800/50 rounded-lg p-4 border border-gray-700/50 hover:border-marine-cyan/30 transition-colors">
                      <div className="flex items-start justify-between mb-2">
                        <h4 className="font-medium text-white">NOAA</h4>
                        <span className="text-xs px-2 py-0.5 bg-blue-500/20 text-blue-400 rounded-full">Agency</span>
                      </div>
                      <p className="text-xs text-gray-400 mb-2">National Oceanic and Atmospheric Administration</p>
                      <p className="text-xs text-gray-300">
                        Oceanographic datasets, bathymetry, and marine environmental data references.
                      </p>
                    </div>

                    <div className="bg-gray-800/50 rounded-lg p-4 border border-gray-700/50 hover:border-marine-cyan/30 transition-colors">
                      <div className="flex items-start justify-between mb-2">
                        <h4 className="font-medium text-white">IUCN</h4>
                        <span className="text-xs px-2 py-0.5 bg-red-500/20 text-red-400 rounded-full">Conservation</span>
                      </div>
                      <p className="text-xs text-gray-400 mb-2">International Union for Conservation of Nature</p>
                      <p className="text-xs text-gray-300">
                        Red List data for species conservation status and threat assessments.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Footer */}
                <div className="pt-6 border-t border-gray-700 text-center">
                  <p className="text-xs text-gray-500">
                    Developed with ❤️ for the marine research community.
                  </p>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Dashboard;
