import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { BrowserRouter as Router, Routes, Route, useNavigate, useLocation } from 'react-router-dom';
import Dashboard from './components/Dashboard';
import LandingPage from './components/LandingPage';
import GlobeView from './components/GlobeView';
import LoaderOverlay from './components/LoaderOverlay';
import SearchResultsView, { SearchResultSummary } from './components/SearchResultsView';
import APIDocumentation from './components/APIDocumentation';
import './App.css';

export interface Project {
  id: string;
  title: string;
  description: string;
  date: string;
  tags: string[];
  progress: number;
  waterBody: string;
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
}

function App() {
  const [currentView, setCurrentView] = useState<'landing' | 'dashboard' | 'search' | 'globe' | 'api-docs'>('landing');
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [showLoader, setShowLoader] = React.useState(false);
  const [searchResult, setSearchResult] = React.useState<SearchResultSummary | null>(null);

  // Handle URL-based navigation
  useEffect(() => {
    const path = window.location.pathname;
    if (path === '/api-docs' || path === '/api-documentation') {
      setCurrentView('api-docs');
    } else if (path === '/dashboard') {
      setCurrentView('dashboard');
    } else if (path === '/globe') {
      setCurrentView('globe');
    } else if (path === '/search') {
      setCurrentView('search');
    } else {
      setCurrentView('landing');
    }
  }, []);

  // Update URL when view changes
  useEffect(() => {
    const path = window.location.pathname;
    let newPath = '/';
    
    switch (currentView) {
      case 'api-docs':
        newPath = '/api-docs';
        break;
      case 'dashboard':
        newPath = '/dashboard';
        break;
      case 'globe':
        newPath = '/globe';
        break;
      case 'search':
        newPath = '/search';
        break;
      default:
        newPath = '/';
    }
    
    if (path !== newPath) {
      window.history.pushState({}, '', newPath);
    }
  }, [currentView]);

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


  // Restore view state on first load
  React.useEffect(() => {
    try {
      const savedView = localStorage.getItem('sagar:view');
      const savedResult = localStorage.getItem('sagar:searchResult');
      const savedProject = localStorage.getItem('sagar:selectedProject');
      if (savedView === 'search' && savedResult) {
        setSearchResult(JSON.parse(savedResult));
        setCurrentView('search');
      } else if (savedView === 'globe') {
        if (savedProject) {
          setSelectedProject(JSON.parse(savedProject));
        }
        setCurrentView('globe');
      } else if (savedView === 'dashboard') {
        setCurrentView('dashboard');
      } else {
        // default remains 'landing'
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
            <LandingPage onEnter={() => setCurrentView('dashboard')} />
          </motion.div>
        ) : currentView === 'dashboard' ? (
          <motion.div
            key="dashboard"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            <Dashboard onProjectSelect={handleProjectSelect} onNavigateToAPI={() => setCurrentView('api-docs')} />
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
                    // Show loader during transition back to globe
                    setShowLoader(true);
                    const t = (window as any).__sagarTransition;
                    if (t?.overlay) {
                      t.overlay.remove();
                      (window as any).__sagarTransition = undefined;
                    }
                    setCurrentView('globe');
                    // Hide loader after brief delay
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
            <APIDocumentation onBack={() => setCurrentView('dashboard')} />
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
                // Show loader during transition into SearchResultsView
                setShowLoader(true);
                setSearchResult(result);
                setCurrentView('search');
                // Hide after brief delay to cover render/texture loads
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
