import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiHome, FiDatabase, FiDollarSign, FiLogOut, FiCode, FiActivity, FiGlobe, FiServer, FiCpu, FiCopy, FiCheck, FiInfo, FiX, FiAward } from 'react-icons/fi';

interface APIDocumentationProps {
  onBack: () => void;
  onLogout?: () => void;
  onNavigateToDataSources?: () => void;
}

const APIDocumentation: React.FC<APIDocumentationProps> = ({ 
  onBack, 
  onLogout 
}) => {
  const [copiedUrl, setCopiedUrl] = useState<string | null>(null);
  const [isAboutOpen, setIsAboutOpen] = useState(false);

  const handleCopy = (url: string) => {
    navigator.clipboard.writeText(url);
    setCopiedUrl(url);
    setTimeout(() => setCopiedUrl(null), 2000);
  };

  const sections = [
    {
      id: 'data-processing',
      title: 'Data Processing Engine',
      description: 'Core engine for processing and ingesting marine data streams.',
      icon: FiServer,
      services: [
        {
          name: 'Data Processing Engine',
          baseUrl: 'https://dataprocessingengine-sagar.onrender.com',
          description: 'Handles data ingestion pipeline and quality control checks.',
          endpoints: [
            { method: 'GET', path: '/', description: 'Health check - Returns system status' },
            { method: 'POST', path: '/process', description: 'Trigger data processing pipeline (Internal)' }
          ]
        }
      ]
    },
    {
      id: 'rag',
      title: 'RAG API',
      description: 'Retrieval-Augmented Generation service for querying marine knowledge base.',
      icon: FiDatabase,
      services: [
        {
          name: 'RAG Service',
          baseUrl: 'https://rag.nikare.in',
          description: 'Provides semantic search and question answering capabilities over the indexed data.',
          endpoints: [
            { method: 'POST', path: '/query', description: 'Submit a natural language query' },
            { method: 'GET', path: '/status', description: 'Check indexing status' }
          ]
        }
      ]
    },
    {
      id: 'ai-ml',
      title: 'AI/ML Services',
      description: 'Specialized machine learning models for marine biology tasks.',
      icon: FiCpu,
      services: [
        {
          name: 'Otolith Classifier',
          baseUrl: 'https://chinmay0805-37-otolith-classifier.hf.space',
          description: 'Classifies fish species based on otolith images.',
          endpoints: [
            { method: 'POST', path: '/predict', description: 'Upload image for classification' },
            { method: 'GET', path: '/', description: 'Service information and UI' }
          ]
        },
        {
          name: 'eDNA Analysis',
          baseUrl: 'https://sagar-e-dna-2.vercel.app',
          description: 'Analyzes environmental DNA sequences for species detection.',
          endpoints: [
            { method: 'POST', path: '/api/analyze', description: 'Submit FASTA sequence for analysis' },
            { method: 'GET', path: '/api/status', description: 'Check analysis job status' }
          ]
        },
        {
          name: 'Species Identification',
          baseUrl: 'https://chinmay0805-specie-identification.hf.space',
          description: 'Identifies marine species from uploaded images.',
          endpoints: [
            { method: 'POST', path: '/predict', description: 'Identify species from image' },
            { method: 'GET', path: '/', description: 'Service information' }
          ]
        },
        {
          name: 'Taxonomy Service',
          baseUrl: 'https://taxa-2.vercel.app',
          description: 'Taxonomic hierarchy and species information service.',
          endpoints: [
            { method: 'GET', path: '/api/search', description: 'Search for species by name (query param: q)' },
            { method: 'GET', path: '/api/species/:id', description: 'Get detailed species info by ID' }
          ]
        }
      ]
    }
  ];

  return (
    <div className="min-h-screen bg-marine-blue text-white selection:bg-marine-cyan/30">
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
              <span className="text-xl font-bold text-white">SAGAR API</span>
            </motion.div>

            {/* Navigation */}
            <nav className="hidden md:flex items-center space-x-8">
              <button
                onClick={onBack}
                className="flex items-center space-x-2 text-gray-300 hover:text-marine-cyan transition-colors duration-200"
              >
                <FiHome className="w-4 h-4" />
                <span>Home</span>
              </button>
              
              {/* Data Sources Link - Role based visibility can be handled here if needed, keeping it simple for doc page */}
              {['principal_scientist', 'senior_scientist', 'scientist', 'junior_scientist'].includes(localStorage.getItem('sagar:role') || '') && (
                <a
                  href="https://data-ingestion-frontend-sagar.vercel.app/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center space-x-2 text-gray-300 hover:text-marine-cyan transition-colors duration-200"
                >
                  <FiDatabase className="w-4 h-4" />
                  <span>Data Sources</span>
                </a>
              )}

              <div className="flex items-center space-x-2 text-marine-cyan">
                <FiCode className="w-4 h-4" />
                <span>Documentation</span>
              </div>

              <button
                onClick={() => setIsAboutOpen(true)}
                className="flex items-center space-x-2 text-gray-300 hover:text-marine-cyan transition-colors duration-200"
              >
                <FiInfo className="w-4 h-4" />
                <span>About</span>
              </button>
            </nav>

            {/* Logout */}
            <motion.button 
              onClick={onLogout}
              className="flex items-center space-x-2 px-4 py-2 bg-red-600/20 hover:bg-red-600/30 border border-red-500/30 rounded-lg transition-colors duration-200"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5 }}
            >
              <FiLogOut className="w-4 h-4" />
              <span>Logout</span>
            </motion.button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="pt-24 px-6 pb-20">
        <div className="max-w-7xl mx-auto">
          {/* Hero Section */}
          <motion.div 
            className="text-center mb-16"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-6">
              API Documentation
            </h1>
            <p className="text-lg text-gray-300 max-w-3xl mx-auto leading-relaxed">
              Complete reference for the SAGAR platform ecosystem. 
              integrate with our Data Processing Engine, RAG capabilities, and specialized AI/ML services 
              for marine biological research.
            </p>
          </motion.div>

          {/* Documentation Sections */}
          <div className="space-y-12">
            {sections.map((section, sectionIndex) => (
              <motion.div
                key={section.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: sectionIndex * 0.1 }}
                className="space-y-6"
              >
                {/* Section Header */}
                <div className="flex items-center space-x-4 border-b border-gray-700 pb-4">
                  <div className="p-3 bg-marine-cyan/10 rounded-xl text-marine-cyan">
                    <section.icon className="w-6 h-6" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-white">{section.title}</h2>
                    <p className="text-gray-400">{section.description}</p>
                  </div>
                </div>

                {/* Services Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {section.services.map((service, serviceIndex) => (
                    <div 
                      key={service.name}
                      className="bg-gray-900/40 backdrop-blur-sm border border-gray-700/50 rounded-xl overflow-hidden hover:border-marine-cyan/30 transition-all duration-300"
                    >
                      {/* Service Header */}
                      <div className="p-6 border-b border-gray-700/50 bg-gray-800/20">
                        <div className="flex justify-between items-start mb-4">
                          <h3 className="text-xl font-bold text-white">{service.name}</h3>
                          <span className="px-2 py-1 text-xs font-medium bg-marine-cyan/10 text-marine-cyan rounded-full border border-marine-cyan/20">
                            REST API
                          </span>
                        </div>
                        <p className="text-sm text-gray-400 mb-4">{service.description}</p>
                        
                        {/* Base URL */}
                        <div className="bg-black/30 rounded-lg p-3 flex items-center justify-between group">
                          <code className="text-xs md:text-sm text-marine-cyan font-mono break-all">
                            {service.baseUrl}
                          </code>
                          <button
                            onClick={() => handleCopy(service.baseUrl)}
                            className="ml-2 p-1.5 text-gray-400 hover:text-white rounded-md hover:bg-white/10 transition-colors"
                            title="Copy URL"
                          >
                            {copiedUrl === service.baseUrl ? <FiCheck className="w-4 h-4 text-green-400" /> : <FiCopy className="w-4 h-4" />}
                          </button>
                        </div>
                      </div>

                      {/* Endpoints List */}
                      <div className="p-6 bg-gray-900/20">
                        <h4 className="text-sm font-semibold text-gray-300 uppercase tracking-wider mb-4">
                          Available Endpoints
                        </h4>
                        <div className="space-y-3">
                          {service.endpoints.map((endpoint, idx) => (
                            <div key={idx} className="flex items-start space-x-3 text-sm">
                              <span className={`
                                px-2 py-0.5 rounded text-xs font-bold font-mono min-w-[60px] text-center mt-0.5
                                ${endpoint.method === 'GET' ? 'bg-blue-500/20 text-blue-400' : ''}
                                ${endpoint.method === 'POST' ? 'bg-green-500/20 text-green-400' : ''}
                                ${endpoint.method === 'PUT' ? 'bg-orange-500/20 text-orange-400' : ''}
                                ${endpoint.method === 'DELETE' ? 'bg-red-500/20 text-red-400' : ''}
                              `}>
                                {endpoint.method}
                              </span>
                              <div className="flex-1 min-w-0">
                                <div className="font-mono text-gray-200 mb-0.5 truncate" title={endpoint.path}>
                                  {endpoint.path}
                                </div>
                                <div className="text-gray-500 text-xs">
                                  {endpoint.description}
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>
            ))}
          </div>

          {/* Footer Note */}
          <div className="mt-20 text-center text-gray-500 text-sm">
            <p>
              For full API access and keys, please contact the SAGAR administration team.
            </p>
            <p className="mt-2">
              &copy; {new Date().getFullYear()} SAGAR Platform. All rights reserved.
            </p>
          </div>
        </div>
      </main>

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

export default APIDocumentation;
