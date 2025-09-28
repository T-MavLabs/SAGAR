import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { FiPlus, FiLogOut, FiHome, FiInfo, FiDatabase, FiDollarSign } from 'react-icons/fi';
import ProjectCard from './ProjectCard';
import { Project } from '../App';
import { supabase } from '../services/supabaseClient';

interface DashboardProps {
  onProjectSelect: (project: Project) => void;
  onNavigateToAPI: () => void;
}

const Dashboard: React.FC<DashboardProps> = ({ onProjectSelect, onNavigateToAPI }) => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [isLoadingProjects, setIsLoadingProjects] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formTitle, setFormTitle] = useState('');
  const [formDescription, setFormDescription] = useState('');
  const [formWaterBody, setFormWaterBody] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

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
              <div className="w-8 h-8 bg-marine-cyan rounded-lg flex items-center justify-center">
                <span className="text-marine-blue font-bold text-sm">CM</span>
              </div>
              <span className="text-xl font-bold text-white">SAGAR</span>
            </motion.div>

            {/* Navigation */}
            <nav className="hidden md:flex items-center space-x-8">
              {[
                { name: 'Home', icon: FiHome, href: '#', onClick: undefined, isExternal: false },
                { name: 'Data Sources', icon: FiDatabase, href: 'https://sagar-data-ingestion.vercel.app/', onClick: undefined, isExternal: true },
                { name: 'API Documentation', icon: FiDollarSign, href: '#', onClick: onNavigateToAPI, isExternal: false }
              ].map((item, index) => (
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
                    className="flex items-center space-x-2 text-gray-300 hover:text-marine-cyan transition-colors duration-200"
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                  >
                    <item.icon className="w-4 h-4" />
                    <span>{item.name}</span>
                  </motion.button>
                )
              ))}
            </nav>

            {/* User Info & Logout */}
            <motion.div 
              className="flex items-center space-x-4"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5 }}
            >
              <span className="text-sm text-gray-300">Welcome, Dr. Vinu</span>
              <button className="flex items-center space-x-2 px-4 py-2 bg-red-600/20 hover:bg-red-600/30 border border-red-500/30 rounded-lg transition-colors duration-200">
                <FiLogOut className="w-4 h-4" />
                <span>Logout</span>
              </button>
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
    </div>
  );
};

export default Dashboard;
