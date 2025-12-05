import React, { useEffect, useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

// --- Inline Icons (Zero Dependency) ---
const Plus = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
);
const LogOut = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
);
const Home = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>
);
const Database = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><ellipse cx="12" cy="5" rx="9" ry="3"/><path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3"/><path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5"/></svg>
);
const FileText = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></svg>
);
const Users = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
);
const UserPlus = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="8.5" cy="7" r="4"/><line x1="20" y1="8" x2="20" y2="14"/><line x1="23" y1="11" x2="17" y2="11"/></svg>
);
const X = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
);
const AlertCircle = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
);
const CheckCircle = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
);
const Clock = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
);
const Search = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
);
const Edit2 = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z"></path></svg>
);
const Trash = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
);

// --- Constants & Types ---
interface Project {
  id: string;
  title: string;
  description: string;
  date: string;
  tags: string[];
  progress: number;
  waterBody: string; 
}

interface EnhancedProject extends Project {
  priority?: 'high' | 'medium' | 'low';
  status?: 'completed' | 'in-progress' | 'not-started';
}

interface ProjectMember {
  id: string;
  email: string;
  role: string;
  name?: string;
}

interface DashboardProps {
  onProjectSelect: (project: Project) => void;
  onNavigateToAPI: () => void;
  onNavigateToDataSources: () => void;
  onNavigateToDataContributor: () => void;
  onLogout?: () => void;
}

// --- 1. The Starry Night Background Component ---
const AnimatedBackground: React.FC = () => {
  const generateBoxShadow = (n: number) => {
    let value = '';
    for (let i = 0; i < n; i++) {
      const x = Math.floor(Math.random() * 2000);
      const y = Math.floor(Math.random() * 2000);
      value += `${x}px ${y}px #FFF${i === n - 1 ? '' : ', '}`;
    }
    return value;
  };

  const shadowsSmall = useMemo(() => generateBoxShadow(700), []);
  const shadowsMedium = useMemo(() => generateBoxShadow(200), []);
  const shadowsBig = useMemo(() => generateBoxShadow(100), []);

  return (
    <div className="fixed inset-0 z-0 overflow-hidden bg-[radial-gradient(ellipse_at_bottom,_#1B2735_0%,_#090A0F_100%)]">
      <style>{`
        @keyframes animStar {
          from { transform: translateY(0px); }
          to { transform: translateY(-2000px); }
        }
      `}</style>
      
      <div 
        className="absolute w-[1px] h-[1px] bg-transparent"
        style={{ boxShadow: shadowsSmall, animation: 'animStar 50s linear infinite' }}
      >
        <div className="absolute top-[2000px] w-[1px] h-[1px] bg-transparent" style={{ boxShadow: shadowsSmall }} />
      </div>

      <div 
        className="absolute w-[2px] h-[2px] bg-transparent"
        style={{ boxShadow: shadowsMedium, animation: 'animStar 100s linear infinite' }}
      >
        <div className="absolute top-[2000px] w-[2px] h-[2px] bg-transparent" style={{ boxShadow: shadowsMedium }} />
      </div>

      <div 
        className="absolute w-[3px] h-[3px] bg-transparent"
        style={{ boxShadow: shadowsBig, animation: 'animStar 150s linear infinite' }}
      >
        <div className="absolute top-[2000px] w-[3px] h-[3px] bg-transparent" style={{ boxShadow: shadowsBig }} />
      </div>
      
      <div className="absolute inset-0 bg-slate-900/30 mix-blend-overlay pointer-events-none" />
    </div>
  );
};

