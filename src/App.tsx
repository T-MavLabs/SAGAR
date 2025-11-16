import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { BrowserRouter as Router, Routes, Route, useNavigate, useLocation } from 'react-router-dom';
import Dashboard from './components/Dashboard';
import LandingPage from './components/LandingPage';
import GlobeView from './components/GlobeView';
import LoaderOverlay from './components/LoaderOverlay';
import SearchResultsView, { SearchResultSummary } from './components/SearchResultsView';
import APIDocumentation from './components/APIDocumentation';
import DataSourcePage from './components/DataSourcePage';
import DataContributorPage from './components/DataContributorPage';
import './App.css';

export interface Project {
  id: string;
  title: string;
  description: string;
  date: string;
  tags: string[];
  progress: number;
  waterBody: string;
  researchType?: 'biodiversity' | 'oceanography' | 'fisheries' | 'conservation' | 'taxonomy' | 'molecular';
  geographicScope?: {
    coordinates: [number, number][];
    waterBody: string;
    depthRange?: [number, number];
  };
  dataTypes?: ('oceanographic' | 'taxonomic' | 'morphological' | 'molecular' | 'eDNA')[];
  collaborators?: string[];
}

export interface DataPoint {
  scientificName: string;
  locality: string;
  eventDate: string;
  decimalLatitude: number;
  decimalLongitude: number;
  waterBody: string;
  samplingProtocol: string;
  minimumDepthInMeters: number;
  maximumDepthInMeters: number;
  identifiedBy: string;
  dataType?: 'oceanographic' | 'taxonomic' | 'morphological' | 'molecular' | 'eDNA';
}

export interface User {
  id: string;
  name: string;
  email: string;
  type: 'researcher' | 'contributor' | 'admin';
  organization?: string;
  specialization?: string[];
  joinDate?: string;
}

// Marine research templates
export const RESEARCH_TEMPLATES = [
  {
    id: 'biodiversity',
    name: 'Biodiversity Assessment',
    icon: '🐠',
    description: 'Study species diversity and distribution',
    defaultWaterBody: 'Bay of Bengal',
    dataTypes: ['taxonomic', 'molecular', 'eDNA'] as const
  },
  {
    id: 'oceanography',
    name: 'Oceanographic Survey',
    icon: '🌊',
    description: 'Physical and chemical ocean parameters',
    defaultWaterBody: 'Arabian Sea',
    dataTypes: ['oceanographic'] as const
  },
  {
    id: 'fisheries',
    name: 'Fisheries Research',
    icon: '🎣',
    description: 'Fish stocks and fisheries management',
    defaultWaterBody: 'Indian Ocean',
    dataTypes: ['taxonomic', 'morphological'] as const
  },
  {
    id: 'conservation',
    name: 'Conservation Planning',
    icon: '🛡️',
    description: 'Marine protected areas and conservation',
    defaultWaterBody: 'Andaman Sea',
    dataTypes: ['taxonomic', 'oceanographic'] as const
  }
];

