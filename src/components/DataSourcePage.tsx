import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { FiArrowLeft, FiDatabase, FiMail, FiFileText, FiDownload, FiEye, FiX, FiExternalLink, FiPlay, FiPause, FiChevronRight, FiChevronDown, FiInfo } from 'react-icons/fi';

interface DataSourcePageProps {
  onBack: () => void;
  onLogout?: () => void;
}

const DataSourcePage: React.FC<DataSourcePageProps> = ({ onBack, onLogout }) => {
  const [selectedDataset, setSelectedDataset] = useState<string | null>(null);
  const [expandedSections, setExpandedSections] = useState<{ [key: string]: boolean }>({});
  const [isPipelineAnimating, setIsPipelineAnimating] = useState(false);
  const [currentStep, setCurrentStep] = useState<string>('');
  const [hoveredProcess, setHoveredProcess] = useState<string | null>(null);
  const [selectedProcess, setSelectedProcess] = useState<string | null>(null);

  const downloadFile = (filename: string, displayName: string) => {
    const link = document.createElement('a');
    link.href = `/${filename}`;
    link.download = displayName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const toggleSection = (section: string) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  const processInfo = {
    'login': {
      title: 'User Authentication',
      description: 'Secure login process that validates user credentials before granting access to the upload portal.',
      details: [
        'Validates provided credentials (prasannapal21, asdfasdf)',
        'Creates secure session for authenticated user',
        'Grants access to file upload interface',
        'Implements session timeout for security'
      ],
      icon: '🔐',
      color: 'blue'
    },
    'file-selection': {
      title: 'File Selection',
      description: 'User selects data files from their local computer with support for multiple scientific formats.',
      details: [
        'Supports .txt, .csv, .nc (NetCDF), .jpg formats',
        'File type validation and size checking',
        'Preview functionality for supported formats',
        'Drag-and-drop interface support'
      ],
      icon: '📁',
      color: 'blue'
    },
    'upload': {
      title: 'Direct Upload to Storage',
      description: 'Files are uploaded directly to Supabase Storage without involving backend API services.',
      details: [
        'Direct browser-to-storage upload',
        'Uses Supabase Storage raw-uploads bucket',
        'No backend API involvement',
        'Automatic file validation on upload'
      ],
      icon: '⬆️',
      color: 'blue'
    },
    'trigger': {
      title: 'Event Trigger',
      description: 'Automatic event notification system that detects file uploads and initiates backend processing.',
      details: [
        'Database webhook listens for INSERT events',
        'Triggers on successful file upload',
        'Extracts filename from event payload',
        'Initiates automated backend workflow'
      ],
      icon: '⚡',
      color: 'red'
    },
    'dispatch': {
      title: 'Edge Function Dispatch',
      description: 'Lightweight dispatcher that routes processing requests to the Data Ingestion Service.',
      details: [
        'Supabase Edge Function acts as dispatcher',
        'Makes secure POST API calls',
        'Sends filename as JSON payload',
        'Handles service communication'
      ],
      icon: '🚀',
      color: 'yellow'
    },
    'process': {
      title: 'Data Processing',
      description: 'Core data transformation workflow that converts raw files into standardized formats.',
      details: [
        'Downloads raw file from storage',
        'Identifies file type and routes appropriately',
        'Extracts metadata and converts to DataFrame',
        'Generates geospatial footprint if coordinates present'
      ],
      icon: '⚙️',
      color: 'green'
    },
    'store': {
      title: 'Storage & Catalog',
      description: 'Final storage of processed data in Parquet format with complete metadata cataloging.',
      details: [
        'Converts DataFrame to Apache Parquet format',
        'Uploads to processed-data bucket (data lakehouse)',
        'Updates file_metadata table in database',
        'Creates permanent record with geospatial data'
      ],
      icon: '💾',
      color: 'purple'
    }
  };

  const startPipelineAnimation = () => {
    setIsPipelineAnimating(true);
    setCurrentStep('Starting...');
    // Auto-expand sections during animation
    setExpandedSections({ stage1: true, stage2: true });
    
    // Step sequence with timing
    const steps = [
      { time: 0, step: 'Stage 1: Frontend Upload' },
      { time: 500, step: 'Login Process' },
      { time: 1200, step: 'File Selection' },
      { time: 1900, step: 'Upload to Storage' },
      { time: 2600, step: 'Stage 2: Backend Processing' },
      { time: 3300, step: 'Event Trigger' },
      { time: 4000, step: 'Edge Function Dispatch' },
      { time: 4700, step: 'Data Processing' },
      { time: 5400, step: 'Storage & Catalog' },
      { time: 8000, step: 'Complete!' }
    ];

    steps.forEach(({ time, step }) => {
      setTimeout(() => setCurrentStep(step), time);
    });

    setTimeout(() => {
      setIsPipelineAnimating(false);
      setCurrentStep('');
    }, 8000);
  };

  const datasets = {
    'adcp': {
      title: 'ADCP (Acoustic Doppler Current Profiler) Data',
      description: 'High-resolution current velocity profiles collected using ADCP technology. This data provides detailed information about ocean current patterns and water column dynamics.',
      details: {
        'Format': 'LTA files with ensemble data',
        'Frequency': '76.8 kHz Broadband',
        'Pings/Ensemble': '197',
        'Time/Ping': '00:01.50',
        'Bin Size': '4.00m',
        'Coverage': 'Multiple depth bins with velocity measurements',
        'Data Range': 'Surface to 1000m depth',
        'Parameters': 'East velocity, North velocity, Magnitude, Direction'
      },
      sampleData: 'Sample ADCP data shows current velocities at different depths with timestamps and GPS coordinates.',
      usage: 'Used for ocean current modeling, marine navigation, and climate research.',
      files: [
        { filename: 'ADCP-sample data.txt', displayName: 'ADCP Sample Data.txt', description: 'Sample ADCP current velocity data' }
      ]
    },
    'aws': {
      title: 'AWS (Automatic Weather Station) Data',
      description: 'Meteorological data including GPS coordinates, wind speed, atmospheric pressure, temperature, humidity, and sea surface temperature.',
      details: {
        'Parameters': 'GPS, Wind Speed, Wind Direction, Atmospheric Pressure, Temperature, Humidity, Sea Surface Temperature',
        'Sampling': 'Continuous monitoring every minute',
        'Location': 'Marine research stations',
        'Data Quality': 'Real-time validation and quality control',
        'Storage': 'Automated data logging system',
        'Transmission': 'Satellite and cellular communication'
      },
      sampleData: 'Sample AWS data includes GPS coordinates (9°58.257N, 76°14.625E), wind speed (5.04 m/s), and atmospheric pressure (1009.9 hPa).',
      usage: 'Essential for weather forecasting, climate monitoring, and marine safety.',
      files: [
        { filename: 'AWS sample data.txt', displayName: 'AWS Sample Data.txt', description: 'Sample AWS meteorological data' }
      ]
    },
    'ctd': {
      title: 'CTD (Conductivity, Temperature, Depth) Data',
      description: 'Oceanographic profiles including conductivity, temperature, pressure, oxygen levels, and water clarity measurements.',
      details: {
        'Parameters': 'Salinity, Temperature, Pressure, Oxygen, Transmission, Attenuation',
        'Depth Range': 'Surface to 2659m',
        'Station': 'STN298002 (FORV Sagar Sampada)',
        'Cruise': 'CR 297',
        'Location': '20°46.152N, 65°13.566E',
        'Sensors': 'Temperature SN 2881, Conductivity SN 2504',
        'Data Points': '1000 measurements per profile'
      },
      sampleData: 'CTD profile shows temperature decreasing from 26.5°C at surface to 8.9°C at depth, with salinity around 35.0 PSU.',
      usage: 'Critical for oceanographic research, water mass analysis, and ecosystem studies.',
      files: [
        { filename: 'stn298002.asc', displayName: 'CTD Data - Station 298002.asc', description: 'CTD profile data from station 298002' },
        { filename: 'stn298002.HDR', displayName: 'CTD Header - Station 298002.HDR', description: 'CTD data header information' }
      ]
    },
    'documentation': {
      title: 'Dataset Documentation',
      description: 'Comprehensive documentation describing data collection methods, quality control procedures, and data processing protocols.',
      details: {
        'Format': 'DOCX documentation files',
        'Content': 'Collection protocols, quality standards, processing methods',
        'Usage': 'Research and analysis guidelines',
        'Standards': 'International oceanographic data standards',
        'Validation': 'Multi-level quality control procedures',
        'Metadata': 'Complete dataset metadata and provenance'
      },
      sampleData: 'Documentation includes detailed protocols for data collection, calibration procedures, and quality assurance methods.',
      usage: 'Essential for understanding data collection methods and ensuring research reproducibility.',
      files: [
        { filename: 'sample data description.docx', displayName: 'Data Description Documentation.docx', description: 'Comprehensive data collection and processing documentation' }
      ]
    }
  };

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

            {/* Back Button */}
            <motion.button
              onClick={onBack}
              className="flex items-center space-x-2 px-4 py-2 bg-marine-cyan/20 hover:bg-marine-cyan/30 border border-marine-cyan/30 rounded-lg transition-colors duration-200"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5 }}
            >
              <FiArrowLeft className="w-4 h-4" />
              <span>Back to Dashboard</span>
            </motion.button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="pt-24 px-6">
        <div className="max-w-6xl mx-auto">
          {/* Page Header */}
          <motion.div 
            className="mb-12"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <div className="flex items-center justify-between mb-4">
              <h1 className="text-4xl font-bold text-white">
                Data Sources & Research Collaboration
              </h1>
              <motion.a
                href="https://data-ingestion-frontend-sagar.vercel.app/"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center space-x-2 px-6 py-3 bg-marine-cyan hover:bg-marine-cyan/80 text-marine-blue font-semibold rounded-lg transition-colors duration-200 shadow-lg hover:shadow-xl"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: 0.4 }}
              >
                <FiDatabase className="w-5 h-5" />
                <span>Ingest Data</span>
                <FiExternalLink className="w-4 h-4" />
              </motion.a>
            </div>
            <p className="text-xl text-gray-300">
              Information about our datasets and collaboration with CLMRE (Centre for Learning in Marine and Earth Sciences)
            </p>
          </motion.div>

          {/* Research Collaboration and Datasets Section */}
          <motion.section 
            className="mb-12"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Research Collaboration - Left Side (Full Height) */}
              <div className="bg-gray-900/50 border border-gray-700 rounded-xl p-6">
                <div className="flex items-center space-x-3 mb-4">
                  <FiMail className="w-5 h-5 text-marine-cyan" />
                  <h2 className="text-xl font-semibold text-white">Research Collaboration</h2>
                </div>
                
                <div className="mb-4">
                  <h3 className="text-base font-medium text-white mb-2">Correspondence with CLMRE</h3>
                  <p className="text-gray-300 text-sm mb-3">
                    We reached out to <strong>Dr. Karthic K</strong> from CLMRE to request access to marine research datasets for our SAGAR platform.
                  </p>
                  
                  <div className="bg-gray-800/50 rounded-lg p-2 mb-3">
                    <img 
                      src="/email-screenshot.jpeg" 
                      alt="Email correspondence with Dr. Karthic K from CLMRE"
                      className="w-full rounded-lg shadow-md"
                    />
                  </div>
                  
                  <div className="text-xs text-gray-400">
                    <strong>Contact:</strong> Dr. Karthic K, CLMRE<br/>
                    <strong>Purpose:</strong> Dataset collaboration<br/>
                    <strong>Status:</strong> Active collaboration
                  </div>
                </div>
              </div>

              {/* Right Side - Two Sections Stacked */}
              <div className="flex flex-col h-full">
                {/* Available Datasets - Top Right */}
                <div className="bg-gray-900/50 border border-gray-700 rounded-xl p-6 flex-1 mb-6 flex flex-col">
                  <div className="flex items-center space-x-3 mb-6">
                    <FiDatabase className="w-5 h-5 text-marine-cyan" />
                    <h2 className="text-xl font-semibold text-white">Used Datasets</h2>
                  </div>
                  
                  <div className="space-y-4 flex-1">
                    {/* ADCP Data */}
                        <motion.div 
                          className="bg-gray-800/50 rounded-lg p-4 cursor-pointer hover:bg-gray-700/50 transition-colors duration-200"
                          onClick={() => setSelectedDataset('adcp')}
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                        >
                          <div className="flex items-center justify-between mb-2">
                            <h3 className="text-base font-medium text-white flex items-center">
                              <FiFileText className="w-5 h-5 mr-2 text-marine-cyan" />
                              ADCP Data
                            </h3>
                            <div className="flex items-center space-x-2">
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  downloadFile('ADCP-sample data.txt', 'ADCP Sample Data.txt');
                                }}
                                className="p-1 hover:bg-marine-cyan/20 rounded transition-colors duration-200"
                                title="Download ADCP sample data"
                              >
                                <FiDownload className="w-4 h-4 text-marine-cyan" />
                              </button>
                              <FiEye className="w-5 h-5 text-marine-cyan" />
                            </div>
                          </div>
                          <p className="text-gray-300 text-sm mb-2">
                            High-resolution current velocity profiles using ADCP technology for ocean current analysis.
                          </p>
                          <div className="text-sm text-gray-400">
                            <strong>Format:</strong> LTA files • <strong>Frequency:</strong> 76.8 kHz • <strong>Depth:</strong> 0-1000m
                          </div>
                        </motion.div>

                    {/* AWS Data */}
                    <motion.div 
                      className="bg-gray-800/50 rounded-lg p-4 cursor-pointer hover:bg-gray-700/50 transition-colors duration-200"
                      onClick={() => setSelectedDataset('aws')}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="text-base font-medium text-white flex items-center">
                          <FiFileText className="w-5 h-5 mr-2 text-marine-cyan" />
                          AWS Data
                        </h3>
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              downloadFile('AWS sample data.txt', 'AWS Sample Data.txt');
                            }}
                            className="p-1 hover:bg-marine-cyan/20 rounded transition-colors duration-200"
                            title="Download AWS sample data"
                          >
                            <FiDownload className="w-4 h-4 text-marine-cyan" />
                          </button>
                          <FiEye className="w-5 h-5 text-marine-cyan" />
                        </div>
                      </div>
                      <p className="text-gray-300 text-sm mb-2">
                        Meteorological data including GPS coordinates, wind speed, atmospheric pressure, and temperature.
                      </p>
                      <div className="text-sm text-gray-400">
                        <strong>Parameters:</strong> GPS, Wind, Pressure • <strong>Sampling:</strong> Continuous • <strong>Location:</strong> Marine stations
                      </div>
                    </motion.div>

                    {/* CTD Data */}
                    <motion.div 
                      className="bg-gray-800/50 rounded-lg p-4 cursor-pointer hover:bg-gray-700/50 transition-colors duration-200"
                      onClick={() => setSelectedDataset('ctd')}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="text-base font-medium text-white flex items-center">
                          <FiFileText className="w-5 h-5 mr-2 text-marine-cyan" />
                          CTD Data
                        </h3>
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              downloadFile('stn298002.asc', 'CTD Data - Station 298002.asc');
                            }}
                            className="p-1 hover:bg-marine-cyan/20 rounded transition-colors duration-200"
                            title="Download CTD data"
                          >
                            <FiDownload className="w-4 h-4 text-marine-cyan" />
                          </button>
                          <FiEye className="w-5 h-5 text-marine-cyan" />
                        </div>
                      </div>
                      <p className="text-gray-300 text-sm mb-2">
                        Oceanographic profiles including conductivity, temperature, pressure, oxygen levels, and water clarity.
                      </p>
                      <div className="text-sm text-gray-400">
                        <strong>Parameters:</strong> Salinity, Temperature, Oxygen • <strong>Depth:</strong> Surface to 2659m • <strong>Station:</strong> STN298002
                      </div>
                    </motion.div>

                    {/* Documentation */}
                    <motion.div 
                      className="bg-gray-800/50 rounded-lg p-4 cursor-pointer hover:bg-gray-700/50 transition-colors duration-200"
                      onClick={() => setSelectedDataset('documentation')}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="text-base font-medium text-white flex items-center">
                          <FiFileText className="w-5 h-5 mr-2 text-marine-cyan" />
                          Documentation
                        </h3>
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              downloadFile('sample data description.docx', 'Data Description Documentation.docx');
                            }}
                            className="p-1 hover:bg-marine-cyan/20 rounded transition-colors duration-200"
                            title="Download documentation"
                          >
                            <FiDownload className="w-4 h-4 text-marine-cyan" />
                          </button>
                          <FiEye className="w-5 h-5 text-marine-cyan" />
                        </div>
                      </div>
                      <p className="text-gray-300 text-sm mb-2">
                        Comprehensive documentation for data collection methods, quality control procedures, and processing protocols.
                      </p>
                      <div className="text-sm text-gray-400">
                        <strong>Format:</strong> DOCX • <strong>Content:</strong> Protocols, standards • <strong>Usage:</strong> Research guidelines
                      </div>
                    </motion.div>
                  </div>
                </div>

                {/* Data Integration - Bottom Right */}
                <div className="bg-gray-900/50 border border-gray-700 rounded-xl p-6 flex-1 flex flex-col">
                  <div className="flex items-center space-x-3 mb-6">
                    <FiDownload className="w-5 h-5 text-marine-cyan" />
                    <h2 className="text-xl font-semibold text-white">Data Integration</h2>
                  </div>
                  
                  <div className="space-y-6 flex-1">
                    <div className="text-center bg-gray-800/30 rounded-lg p-4">
                      <div className="w-16 h-16 bg-marine-cyan/20 rounded-full flex items-center justify-center mx-auto mb-4">
                        <FiDatabase className="w-8 h-8 text-marine-cyan" />
                      </div>
                      <h3 className="text-base font-medium text-white mb-3">Data Collection</h3>
                      <p className="text-gray-300 text-sm leading-relaxed">
                        Systematic collection of oceanographic and meteorological data from research vessels and monitoring stations across multiple locations.
                      </p>
                      <div className="mt-3 text-xs text-marine-cyan">
                        • Real-time monitoring • Automated logging • Quality validation
                      </div>
                    </div>
                    
                    <div className="text-center bg-gray-800/30 rounded-lg p-4">
                      <div className="w-16 h-16 bg-marine-cyan/20 rounded-full flex items-center justify-center mx-auto mb-4">
                        <FiFileText className="w-8 h-8 text-marine-cyan" />
                      </div>
                      <h3 className="text-base font-medium text-white mb-3">Data Processing</h3>
                      <p className="text-gray-300 text-sm leading-relaxed">
                        Quality control, calibration, and standardization of raw data for research and analysis purposes with advanced algorithms.
                      </p>
                      <div className="mt-3 text-xs text-marine-cyan">
                        • Calibration protocols • Quality assurance • Data validation
                      </div>
                    </div>
                    
                    <div className="text-center bg-gray-800/30 rounded-lg p-4">
                      <div className="w-16 h-16 bg-marine-cyan/20 rounded-full flex items-center justify-center mx-auto mb-4">
                        <FiDownload className="w-8 h-8 text-marine-cyan" />
                      </div>
                      <h3 className="text-base font-medium text-white mb-3">Data Access</h3>
                      <p className="text-gray-300 text-sm leading-relaxed">
                        Secure and controlled access to processed datasets for authorized research and educational purposes with comprehensive documentation.
                      </p>
                      <div className="mt-3 text-xs text-marine-cyan">
                        • Secure protocols • User authentication • Data documentation
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.section>

          {/* SAGAR Data Ingestion Pipeline Section */}
          <motion.section 
            className="mb-12"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
          >
            <div className="bg-gray-900/50 border border-gray-700 rounded-xl p-8">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center space-x-3">
                  <FiDatabase className="w-6 h-6 text-marine-cyan" />
                  <h2 className="text-2xl font-semibold text-white">SAGAR Data Ingestion Pipeline</h2>
                </div>
                <motion.button
                  onClick={startPipelineAnimation}
                  className="flex items-center space-x-2 px-4 py-2 bg-marine-cyan/20 hover:bg-marine-cyan/30 border border-marine-cyan/30 rounded-lg transition-colors duration-200"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <FiPlay className="w-4 h-4" />
                  <span>Animate Flow</span>
                </motion.button>
              </div>
              
              <p className="text-gray-300 mb-8 text-center">
                Fully automated, cloud-native system that transforms raw files into standardized, analysis-ready assets
              </p>

              {/* Animation Progress Indicator */}
              {isPipelineAnimating && (
                <motion.div 
                  className="mb-6"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-gray-300">Animation Progress</span>
                    <motion.span 
                      className="text-sm font-medium text-marine-cyan"
                      key={currentStep}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                    >
                      {currentStep}
                    </motion.span>
                  </div>
                  <div className="bg-gray-800/30 rounded-full h-2 overflow-hidden">
                    <motion.div
                      className="h-full bg-gradient-to-r from-blue-500 to-marine-cyan"
                      initial={{ width: "0%" }}
                      animate={{ width: "100%" }}
                      transition={{ duration: 8, ease: "linear" }}
                    />
                  </div>
                </motion.div>
              )}

              {/* Interactive Pipeline Flow */}
              <div className="relative">
                {/* Stage 1 - Frontend */}
                <motion.div 
                  className="bg-gradient-to-r from-blue-600/20 to-blue-500/20 border border-blue-500/30 rounded-xl p-6 mb-6 cursor-pointer"
                  onClick={() => toggleSection('stage1')}
                  whileHover={{ scale: 1.02 }}
                  animate={isPipelineAnimating ? { 
                    boxShadow: "0 0 20px rgba(59, 130, 246, 0.5)",
                    scale: 1.02 
                  } : {}}
                  transition={{ duration: 0.5 }}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="w-12 h-12 bg-blue-500/20 rounded-full flex items-center justify-center">
                        <span className="text-xl font-bold text-blue-400">1</span>
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-white">Frontend Upload</h3>
                        <p className="text-gray-300 text-sm">User authentication & file selection</p>
                      </div>
                    </div>
                    <motion.div
                      animate={{ rotate: expandedSections.stage1 ? 90 : 0 }}
                      transition={{ duration: 0.3 }}
                    >
                      <FiChevronRight className="w-5 h-5 text-gray-400" />
                    </motion.div>
                  </div>
                  
                  {expandedSections.stage1 && (
                    <motion.div 
                      className="mt-4 space-y-3"
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                    >
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                        <motion.div 
                          className="bg-gray-800/50 rounded-lg p-3 text-center cursor-pointer relative"
                          animate={isPipelineAnimating ? {
                            boxShadow: "0 0 20px rgba(59, 130, 246, 0.6)",
                            scale: 1.05,
                            backgroundColor: "rgba(59, 130, 246, 0.1)"
                          } : {}}
                          transition={{ delay: 0.5, duration: 0.8 }}
                          onHoverStart={() => setHoveredProcess('login')}
                          onHoverEnd={() => setHoveredProcess(null)}
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedProcess('login');
                          }}
                          whileHover={{ scale: 1.05 }}
                        >
                          <motion.div
                            animate={isPipelineAnimating ? { 
                              scale: [1, 1.2, 1],
                              rotate: [0, 5, -5, 0]
                            } : {}}
                            transition={{ delay: 0.5, duration: 0.6 }}
                          >
                            <FiInfo className="w-6 h-6 text-blue-400 mx-auto mb-2" />
                          </motion.div>
                          <h4 className="text-sm font-medium text-white">Login</h4>
                          <p className="text-xs text-gray-400">Secure authentication</p>
                          
                          {/* Hover Tooltip */}
                          {hoveredProcess === 'login' && (
                            <motion.div
                              className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 bg-gray-900 border border-gray-700 rounded-lg p-3 w-64 z-50"
                              initial={{ opacity: 0, y: 10 }}
                              animate={{ opacity: 1, y: 0 }}
                              exit={{ opacity: 0, y: 10 }}
                            >
                              <div className="text-center">
                                <div className="text-lg mb-1">🔐</div>
                                <h5 className="text-sm font-semibold text-white mb-1">User Authentication</h5>
                                <p className="text-xs text-gray-300">Secure login process that validates user credentials</p>
                              </div>
                              <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-700"></div>
                            </motion.div>
                          )}
                        </motion.div>
                        
                        <motion.div 
                          className="bg-gray-800/50 rounded-lg p-3 text-center cursor-pointer relative"
                          animate={isPipelineAnimating ? {
                            boxShadow: "0 0 20px rgba(59, 130, 246, 0.6)",
                            scale: 1.05,
                            backgroundColor: "rgba(59, 130, 246, 0.1)"
                          } : {}}
                          transition={{ delay: 1.2, duration: 0.8 }}
                          onHoverStart={() => setHoveredProcess('file-selection')}
                          onHoverEnd={() => setHoveredProcess(null)}
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedProcess('file-selection');
                          }}
                          whileHover={{ scale: 1.05 }}
                        >
                          <motion.div
                            animate={isPipelineAnimating ? { 
                              scale: [1, 1.2, 1],
                              rotate: [0, 5, -5, 0]
                            } : {}}
                            transition={{ delay: 1.2, duration: 0.6 }}
                          >
                            <FiFileText className="w-6 h-6 text-blue-400 mx-auto mb-2" />
                          </motion.div>
                          <h4 className="text-sm font-medium text-white">Select File</h4>
                          <p className="text-xs text-gray-400">.txt, .csv, .nc, .jpg</p>
                          
                          {/* Hover Tooltip */}
                          {hoveredProcess === 'file-selection' && (
                            <motion.div
                              className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 bg-gray-900 border border-gray-700 rounded-lg p-3 w-64 z-50"
                              initial={{ opacity: 0, y: 10 }}
                              animate={{ opacity: 1, y: 0 }}
                              exit={{ opacity: 0, y: 10 }}
                            >
                              <div className="text-center">
                                <div className="text-lg mb-1">📁</div>
                                <h5 className="text-sm font-semibold text-white mb-1">File Selection</h5>
                                <p className="text-xs text-gray-300">User selects data files with multiple format support</p>
                              </div>
                              <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-700"></div>
                            </motion.div>
                          )}
                        </motion.div>
                        
                        <motion.div 
                          className="bg-gray-800/50 rounded-lg p-3 text-center cursor-pointer relative"
                          animate={isPipelineAnimating ? {
                            boxShadow: "0 0 20px rgba(59, 130, 246, 0.6)",
                            scale: 1.05,
                            backgroundColor: "rgba(59, 130, 246, 0.1)"
                          } : {}}
                          transition={{ delay: 1.9, duration: 0.8 }}
                          onHoverStart={() => setHoveredProcess('upload')}
                          onHoverEnd={() => setHoveredProcess(null)}
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedProcess('upload');
                          }}
                          whileHover={{ scale: 1.05 }}
                        >
                          <motion.div
                            animate={isPipelineAnimating ? { 
                              scale: [1, 1.2, 1],
                              rotate: [0, 5, -5, 0]
                            } : {}}
                            transition={{ delay: 1.9, duration: 0.6 }}
                          >
                            <FiDownload className="w-6 h-6 text-blue-400 mx-auto mb-2" />
                          </motion.div>
                          <h4 className="text-sm font-medium text-white">Upload</h4>
                          <p className="text-xs text-gray-400">Direct to storage</p>
                          
                          {/* Hover Tooltip */}
                          {hoveredProcess === 'upload' && (
                            <motion.div
                              className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 bg-gray-900 border border-gray-700 rounded-lg p-3 w-64 z-50"
                              initial={{ opacity: 0, y: 10 }}
                              animate={{ opacity: 1, y: 0 }}
                              exit={{ opacity: 0, y: 10 }}
                            >
                              <div className="text-center">
                                <div className="text-lg mb-1">⬆️</div>
                                <h5 className="text-sm font-semibold text-white mb-1">Direct Upload</h5>
                                <p className="text-xs text-gray-300">Files uploaded directly to Supabase Storage</p>
                              </div>
                              <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-700"></div>
                            </motion.div>
                          )}
                        </motion.div>
                      </div>
                    </motion.div>
                  )}
                </motion.div>

                {/* Arrow */}
                <div className="flex justify-center mb-6">
                  <motion.div
                    className="w-8 h-8 bg-marine-cyan/20 rounded-full flex items-center justify-center"
                    animate={isPipelineAnimating ? { 
                      y: [0, -10, 0],
                      scale: [1, 1.1, 1],
                      boxShadow: [
                        "0 0 0px rgba(6, 182, 212, 0)",
                        "0 0 20px rgba(6, 182, 212, 0.8)",
                        "0 0 0px rgba(6, 182, 212, 0)"
                      ]
                    } : {}}
                    transition={{ 
                      duration: 0.8, 
                      repeat: isPipelineAnimating ? Infinity : 0,
                      repeatDelay: 0.5
                    }}
                  >
                    <motion.div
                      animate={isPipelineAnimating ? {
                        scale: [1, 1.2, 1],
                        rotate: [0, 5, -5, 0]
                      } : {}}
                      transition={{ 
                        duration: 0.6, 
                        repeat: isPipelineAnimating ? Infinity : 0,
                        repeatDelay: 0.5
                      }}
                    >
                      <FiChevronDown className="w-4 h-4 text-marine-cyan" />
                    </motion.div>
                  </motion.div>
                </div>

                {/* Stage 2 - Backend */}
                <motion.div 
                  className="bg-gradient-to-r from-marine-cyan/20 to-cyan-500/20 border border-marine-cyan/30 rounded-xl p-6 cursor-pointer"
                  onClick={() => toggleSection('stage2')}
                  whileHover={{ scale: 1.02 }}
                  animate={isPipelineAnimating ? { 
                    boxShadow: "0 0 20px rgba(6, 182, 212, 0.5)",
                    scale: 1.02 
                  } : {}}
                  transition={{ duration: 0.5, delay: 0.5 }}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="w-12 h-12 bg-marine-cyan/20 rounded-full flex items-center justify-center">
                        <span className="text-xl font-bold text-marine-cyan">2</span>
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-white">Automated Processing</h3>
                        <p className="text-gray-300 text-sm">Event-driven backend workflow</p>
                      </div>
                    </div>
                    <motion.div
                      animate={{ rotate: expandedSections.stage2 ? 90 : 0 }}
                      transition={{ duration: 0.3 }}
                    >
                      <FiChevronRight className="w-5 h-5 text-gray-400" />
                    </motion.div>
                  </div>
                  
                  {expandedSections.stage2 && (
                    <motion.div 
                      className="mt-4 space-y-3"
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                    >
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
                        <motion.div 
                          className="bg-gray-800/50 rounded-lg p-3 text-center cursor-pointer relative"
                          animate={isPipelineAnimating ? {
                            boxShadow: "0 0 20px rgba(239, 68, 68, 0.6)",
                            scale: 1.05,
                            backgroundColor: "rgba(239, 68, 68, 0.1)"
                          } : {}}
                          transition={{ delay: 2.6, duration: 0.8 }}
                          onHoverStart={() => setHoveredProcess('trigger')}
                          onHoverEnd={() => setHoveredProcess(null)}
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedProcess('trigger');
                          }}
                          whileHover={{ scale: 1.05 }}
                        >
                          <motion.div 
                            className="w-8 h-8 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-2"
                            animate={isPipelineAnimating ? {
                              scale: [1, 1.3, 1],
                              rotate: [0, 10, -10, 0]
                            } : {}}
                            transition={{ delay: 2.6, duration: 0.6 }}
                          >
                            <span className="text-xs font-bold text-red-400">⚡</span>
                          </motion.div>
                          <h4 className="text-sm font-medium text-white">Trigger</h4>
                          <p className="text-xs text-gray-400">Event notification</p>
                          
                          {/* Hover Tooltip */}
                          {hoveredProcess === 'trigger' && (
                            <motion.div
                              className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 bg-gray-900 border border-gray-700 rounded-lg p-3 w-64 z-50"
                              initial={{ opacity: 0, y: 10 }}
                              animate={{ opacity: 1, y: 0 }}
                              exit={{ opacity: 0, y: 10 }}
                            >
                              <div className="text-center">
                                <div className="text-lg mb-1">⚡</div>
                                <h5 className="text-sm font-semibold text-white mb-1">Event Trigger</h5>
                                <p className="text-xs text-gray-300">Automatic event notification system</p>
                              </div>
                              <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-700"></div>
                            </motion.div>
                          )}
                        </motion.div>
                        
                        <motion.div 
                          className="bg-gray-800/50 rounded-lg p-3 text-center cursor-pointer relative"
                          animate={isPipelineAnimating ? {
                            boxShadow: "0 0 20px rgba(234, 179, 8, 0.6)",
                            scale: 1.05,
                            backgroundColor: "rgba(234, 179, 8, 0.1)"
                          } : {}}
                          transition={{ delay: 3.3, duration: 0.8 }}
                          onHoverStart={() => setHoveredProcess('dispatch')}
                          onHoverEnd={() => setHoveredProcess(null)}
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedProcess('dispatch');
                          }}
                          whileHover={{ scale: 1.05 }}
                        >
                          <motion.div 
                            className="w-8 h-8 bg-yellow-500/20 rounded-full flex items-center justify-center mx-auto mb-2"
                            animate={isPipelineAnimating ? {
                              scale: [1, 1.3, 1],
                              rotate: [0, 10, -10, 0]
                            } : {}}
                            transition={{ delay: 3.3, duration: 0.6 }}
                          >
                            <span className="text-xs font-bold text-yellow-400">🚀</span>
                          </motion.div>
                          <h4 className="text-sm font-medium text-white">Dispatch</h4>
                          <p className="text-xs text-gray-400">Edge function</p>
                          
                          {/* Hover Tooltip */}
                          {hoveredProcess === 'dispatch' && (
                            <motion.div
                              className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 bg-gray-900 border border-gray-700 rounded-lg p-3 w-64 z-50"
                              initial={{ opacity: 0, y: 10 }}
                              animate={{ opacity: 1, y: 0 }}
                              exit={{ opacity: 0, y: 10 }}
                            >
                              <div className="text-center">
                                <div className="text-lg mb-1">🚀</div>
                                <h5 className="text-sm font-semibold text-white mb-1">Edge Function Dispatch</h5>
                                <p className="text-xs text-gray-300">Lightweight dispatcher for processing requests</p>
                              </div>
                              <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-700"></div>
                            </motion.div>
                          )}
                        </motion.div>
                        
                        <motion.div 
                          className="bg-gray-800/50 rounded-lg p-3 text-center cursor-pointer relative"
                          animate={isPipelineAnimating ? {
                            boxShadow: "0 0 20px rgba(34, 197, 94, 0.6)",
                            scale: 1.05,
                            backgroundColor: "rgba(34, 197, 94, 0.1)"
                          } : {}}
                          transition={{ delay: 4.0, duration: 0.8 }}
                          onHoverStart={() => setHoveredProcess('process')}
                          onHoverEnd={() => setHoveredProcess(null)}
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedProcess('process');
                          }}
                          whileHover={{ scale: 1.05 }}
                        >
                          <motion.div 
                            className="w-8 h-8 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-2"
                            animate={isPipelineAnimating ? {
                              scale: [1, 1.3, 1],
                              rotate: [0, 10, -10, 0]
                            } : {}}
                            transition={{ delay: 4.0, duration: 0.6 }}
                          >
                            <span className="text-xs font-bold text-green-400">⚙️</span>
                          </motion.div>
                          <h4 className="text-sm font-medium text-white">Process</h4>
                          <p className="text-xs text-gray-400">Data transformation</p>
                          
                          {/* Hover Tooltip */}
                          {hoveredProcess === 'process' && (
                            <motion.div
                              className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 bg-gray-900 border border-gray-700 rounded-lg p-3 w-64 z-50"
                              initial={{ opacity: 0, y: 10 }}
                              animate={{ opacity: 1, y: 0 }}
                              exit={{ opacity: 0, y: 10 }}
                            >
                              <div className="text-center">
                                <div className="text-lg mb-1">⚙️</div>
                                <h5 className="text-sm font-semibold text-white mb-1">Data Processing</h5>
                                <p className="text-xs text-gray-300">Core data transformation workflow</p>
                              </div>
                              <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-700"></div>
                            </motion.div>
                          )}
                        </motion.div>
                        
                        <motion.div 
                          className="bg-gray-800/50 rounded-lg p-3 text-center cursor-pointer relative"
                          animate={isPipelineAnimating ? {
                            boxShadow: "0 0 20px rgba(168, 85, 247, 0.6)",
                            scale: 1.05,
                            backgroundColor: "rgba(168, 85, 247, 0.1)"
                          } : {}}
                          transition={{ delay: 4.7, duration: 0.8 }}
                          onHoverStart={() => setHoveredProcess('store')}
                          onHoverEnd={() => setHoveredProcess(null)}
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedProcess('store');
                          }}
                          whileHover={{ scale: 1.05 }}
                        >
                          <motion.div 
                            className="w-8 h-8 bg-purple-500/20 rounded-full flex items-center justify-center mx-auto mb-2"
                            animate={isPipelineAnimating ? {
                              scale: [1, 1.3, 1],
                              rotate: [0, 10, -10, 0]
                            } : {}}
                            transition={{ delay: 4.7, duration: 0.6 }}
                          >
                            <span className="text-xs font-bold text-purple-400">💾</span>
                          </motion.div>
                          <h4 className="text-sm font-medium text-white">Store</h4>
                          <p className="text-xs text-gray-400">Parquet + catalog</p>
                          
                          {/* Hover Tooltip */}
                          {hoveredProcess === 'store' && (
                            <motion.div
                              className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 bg-gray-900 border border-gray-700 rounded-lg p-3 w-64 z-50"
                              initial={{ opacity: 0, y: 10 }}
                              animate={{ opacity: 1, y: 0 }}
                              exit={{ opacity: 0, y: 10 }}
                            >
                              <div className="text-center">
                                <div className="text-lg mb-1">💾</div>
                                <h5 className="text-sm font-semibold text-white mb-1">Storage & Catalog</h5>
                                <p className="text-xs text-gray-300">Final storage with metadata cataloging</p>
                              </div>
                              <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-700"></div>
                            </motion.div>
                          )}
                        </motion.div>
                      </div>
                    </motion.div>
                  )}
                </motion.div>
              </div>

              {/* Key Features */}
              <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-center">
                  <div className="w-12 h-12 bg-marine-cyan/20 rounded-full flex items-center justify-center mx-auto mb-3">
                    <FiPlay className="w-6 h-6 text-marine-cyan" />
                  </div>
                  <h4 className="text-sm font-medium text-white mb-1">Event-Driven</h4>
                  <p className="text-xs text-gray-400">Automatic processing on upload</p>
                </div>
                <div className="text-center">
                  <div className="w-12 h-12 bg-marine-cyan/20 rounded-full flex items-center justify-center mx-auto mb-3">
                    <FiDatabase className="w-6 h-6 text-marine-cyan" />
                  </div>
                  <h4 className="text-sm font-medium text-white mb-1">Multi-Format</h4>
                  <p className="text-xs text-gray-400">Supports various data types</p>
                </div>
                <div className="text-center">
                  <div className="w-12 h-12 bg-marine-cyan/20 rounded-full flex items-center justify-center mx-auto mb-3">
                    <FiFileText className="w-6 h-6 text-marine-cyan" />
                  </div>
                  <h4 className="text-sm font-medium text-white mb-1">Standardized</h4>
                  <p className="text-xs text-gray-400">Consistent data format</p>
                </div>
              </div>
            </div>
          </motion.section>

        </div>
      </main>

      {/* Dataset Detail Modal */}
      {selectedDataset && (
        <div className="fixed inset-0 z-[100] bg-black/70 flex items-center justify-center p-4">
          <motion.div 
            className="w-full max-w-4xl bg-gray-900 border border-gray-700 rounded-xl max-h-[90vh] overflow-y-auto"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ duration: 0.3 }}
          >
            <div className="p-6">
              {/* Modal Header */}
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center space-x-3">
                  <FiDatabase className="w-6 h-6 text-marine-cyan" />
                  <h2 className="text-2xl font-semibold text-white">
                    {datasets[selectedDataset as keyof typeof datasets].title}
                  </h2>
                </div>
                <button
                  onClick={() => setSelectedDataset(null)}
                  className="p-2 hover:bg-gray-800 rounded-lg transition-colors duration-200"
                >
                  <FiX className="w-5 h-5 text-gray-400" />
                </button>
              </div>

              {/* Modal Content */}
              <div className="space-y-6">
                {/* Description */}
                <div>
                  <h3 className="text-lg font-medium text-white mb-3">Description</h3>
                  <p className="text-gray-300">
                    {datasets[selectedDataset as keyof typeof datasets].description}
                  </p>
                </div>

                {/* Technical Details */}
                <div>
                  <h3 className="text-lg font-medium text-white mb-3">Technical Details</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {Object.entries(datasets[selectedDataset as keyof typeof datasets].details).map(([key, value]) => (
                      <div key={key} className="bg-gray-800/50 rounded-lg p-4">
                        <div className="text-sm font-medium text-marine-cyan mb-1">{key}</div>
                        <div className="text-sm text-gray-300">{value}</div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Sample Data */}
                <div>
                  <h3 className="text-lg font-medium text-white mb-3">Sample Data</h3>
                  <div className="bg-gray-800/50 rounded-lg p-4">
                    <p className="text-gray-300 text-sm">
                      {datasets[selectedDataset as keyof typeof datasets].sampleData}
                    </p>
                  </div>
                </div>

                {/* Usage */}
                <div>
                  <h3 className="text-lg font-medium text-white mb-3">Usage & Applications</h3>
                  <div className="bg-gradient-to-r from-marine-cyan/10 to-blue-600/10 border border-marine-cyan/30 rounded-lg p-4">
                    <p className="text-gray-300">
                      {datasets[selectedDataset as keyof typeof datasets].usage}
                    </p>
                  </div>
                </div>

                    {/* Available Files */}
                    <div>
                      <h3 className="text-lg font-medium text-white mb-3">Available Files</h3>
                      <div className="space-y-3">
                        {datasets[selectedDataset as keyof typeof datasets].files.map((file, index) => (
                          <motion.div 
                            key={index}
                            className="flex items-center justify-between bg-gray-800/50 rounded-lg p-4"
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: index * 0.1 }}
                          >
                            <div className="flex-1">
                              <h4 className="text-sm font-medium text-white mb-1">{file.displayName}</h4>
                              <p className="text-xs text-gray-400">{file.description}</p>
                            </div>
                            <button
                              onClick={() => downloadFile(file.filename, file.displayName)}
                              className="px-3 py-2 bg-marine-cyan hover:bg-marine-cyan/80 text-marine-blue font-semibold rounded-lg transition-colors duration-200 flex items-center space-x-2 text-sm"
                            >
                              <FiDownload className="w-4 h-4" />
                              <span>Download</span>
                            </button>
                          </motion.div>
                        ))}
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex items-center justify-end space-x-4 pt-4 border-t border-gray-700">
                      <button
                        onClick={() => setSelectedDataset(null)}
                        className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors duration-200"
                      >
                        Close
                      </button>
                    </div>
              </div>
            </div>
          </motion.div>
        </div>
          )}

          {/* Process Detail Modal */}
          {selectedProcess && (
            <div className="fixed inset-0 z-[100] bg-black/70 flex items-center justify-center p-4">
              <motion.div 
                className="w-full max-w-2xl bg-gray-900 border border-gray-700 rounded-xl max-h-[90vh] overflow-y-auto"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.3 }}
              >
                <div className="p-6">
                  {/* Modal Header */}
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center space-x-3">
                      <div className="text-3xl">{processInfo[selectedProcess as keyof typeof processInfo].icon}</div>
                      <div>
                        <h2 className="text-2xl font-semibold text-white">
                          {processInfo[selectedProcess as keyof typeof processInfo].title}
                        </h2>
                        <div className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${
                          processInfo[selectedProcess as keyof typeof processInfo].color === 'blue' ? 'bg-blue-500/20 text-blue-400' :
                          processInfo[selectedProcess as keyof typeof processInfo].color === 'red' ? 'bg-red-500/20 text-red-400' :
                          processInfo[selectedProcess as keyof typeof processInfo].color === 'yellow' ? 'bg-yellow-500/20 text-yellow-400' :
                          processInfo[selectedProcess as keyof typeof processInfo].color === 'green' ? 'bg-green-500/20 text-green-400' :
                          'bg-purple-500/20 text-purple-400'
                        }`}>
                          {processInfo[selectedProcess as keyof typeof processInfo].color === 'blue' ? 'Frontend Process' :
                           processInfo[selectedProcess as keyof typeof processInfo].color === 'red' ? 'Event System' :
                           processInfo[selectedProcess as keyof typeof processInfo].color === 'yellow' ? 'Edge Function' :
                           processInfo[selectedProcess as keyof typeof processInfo].color === 'green' ? 'Data Processing' :
                           'Storage System'}
                        </div>
                      </div>
                    </div>
                    <button
                      onClick={() => setSelectedProcess(null)}
                      className="p-2 hover:bg-gray-800 rounded-lg transition-colors duration-200"
                    >
                      <FiX className="w-5 h-5 text-gray-400" />
                    </button>
                  </div>

                  {/* Modal Content */}
                  <div className="space-y-6">
                    {/* Description */}
                    <div>
                      <h3 className="text-lg font-medium text-white mb-3">Description</h3>
                      <p className="text-gray-300 leading-relaxed">
                        {processInfo[selectedProcess as keyof typeof processInfo].description}
                      </p>
                    </div>

                    {/* Process Details */}
                    <div>
                      <h3 className="text-lg font-medium text-white mb-3">Process Details</h3>
                      <div className="space-y-3">
                        {processInfo[selectedProcess as keyof typeof processInfo].details.map((detail, index) => (
                          <motion.div 
                            key={index}
                            className="flex items-start space-x-3 bg-gray-800/50 rounded-lg p-4"
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: index * 0.1 }}
                          >
                            <div className={`w-2 h-2 rounded-full mt-2 flex-shrink-0 ${
                              processInfo[selectedProcess as keyof typeof processInfo].color === 'blue' ? 'bg-blue-400' :
                              processInfo[selectedProcess as keyof typeof processInfo].color === 'red' ? 'bg-red-400' :
                              processInfo[selectedProcess as keyof typeof processInfo].color === 'yellow' ? 'bg-yellow-400' :
                              processInfo[selectedProcess as keyof typeof processInfo].color === 'green' ? 'bg-green-400' :
                              'bg-purple-400'
                            }`} />
                            <p className="text-gray-300 text-sm">{detail}</p>
                          </motion.div>
                        ))}
                      </div>
                    </div>

                    {/* Technical Flow */}
                    <div>
                      <h3 className="text-lg font-medium text-white mb-3">Technical Flow</h3>
                      <div className={`p-4 rounded-lg border-l-4 ${
                        processInfo[selectedProcess as keyof typeof processInfo].color === 'blue' ? 'bg-blue-500/10 border-blue-500' :
                        processInfo[selectedProcess as keyof typeof processInfo].color === 'red' ? 'bg-red-500/10 border-red-500' :
                        processInfo[selectedProcess as keyof typeof processInfo].color === 'yellow' ? 'bg-yellow-500/10 border-yellow-500' :
                        processInfo[selectedProcess as keyof typeof processInfo].color === 'green' ? 'bg-green-500/10 border-green-500' :
                        'bg-purple-500/10 border-purple-500'
                      }`}>
                        <p className="text-gray-300 text-sm">
                          This process is part of the automated SAGAR data ingestion pipeline and operates seamlessly 
                          with other components to ensure reliable data processing and storage.
                        </p>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex items-center justify-end space-x-4 pt-4 border-t border-gray-700">
                      <button
                        onClick={() => setSelectedProcess(null)}
                        className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors duration-200"
                      >
                        Close
                      </button>
                      <button 
                        onClick={() => {
                          setSelectedProcess(null);
                          startPipelineAnimation();
                        }}
                        className="px-4 py-2 bg-marine-cyan hover:bg-marine-cyan/80 text-marine-blue font-semibold rounded-lg transition-colors duration-200 flex items-center space-x-2"
                      >
                        <FiPlay className="w-4 h-4" />
                        <span>See in Action</span>
                      </button>
                    </div>
                  </div>
                </div>
              </motion.div>
            </div>
          )}
        </div>
      );
    };

    export default DataSourcePage;
