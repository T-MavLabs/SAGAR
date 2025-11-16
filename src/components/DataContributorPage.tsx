import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FiArrowLeft, FiUpload, FiCheck, FiX, FiFile, FiDatabase, 
  FiBarChart2, FiUsers, FiAward, FiClock, FiEye, FiDownload,
  FiPlus, FiTrash2, FiEdit, FiCopy, FiExternalLink, FiAlertCircle,
  FiCalendar, FiMap, FiGlobe, FiLayers, FiFilter, FiDroplet,
  FiBook, FiStar, FiTrendingUp, FiShare2, FiGitBranch, FiZap,
  FiTarget, FiHeart, FiShield, FiCompass, FiAnchor, FiBox
} from 'react-icons/fi';
import { FaFish, FaWater, FaDna, FaMicroscope, FaMapMarkerAlt, FaShip, FaWaveSquare } from 'react-icons/fa';
import { IoWaterOutline, IoStatsChart } from 'react-icons/io5';

interface User {
  id: string;
  name: string;
  email: string;
  type: 'researcher' | 'contributor' | 'admin';
  organization?: string;
  specialization?: string[];
}

interface DataContributorPageProps {
  onBack: () => void;
  onLogout?: () => void;
  currentUser?: User | null;
}

interface UploadedFile {
  id: string;
  name: string;
  size: number;
  type: string;
  status: 'uploading' | 'processing' | 'completed' | 'error' | 'pendingReview' | 'published';
  progress: number;
  uploadedAt: Date;
  datasetType: string;
  records?: number;
  error?: string;
  waterBody?: string;
  location?: string;
  timePeriod?: string;
  downloads?: number;
  citations?: number;
}

interface ContributionStats {
  totalFiles: number;
  totalSize: number;
  publishedDatasets: number;
  pendingReview: number;
  totalDownloads: number;
  citations: number;
  dataQualityScore: number;
  impactScore: number;
}