function App() {
  const getInitialView = () => {
    const path = window.location.pathname;
    if (path === '/api-docs' || path === '/api-documentation') return 'api-docs';
    if (path === '/dashboard') return 'dashboard';
    if (path === '/data-sources') return 'data-sources';
    if (path === '/data-contributor') return 'data-contributor';
    if (path.startsWith('/project/')) return 'globe';
    if (path === '/globe') return 'globe';
    if (path === '/search') return 'search';
    return 'landing';
  };

  const [currentView, setCurrentView] = useState<'landing' | 'dashboard' | 'search' | 'globe' | 'api-docs' | 'data-sources' | 'data-contributor'>(getInitialView());
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [showLoader, setShowLoader] = React.useState(false);
  const [searchResult, setSearchResult] = React.useState<SearchResultSummary | null>(null);
  const [currentUser, setCurrentUser] = React.useState<User | null>(null);
  const [marineStats, setMarineStats] = useState({
    activeCruises: 12,
    speciesRecords: 1250000,
    researchPublications: 45,
    dataContributors: 89
  });

  // Load project from database
  const loadProjectFromDatabase = async (projectId: string) => {
    try {
      const { supabase } = await import('./services/supabaseClient');
      
      const { data, error } = await supabase
        .from('projects')
        .select('*')
        .eq('id', projectId)
        .single();

      if (error) {
        console.error('Error loading project:', error);
        return;
      }

      if (data) {
        const project: Project = {
          id: String(data.id),
          title: data.title,
          description: data.description || '',
          date: data.date || new Date().toISOString().slice(0, 10),
          tags: data.tags || ['Project'],
          progress: Number(data.progress || 0),
          waterBody: data.water_body || '',
          researchType: data.research_type,
          dataTypes: data.data_types,
          collaborators: data.collaborators
        };
        setSelectedProject(project);
        localStorage.setItem('sagar:selectedProject', JSON.stringify(project));
      }
    } catch (error) {
      console.error('Error loading project from database:', error);
    }
  };

  // Handle user login
  const handleUserLogin = (userData: { email: string; name: string; type: 'researcher' | 'contributor' | 'admin'; organization?: string; specialization?: string[] }) => {
    const user: User = {
      id: Math.random().toString(36).substr(2, 9),
      name: userData.name,
      email: userData.email,
      type: userData.type,
      organization: userData.organization,
      specialization: userData.specialization,
      joinDate: new Date().toISOString().slice(0, 10)
    };
    setCurrentUser(user);
    localStorage.setItem('sagar:currentUser', JSON.stringify(user));
    
    // Redirect based on user type
    if (userData.type === 'contributor') {
      setShowLoader(true);
      setTimeout(() => {
        setCurrentView('data-contributor');
        setShowLoader(false);
      }, 800);
    } else {
      setCurrentView('dashboard');
    }
  };

  // Handle user logout
  const handleUserLogout = () => {
    setCurrentUser(null);
    setCurrentView('landing');
    localStorage.removeItem('sagar:currentUser');
    localStorage.removeItem('sagar:selectedProject');
    localStorage.removeItem('sagar:searchResult');
  };

  // Handle navigation to Data Contributor page with loader
  const handleNavigateToDataContributor = () => {
    setShowLoader(true);
    setTimeout(() => {
      setCurrentView('data-contributor');
      setShowLoader(false);
    }, 800);
  };

  // Handle browser back/forward navigation
  useEffect(() => {
    const handleRouteChange = () => {
      const path = window.location.pathname;
      console.log('URL changed to:', path);
      
      if (path === '/api-docs' || path === '/api-documentation') {
        setCurrentView('api-docs');
      } else if (path === '/dashboard') {
        setCurrentView('dashboard');
      } else if (path === '/data-sources') {
        setCurrentView('data-sources');
      } else if (path === '/data-contributor') {
        setCurrentView('data-contributor');
      } else if (path.startsWith('/project/')) {
        const projectId = path.replace('/project/', '');
        console.log('Loading project from URL:', projectId);
        setCurrentView('globe');
        try {
          const savedProject = localStorage.getItem('sagar:selectedProject');
          if (savedProject) {
            const project = JSON.parse(savedProject);
            if (project.id === projectId) {
              setSelectedProject(project);
            } else {
              loadProjectFromDatabase(projectId);
            }
          } else {
            loadProjectFromDatabase(projectId);
          }
        } catch (e) {
          console.error('Error loading project:', e);
          loadProjectFromDatabase(projectId);
        }
      } else if (path === '/globe') {
        setCurrentView('globe');
      } else if (path === '/search') {
        setCurrentView('search');
      } else {
        setCurrentView('landing');
      }
    };

    window.addEventListener('popstate', handleRouteChange);
    return () => {
      window.removeEventListener('popstate', handleRouteChange);
    };
  }, []);

  // Update URL when view changes
  useEffect(() => {
    const currentPath = window.location.pathname;
    let targetPath = '/';
    
    switch (currentView) {
      case 'api-docs':
        targetPath = '/api-docs';
        break;
      case 'dashboard':
        targetPath = '/dashboard';
        break;
      case 'data-sources':
        targetPath = '/data-sources';
        break;
      case 'data-contributor':
        targetPath = '/data-contributor';
        break;
      case 'globe':
        if (selectedProject) {
          targetPath = `/project/${selectedProject.id}`;
        } else {
          targetPath = '/globe';
        }
        break;
      case 'search':
        targetPath = '/search';
        break;
      default:
        targetPath = '/';
    }
    
    if (currentPath !== targetPath) {
      console.log('Updating URL from', currentPath, 'to', targetPath);
      window.history.pushState({}, '', targetPath);
    }
  }, [currentView, selectedProject]);

  // Handle initial project loading from URL
  useEffect(() => {
    const path = window.location.pathname;
    if (path.startsWith('/project/')) {
      const projectId = path.replace('/project/', '');
      console.log('Initial load: Loading project from URL:', projectId);
      
      try {
        const savedProject = localStorage.getItem('sagar:selectedProject');
        if (savedProject) {
          const project = JSON.parse(savedProject);
          if (project.id === projectId) {
            setSelectedProject(project);
            return;
          }
        }
      } catch (e) {
        console.error('Error loading project from localStorage:', e);
      }
      
      loadProjectFromDatabase(projectId);
    }
  }, []);

  // Load user from localStorage on app start
  useEffect(() => {
    try {
      const savedUser = localStorage.getItem('sagar:currentUser');
      if (savedUser) {
        const user = JSON.parse(savedUser);
        setCurrentUser(user);
        
        // Load marine stats (mock data)
        setMarineStats({
          activeCruises: Math.floor(Math.random() * 20) + 5,
          speciesRecords: 1250000 + Math.floor(Math.random() * 100000),
          researchPublications: 45 + Math.floor(Math.random() * 10),
          dataContributors: 89 + Math.floor(Math.random() * 20)
        });
      }
    } catch (e) {
      console.error('Error loading user from localStorage:', e);
    }
  }, []);

  const handleProjectSelect = (project: Project) => {
    console.log('App: Project selected, navigating to globe view');
    setShowLoader(true);
    setTimeout(() => {
      setSelectedProject(project);
      setCurrentView('globe');
      setShowLoader(false);
    }, 800);
  };

  React.useEffect(() => {
    const handler = () => {
      console.log('App: Back to Projects event received');
      setShowLoader(true);
      setTimeout(() => {
        setCurrentView('dashboard');
        setSelectedProject(null);
        setShowLoader(false);
      }, 600);
    };
    window.addEventListener('backToProjects', handler as EventListener);
    return () => window.removeEventListener('backToProjects', handler as EventListener);
  }, []);

  // Restore additional state from localStorage
  React.useEffect(() => {
    try {
      const savedResult = localStorage.getItem('sagar:searchResult');
      const savedProject = localStorage.getItem('sagar:selectedProject');
      if (savedResult) {
        setSearchResult(JSON.parse(savedResult));
      }
      if (savedProject) {
        setSelectedProject(JSON.parse(savedProject));
      }
    } catch {}
  }, []);

  // Persist view state on change
  React.useEffect(() => {
    try {
      localStorage.setItem('sagar:view', currentView);
      if (searchResult) {
        localStorage.setItem('sagar:searchResult', JSON.stringify(searchResult));
      } else {
        localStorage.removeItem('sagar:searchResult');
      }
      if (selectedProject) {
        localStorage.setItem('sagar:selectedProject', JSON.stringify(selectedProject));
      } else {
        localStorage.removeItem('sagar:selectedProject');
      }
    } catch {}
  }, [currentView, searchResult, selectedProject]);

  console.log('App: Current view:', currentView, 'Selected project:', selectedProject?.title);

  const rootBgClass = currentView === 'search' ? 'bg-black' : 'bg-marine-blue';
  
  return (
    <div className={`min-h-screen ${rootBgClass} text-white`}>
      <LoaderOverlay visible={showLoader} />
      <AnimatePresence mode="wait">
        {currentView === 'landing' ? (
          <motion.div
            key="landing"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            <LandingPage 
              onEnter={() => setCurrentView('dashboard')} 
              onUserLogin={handleUserLogin}
              marineStats={marineStats}
            />
          </motion.div>
        ) : currentView === 'dashboard' ? (
          <motion.div
            key="dashboard"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            <Dashboard 
              onProjectSelect={handleProjectSelect}
              onNavigateToAPI={() => setCurrentView('api-docs')}
              onNavigateToDataSources={() => setCurrentView('data-sources')}
              onNavigateToDataContributor={handleNavigateToDataContributor}
              onLogout={handleUserLogout}
            />
          </motion.div>
        ) : currentView === 'search' ? (
          <motion.div
            key="search"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            {searchResult && (
              <div className="pt-24 px-6 max-w-7xl mx-auto">
                <SearchResultsView
                  result={searchResult}
                  onViewOnGlobe={() => setCurrentView('globe')}
                  onBack={() => {
                    setShowLoader(true);
                    const t = (window as any).__sagarTransition;
                    if (t?.overlay) {
                      t.overlay.remove();
                      (window as any).__sagarTransition = undefined;
                    }
                    setCurrentView('globe');
                    setTimeout(() => setShowLoader(false), 800);
                  }}
                />
              </div>
            )}
          </motion.div>
        ) : currentView === 'api-docs' ? (
          <motion.div
            key="api-docs"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            <APIDocumentation 
              onBack={() => setCurrentView('dashboard')} 
              onLogout={handleUserLogout}
            />
          </motion.div>
        ) : currentView === 'data-sources' ? (
          <motion.div
            key="data-sources"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            <DataSourcePage 
              onBack={() => setCurrentView('dashboard')} 
              onLogout={handleUserLogout}
            />
          </motion.div>
        ) : currentView === 'data-contributor' ? (
          <motion.div
            key="data-contributor"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            <DataContributorPage 
              onBack={() => setCurrentView('dashboard')} 
              onLogout={handleUserLogout}
              currentUser={currentUser}
            />
          </motion.div>
        ) : (
          <motion.div
            key="globe"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            <GlobeView 
              selectedProject={selectedProject}
              onShowSearchResults={(result) => {
                setShowLoader(true);
                setSearchResult(result);
                setCurrentView('search');
                setTimeout(() => setShowLoader(false), 900);
              }}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// Main App component with Router
function AppWithRouter() {
  return (
    <Router>
      <App />
    </Router>
  );
}

export default AppWithRouter;