// --- 2. Enhanced Project Card ---
interface EnhancedProjectCardProps {
  project: EnhancedProject;
  onSelect: () => void;
  onManageMembers: () => void;
  onEdit: () => void;
  onDelete: () => void;
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
  onEdit,
  onDelete,
  memberCount,
  tagColor,
  statusIcon 
}) => {
  const StatusIcon = statusIcon.icon;
  
  return (
    <div className="relative">
      <div className="relative backdrop-blur-sm bg-gray-900/60 rounded-xl p-6 hover:shadow-lg hover:shadow-cyan-400/10 transition-all duration-300 h-80 flex flex-col border border-gray-700/50 hover:border-cyan-400/50">
        <div className="absolute top-4 left-4 flex items-center space-x-1">
          <StatusIcon className={`w-4 h-4 ${statusIcon.color}`} />
          <span className={`text-xs font-medium ${statusIcon.color}`}>
            {statusIcon.label}
          </span>
        </div>
        
        {/* Top Right Member Count */}
        <motion.button
          onClick={(e) => {
            e.stopPropagation();
            onManageMembers();
          }}
          className="absolute top-4 right-4 flex items-center space-x-1 px-2 py-1 bg-gray-800/80 backdrop-blur-sm border border-gray-600/50 rounded-lg text-gray-300 hover:text-cyan-400 hover:border-cyan-400/50 transition-all duration-200 group"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          title="Manage team members"
        >
          <Users className="w-3 h-3" />
          <span className="text-xs font-medium">{memberCount}</span>
        </motion.button>

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
          <div className="flex flex-wrap gap-2 mb-4 mt-6">
            {project.tags.map((tag, index) => (
              <motion.span
                key={tag}
                className={`px-3 py-1 text-xs font-medium rounded-full ${
                  tag === 'Project' || tag === 'New' ? tagColor : 'bg-cyan-500 text-white'
                }`}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.2, delay: index * 0.1 }}
              >
                {tag}
              </motion.span>
            ))}
          </div>

          <motion.h3 
            className="text-xl font-bold text-white mb-2 group-hover:text-cyan-400 transition-colors duration-200"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3, delay: 0.1 }}
          >
            {project.title}
          </motion.h3>

          <motion.div 
            className="flex items-center text-gray-400 text-sm mb-3"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3, delay: 0.2 }}
          >
            <span>{new Date(project.date).toLocaleDateString()}</span>
          </motion.div>

          <motion.p 
            className="text-gray-300 text-sm mb-4 line-clamp-2 flex-1"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3, delay: 0.3 }}
          >
            {project.description}
          </motion.p>

          <div className="mt-auto">
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
                  className="bg-cyan-400 h-2 rounded-full"
                  initial={{ width: 0 }}
                  animate={{ width: `${project.progress}%` }}
                  transition={{ duration: 1, delay: 0.5 }}
                />
              </div>
            </motion.div>

            <motion.div
              className="flex gap-2"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.5 }}
            >
                {/* Open Project Button */}
                <motion.button
                    onClick={(e) => {
                        e.stopPropagation();
                        onSelect();
                    }}
                    className="flex-1 flex items-center justify-center space-x-2 px-4 py-2 bg-cyan-500/10 border border-cyan-500/30 rounded-lg text-cyan-400 hover:bg-cyan-500/20 hover:border-cyan-500/50 transition-all duration-200"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                >
                    <span className="font-medium">Open</span> 
                    <Plus className="w-4 h-4" />
                </motion.button>
                
                {/* Edit Button */}
                <motion.button
                    onClick={(e) => {
                        e.stopPropagation();
                        onEdit();
                    }}
                    className="px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-gray-400 hover:text-white hover:border-cyan-500 hover:bg-gray-700 transition-all duration-200 flex items-center justify-center"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    title="Edit Project"
                >
                    <Edit2 className="w-4 h-4" />
                </motion.button>

                {/* Delete Button */}
                <motion.button
                    onClick={(e) => {
                        e.stopPropagation();
                        onDelete();
                    }}
                    className="px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-gray-400 hover:text-red-400 hover:border-red-500 hover:bg-gray-700 transition-all duration-200 flex items-center justify-center"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    title="Delete Project"
                >
                    <Trash className="w-4 h-4" />
                </motion.button>
                
                {/* Add Member Button */}
                <motion.button
                    onClick={(e) => {
                        e.stopPropagation();
                        onManageMembers();
                    }}
                    className="px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-gray-400 hover:text-white hover:border-cyan-500 hover:bg-gray-700 transition-all duration-200 flex items-center justify-center"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    title="Add Member"
                >
                    <UserPlus className="w-5 h-5" />
                </motion.button>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
};