const DataContributorPage: React.FC<DataContributorPageProps> = ({ onBack, onLogout, currentUser }) => {
  const [activeTab, setActiveTab] = useState<'upload' | 'my-data' | 'analytics' | 'guidelines'>('upload');
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedDatasetType, setSelectedDatasetType] = useState('oceanographic');
  const [fileDescription, setFileDescription] = useState('');
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [selectedWaterBody, setSelectedWaterBody] = useState('Bay of Bengal');
  const [collectionDate, setCollectionDate] = useState('');
  const [isHovering, setIsHovering] = useState<string | null>(null);

  const [stats, setStats] = useState<ContributionStats>({
    totalFiles: 12,
    totalSize: 245.7,
    publishedDatasets: 8,
    pendingReview: 2,
    totalDownloads: 1542,
    citations: 23,
    dataQualityScore: 94,
    impactScore: 87
  });

  // Enhanced Marine Dataset Types with attractive styling
  const marineDatasetTypes = [
    { 
      value: 'oceanographic', 
      label: 'Oceanographic Data', 
      icon: IoWaterOutline, 
      description: 'CTD profiles, temperature, salinity, currents',
      formats: 'CSV, NETCDF, TXT',
      color: 'marine-cyan',
      bgColor: 'bg-marine-cyan/20',
      borderColor: 'border-marine-cyan/40',
      textColor: 'text-marine-cyan'
    },
    { 
      value: 'biodiversity', 
      label: 'Biodiversity Data', 
      icon: FaFish, 
      description: 'Species observations, abundance, distribution',
      formats: 'CSV, XLSX, Darwin Core',
      color: 'marine-green',
      bgColor: 'bg-marine-green/20',
      borderColor: 'border-marine-green/40',
      textColor: 'text-marine-green'
    },
    { 
      value: 'molecular', 
      label: 'Molecular Data', 
      icon: FaDna, 
      description: 'eDNA sequences, genetic markers, metabarcoding',
      formats: 'FASTA, FASTQ, CSV',
      color: 'purple-400',
      bgColor: 'bg-purple-500/20',
      borderColor: 'border-purple-400/40',
      textColor: 'text-purple-400'
    },
    { 
      value: 'taxonomic', 
      label: 'Taxonomic Data', 
      icon: FaMicroscope, 
      description: 'Species identification, morphological data',
      formats: 'CSV, XLSX, Images',
      color: 'amber-400',
      bgColor: 'bg-amber-500/20',
      borderColor: 'border-amber-400/40',
      textColor: 'text-amber-400'
    },
    { 
      value: 'fisheries', 
      label: 'Fisheries Data', 
      icon: FiBarChart2, 
      description: 'Catch data, effort, species composition',
      formats: 'CSV, XLSX',
      color: 'teal-400',
      bgColor: 'bg-teal-500/20',
      borderColor: 'border-teal-400/40',
      textColor: 'text-teal-400'
    },
    { 
      value: 'remote-sensing', 
      label: 'Remote Sensing', 
      icon: FiGlobe, 
      description: 'Satellite data, chlorophyll, sea surface temp',
      formats: 'NETCDF, GEOTIFF, HDF',
      color: 'indigo-400',
      bgColor: 'bg-indigo-500/20',
      borderColor: 'border-indigo-400/40',
      textColor: 'text-indigo-400'
    }
  ];

  // Indian Water Bodies for SAGAR
  const indianWaterBodies = [
    'Bay of Bengal',
    'Arabian Sea',
    'Andaman Sea',
    'Indian Ocean',
    'Lakshadweep Sea',
    'Gulf of Mannar',
    'Palk Bay',
    'Gulf of Kutch',
    'Gulf of Khambhat'
  ];

  // Enhanced research impact data
  const researchImpact = [
    { year: '2020', publications: 2, downloads: 234, citations: 5, impact: 45 },
    { year: '2021', publications: 4, downloads: 567, citations: 12, impact: 62 },
    { year: '2022', publications: 6, downloads: 892, citations: 18, impact: 78 },
    { year: '2023', publications: 8, downloads: 1245, citations: 23, impact: 87 }
  ];

  // Initialize with marine research data
  useEffect(() => {
    setUploadedFiles([
      {
        id: '1',
        name: 'CTD_Profile_BayOfBengal_Stn298.csv',
        size: 2.4,
        type: 'oceanographic',
        status: 'published',
        progress: 100,
        uploadedAt: new Date('2024-01-15'),
        records: 1245,
        datasetType: 'Oceanographic Data',
        waterBody: 'Bay of Bengal',
        location: '15.5°N, 88.2°E',
        timePeriod: 'Jan 2024',
        downloads: 156,
        citations: 8
      },
      {
        id: '2',
        name: 'eDNA_Metabarcoding_Andaman.fasta',
        size: 45.8,
        type: 'molecular',
        status: 'published',
        progress: 100,
        uploadedAt: new Date('2024-01-10'),
        records: 12500,
        datasetType: 'Molecular Data',
        waterBody: 'Andaman Sea',
        location: '11.7°N, 92.8°E',
        timePeriod: 'Dec 2023',
        downloads: 89,
        citations: 3
      },
      {
        id: '3',
        name: 'Species_Inventory_GoMannar.xlsx',
        size: 1.2,
        type: 'biodiversity',
        status: 'pendingReview',
        progress: 100,
        uploadedAt: new Date('2024-01-20'),
        records: 234,
        datasetType: 'Biodiversity Data',
        waterBody: 'Gulf of Mannar',
        location: '9.2°N, 79.1°E',
        timePeriod: 'Nov 2023'
      },
      {
        id: '4',
        name: 'ADCP_Currents_ArabianSea.nc',
        size: 32.7,
        type: 'oceanographic',
        status: 'processing',
        progress: 65,
        uploadedAt: new Date('2024-01-18'),
        records: 8900,
        datasetType: 'Oceanographic Data',
        waterBody: 'Arabian Sea',
        location: '18.4°N, 72.8°E',
        timePeriod: 'Jan 2024'
      }
    ]);
  }, []);

  const handleFiles = (files: FileList) => {
    const newFiles: UploadedFile[] = Array.from(files).map(file => ({
      id: Math.random().toString(36).substr(2, 9),
      name: file.name,
      size: file.size / (1024 * 1024),
      type: selectedDatasetType,
      status: 'uploading',
      progress: 0,
      uploadedAt: new Date(),
      datasetType: marineDatasetTypes.find(dt => dt.value === selectedDatasetType)?.label || 'Unknown',
      waterBody: selectedWaterBody,
      timePeriod: collectionDate
    }));

    setUploadedFiles(prev => [...newFiles, ...prev]);
    setIsUploading(true);

    newFiles.forEach((file) => {
      simulateUpload(file.id);
    });
  };

  const simulateUpload = (fileId: string) => {
    let progress = 0;
    const interval = setInterval(() => {
      progress += Math.random() * 10;
      if (progress >= 100) {
        progress = 100;
        clearInterval(interval);
        
        setUploadedFiles(prev => prev.map(file => 
          file.id === fileId 
            ? { ...file, progress: 100, status: 'processing' }
            : file
        ));

        setTimeout(() => {
          setUploadedFiles(prev => prev.map(file => 
            file.id === fileId 
              ? { 
                  ...file, 
                  status: Math.random() > 0.3 ? 'completed' : 'pendingReview', 
                  records: Math.floor(Math.random() * 10000) + 100 
                }
              : file
          ));
          setShowSuccessModal(true);
        }, 2000);
      } else {
        setUploadedFiles(prev => prev.map(file => 
          file.id === fileId ? { ...file, progress } : file
        ));
      }
    }, 200);
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFiles(e.dataTransfer.files);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
      handleFiles(e.target.files);
    }
  };

  const onButtonClick = () => {
    fileInputRef.current?.click();
  };

  const removeFile = (fileId: string) => {
    setUploadedFiles(prev => prev.filter(file => file.id !== fileId));
  };

  const getStatusColor = (status: UploadedFile['status']) => {
    switch (status) {
      case 'uploading': return 'text-yellow-400';
      case 'processing': return 'text-blue-400';
      case 'completed': return 'text-green-400';
      case 'published': return 'text-green-400';
      case 'error': return 'text-red-400';
      case 'pendingReview': return 'text-orange-400';
      default: return 'text-gray-400';
    }
  };

  const getStatusIcon = (status: UploadedFile['status']) => {
    switch (status) {
      case 'uploading': return <div className="w-3 h-3 border-2 border-yellow-400 border-t-transparent rounded-full animate-spin" />;
      case 'processing': return <div className="w-3 h-3 border-2 border-blue-400 border-t-transparent rounded-full animate-spin" />;
      case 'completed': return <FiCheck className="w-4 h-4 text-green-400" />;
      case 'published': return <FiCheck className="w-4 h-4 text-green-400" />;
      case 'error': return <FiX className="w-4 h-4 text-red-400" />;
      case 'pendingReview': return <FiClock className="w-4 h-4 text-orange-400" />;
      default: return <FiClock className="w-4 h-4 text-gray-400" />;
    }
  };

  const formatFileSize = (size: number) => {
    return size < 1 ? `${(size * 1024).toFixed(1)} KB` : `${size.toFixed(1)} MB`;
  };

  const getCurrentType = () => marineDatasetTypes.find(t => t.value === selectedDatasetType);

  return (
    <div className="min-h-screen bg-marine-blue">
      {/* Animated Background Elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-marine-cyan/10 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-marine-green/10 rounded-full blur-3xl"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-blue-500/5 rounded-full blur-3xl"></div>
      </div>

      {/* Enhanced Header - Fixed padding for better visibility */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-marine-blue/95 backdrop-blur-xl border-b border-marine-cyan/30">
        <div className="max-w-7xl mx-auto px-6 py-3">
          <div className="flex items-center justify-between">
            {/* Logo and Back */}
            <div className="flex items-center space-x-4">
              <motion.button
                onClick={onBack}
                className="flex items-center space-x-2 px-4 py-2 bg-white/10 hover:bg-white/20 border border-white/20 rounded-xl backdrop-blur-sm transition-all duration-200 group"
                whileHover={{ scale: 1.05, x: -2 }}
                whileTap={{ scale: 0.95 }}
              >
                <FiArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                <span>Back to Dashboard</span>
              </motion.button>

              <div className="flex items-center space-x-3">
                <motion.div 
                  className="relative"
                  whileHover={{ scale: 1.05 }}
                >
                  <div className="w-10 h-10 rounded-xl bg-marine-cyan/20 border border-marine-cyan/30 flex items-center justify-center backdrop-blur-sm">
                    <img 
                      src="/WhatsApp Image 2025-09-29 at 03.04.02.jpeg" 
                      alt="SAGAR Logo" 
                      className="w-8 h-8 object-contain"
                    />
                  </div>
                </motion.div>
                <div className="flex flex-col">
                  <span className="text-xl font-bold text-white">SAGAR</span>
                  <span className="text-xs text-gray-400">Marine Data Portal</span>
                </div>
              </div>
            </div>

            {/* User Info */}
            <motion.div 
              className="flex items-center space-x-4"
              whileHover={{ scale: 1.02 }}
            >
              <div className="text-right">
                <div className="text-sm font-medium text-white">
                  {currentUser?.name || 'Marine Researcher'}
                </div>
                <div className="text-xs text-marine-green flex items-center space-x-1">
                  <FiAward className="w-3 h-3" />
                  <span>Data Contributor</span>
                </div>
                {currentUser?.organization && (
                  <div className="text-xs text-gray-400">{currentUser.organization}</div>
                )}
              </div>
              <div className="w-10 h-10 bg-marine-green/20 border border-marine-green/30 rounded-full flex items-center justify-center backdrop-blur-sm">
                <FiUsers className="w-5 h-5 text-marine-green" />
              </div>
            </motion.div>
          </div>

          {/* Enhanced Navigation Tabs */}
          <nav className="flex space-x-2 mt-4">
            {[
              { id: 'upload', label: 'Upload Data', icon: FiUpload, color: 'marine-cyan' },
              { id: 'my-data', label: 'My Datasets', icon: FiDatabase, color: 'marine-green' },
              { id: 'analytics', label: 'Research Impact', icon: IoStatsChart, color: 'purple-400' },
              { id: 'guidelines', label: 'Guidelines', icon: FiAward, color: 'amber-400' }
            ].map((tab) => (
              <motion.button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`relative flex items-center space-x-2 px-4 py-3 rounded-xl transition-all duration-200 font-medium ${
                  activeTab === tab.id
                    ? `text-white bg-${tab.color}/20 border border-${tab.color}/30 shadow-lg shadow-${tab.color}/10`
                    : 'text-gray-300 hover:text-white hover:bg-white/10 border border-transparent'
                } backdrop-blur-sm`}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <tab.icon className="w-4 h-4" />
                <span>{tab.label}</span>
                {activeTab === tab.id && (
                  <motion.div
                    className="absolute inset-0 border-2 border-white/20 rounded-xl"
                    layoutId="activeTab"
                    transition={{ type: "spring", stiffness: 300, damping: 30 }}
                  />
                )}
              </motion.button>
            ))}
          </nav>
        </div>
      </header>

      {/* Main Content - Adjusted top padding for better header visibility */}
      <main className="pt-28 pb-12 relative z-10">
        <div className="max-w-7xl mx-auto px-6">
          {/* Enhanced Stats Overview with Glass Morphism */}
          <motion.div 
            className="grid grid-cols-2 lg:grid-cols-7 gap-4 mb-8"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            {[
              { value: stats.totalFiles, label: 'Datasets', icon: FiDatabase, color: 'marine-cyan' },
              { value: `${stats.totalSize} MB`, label: 'Data Volume', icon: FiDownload, color: 'marine-green' },
              { value: stats.publishedDatasets, label: 'Published', icon: FiCheck, color: 'green-400' },
              { value: stats.pendingReview, label: 'In Review', icon: FiClock, color: 'orange-400' },
              { value: stats.totalDownloads, label: 'Downloads', icon: FiTrendingUp, color: 'blue-400' },
              { value: stats.citations, label: 'Citations', icon: FiBook, color: 'purple-400' },
              { value: `${stats.dataQualityScore}%`, label: 'Quality Score', icon: FiStar, color: 'yellow-400' }
            ].map((stat, index) => (
              <motion.div
                key={stat.label}
                className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-4 text-center hover:bg-white/10 transition-all duration-300 group cursor-pointer"
                whileHover={{ scale: 1.05, y: -2 }}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
              >
                <div className={`w-12 h-12 bg-${stat.color}/20 rounded-xl flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform duration-300 border border-${stat.color}/30`}>
                  <stat.icon className={`w-6 h-6 text-${stat.color}`} />
                </div>
                <div className="text-2xl font-bold text-white mb-1">{stat.value}</div>
                <div className="text-sm text-gray-300 group-hover:text-white transition-colors">{stat.label}</div>
              </motion.div>
            ))}
          </motion.div>

          {/* Enhanced Upload Section */}
          {activeTab === 'upload' && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5 }}
            >
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2">
                  <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="mb-8"
                  >
                    <h2 className="text-3xl font-bold text-white mb-2">
                      Contribute Marine Research Data
                    </h2>
                    <p className="text-gray-300">Share your valuable marine data with the global research community</p>
                  </motion.div>
                  
                  {/* Enhanced Marine Dataset Type Selection */}
                  <motion.div 
                    className="mb-8"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                  >
                    <label className="block text-lg font-semibold text-white mb-4 flex items-center space-x-2">
                      <FiLayers className="w-5 h-5 text-marine-cyan" />
                      <span>Marine Data Category</span>
                    </label>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                      {marineDatasetTypes.map((type) => (
                        <motion.button
                          key={type.value}
                          onClick={() => setSelectedDatasetType(type.value)}
                          className={`p-4 border-2 rounded-2xl text-left transition-all duration-300 group backdrop-blur-sm ${
                            selectedDatasetType === type.value
                              ? `${type.bgColor} ${type.borderColor} shadow-lg shadow-${type.color}/20`
                              : 'border-gray-600 bg-gray-800/30 hover:border-gray-500 hover:bg-gray-700/30'
                          }`}
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          onMouseEnter={() => setIsHovering(type.value)}
                          onMouseLeave={() => setIsHovering(null)}
                        >
                          <div className="flex items-center justify-between mb-3">
                            <type.icon className={`w-8 h-8 ${
                              selectedDatasetType === type.value 
                                ? type.textColor 
                                : 'text-gray-400 group-hover:text-white'
                            }`} />
                            {selectedDatasetType === type.value && (
                              <motion.div
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center"
                              >
                                <FiCheck className="w-3 h-3 text-white" />
                              </motion.div>
                            )}
                          </div>
                          <div className={`font-semibold text-sm mb-2 ${
                            selectedDatasetType === type.value ? 'text-white' : 'text-gray-300 group-hover:text-white'
                          }`}>
                            {type.label}
                          </div>
                          <div className="text-xs text-gray-400 mb-2">{type.description}</div>
                          <div className="text-xs text-marine-cyan font-medium">Formats: {type.formats}</div>
                        </motion.button>
                      ))}
                    </div>
                  </motion.div>

                  {/* Enhanced Marine Data Metadata */}
                  <motion.div 
                    className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                  >
                    <div>
                      <label className="block text-sm font-medium text-white mb-3 flex items-center space-x-2">
                        <FiMap className="w-4 h-4 text-marine-cyan" />
                        <span>Water Body / Region</span>
                      </label>
                      <select
                        value={selectedWaterBody}
                        onChange={(e) => setSelectedWaterBody(e.target.value)}
                        className="w-full px-4 py-3 bg-gray-800/50 border-2 border-gray-600 rounded-xl text-white focus:border-marine-cyan focus:outline-none transition-colors backdrop-blur-sm"
                      >
                        {indianWaterBodies.map(waterBody => (
                          <option key={waterBody} value={waterBody}>{waterBody}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-white mb-3 flex items-center space-x-2">
                        <FiCalendar className="w-4 h-4 text-marine-cyan" />
                        <span>Collection Period</span>
                      </label>
                      <input
                        type="text"
                        value={collectionDate}
                        onChange={(e) => setCollectionDate(e.target.value)}
                        placeholder="e.g., Jan 2024, Dec 2023 - Feb 2024"
                        className="w-full px-4 py-3 bg-gray-800/50 border-2 border-gray-600 rounded-xl text-white placeholder-gray-400 focus:border-marine-cyan focus:outline-none transition-colors backdrop-blur-sm"
                      />
                    </div>
                  </motion.div>

                  {/* Enhanced File Description */}
                  <motion.div 
                    className="mb-8"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                  >
                    <label className="block text-sm font-medium text-white mb-3 flex items-center space-x-2">
                      <FiBook className="w-4 h-4 text-marine-cyan" />
                      <span>Research Context & Methodology</span>
                    </label>
                    <textarea
                      value={fileDescription}
                      onChange={(e) => setFileDescription(e.target.value)}
                      placeholder="Describe your research: objectives, sampling methods, instruments used, quality control procedures, and any relevant oceanographic context..."
                      rows={4}
                      className="w-full px-4 py-3 bg-gray-800/50 border-2 border-gray-600 rounded-xl text-white placeholder-gray-400 focus:border-marine-cyan focus:outline-none resize-none transition-colors backdrop-blur-sm"
                    />
                  </motion.div>

                  {/* Enhanced Upload Area */}
                  <motion.div 
                    className="mb-8"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                  >
                    <label className="block text-sm font-medium text-white mb-4 flex items-center space-x-2">
                      <FiUpload className="w-5 h-5 text-marine-cyan" />
                      <span>Upload Marine Data Files</span>
                    </label>
                    <motion.div
                      className={`border-2 border-dashed rounded-2xl p-8 text-center transition-all duration-300 backdrop-blur-sm ${
                        dragActive 
                          ? 'border-marine-cyan bg-marine-cyan/10 shadow-lg shadow-marine-cyan/20' 
                          : 'border-gray-600 bg-gray-800/30 hover:border-marine-cyan hover:bg-marine-cyan/5'
                      }`}
                      onDragEnter={handleDrag}
                      onDragLeave={handleDrag}
                      onDragOver={handleDrag}
                      onDrop={handleDrop}
                      whileHover={{ scale: 1.02 }}
                    >
                      <motion.div
                        animate={{ y: dragActive ? [0, -5, 0] : 0 }}
                        transition={{ duration: 1, repeat: dragActive ? Infinity : 0 }}
                      >
                        <FiUpload className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                      </motion.div>
                      <p className="text-gray-300 mb-2 text-lg">
                        Drag and drop your marine data files here
                      </p>
                      <p className="text-gray-400 mb-4">
                        or{' '}
                        <button
                          onClick={onButtonClick}
                          className="text-marine-cyan hover:text-marine-green underline font-medium"
                        >
                          browse your computer
                        </button>
                      </p>
                      <p className="text-sm text-gray-500">
                        Supports marine data formats: CSV, NETCDF, TXT, FASTA, FASTQ, XLSX, JSON
                      </p>
                      <input
                        ref={fileInputRef}
                        type="file"
                        multiple
                        onChange={handleChange}
                        className="hidden"
                        accept=".csv,.txt,.nc,.json,.xlsx,.xls,.fasta,.fastq,.fq,.gff"
                      />
                    </motion.div>
                  </motion.div>

                  {/* Enhanced Data Standards */}
                  <motion.div 
                    className="bg-marine-cyan/10 border-2 border-marine-cyan/20 rounded-2xl p-6 backdrop-blur-sm"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 }}
                  >
                    <div className="flex items-start space-x-4">
                      <div className="w-12 h-12 bg-marine-cyan/20 rounded-xl flex items-center justify-center flex-shrink-0">
                        <FiAlertCircle className="w-6 h-6 text-marine-cyan" />
                      </div>
                      <div>
                        <h4 className="text-marine-cyan font-semibold text-lg mb-2">SAGAR Data Standards</h4>
                        <ul className="text-sm text-marine-cyan/90 space-y-2">
                          <li className="flex items-center space-x-2">
                            <FiCheck className="w-4 h-4" />
                            <span>Use WGS84 coordinate system for geographic data</span>
                          </li>
                          <li className="flex items-center space-x-2">
                            <FiCheck className="w-4 h-4" />
                            <span>Include comprehensive metadata following ISO 19115</span>
                          </li>
                          <li className="flex items-center space-x-2">
                            <FiCheck className="w-4 h-4" />
                            <span>Provide data collection methodology and instrument details</span>
                          </li>
                          <li className="flex items-center space-x-2">
                            <FiCheck className="w-4 h-4" />
                            <span>Include quality flags and uncertainty estimates</span>
                          </li>
                          <li className="flex items-center space-x-2">
                            <FiCheck className="w-4 h-4" />
                            <span>Maximum file size: 500 MB per file</span>
                          </li>
                        </ul>
                      </div>
                    </div>
                  </motion.div>
                </div>

                {/* Enhanced Upload Queue - FIXED: Shows all files now */}
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.3 }}
                >
                  <div className="bg-gray-800/30 backdrop-blur-md border border-white/10 rounded-2xl p-6 sticky top-32">
                    <h3 className="text-lg font-semibold text-white mb-4 flex items-center space-x-2">
                      <FiClock className="w-5 h-5 text-marine-cyan" />
                      <span>Upload Queue</span>
                      {uploadedFiles.length > 0 && (
                        <span className="bg-marine-cyan text-white text-xs px-2 py-1 rounded-full">
                          {uploadedFiles.length}
                        </span>
                      )}
                    </h3>
                    <div className="space-y-4 max-h-96 overflow-y-auto">
                      {uploadedFiles.length === 0 ? (
                        <motion.div 
                          className="text-center text-gray-400 py-8"
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                        >
                          <FiFile className="w-16 h-16 mx-auto mb-3 opacity-50" />
                          <p>No marine data files in queue</p>
                          <p className="text-sm mt-1">Files will appear here when you upload</p>
                        </motion.div>
                      ) : (
                        uploadedFiles.map((file, index) => (
                          <motion.div
                            key={file.id}
                            className="bg-gray-700/50 backdrop-blur-sm border border-gray-600 rounded-xl p-4 hover:border-marine-cyan/30 transition-all duration-300"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.1 }}
                            whileHover={{ scale: 1.02 }}
                          >
                            <div className="flex items-center justify-between mb-3">
                              <div className="flex items-center space-x-3">
                                <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                                  file.type === 'oceanographic' ? 'bg-marine-cyan/20' :
                                  file.type === 'biodiversity' ? 'bg-marine-green/20' :
                                  file.type === 'molecular' ? 'bg-purple-500/20' :
                                  'bg-amber-500/20'
                                }`}>
                                  {file.type === 'oceanographic' && <FaWater className="w-5 h-5 text-marine-cyan" />}
                                  {file.type === 'biodiversity' && <FaFish className="w-5 h-5 text-marine-green" />}
                                  {file.type === 'molecular' && <FaDna className="w-5 h-5 text-purple-400" />}
                                  {file.type === 'taxonomic' && <FaMicroscope className="w-5 h-5 text-amber-400" />}
                                </div>
                                <div>
                                  <div className="text-sm font-medium text-white truncate max-w-[120px]">
                                    {file.name}
                                  </div>
                                  <div className="text-xs text-gray-400">{file.datasetType}</div>
                                </div>
                              </div>
                              <div className="flex items-center space-x-2">
                                <span className={`text-xs font-medium ${getStatusColor(file.status)}`}>
                                  {file.status}
                                </span>
                                {getStatusIcon(file.status)}
                                <button
                                  onClick={() => removeFile(file.id)}
                                  className="text-gray-400 hover:text-red-400 transition-colors p-1 rounded"
                                >
                                  <FiTrash2 className="w-4 h-4" />
                                </button>
                              </div>
                            </div>
                            
                            <div className="flex items-center justify-between text-xs text-gray-400 mb-3">
                              <span>{formatFileSize(file.size)}</span>
                              {file.waterBody && (
                                <span className="flex items-center space-x-1 text-marine-cyan">
                                  <FaMapMarkerAlt className="w-3 h-3" />
                                  <span>{file.waterBody}</span>
                                </span>
                              )}
                            </div>

                            <div className="w-full bg-gray-600 rounded-full h-2 mb-2">
                              <motion.div
                                className={`h-2 rounded-full transition-all duration-300 ${
                                  file.status === 'completed' || file.status === 'published'
                                    ? 'bg-green-500' 
                                    : file.status === 'error'
                                    ? 'bg-red-500'
                                    : file.status === 'pendingReview'
                                    ? 'bg-orange-500'
                                    : 'bg-marine-cyan'
                                }`}
                                initial={{ width: 0 }}
                                animate={{ width: `${file.progress}%` }}
                                transition={{ duration: 0.5 }}
                              />
                            </div>

                            {file.records && (
                              <div className="text-xs text-gray-400">
                                {file.records.toLocaleString()} marine data records
                              </div>
                            )}
                          </motion.div>
                        ))
                      )}
                    </div>
                  </div>
                </motion.div>
              </div>
            </motion.div>
          )}

          {/* Enhanced My Datasets Section */}
          {activeTab === 'my-data' && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5 }}
            >
              <div className="flex items-center justify-between mb-8">
                <div>
                  <h2 className="text-3xl font-bold text-white mb-2">
                    My Marine Research Datasets
                  </h2>
                  <p className="text-gray-300">Manage and track your contributed marine data</p>
                </div>
                <div className="flex items-center space-x-3">
                  <select className="px-4 py-2 bg-gray-800/50 border-2 border-gray-600 rounded-xl text-white text-sm backdrop-blur-sm focus:border-marine-cyan focus:outline-none">
                    <option>All Marine Data</option>
                    <option>Oceanographic</option>
                    <option>Biodiversity</option>
                    <option>Molecular</option>
                    <option>Taxonomic</option>
                  </select>
                  <motion.button 
                    onClick={() => setActiveTab('upload')}
                    className="px-6 py-3 bg-marine-cyan hover:bg-marine-cyan/80 text-marine-blue rounded-xl transition-all duration-300 flex items-center space-x-2 shadow-lg shadow-marine-cyan/25"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <FiPlus className="w-5 h-5" />
                    <span>Upload New Dataset</span>
                  </motion.button>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-6">
                {uploadedFiles.map((file, index) => (
                  <motion.div
                    key={file.id}
                    className="bg-gray-800/30 backdrop-blur-md border border-gray-700 rounded-2xl p-6 hover:border-marine-cyan/30 transition-all duration-300 group"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    whileHover={{ scale: 1.02, y: -2 }}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-6">
                        <div className={`w-16 h-16 rounded-2xl flex items-center justify-center backdrop-blur-sm ${
                          file.type === 'oceanographic' ? 'bg-marine-cyan/20 border border-marine-cyan/30' :
                          file.type === 'biodiversity' ? 'bg-marine-green/20 border border-marine-green/30' :
                          file.type === 'molecular' ? 'bg-purple-500/20 border border-purple-400/30' :
                          'bg-amber-500/20 border border-amber-400/30'
                        }`}>
                          {file.type === 'oceanographic' && <FaWater className="w-8 h-8 text-marine-cyan" />}
                          {file.type === 'biodiversity' && <FaFish className="w-8 h-8 text-marine-green" />}
                          {file.type === 'molecular' && <FaDna className="w-8 h-8 text-purple-400" />}
                          {file.type === 'taxonomic' && <FaMicroscope className="w-8 h-8 text-amber-400" />}
                        </div>
                        <div>
                          <h3 className="text-xl font-semibold text-white group-hover:text-marine-cyan transition-colors">
                            {file.name}
                          </h3>
                          <div className="flex items-center space-x-6 text-sm text-gray-400 mt-2">
                            <span className="flex items-center space-x-2">
                              <FiCalendar className="w-4 h-4" />
                              <span>{file.uploadedAt.toLocaleDateString()}</span>
                            </span>
                            <span className="flex items-center space-x-2">
                              <FiDatabase className="w-4 h-4" />
                              <span>{formatFileSize(file.size)}</span>
                            </span>
                            <span className={`flex items-center space-x-2 ${getStatusColor(file.status)}`}>
                              {getStatusIcon(file.status)}
                              <span className="capitalize">{file.status}</span>
                            </span>
                            {file.waterBody && (
                              <span className="flex items-center space-x-2 text-marine-cyan">
                                <FaMapMarkerAlt className="w-4 h-4" />
                                <span>{file.waterBody}</span>
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-3">
                        <motion.button 
                          className="p-3 text-gray-400 hover:text-marine-cyan transition-colors bg-gray-700/50 rounded-xl hover:bg-marine-cyan/10"
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          title="Preview"
                        >
                          <FiEye className="w-5 h-5" />
                        </motion.button>
                        <motion.button 
                          className="p-3 text-gray-400 hover:text-marine-green transition-colors bg-gray-700/50 rounded-xl hover:bg-marine-green/10"
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          title="Edit Metadata"
                        >
                          <FiEdit className="w-5 h-5" />
                        </motion.button>
                        <motion.button 
                          className="p-3 text-gray-400 hover:text-red-400 transition-colors bg-gray-700/50 rounded-xl hover:bg-red-500/10"
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          title="Delete"
                        >
                          <FiTrash2 className="w-5 h-5" />
                        </motion.button>
                      </div>
                    </div>

                    {file.records && (
                      <div className="flex items-center space-x-8 mt-6 text-sm text-gray-400">
                        <span className="bg-gray-700/50 px-3 py-1 rounded-full">
                          {file.records.toLocaleString()} marine data records
                        </span>
                        <span className="bg-gray-700/50 px-3 py-1 rounded-full capitalize">
                          {file.datasetType}
                        </span>
                        {file.downloads && (
                          <span className="bg-marine-cyan/20 text-marine-cyan px-3 py-1 rounded-full">
                            {file.downloads} research downloads
                          </span>
                        )}
                        {file.citations && (
                          <span className="bg-marine-green/20 text-marine-green px-3 py-1 rounded-full">
                            {file.citations} scientific citations
                          </span>
                        )}
                      </div>
                    )}
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}

          {/* Enhanced Analytics Section */}
          {activeTab === 'analytics' && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5 }}
            >
              <div className="mb-8">
                <h2 className="text-3xl font-bold text-white mb-2">
                  Research Impact Analytics
                </h2>
                <p className="text-gray-300">Track your scientific contributions and global impact</p>
              </div>
              
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
                {/* Impact Metrics */}
                <motion.div 
                  className="bg-gray-800/30 backdrop-blur-md border border-gray-700 rounded-2xl p-6"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                >
                  <h3 className="text-lg font-semibold text-white mb-6 flex items-center space-x-2">
                    <FiTarget className="w-5 h-5 text-marine-cyan" />
                    <span>Your Scientific Impact</span>
                  </h3>
                  <div className="space-y-4">
                    {[
                      { icon: FiDownload, label: 'Total Research Downloads', value: stats.totalDownloads, color: 'marine-green' },
                      { icon: FiBook, label: 'Dataset Citations', value: stats.citations, color: 'marine-cyan' },
                      { icon: FiGitBranch, label: 'Research Projects Using Your Data', value: 8, color: 'purple-400' },
                      { icon: FiGlobe, label: 'Countries Accessing Your Data', value: 12, color: 'amber-400' }
                    ].map((metric, index) => (
                      <motion.div
                        key={metric.label}
                        className="flex items-center justify-between p-4 bg-gray-700/30 rounded-xl hover:bg-gray-700/50 transition-all duration-300 group"
                        whileHover={{ scale: 1.02 }}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                      >
                        <div className="flex items-center space-x-4">
                          <div className={`w-12 h-12 bg-${metric.color}/20 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300 border border-${metric.color}/30`}>
                            <metric.icon className={`w-6 h-6 text-${metric.color}`} />
                          </div>
                          <span className="text-gray-300 group-hover:text-white transition-colors">{metric.label}</span>
                        </div>
                        <span className="text-2xl font-bold text-white">
                          {metric.value}
                        </span>
                      </motion.div>
                    ))}
                  </div>
                </motion.div>

                {/* Research Quality Score */}
                <motion.div 
                  className="bg-gray-800/30 backdrop-blur-md border border-gray-700 rounded-2xl p-6"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                >
                  <h3 className="text-lg font-semibold text-white mb-6 flex items-center space-x-2">
                    <FiStar className="w-5 h-5 text-yellow-400" />
                    <span>Data Quality & Impact</span>
                  </h3>
                  <div className="space-y-6">
                    {[
                      { label: 'Data Quality Score', value: stats.dataQualityScore, color: 'marine-cyan' },
                      { label: 'Research Impact Score', value: stats.impactScore, color: 'marine-green' },
                      { label: 'Metadata Completeness', value: 92, color: 'purple-400' }
                    ].map((score, index) => (
                      <motion.div
                        key={score.label}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.2 }}
                      >
                        <div className="flex items-center justify-between mb-3">
                          <span className="text-gray-300">{score.label}</span>
                          <span className={`text-${score.color} font-bold text-lg`}>{score.value}%</span>
                        </div>
                        <div className="w-full bg-gray-700 rounded-full h-3">
                          <motion.div 
                            className={`h-3 rounded-full bg-${score.color}`}
                            initial={{ width: 0 }}
                            animate={{ width: `${score.value}%` }}
                            transition={{ duration: 1, delay: index * 0.3 }}
                          />
                        </div>
                      </motion.div>
                    ))}
                    <div className="grid grid-cols-2 gap-4 text-center mt-6">
                      <div className="bg-marine-cyan/10 p-4 rounded-xl border border-marine-cyan/20">
                        <div className="text-2xl font-bold text-marine-cyan">4.8</div>
                        <div className="text-xs text-gray-400">Data Quality Rating</div>
                      </div>
                      <div className="bg-marine-green/10 p-4 rounded-xl border border-marine-green/20">
                        <div className="text-2xl font-bold text-marine-green">A+</div>
                        <div className="text-xs text-gray-400">Peer Review Score</div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              </div>

              {/* Enhanced Research Impact Timeline */}
              <motion.div 
                className="bg-gray-800/30 backdrop-blur-md border border-gray-700 rounded-2xl p-6 mb-8"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <h3 className="text-lg font-semibold text-white mb-6 flex items-center space-x-2">
                  <FiTrendingUp className="w-5 h-5 text-marine-green" />
                  <span>Research Impact Over Time</span>
                </h3>
                <div className="space-y-4">
                  {researchImpact.map((year, index) => (
                    <motion.div 
                      key={year.year}
                      className="flex items-center justify-between p-6 bg-gray-700/20 rounded-xl hover:bg-gray-700/30 transition-all duration-300 group"
                      whileHover={{ scale: 1.02 }}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                    >
                      <div className="flex items-center space-x-6">
                        <div className="w-14 h-14 bg-marine-cyan/20 rounded-2xl flex items-center justify-center backdrop-blur-sm border border-marine-cyan/30 group-hover:scale-110 transition-transform duration-300">
                          <FiZap className="w-6 h-6 text-marine-cyan" />
                        </div>
                        <div>
                          <div className="font-semibold text-white text-lg">{year.year}</div>
                          <div className="text-sm text-gray-400">Research Period</div>
                        </div>
                      </div>
                      <div className="grid grid-cols-4 gap-8 text-center">
                        <div>
                          <div className="text-xl font-bold text-marine-green">{year.publications}</div>
                          <div className="text-xs text-gray-400">Publications</div>
                        </div>
                        <div>
                          <div className="text-xl font-bold text-marine-cyan">{year.downloads}</div>
                          <div className="text-xs text-gray-400">Downloads</div>
                        </div>
                        <div>
                          <div className="text-xl font-bold text-blue-400">{year.citations}</div>
                          <div className="text-xs text-gray-400">Citations</div>
                        </div>
                        <div>
                          <div className="text-xl font-bold text-purple-400">{year.impact}%</div>
                          <div className="text-xs text-gray-400">Impact</div>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </motion.div>

              {/* Enhanced Recent Research Activity */}
              <motion.div 
                className="bg-gray-800/30 backdrop-blur-md border border-gray-700 rounded-2xl p-6"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <h3 className="text-lg font-semibold text-white mb-6 flex items-center space-x-2">
                  <FiCompass className="w-5 h-5 text-marine-cyan" />
                  <span>Recent Research Activity</span>
                </h3>
                <div className="space-y-4">
                  {[
                    { 
                      action: 'Dataset downloaded for climate research', 
                      user: 'University of Tokyo - Marine Science Dept', 
                      time: '2 hours ago',
                      type: 'download',
                      color: 'marine-green'
                    },
                    { 
                      action: 'New citation in marine ecology publication', 
                      user: 'Marine Ecology Progress Series', 
                      time: '1 day ago',
                      type: 'citation',
                      color: 'marine-cyan'
                    },
                    { 
                      action: 'Dataset accessed for fisheries assessment', 
                      user: 'NOAA Fisheries Research', 
                      time: '2 days ago',
                      type: 'access',
                      color: 'blue-400'
                    },
                    { 
                      action: 'Data used in climate change publication', 
                      user: 'Stanford University - Oceanography', 
                      time: '1 week ago',
                      type: 'publication',
                      color: 'purple-400'
                    },
                    { 
                      action: 'Dataset featured in research webinar', 
                      user: 'International Marine Data Conference', 
                      time: '2 weeks ago',
                      type: 'recognition',
                      color: 'amber-400'
                    }
                  ].map((activity, index) => (
                    <motion.div
                      key={index}
                      className="flex items-center space-x-4 p-4 bg-gray-700/20 rounded-xl hover:bg-gray-700/30 transition-all duration-300 group"
                      whileHover={{ scale: 1.01 }}
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                    >
                      <div className={`w-12 h-12 bg-${activity.color}/20 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300 border border-${activity.color}/30`}>
                        {activity.type === 'download' && <FiDownload className={`w-6 h-6 text-${activity.color}`} />}
                        {activity.type === 'citation' && <FiBook className={`w-6 h-6 text-${activity.color}`} />}
                        {activity.type === 'access' && <FiEye className={`w-6 h-6 text-${activity.color}`} />}
                        {activity.type === 'publication' && <FiShare2 className={`w-6 h-6 text-${activity.color}`} />}
                        {activity.type === 'recognition' && <FiAward className={`w-6 h-6 text-${activity.color}`} />}
                      </div>
                      <div className="flex-1">
                        <div className="text-white text-sm font-medium group-hover:text-marine-cyan transition-colors">
                          {activity.action}
                        </div>
                        <div className="text-gray-400 text-xs">{activity.user} • {activity.time}</div>
                      </div>
                      <motion.div
                        className="w-2 h-2 bg-green-500 rounded-full"
                        animate={{ scale: [1, 1.2, 1] }}
                        transition={{ duration: 2, repeat: Infinity, delay: index * 0.2 }}
                      />
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            </motion.div>
          )}

          {/* Enhanced Guidelines Section */}
          {activeTab === 'guidelines' && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5 }}
            >
              <div className="mb-8">
                <h2 className="text-3xl font-bold text-white mb-2">
                  SAGAR Data Contribution Guidelines
                </h2>
                <p className="text-gray-300">Best practices and standards for marine data contribution</p>
              </div>
              
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Best Practices */}
                <div className="space-y-6">
                  <motion.div 
                    className="bg-marine-green/10 border-2 border-marine-green/20 rounded-2xl p-6 backdrop-blur-sm"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                  >
                    <h3 className="text-lg font-semibold text-marine-green mb-4 flex items-center space-x-2">
                      <FiCheck className="w-5 h-5" />
                      <span>Marine Data Best Practices</span>
                    </h3>
                    <ul className="space-y-3 text-gray-300">
                      {[
                        "Include comprehensive metadata with each dataset following ISO 19115 standards",
                        "Use standard marine data formats (NETCDF for oceanographic, Darwin Core for biodiversity)",
                        "Provide clear documentation including sampling methodology and instrument calibration",
                        "Include data collection methodology details and quality control procedures",
                        "Use WGS84 coordinate reference system for all geographic data"
                      ].map((item, index) => (
                        <motion.li 
                          key={index}
                          className="flex items-start space-x-3"
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: index * 0.1 }}
                        >
                          <FiCheck className="w-5 h-5 text-marine-green mt-1 flex-shrink-0" />
                          <span>{item}</span>
                        </motion.li>
                      ))}
                    </ul>
                  </motion.div>

                  <motion.div 
                    className="bg-marine-cyan/10 border-2 border-marine-cyan/20 rounded-2xl p-6 backdrop-blur-sm"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.2 }}
                  >
                    <h3 className="text-lg font-semibold text-marine-cyan mb-4 flex items-center space-x-2">
                      <FiStar className="w-5 h-5" />
                      <span>Data Quality Standards</span>
                    </h3>
                    <ul className="space-y-3 text-gray-300">
                      {[
                        "Data must be scientifically valid, reproducible, and collected using standardized methods",
                        "Include quality control procedures and uncertainty estimates",
                        "Provide calibration information and instrument specifications",
                        "Document any data processing steps and transformations applied"
                      ].map((item, index) => (
                        <motion.li 
                          key={index}
                          className="flex items-start space-x-3"
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: index * 0.1 + 0.2 }}
                        >
                          <FiStar className="w-5 h-5 text-marine-cyan mt-1 flex-shrink-0" />
                          <span>{item}</span>
                        </motion.li>
                      ))}
                    </ul>
                  </motion.div>
                </div>

                {/* Recognition & Benefits */}
                <div className="space-y-6">
                  <motion.div 
                    className="bg-purple-500/10 border-2 border-purple-400/20 rounded-2xl p-6 backdrop-blur-sm"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                  >
                    <h3 className="text-lg font-semibold text-purple-400 mb-4 flex items-center space-x-2">
                      <FiAward className="w-5 h-5" />
                      <span>Researcher Recognition & Benefits</span>
                    </h3>
                    <ul className="space-y-3 text-gray-300">
                      {[
                        "Get Digital Object Identifier (DOI) for each published dataset",
                        "Track citations and research impact metrics in real-time",
                        "Receive SAGAR Contributor badges and annual recognition awards",
                        "Join exclusive marine researcher network and collaboration opportunities",
                        "Priority access to SAGAR research cruises and field programs"
                      ].map((item, index) => (
                        <motion.li 
                          key={index}
                          className="flex items-start space-x-3"
                          initial={{ opacity: 0, x: 10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: index * 0.1 }}
                        >
                          <FiAward className="w-5 h-5 text-purple-400 mt-1 flex-shrink-0" />
                          <span>{item}</span>
                        </motion.li>
                      ))}
                    </ul>
                  </motion.div>

                  <motion.div 
                    className="bg-amber-500/10 border-2 border-amber-400/20 rounded-2xl p-6 backdrop-blur-sm"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.2 }}
                  >
                    <h3 className="text-lg font-semibold text-amber-400 mb-4 flex items-center space-x-2">
                      <FiDownload className="w-5 h-5" />
                      <span>Support & Resources</span>
                    </h3>
                    <div className="space-y-3">
                      {[
                        { icon: FiBook, title: "Marine Data Formatting Guide", desc: "Complete guide to SAGAR data standards and formats" },
                        { icon: FiDownload, title: "Metadata Templates & Tools", desc: "Download standard metadata templates and validation tools" },
                        { icon: FiUsers, title: "Data Management Support", desc: "Get personalized help with data submission and quality checks" }
                      ].map((resource, index) => (
                        <motion.button
                          key={resource.title}
                          className="w-full text-left p-4 bg-amber-500/5 hover:bg-amber-500/10 rounded-xl transition-all duration-300 group"
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: index * 0.1 + 0.2 }}
                        >
                          <div className="flex items-center space-x-4">
                            <resource.icon className="w-6 h-6 text-amber-400 group-hover:scale-110 transition-transform" />
                            <div>
                              <div className="font-medium text-white group-hover:text-amber-400 transition-colors">
                                {resource.title}
                              </div>
                              <div className="text-sm text-amber-300/80">{resource.desc}</div>
                            </div>
                          </div>
                        </motion.button>
                      ))}
                    </div>
                  </motion.div>
                </div>
              </div>

              {/* Enhanced Compliance Section */}
              <motion.div 
                className="mt-8 bg-marine-cyan/10 border-2 border-marine-cyan/20 rounded-2xl p-6 backdrop-blur-sm"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <h3 className="text-lg font-semibold text-marine-cyan mb-4 flex items-center space-x-2">
                  <FiShield className="w-5 h-5" />
                  <span>Compliance & Ethics</span>
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm text-gray-300">
                  <div>
                    <h4 className="font-medium text-white mb-3">Data Sharing Agreement</h4>
                    <ul className="space-y-2">
                      <li className="flex items-center space-x-2">
                        <FiCheck className="w-4 h-4 text-marine-green" />
                        <span>Data contributors retain ownership of their data</span>
                      </li>
                      <li className="flex items-center space-x-2">
                        <FiCheck className="w-4 h-4 text-marine-green" />
                        <span>SAGAR provides secure storage and distribution</span>
                      </li>
                      <li className="flex items-center space-x-2">
                        <FiCheck className="w-4 h-4 text-marine-green" />
                        <span>Proper attribution guaranteed for all data usage</span>
                      </li>
                    </ul>
                  </div>
                  <div>
                    <h4 className="font-medium text-white mb-3">Ethical Guidelines</h4>
                    <ul className="space-y-2">
                      <li className="flex items-center space-x-2">
                        <FiCheck className="w-4 h-4 text-marine-green" />
                        <span>Follow national and international data sharing policies</span>
                      </li>
                      <li className="flex items-center space-x-2">
                        <FiCheck className="w-4 h-4 text-marine-green" />
                        <span>Ensure data doesn't compromise national security</span>
                      </li>
                      <li className="flex items-center space-x-2">
                        <FiCheck className="w-4 h-4 text-marine-green" />
                        <span>Respect intellectual property and collaboration agreements</span>
                      </li>
                    </ul>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          )}
        </div>
      </main>

      {/* Enhanced Success Modal */}
      <AnimatePresence>
        {showSuccessModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              className="absolute inset-0 bg-black/80 backdrop-blur-sm"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowSuccessModal(false)}
            />

            <motion.div
              className="relative bg-marine-blue border-2 border-marine-cyan/30 rounded-3xl p-8 max-w-md w-full backdrop-blur-xl shadow-2xl shadow-marine-cyan/25"
              initial={{ opacity: 0, scale: 0.8, y: 50 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.8, y: 50 }}
            >
              <div className="text-center">
                <motion.div
                  className="w-20 h-20 bg-marine-green rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg shadow-marine-green/25"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", stiffness: 200, damping: 15 }}
                >
                  <FiCheck className="w-10 h-10 text-white" />
                </motion.div>
                <motion.h3 
                  className="text-2xl font-bold text-white mb-3"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 }}
                >
                  Marine Data Uploaded!
                </motion.h3>
                <motion.p 
                  className="text-gray-300 mb-6"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                >
                  Your marine research data has been successfully uploaded to SAGAR. 
                  It will now undergo quality review before publication.
                </motion.p>
                <motion.div 
                  className="bg-marine-green/10 border border-marine-green/20 rounded-xl p-4 mb-6"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.3 }}
                >
                  <p className="text-sm text-marine-green font-medium">
                    Thank you for contributing to India's marine research database!
                  </p>
                </motion.div>
                <motion.div 
                  className="flex space-x-3"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                >
                  <motion.button
                    onClick={() => setShowSuccessModal(false)}
                    className="flex-1 px-4 py-3 bg-gray-700 hover:bg-gray-600 text-white rounded-xl transition-all duration-300 font-medium"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    Upload More
                  </motion.button>
                  <motion.button
                    onClick={() => {
                      setShowSuccessModal(false);
                      setActiveTab('my-data');
                    }}
                    className="flex-1 px-4 py-3 bg-marine-cyan hover:bg-marine-cyan/80 text-marine-blue rounded-xl transition-all duration-300 font-medium shadow-lg shadow-marine-cyan/25"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    View Datasets
                  </motion.button>
                </motion.div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default DataContributorPage;