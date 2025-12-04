import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { FiPlus, FiLogOut, FiHome, FiDatabase, FiDollarSign, FiUsers, FiUserPlus, FiX, FiAlertCircle, FiCheckCircle, FiClock } from 'react-icons/fi';
import ProjectCard from './ProjectCard';
import { Project } from '../App';
import { supabase } from '../services/supabaseClient';

interface DashboardProps {
  onProjectSelect: (project: Project) => void;
  onNavigateToAPI: () => void;
  onNavigateToDataSources: () => void;
  onNavigateToDataContributor: () => void;
  onLogout?: () => void;
}

interface ProjectMember {
  id: string;
  email: string;
  role: string;
  name?: string;
}

interface EnhancedProject extends Project {
  priority?: 'high' | 'medium' | 'low';
  status?: 'completed' | 'in-progress' | 'not-started';
}

const Dashboard: React.FC<DashboardProps> = ({ 
  onProjectSelect, 
  onNavigateToAPI, 
  onNavigateToDataSources, 
  onNavigateToDataContributor,
  onLogout 
}) => {
  const [projects, setProjects] = useState<EnhancedProject[]>([]);
  const [isLoadingProjects, setIsLoadingProjects] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formTitle, setFormTitle] = useState('');
  const [formDescription, setFormDescription] = useState('');
  const [formWaterBody, setFormWaterBody] = useState('');
  const [formPriority, setFormPriority] = useState<'high' | 'medium' | 'low'>('medium');
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Member management state
  const [selectedProject, setSelectedProject] = useState<EnhancedProject | null>(null);
  const [isMemberModalOpen, setIsMemberModalOpen] = useState(false);
  const [newMemberEmail, setNewMemberEmail] = useState('');
  const [newMemberRole, setNewMemberRole] = useState('Researcher');
  const [projectMembers, setProjectMembers] = useState<{ [key: string]: ProjectMember[] }>({});
  const [isAddingMember, setIsAddingMember] = useState(false);

  const openModal = () => setIsModalOpen(true);
  const closeModal = () => {
    if (isSaving) return;
    setIsModalOpen(false);
    setFormTitle('');
    setFormDescription('');
    setFormWaterBody('');
    setFormPriority('medium');
    setError(null);
  };

  const openMemberModal = (project: EnhancedProject) => {
    setSelectedProject(project);
    setIsMemberModalOpen(true);
    // Load members for this project if not already loaded
    if (!projectMembers[project.id]) {
      loadProjectMembers(project.id);
    }
  };

  const closeMemberModal = () => {
    setIsMemberModalOpen(false);
    setSelectedProject(null);
    setNewMemberEmail('');
    setNewMemberRole('Researcher');
  };

  const loadProjectMembers = async (projectId: string) => {
    try {
      const { data, error } = await supabase
        .from('project_members')
        .select('*')
        .eq('project_id', projectId);

      if (error) throw error;

      setProjectMembers(prev => ({
        ...prev,
        [projectId]: data || []
      }));
    } catch (error) {
      console.error('Error loading project members:', error);
    }
  };

  const handleAddMember = async () => {
    if (!selectedProject || !newMemberEmail.trim()) return;

    setIsAddingMember(true);
    try {
      const { data, error } = await supabase
        .from('project_members')
        .insert([
          {
            project_id: selectedProject.id,
            email: newMemberEmail.trim(),
            role: newMemberRole,
            added_at: new Date().toISOString()
          }
        ])
        .select()
        .single();

      if (error) throw error;

      // Update local state
      const newMember: ProjectMember = {
        id: data.id,
        email: data.email,
        role: data.role
      };

      setProjectMembers(prev => ({
        ...prev,
        [selectedProject.id]: [...(prev[selectedProject.id] || []), newMember]
      }));

      setNewMemberEmail('');
      setNewMemberRole('Researcher');
    } catch (error: any) {
      console.error('Error adding member:', error);
      alert('Failed to add member: ' + error.message);
    } finally {
      setIsAddingMember(false);
    }
  };

  const handleRemoveMember = async (projectId: string, memberId: string) => {
    try {
      const { error } = await supabase
        .from('project_members')
        .delete()
        .eq('id', memberId);

      if (error) throw error;

      // Update local state
      setProjectMembers(prev => ({
        ...prev,
        [projectId]: prev[projectId]?.filter(member => member.id !== memberId) || []
      }));
    } catch (error: any) {
      console.error('Error removing member:', error);
      alert('Failed to remove member: ' + error.message);
    }
  };

  const handleCreateProject = async () => {
    if (!formTitle.trim()) {
      setError('Title is required');
      return;
    }
    setIsSaving(true);
    setError(null);
    try {
      // Only include fields that exist in your database
      const projectData: any = {
        title: formTitle,
        description: formDescription,
        water_body: formWaterBody,
        progress: 0,
        date: new Date().toISOString().slice(0, 10)
      };

      const { data, error: dbError } = await supabase
        .from('projects')
        .insert([projectData])
        .select()
        .single();

      if (dbError) throw dbError;

      const newProject: EnhancedProject = {
        id: String((data as any).id ?? crypto.randomUUID()),
        title: (data as any).title ?? formTitle,
        description: (data as any).description ?? formDescription,
        date: (data as any).date ?? new Date().toISOString().slice(0, 10),
        tags: ['New'],
        progress: Number((data as any).progress ?? 0),
        waterBody: (data as any).water_body ?? formWaterBody,
        priority: formPriority, // Store locally only
        status: getProjectStatus(Number((data as any).progress ?? 0))
      };
      setProjects(prev => [newProject, ...prev]);
      closeModal();
    } catch (e: any) {
      setError(e.message || 'Failed to create project');
    } finally {
      setIsSaving(false);
    }
  };

  // Get project status based on progress
  const getProjectStatus = (progress: number): 'completed' | 'in-progress' | 'not-started' => {
    if (progress >= 100) return 'completed';
    if (progress > 0) return 'in-progress';
    return 'not-started';
  };

  // Get tag color based on priority and status
  const getProjectTagColor = (project: EnhancedProject) => {
    // First check if completed (green takes highest priority)
    if (project.status === 'completed' || project.progress >= 100) {
      return 'bg-green-500 text-white';
    }
    
    // Then check for high priority (red)
    if (project.priority === 'high') {
      return 'bg-red-500 text-white';
    }
    
    // Then in-progress (blue)
    if (project.status === 'in-progress' || project.progress > 0) {
      return 'bg-blue-500 text-white';
    }
    
    // Default tag color
    return 'bg-marine-cyan text-marine-blue';
  };

  // Get status icon
  const getStatusIcon = (project: EnhancedProject) => {
    const status = project.status || getProjectStatus(project.progress);
    
    switch (status) {
      case 'completed':
        return { icon: FiCheckCircle, color: 'text-green-500', label: 'Completed' };
      case 'in-progress':
        return { icon: FiClock, color: 'text-blue-500', label: 'In Progress' };
      default:
        if (project.priority === 'high') {
          return { icon: FiAlertCircle, color: 'text-red-500', label: 'High Priority' };
        }
        return { icon: FiClock, color: 'text-gray-500', label: 'Not Started' };
    }
  };

  // Generate mock priority for existing projects (frontend only)
  const generateMockPriority = (index: number): 'high' | 'medium' | 'low' => {
    const priorities: ('high' | 'medium' | 'low')[] = ['high', 'medium', 'low'];
    return priorities[index % 3];
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
        
        const mapped: EnhancedProject[] = (data || []).map((p: any, index: number) => ({
          id: String(p.id),
          title: p.title,
          description: p.description ?? '',
          date: p.date ?? new Date().toISOString().slice(0, 10),
          tags: ['Project'],
          progress: Number(p.progress ?? 0),
          waterBody: p.water_body ?? '',
          priority: generateMockPriority(index), // Generate mock priority for demo
          status: getProjectStatus(Number(p.progress ?? 0))
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
              {[
                { name: 'Home', icon: FiHome, href: '#', onClick: undefined, isExternal: false },
                { name: 'Data Sources', icon: FiDatabase, href: '#', onClick: onNavigateToDataSources, isExternal: false },
                { name: 'API Documentation', icon: FiDollarSign, href: '#', onClick: onNavigateToAPI, isExternal: false },
                { name: 'Data Contributor', icon: FiUsers, href: '#', onClick: onNavigateToDataContributor, isExternal: false }
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
              <button 
                onClick={onLogout}
                className="flex items-center space-x-2 px-4 py-2 bg-red-600/20 hover:bg-red-600/30 border border-red-500/30 rounded-lg transition-colors duration-200"
              >
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

          {/* Legend */}
          <motion.div 
            className="flex flex-wrap gap-4 mb-6 p-4 bg-gray-800/30 rounded-lg"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-red-500 rounded-full"></div>
              <span className="text-sm text-gray-300">High Priority</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-green-500 rounded-full"></div>
              <span className="text-sm text-gray-300">Completed</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
              <span className="text-sm text-gray-300">In Progress</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-marine-cyan rounded-full"></div>
              <span className="text-sm text-gray-300">Not Started / Normal</span>
            </div>
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
                  <EnhancedProjectCard 
                    project={project} 
                    onSelect={() => onProjectSelect(project)}
                    onManageMembers={() => openMemberModal(project)}
                    memberCount={projectMembers[project.id]?.length || 0}
                    tagColor={getProjectTagColor(project)}
                    statusIcon={getStatusIcon(project)}
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
              <div>
                <label className="block text-xs text-gray-400 mb-1">Priority</label>
                <select
                  value={formPriority}
                  onChange={(e) => setFormPriority(e.target.value as 'high' | 'medium' | 'low')}
                  className="w-full px-3 py-2 bg-gray-800/50 border border-gray-700 rounded text-white focus:border-marine-cyan focus:outline-none"
                >
                  <option value="low">Low Priority</option>
                  <option value="medium">Medium Priority</option>
                  <option value="high">High Priority</option>
                </select>
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

      {/* Manage Members Modal */}
      {isMemberModalOpen && selectedProject && (
        <div className="fixed inset-0 z-[100] bg-black/70 flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-gray-900 border border-gray-700 rounded-xl p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-white">
                Manage Team - {selectedProject.title}
              </h2>
              <button
                onClick={closeMemberModal}
                className="text-gray-400 hover:text-white transition-colors"
              >
                <FiX className="w-5 h-5" />
              </button>
            </div>

            {/* Add Member Form */}
            <div className="mb-6 p-4 bg-gray-800/50 rounded-lg">
              <h3 className="text-sm font-medium text-gray-300 mb-3">Add Team Member</h3>
              <div className="space-y-3">
                <input
                  type="email"
                  value={newMemberEmail}
                  onChange={(e) => setNewMemberEmail(e.target.value)}
                  placeholder="Enter email address"
                  className="w-full px-3 py-2 bg-gray-700/50 border border-gray-600 rounded text-white text-sm focus:border-marine-cyan focus:outline-none"
                />
                <select
                  value={newMemberRole}
                  onChange={(e) => setNewMemberRole(e.target.value)}
                  className="w-full px-3 py-2 bg-gray-700/50 border border-gray-600 rounded text-white text-sm focus:border-marine-cyan focus:outline-none"
                >
                  <option value="Researcher">Researcher</option>
                  <option value="Data Scientist">Data Scientist</option>
                  <option value="Marine Biologist">Marine Biologist</option>
                  <option value="Project Manager">Project Manager</option>
                  <option value="Collaborator">Collaborator</option>
                </select>
                <button
                  onClick={handleAddMember}
                  disabled={isAddingMember || !newMemberEmail.trim()}
                  className="w-full flex items-center justify-center space-x-2 px-4 py-2 bg-marine-cyan text-marine-blue font-medium rounded hover:opacity-90 disabled:opacity-50 transition-opacity"
                >
                  <FiUserPlus className="w-4 h-4" />
                  <span>{isAddingMember ? 'Adding...' : 'Add Member'}</span>
                </button>
              </div>
            </div>

            {/* Members List */}
            <div>
              <h3 className="text-sm font-medium text-gray-300 mb-3">
                Team Members ({projectMembers[selectedProject.id]?.length || 0})
              </h3>
              <div className="space-y-2 max-h-60 overflow-y-auto">
                {projectMembers[selectedProject.id]?.length ? (
                  projectMembers[selectedProject.id].map((member) => (
                    <div
                      key={member.id}
                      className="flex items-center justify-between p-3 bg-gray-800/30 rounded border border-gray-700"
                    >
                      <div>
                        <div className="text-white text-sm font-medium">
                          {member.email}
                        </div>
                        <div className="text-gray-400 text-xs">
                          {member.role}
                        </div>
                      </div>
                      <button
                        onClick={() => handleRemoveMember(selectedProject.id, member.id)}
                        className="text-gray-400 hover:text-red-400 transition-colors p-1"
                        title="Remove member"
                      >
                        <FiX className="w-4 h-4" />
                      </button>
                    </div>
                  ))
                ) : (
                  <div className="text-center text-gray-400 py-4 text-sm">
                    No team members added yet
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// Enhanced ProjectCard wrapper that adds member functionality and status indicators
interface EnhancedProjectCardProps {
  project: EnhancedProject;
  onSelect: () => void;
  onManageMembers: () => void;
  memberCount: number;
  tagColor: string;
  statusIcon: {
    icon: React.ComponentType<{ className?: string }>;
    color: string;
    label: string;
  };
}

const EnhancedProjectCard: React.FC<EnhancedProjectCardProps> = ({ 
  project, 
  onSelect, 
  onManageMembers,
  memberCount,
  tagColor,
  statusIcon 
}) => {
  const StatusIcon = statusIcon.icon;
  
  return (
    <div className="relative">
      <div className="relative backdrop-blur-sm rounded-xl p-6 hover:shadow-lg hover:shadow-marine-cyan/10 transition-all duration-300 h-80 flex flex-col border border-gray-700/50 hover:border-marine-cyan/50">
        {/* Status Indicator */}
        <div className="absolute top-4 left-4 flex items-center space-x-1">
          <StatusIcon className={`w-4 h-4 ${statusIcon.color}`} />
          <span className={`text-xs font-medium ${statusIcon.color}`}>
            {statusIcon.label}
          </span>
        </div>
        
        {/* Member management button */}
        <motion.button
          onClick={(e) => {
            e.stopPropagation();
            onManageMembers();
          }}
          className="absolute top-4 right-4 flex items-center space-x-1 px-2 py-1 bg-gray-800/80 backdrop-blur-sm border border-gray-600/50 rounded-lg text-gray-300 hover:text-marine-cyan hover:border-marine-cyan/50 transition-all duration-200 group"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          title="Manage team members"
        >
          <FiUsers className="w-3 h-3" />
          <span className="text-xs font-medium">{memberCount}</span>
        </motion.button>

        {/* Project Content */}
        <div 
          role="button"
          tabIndex={0}
          onClick={onSelect}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              onSelect();
            }
          }}
          className="flex-1 flex flex-col cursor-pointer"
        >
          {/* Tags - Now with colored "Project" tag */}
          <div className="flex flex-wrap gap-2 mb-4 mt-6">
            {project.tags.map((tag, index) => (
              <motion.span
                key={tag}
                className={`px-3 py-1 text-xs font-medium rounded-full ${
                  tag === 'Project' ? tagColor : 'bg-marine-cyan text-marine-blue'
                }`}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.2, delay: index * 0.1 }}
              >
                {tag}
              </motion.span>
            ))}
          </div>

          {/* Project Title */}
          <motion.h3 
            className="text-xl font-bold text-white mb-2 group-hover:text-marine-cyan transition-colors duration-200"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3, delay: 0.1 }}
          >
            {project.title}
          </motion.h3>

          {/* Date */}
          <motion.div 
            className="flex items-center text-gray-400 text-sm mb-3"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3, delay: 0.2 }}
          >
            <span>{new Date(project.date).toLocaleDateString()}</span>
          </motion.div>

          {/* Description */}
          <motion.p 
            className="text-gray-300 text-sm mb-4 line-clamp-2 flex-1"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3, delay: 0.3 }}
          >
            {project.description}
          </motion.p>

          {/* Bottom Section - Progress Bar and Button */}
          <div className="mt-auto">
            {/* Progress Bar */}
            <motion.div 
              className="mb-4"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3, delay: 0.4 }}
            >
              <div className="flex justify-between text-sm text-gray-400 mb-1">
                <span>Progress</span>
                <span>{project.progress}%</span>
              </div>
              <div className="w-full bg-gray-700 rounded-full h-2">
                <motion.div
                  className="bg-marine-cyan h-2 rounded-full"
                  initial={{ width: 0 }}
                  animate={{ width: `${project.progress}%` }}
                  transition={{ duration: 1, delay: 0.5 }}
                />
              </div>
            </motion.div>

            {/* Open Project CTA */}
            <motion.div
              className="w-full flex items-center justify-center space-x-2 px-4 py-3 bg-marine-cyan/20 border border-marine-cyan/30 rounded-lg text-marine-cyan hover:bg-marine-cyan/30 hover:border-marine-cyan/50 transition-all duration-200"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.5 }}
            >
              <span className="font-medium">Open Project</span> 
              <FiPlus className="w-4 h-4 group-hover:translate-x-1 transition-transform duration-200" />
            </motion.div>

            
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;