// --- 3. Main Dashboard Component ---
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
  const [searchQuery, setSearchQuery] = useState('');

  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formTitle, setFormTitle] = useState('');
  const [formDescription, setFormDescription] = useState('');
  const [formWaterBody, setFormWaterBody] = useState('');
  const [formPriority, setFormPriority] = useState<'high' | 'medium' | 'low'>('medium');
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [editingProjectId, setEditingProjectId] = useState<string | null>(null);

  // Member modal states
  const [selectedProject, setSelectedProject] = useState<EnhancedProject | null>(null);
  const [isMemberModalOpen, setIsMemberModalOpen] = useState(false);
  const [newMemberEmail, setNewMemberEmail] = useState('');
  const [newMemberRole, setNewMemberRole] = useState('Researcher');
  const [projectMembers, setProjectMembers] = useState<{ [key: string]: ProjectMember[] }>({});
  const [isAddingMember, setIsAddingMember] = useState(false);

  // MOCK DATA
  const MOCK_PROJECTS: EnhancedProject[] = [
    {
      id: '1',
      title: 'Andaman Coral Survey',
      description: 'Long-term monitoring of coral bleaching events in North Bay.',
      date: '2025-10-15',
      tags: ['Survey', 'Coral'],
      progress: 75,
      waterBody: 'Andaman Sea',
      priority: 'high',
      status: 'in-progress'
    },
    {
      id: '2',
      title: 'Deep Ocean Sensors',
      description: 'Deployment of autonomous sensors for salinity measurement.',
      date: '2025-09-20',
      tags: ['Tech', 'Deep Sea'],
      progress: 30,
      waterBody: 'Indian Ocean',
      priority: 'medium',
      status: 'in-progress'
    },
    {
      id: '3',
      title: 'Coastal Mangrove Mapping',
      description: 'Satellite imagery analysis of mangrove cover changes.',
      date: '2025-11-01',
      tags: ['Satellite', 'Coastal'],
      progress: 0,
      waterBody: 'Bay of Bengal',
      priority: 'low',
      status: 'not-started'
    },
    {
      id: '4',
      title: 'Microplastic Distribution',
      description: 'Analysis of microplastic density in surface waters near Chennai.',
      date: '2025-11-20',
      tags: ['Pollution', 'Lab'],
      progress: 10,
      waterBody: 'Bay of Bengal',
      priority: 'medium',
      status: 'in-progress'
    }
  ];

  const openNewProjectModal = () => {
    setEditingProjectId(null);
    setFormTitle('');
    setFormDescription('');
    setFormWaterBody('');
    setFormPriority('medium');
    setIsModalOpen(true);
  };

  const openEditProjectModal = (project: EnhancedProject) => {
    setEditingProjectId(project.id);
    setFormTitle(project.title);
    setFormDescription(project.description);
    setFormWaterBody(project.waterBody);
    setFormPriority(project.priority || 'medium');
    setIsModalOpen(true);
  };

  const closeModal = () => {
    if (isSaving) return;
    setIsModalOpen(false);
    setEditingProjectId(null);
    setFormTitle('');
    setFormDescription('');
    setFormWaterBody('');
    setFormPriority('medium');
    setError(null);
  };

  const openMemberModal = (project: EnhancedProject) => {
    setSelectedProject(project);
    setIsMemberModalOpen(true);
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
    const mockMembers: ProjectMember[] = [
      { id: 'm1', email: 'researcher@institute.edu', role: 'Researcher' },
      { id: 'm2', email: 'analyst@data.org', role: 'Data Scientist' }
    ];
    setProjectMembers(prev => ({ ...prev, [projectId]: mockMembers }));
  };

  const handleAddMember = async () => {
    if (!selectedProject || !newMemberEmail.trim()) return;
    setIsAddingMember(true);
    await new Promise(resolve => setTimeout(resolve, 800));
    const newMember: ProjectMember = {
      id: Math.random().toString(36).substr(2, 9),
      email: newMemberEmail,
      role: newMemberRole
    };
    setProjectMembers(prev => ({
      ...prev,
      [selectedProject.id]: [...(prev[selectedProject.id] || []), newMember]
    }));
    setNewMemberEmail('');
    setNewMemberRole('Researcher');
    setIsAddingMember(false);
  };

  const handleRemoveMember = async (projectId: string, memberId: string) => {
    setProjectMembers(prev => ({
      ...prev,
      [projectId]: prev[projectId]?.filter(member => member.id !== memberId) || []
    }));
  };

  const handleSaveProject = async () => {
    if (!formTitle.trim()) {
      setError('Title is required');
      return;
    }
    setIsSaving(true);
    await new Promise(resolve => setTimeout(resolve, 1000));

    if (editingProjectId) {
      // Edit existing project
      setProjects(prev => prev.map(p => 
        p.id === editingProjectId 
          ? {
              ...p,
              title: formTitle,
              description: formDescription,
              waterBody: formWaterBody,
              priority: formPriority
            } 
          : p
      ));
    } else {
      // Create new project
      const newProject: EnhancedProject = {
        id: Math.random().toString(36).substr(2, 9),
        title: formTitle,
        description: formDescription,
        date: new Date().toISOString().slice(0, 10),
        tags: ['New'],
        progress: 0,
        waterBody: formWaterBody,
        priority: formPriority,
        status: 'not-started'
      };
      setProjects(prev => [newProject, ...prev]);
    }

    setIsSaving(false);
    closeModal();
  };

  const handleDeleteProject = (projectId: string) => {
    if (window.confirm("Are you sure you want to delete this project?")) {
      setProjects(prev => prev.filter(p => p.id !== projectId));
    }
  };

  const getProjectStatus = (progress: number): 'completed' | 'in-progress' | 'not-started' => {
    if (progress >= 100) return 'completed';
    if (progress > 0) return 'in-progress';
    return 'not-started';
  };

  const getProjectTagColor = (project: EnhancedProject) => {
    if (project.status === 'completed' || project.progress >= 100) return 'bg-green-500 text-white';
    if (project.priority === 'high') return 'bg-red-500 text-white';
    if (project.status === 'in-progress' || project.progress > 0) return 'bg-blue-500 text-white';
    return 'bg-cyan-500 text-white';
  };

  const getStatusIcon = (project: EnhancedProject) => {
    const status = project.status || getProjectStatus(project.progress);
    switch (status) {
      case 'completed': return { icon: CheckCircle, color: 'text-green-500', label: 'Completed' };
      case 'in-progress': return { icon: Clock, color: 'text-blue-500', label: 'In Progress' };
      default:
        if (project.priority === 'high') return { icon: AlertCircle, color: 'text-red-500', label: 'High Priority' };
        return { icon: Clock, color: 'text-gray-500', label: 'Not Started' };
    }
  };

  useEffect(() => {
    const load = async () => {
      setIsLoadingProjects(true);
      setLoadError(null);
      await new Promise(resolve => setTimeout(resolve, 800));
      setProjects(MOCK_PROJECTS);
      setIsLoadingProjects(false);
    };
    load();
  }, []);

  // Filter projects based on search query
  const filteredProjects = projects.filter(project => 
    project.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    project.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen relative font-sans">
      <AnimatedBackground />

      <header className="fixed top-0 left-0 right-0 z-50 bg-slate-900/95 backdrop-blur-sm border-b border-cyan-500/20">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <motion.div 
              className="flex items-center space-x-2"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5 }}
            >
              {/* REMOVED THE "S" ICON BOX HERE */}
              <span className="text-xl font-bold text-white tracking-wider">SAGAR</span>
            </motion.div>

            {/* Added Search Bar */}
            <div className="hidden md:flex flex-1 max-w-md mx-8 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-cyan-500/50 w-4 h-4" />
                <input 
                    type="text" 
                    placeholder="Search projects..." 
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full bg-gray-800/50 border border-gray-700/50 text-gray-300 rounded-full py-2 pl-10 pr-4 text-sm focus:outline-none focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/50 transition-all placeholder:text-gray-600"
                />
            </div>

            <nav className="hidden md:flex items-center space-x-8">
              {[
                { name: 'Home', icon: Home, href: '#', onClick: undefined, isExternal: false },
                { name: 'Data Sources', icon: Database, href: '#', onClick: onNavigateToDataSources, isExternal: false },
                { name: 'API Docs', icon: FileText, href: '#', onClick: onNavigateToAPI, isExternal: false },
                { name: 'Contributors', icon: Users, href: '#', onClick: onNavigateToDataContributor, isExternal: false }
              ].map((item, index) => (
                item.isExternal ? (
                  <motion.a
                    key={item.name}
                    href={item.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center space-x-2 text-gray-300 hover:text-cyan-400 transition-colors duration-200"
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
                    className="flex items-center space-x-2 text-gray-300 hover:text-cyan-400 transition-colors duration-200"
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

            <motion.div 
              className="flex items-center space-x-4 ml-8"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5 }}
            >
              <span className="text-sm text-gray-300">Welcome, Dr. Vinu</span>
              <button 
                onClick={onLogout}
                className="flex items-center space-x-2 px-4 py-2 bg-red-600/20 hover:bg-red-600/30 border border-red-500/30 rounded-lg transition-colors duration-200"
              >
                <LogOut className="w-4 h-4" />
                <span>Logout</span>
              </button>
            </motion.div>
          </div>
        </div>
      </header>

      <main className="pt-24 px-6 relative z-10">
        <div className="max-w-7xl mx-auto">
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
              onClick={openNewProjectModal}
              className="flex items-center space-x-2 px-6 py-3 bg-cyan-500 text-white font-semibold rounded-lg hover:shadow-lg hover:shadow-cyan-500/25 transition-all duration-200"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Plus className="w-5 h-5" />
              <span>New Project</span>
            </motion.button>
          </motion.div>

           {/* Mobile Search */}
           <div className="md:hidden mb-6 relative">
             <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-cyan-500/50 w-4 h-4" />
             <input 
                type="text" 
                placeholder="Search projects..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-gray-800/50 border border-gray-700/50 text-gray-300 rounded-lg py-3 pl-10 pr-4 text-sm focus:outline-none focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/50"
             />
          </div>

          <motion.div 
            className="flex flex-wrap gap-4 mb-6 p-4 bg-gray-800/30 rounded-lg backdrop-blur-sm"
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
              <div className="w-3 h-3 bg-cyan-500 rounded-full"></div>
              <span className="text-sm text-gray-300">Not Started / Normal</span>
            </div>
          </motion.div>

          {isLoadingProjects ? (
            <div className="py-16 text-center text-gray-400">Loading projects...</div>
          ) : loadError ? (
            <div className="py-16 text-center text-red-400">{loadError}</div>
          ) : filteredProjects.length === 0 ? (
            <div className="py-16 text-center text-gray-400">No projects found.</div>
          ) : (
            <motion.div 
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.4 }}
            >
              {filteredProjects.map((project, index) => (
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
                    onEdit={() => openEditProjectModal(project)}
                    onDelete={() => handleDeleteProject(project.id)}
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

      {/* New/Edit Project Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[100] bg-black/70 flex items-center justify-center p-4">
          <div className="w-full max-w-lg bg-gray-900/95 backdrop-blur-sm border border-gray-700 rounded-xl p-6">
            <h2 className="text-xl font-semibold text-white mb-4">
              {editingProjectId ? 'Edit Project' : 'Create New Project'}
            </h2>
            {error && (
              <div className="mb-3 text-sm text-red-400">{error}</div>
            )}
            <div className="space-y-4">
              <div>
                <label className="block text-xs text-gray-400 mb-1">Title</label>
                <input
                  value={formTitle}
                  onChange={(e) => setFormTitle(e.target.value)}
                  className="w-full px-3 py-2 bg-gray-800/50 border border-gray-700 rounded text-white focus:border-cyan-400 focus:outline-none"
                  placeholder="e.g., Andaman Deep Sea Survey"
                />
              </div>
              <div>
                <label className="block text-xs text-gray-400 mb-1">Description</label>
                <textarea
                  value={formDescription}
                  onChange={(e) => setFormDescription(e.target.value)}
                  className="w-full px-3 py-2 bg-gray-800/50 border border-gray-700 rounded text-white focus:border-cyan-400 focus:outline-none"
                  placeholder="Short description"
                  rows={3}
                />
              </div>
              <div>
                <label className="block text-xs text-gray-400 mb-1">Water Body</label>
                <input
                  value={formWaterBody}
                  onChange={(e) => setFormWaterBody(e.target.value)}
                  className="w-full px-3 py-2 bg-gray-800/50 border border-gray-700 rounded text-white focus:border-cyan-400 focus:outline-none"
                  placeholder="e.g., Andaman Sea"
                />
              </div>
              <div>
                <label className="block text-xs text-gray-400 mb-1">Priority</label>
                <select
                  value={formPriority}
                  onChange={(e) => setFormPriority(e.target.value as 'high' | 'medium' | 'low')}
                  className="w-full px-3 py-2 bg-gray-800/50 border border-gray-700 rounded text-white focus:border-cyan-400 focus:outline-none"
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
                onClick={handleSaveProject}
                disabled={isSaving}
                className="px-4 py-2 rounded bg-cyan-500 text-white font-semibold hover:opacity-90 disabled:opacity-50"
              >
                {isSaving ? 'Saving...' : (editingProjectId ? 'Update Project' : 'Create Project')}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Manage Members Modal */}
      {isMemberModalOpen && selectedProject && (
        <div className="fixed inset-0 z-[100] bg-black/70 flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-gray-900/95 backdrop-blur-sm border border-gray-700 rounded-xl p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-white">
                Manage Team - {selectedProject.title}
              </h2>
              <button
                onClick={closeMemberModal}
                className="text-gray-400 hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
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
                  className="w-full px-3 py-2 bg-gray-700/50 border border-gray-600 rounded text-white text-sm focus:border-cyan-400 focus:outline-none"
                />
                <select
                  value={newMemberRole}
                  onChange={(e) => setNewMemberRole(e.target.value)}
                  className="w-full px-3 py-2 bg-gray-700/50 border border-gray-600 rounded text-white text-sm focus:border-cyan-400 focus:outline-none"
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
                  className="w-full flex items-center justify-center space-x-2 px-4 py-2 bg-cyan-500 text-white font-medium rounded hover:opacity-90 disabled:opacity-50 transition-opacity"
                >
                  <UserPlus className="w-4 h-4" />
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
                        <X className="w-4 h-4" />
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

export default Dashboard;