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

// --- Interfaces ---
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

  // --- Animation Generators ---
  // Generate random particles for the background
  const particles = Array.from({ length: 25 }).map((_, i) => ({
    id: i,
    size: Math.random() * 4 + 1, // Random size 1-5px
    initialX: Math.random() * 100, // Random start X position %
    initialY: Math.random() * 100, // Random start Y position %
    duration: Math.random() * 20 + 10, // Random duration 10-30s
    delay: Math.random() * 5,
  }));

  // Styles Mapped to Standard Tailwind Colors
  const marineDatasetTypes = [
    { 
      value: 'oceanographic', 
      label: 'Oceanographic Data', 
      icon: IoWaterOutline, 
      description: 'CTD profiles, temperature, salinity, currents',
      formats: 'CSV, NETCDF, TXT',
      colorClass: 'text-cyan-400',
      bgClass: 'bg-cyan-500/10',
      borderClass: 'border-cyan-400/30',
      shadowClass: 'shadow-cyan-400/20'
    },
    { 
      value: 'biodiversity', 
      label: 'Biodiversity Data', 
      icon: FaFish, 
      description: 'Species observations, abundance, distribution',
      formats: 'CSV, XLSX, Darwin Core',
      colorClass: 'text-emerald-400',
      bgClass: 'bg-emerald-500/10',
      borderClass: 'border-emerald-400/30',
      shadowClass: 'shadow-emerald-400/20'
    },
    { 
      value: 'molecular', 
      label: 'Molecular Data', 
      icon: FaDna, 
      description: 'eDNA sequences, genetic markers, metabarcoding',
      formats: 'FASTA, FASTQ, CSV',
      colorClass: 'text-violet-400',
      bgClass: 'bg-violet-500/10',
      borderClass: 'border-violet-400/30',
      shadowClass: 'shadow-violet-400/20'
    },
    { 
      value: 'taxonomic', 
      label: 'Taxonomic Data', 
      icon: FaMicroscope, 
      description: 'Species identification, morphological data',
      formats: 'CSV, XLSX, Images',
      colorClass: 'text-amber-400',
      bgClass: 'bg-amber-500/10',
      borderClass: 'border-amber-400/30',
      shadowClass: 'shadow-amber-400/20'
    },
    { 
      value: 'fisheries', 
      label: 'Fisheries Data', 
      icon: FiBarChart2, 
      description: 'Catch data, effort, species composition',
      formats: 'CSV, XLSX',
      colorClass: 'text-teal-400',
      bgClass: 'bg-teal-500/10',
      borderClass: 'border-teal-400/30',
      shadowClass: 'shadow-teal-400/20'
    },
    { 
      value: 'remote-sensing', 
      label: 'Remote Sensing', 
      icon: FiGlobe, 
      description: 'Satellite data, chlorophyll, sea surface temp',
      formats: 'NETCDF, GEOTIFF, HDF',
      colorClass: 'text-indigo-400',
      bgClass: 'bg-indigo-500/10',
      borderClass: 'border-indigo-400/30',
      shadowClass: 'shadow-indigo-400/20'
    }
  ];

  const indianWaterBodies = [
    'Bay of Bengal', 'Arabian Sea', 'Andaman Sea', 'Indian Ocean', 
    'Lakshadweep Sea', 'Gulf of Mannar', 'Palk Bay', 'Gulf of Kutch', 'Gulf of Khambhat'
  ];

  const researchImpact = [
    { year: '2020', publications: 2, downloads: 234, citations: 5, impact: 45 },
    { year: '2021', publications: 4, downloads: 567, citations: 12, impact: 62 },
    { year: '2022', publications: 6, downloads: 892, citations: 18, impact: 78 },
    { year: '2023', publications: 8, downloads: 1245, citations: 23, impact: 87 }
  ];

  // Dummy Data Load
  useEffect(() => {
    setUploadedFiles([
      {
        id: '1', name: 'CTD_Profile_BayOfBengal_Stn298.csv', size: 2.4, type: 'oceanographic', status: 'published',
        progress: 100, uploadedAt: new Date('2024-01-15'), records: 1245, datasetType: 'Oceanographic Data',
        waterBody: 'Bay of Bengal', location: '15.5°N, 88.2°E', timePeriod: 'Jan 2024', downloads: 156, citations: 8
      },
      {
        id: '2', name: 'eDNA_Metabarcoding_Andaman.fasta', size: 45.8, type: 'molecular', status: 'published',
        progress: 100, uploadedAt: new Date('2024-01-10'), records: 12500, datasetType: 'Molecular Data',
        waterBody: 'Andaman Sea', location: '11.7°N, 92.8°E', timePeriod: 'Dec 2023', downloads: 89, citations: 3
      },
      {
        id: '3', name: 'Species_Inventory_GoMannar.xlsx', size: 1.2, type: 'biodiversity', status: 'pendingReview',
        progress: 100, uploadedAt: new Date('2024-01-20'), records: 234, datasetType: 'Biodiversity Data',
        waterBody: 'Gulf of Mannar', location: '9.2°N, 79.1°E', timePeriod: 'Nov 2023'
      },
      {
        id: '4', name: 'ADCP_Currents_ArabianSea.nc', size: 32.7, type: 'oceanographic', status: 'processing',
        progress: 65, uploadedAt: new Date('2024-01-18'), records: 8900, datasetType: 'Oceanographic Data',
        waterBody: 'Arabian Sea', location: '18.4°N, 72.8°E', timePeriod: 'Jan 2024'
      }
    ]);
  }, []);

  // --- Handlers ---
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

    newFiles.forEach((file) => simulateUpload(file.id));
  };

  const simulateUpload = (fileId: string) => {
    let progress = 0;
    const interval = setInterval(() => {
      progress += Math.random() * 10;
      if (progress >= 100) {
        progress = 100;
        clearInterval(interval);
        setUploadedFiles(prev => prev.map(file => file.id === fileId ? { ...file, progress: 100, status: 'processing' } : file));
        setTimeout(() => {
          setUploadedFiles(prev => prev.map(file => file.id === fileId ? { 
            ...file, status: Math.random() > 0.3 ? 'completed' : 'pendingReview', 
            records: Math.floor(Math.random() * 10000) + 100 
          } : file));
          setShowSuccessModal(true);
        }, 2000);
      } else {
        setUploadedFiles(prev => prev.map(file => file.id === fileId ? { ...file, progress } : file));
      }
    }, 200);
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") setDragActive(true);
    else if (e.type === "dragleave") setDragActive(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) handleFiles(e.dataTransfer.files);
  };

  const getStatusColor = (status: UploadedFile['status']) => {
    switch (status) {
      case 'uploading': return 'text-yellow-400';
      case 'processing': return 'text-sky-400';
      case 'completed': return 'text-emerald-400';
      case 'published': return 'text-emerald-400';
      case 'error': return 'text-red-400';
      case 'pendingReview': return 'text-orange-400';
      default: return 'text-slate-400';
    }
  };

  const getStatusIcon = (status: UploadedFile['status']) => {
    switch (status) {
      case 'uploading': return <div className="w-3 h-3 border-2 border-yellow-400 border-t-transparent rounded-full animate-spin" />;
      case 'processing': return <div className="w-3 h-3 border-2 border-sky-400 border-t-transparent rounded-full animate-spin" />;
      case 'completed': case 'published': return <FiCheck className="w-4 h-4 text-emerald-400" />;
      case 'error': return <FiX className="w-4 h-4 text-red-400" />;
      case 'pendingReview': return <FiClock className="w-4 h-4 text-orange-400" />;
      default: return <FiClock className="w-4 h-4 text-slate-400" />;
    }
  };

  const formatFileSize = (size: number) => size < 1 ? `${(size * 1024).toFixed(1)} KB` : `${size.toFixed(1)} MB`;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans selection:bg-cyan-500/30 overflow-hidden relative">
      
      {/* --- ANIMATED BACKGROUND LAYER --- */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
        
        {/* Base Gradient */}
        <div className="absolute inset-0 bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950" />
        
        {/* Animated Particles (Bubbles/Plankton) */}
        {particles.map((particle) => (
          <motion.div
            key={particle.id}
            className="absolute bg-cyan-400/20 rounded-full blur-[1px]"
            style={{
              width: particle.size,
              height: particle.size,
              left: `${particle.initialX}%`,
            }}
            initial={{ bottom: "-10%", opacity: 0 }}
            animate={{ 
              bottom: "110%", 
              opacity: [0, 0.4, 0.8, 0.4, 0],
              x: ["-20px", "20px", "-20px"] // Gentle waver
            }}
            transition={{
              duration: particle.duration,
              repeat: Infinity,
              ease: "linear",
              delay: particle.delay,
              x: {
                duration: 5,
                repeat: Infinity,
                ease: "easeInOut"
              }
            }}
          />
        ))}

        {/* Drifting Light Orbs (Nebulas/Refraction) */}
        <motion.div
          animate={{
            x: [0, 50, 0],
            y: [0, 30, 0],
            scale: [1, 1.1, 1],
          }}
          transition={{ duration: 20, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-cyan-500/10 rounded-full blur-[120px]"
        />
        
        <motion.div
          animate={{
            x: [0, -40, 0],
            y: [0, 60, 0],
            scale: [1, 1.2, 1],
          }}
          transition={{ duration: 25, repeat: Infinity, ease: "easeInOut" }}
          className="absolute bottom-[10%] right-[-5%] w-[600px] h-[600px] bg-emerald-500/5 rounded-full blur-[100px]"
        />

         <motion.div
          animate={{
            x: [0, 30, 0],
            y: [0, -30, 0],
            scale: [1, 1.3, 1],
          }}
          transition={{ duration: 18, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-[40%] left-[30%] w-[400px] h-[400px] bg-blue-600/5 rounded-full blur-[100px]"
        />

      </div>

      {/* --- Header --- */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-slate-950/70 backdrop-blur-xl border-b border-slate-800 shadow-lg shadow-black/20">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-6">
              <motion.button
                onClick={onBack}
                className="flex items-center space-x-2 px-4 py-2 bg-slate-800/50 hover:bg-slate-700/80 text-slate-300 hover:text-white rounded-lg transition-colors border border-slate-700/50"
                whileHover={{ x: -4 }}
                whileTap={{ scale: 0.95 }}
              >
                <FiArrowLeft className="w-4 h-4" />
                <span className="text-sm font-medium">Back</span>
              </motion.button>

              <div>
                <h1 className="text-xl font-bold tracking-tight text-white leading-none">SAGAR</h1>
                <span className="text-xs text-cyan-400 font-medium tracking-wide">MARINE DATA PORTAL</span>
              </div>
            </div>

            {/* Profile */}
            <div className="flex items-center gap-4 bg-slate-900/50 px-4 py-2 rounded-full border border-slate-800 backdrop-blur-sm">
              <div className="text-right hidden sm:block">
                <div className="text-sm font-semibold text-white">{currentUser?.name || 'Dr. Aditi Sharma'}</div>
                <div className="text-xs text-emerald-400 flex items-center justify-end gap-1">
                  <FiAward className="w-3 h-3" /> Senior Contributor
                </div>
              </div>
              <div className="w-10 h-10 rounded-full bg-slate-800 border-2 border-slate-700 flex items-center justify-center overflow-hidden">
                <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=Felix" alt="User" />
              </div>
            </div>
          </div>

          {/* Navigation Tabs */}
          <div className="flex space-x-1 mt-6 overflow-x-auto pb-1 scrollbar-hide">
            {[
              { id: 'upload', label: 'Upload Data', icon: FiUpload },
              { id: 'my-data', label: 'My Datasets', icon: FiDatabase },
              { id: 'analytics', label: 'Impact Analytics', icon: IoStatsChart },
              { id: 'guidelines', label: 'Guidelines', icon: FiBook }
            ].map((tab) => {
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`relative flex items-center space-x-2 px-6 py-3 rounded-full text-sm font-medium transition-all duration-300 ${
                    isActive ? 'text-white' : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
                  }`}
                >
                  {isActive && (
                    <motion.div
                      layoutId="activeTabBg"
                      className="absolute inset-0 bg-slate-800 border border-slate-700 rounded-full shadow-sm"
                      transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                    />
                  )}
                  <tab.icon className={`w-4 h-4 relative z-10 ${isActive ? 'text-cyan-400' : ''}`} />
                  <span className="relative z-10">{tab.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      </header>

      {/* --- Main Content --- */}
      <main className="pt-48 pb-20 relative z-10 px-6">
        <div className="max-w-7xl mx-auto">
          
          {/* Quick Stats Row */}
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4 mb-10">
            {[
               { value: stats.totalFiles, label: 'Datasets', icon: FiDatabase, color: 'text-cyan-400', bg: 'bg-cyan-900/20' },
               { value: stats.totalSize, unit:'MB', label: 'Volume', icon: FiDownload, color: 'text-emerald-400', bg: 'bg-emerald-900/20' },
               { value: stats.publishedDatasets, label: 'Published', icon: FiCheck, color: 'text-green-400', bg: 'bg-green-900/20' },
               { value: stats.pendingReview, label: 'Reviewing', icon: FiClock, color: 'text-orange-400', bg: 'bg-orange-900/20' },
               { value: stats.totalDownloads, label: 'Downloads', icon: FiTrendingUp, color: 'text-sky-400', bg: 'bg-sky-900/20' },
               { value: stats.citations, label: 'Citations', icon: FiBook, color: 'text-violet-400', bg: 'bg-violet-900/20' },
               { value: stats.dataQualityScore, unit:'%', label: 'Quality', icon: FiStar, color: 'text-amber-400', bg: 'bg-amber-900/20' }
            ].map((stat, i) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                className="bg-slate-900/40 backdrop-blur-md border border-slate-800 p-4 rounded-2xl flex flex-col items-center justify-center hover:bg-slate-800/60 transition-colors group cursor-default shadow-lg shadow-black/10"
              >
                <div className={`w-10 h-10 ${stat.bg} rounded-full flex items-center justify-center mb-2 group-hover:scale-110 transition-transform duration-300`}>
                  <stat.icon className={`w-5 h-5 ${stat.color}`} />
                </div>
                <div className="text-xl font-bold text-white">
                  {stat.value}<span className="text-xs font-normal text-slate-500 ml-0.5">{stat.unit}</span>
                </div>
                <div className="text-xs text-slate-400">{stat.label}</div>
              </motion.div>
            ))}
          </div>

          <AnimatePresence mode='wait'>
            {activeTab === 'upload' && (
              <motion.div
                key="upload"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="grid grid-cols-1 lg:grid-cols-3 gap-8"
              >
                {/* Left Column: Form */}
                <div className="lg:col-span-2 space-y-8">
                  <div>
                    <h2 className="text-3xl font-bold text-white mb-2">Contribute Research Data</h2>
                    <p className="text-slate-400">Share your marine findings with the global SAGAR community.</p>
                  </div>

                  {/* Category Selection */}
                  <div className="space-y-4">
                    <label className="flex items-center space-x-2 text-sm font-medium text-slate-300">
                      <FiLayers className="text-cyan-400" />
                      <span>Data Category</span>
                    </label>
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                      {marineDatasetTypes.map((type) => {
                         const isSelected = selectedDatasetType === type.value;
                         return (
                          <motion.button
                            key={type.value}
                            onClick={() => setSelectedDatasetType(type.value)}
                            className={`relative p-4 rounded-2xl border text-left transition-all duration-200 group backdrop-blur-sm ${
                              isSelected 
                                ? `${type.bgClass} ${type.borderClass} ring-1 ring-offset-0 ${type.shadowClass}` 
                                : 'bg-slate-900/40 border-slate-800 hover:border-slate-600 hover:bg-slate-800/60'
                            }`}
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                          >
                            <div className="flex justify-between items-start mb-3">
                              <type.icon className={`w-6 h-6 ${isSelected ? type.colorClass : 'text-slate-500 group-hover:text-slate-300'}`} />
                              {isSelected && (
                                <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="bg-emerald-500 rounded-full p-0.5">
                                  <FiCheck className="w-3 h-3 text-white" />
                                </motion.div>
                              )}
                            </div>
                            <div className={`text-sm font-semibold mb-1 ${isSelected ? 'text-white' : 'text-slate-300'}`}>{type.label}</div>
                            <div className="text-xs text-slate-500 leading-relaxed">{type.description}</div>
                          </motion.button>
                         );
                      })}
                    </div>
                  </div>

                  {/* Metadata Form */}
                  <div className="bg-slate-900/40 backdrop-blur-md border border-slate-800 rounded-3xl p-8 space-y-6 shadow-xl">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-slate-300">Water Body / Region</label>
                        <div className="relative">
                          <FiMap className="absolute left-4 top-3.5 text-slate-500" />
                          <select 
                            value={selectedWaterBody}
                            onChange={(e) => setSelectedWaterBody(e.target.value)}
                            className="w-full bg-slate-950/50 border border-slate-700 rounded-xl pl-11 pr-4 py-3 text-slate-200 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-all appearance-none"
                          >
                            {indianWaterBodies.map(wb => <option key={wb} value={wb}>{wb}</option>)}
                          </select>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-slate-300">Collection Period</label>
                        <div className="relative">
                          <FiCalendar className="absolute left-4 top-3.5 text-slate-500" />
                          <input 
                            type="text" 
                            placeholder="e.g. Jan 2024 - Mar 2024" 
                            className="w-full bg-slate-950/50 border border-slate-700 rounded-xl pl-11 pr-4 py-3 text-slate-200 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-all"
                            value={collectionDate}
                            onChange={(e) => setCollectionDate(e.target.value)}
                          />
                        </div>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-medium text-slate-300">Methodology & Context</label>
                      <textarea 
                        rows={3} 
                        placeholder="Describe sampling methods, instruments used, and research objectives..."
                        className="w-full bg-slate-950/50 border border-slate-700 rounded-xl p-4 text-slate-200 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-all resize-none"
                        value={fileDescription}
                        onChange={(e) => setFileDescription(e.target.value)}
                      />
                    </div>
                  </div>

                  {/* Upload Area */}
                  <div className="space-y-2">
                     <label className="text-sm font-medium text-slate-300">File Upload</label>
                     <div
                      onDragEnter={handleDrag}
                      onDragLeave={handleDrag}
                      onDragOver={handleDrag}
                      onDrop={handleDrop}
                      onClick={() => fileInputRef.current?.click()}
                      className={`relative border-2 border-dashed rounded-3xl p-10 flex flex-col items-center justify-center text-center cursor-pointer transition-all duration-300 group backdrop-blur-sm ${
                        dragActive 
                          ? 'border-cyan-400 bg-cyan-400/5 shadow-[0_0_30px_rgba(34,211,238,0.1)]' 
                          : 'border-slate-700 bg-slate-900/30 hover:border-slate-500 hover:bg-slate-800/50'
                      }`}
                    >
                      <input ref={fileInputRef} type="file" multiple className="hidden" onChange={(e) => e.target.files && handleFiles(e.target.files)} />
                      
                      <div className={`w-20 h-20 rounded-full flex items-center justify-center mb-4 transition-all duration-300 ${dragActive ? 'bg-cyan-400/20 text-cyan-400 scale-110' : 'bg-slate-800 text-slate-400 group-hover:scale-105 group-hover:text-slate-200'}`}>
                        <FiUpload className="w-8 h-8" />
                      </div>
                      <h3 className="text-lg font-semibold text-white mb-2">Drag & Drop files here</h3>
                      <p className="text-slate-400 text-sm mb-6 max-w-sm">
                        Supports CSV, NetCDF, GeoTIFF, FASTA, and JSON. Max file size 500MB.
                      </p>
                      <button className="px-6 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-lg text-sm font-medium transition-colors border border-slate-700">
                        Browse Computer
                      </button>
                    </div>
                  </div>
                </div>

                {/* Right Column: Queue & Guidelines */}
                <div className="space-y-6">
                  {/* Upload Queue */}
                  <div className="bg-slate-900/60 backdrop-blur-xl border border-slate-800 rounded-3xl p-6 sticky top-28 shadow-xl">
                    <div className="flex items-center justify-between mb-6">
                      <h3 className="text-lg font-bold text-white flex items-center gap-2">
                        <FiClock className="text-cyan-400" /> Upload Queue
                      </h3>
                      <span className="bg-slate-800 text-slate-300 px-2 py-1 rounded text-xs font-mono">{uploadedFiles.length}</span>
                    </div>

                    <div className="space-y-3 max-h-[500px] overflow-y-auto pr-2 custom-scrollbar">
                      <AnimatePresence>
                      {uploadedFiles.length === 0 ? (
                        <div className="text-center py-10 text-slate-500 border-2 border-dashed border-slate-800 rounded-xl">
                          No files pending
                        </div>
                      ) : (
                        uploadedFiles.map((file) => (
                          <motion.div
                            key={file.id}
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, scale: 0.9 }}
                            className="bg-slate-950/50 border border-slate-800 rounded-xl p-3 hover:border-slate-700 transition-all"
                          >
                            <div className="flex justify-between items-start mb-2">
                              <div className="flex items-center gap-3 overflow-hidden">
                                <div className="w-8 h-8 rounded-lg bg-slate-800 flex items-center justify-center flex-shrink-0 text-slate-400">
                                  {file.type === 'oceanographic' ? <IoWaterOutline /> : <FiFile />}
                                </div>
                                <div className="min-w-0">
                                  <div className="text-sm font-medium text-slate-200 truncate">{file.name}</div>
                                  <div className="text-xs text-slate-500">{formatFileSize(file.size)} • {file.datasetType}</div>
                                </div>
                              </div>
                              <button onClick={() => setUploadedFiles(prev => prev.filter(f => f.id !== file.id))} className="text-slate-600 hover:text-red-400 transition-colors">
                                <FiX className="w-4 h-4" />
                              </button>
                            </div>
                            
                            {/* Progress & Status */}
                            <div className="space-y-1">
                              <div className="flex justify-between text-xs">
                                <span className={getStatusColor(file.status)}>{file.status === 'processing' ? 'Processing Metadata...' : file.status}</span>
                                <span className="text-slate-500">{Math.round(file.progress)}%</span>
                              </div>
                              <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
                                <motion.div 
                                  className={`h-full rounded-full ${file.status === 'error' ? 'bg-red-500' : 'bg-gradient-to-r from-cyan-500 to-blue-500'}`}
                                  initial={{ width: 0 }}
                                  animate={{ width: `${file.progress}%` }}
                                />
                              </div>
                            </div>
                          </motion.div>
                        ))
                      )}
                      </AnimatePresence>
                    </div>
                  </div>

                  {/* Mini Guidelines */}
                  <div className="bg-emerald-900/10 border border-emerald-500/20 rounded-3xl p-6 backdrop-blur-sm">
                    <h4 className="text-emerald-400 font-semibold mb-3 flex items-center gap-2">
                      <FiShield /> Quality Standards
                    </h4>
                    <ul className="text-sm text-slate-400 space-y-2">
                      <li className="flex gap-2"><FiCheck className="text-emerald-500 mt-0.5" /> ISO 19115 compliant metadata</li>
                      <li className="flex gap-2"><FiCheck className="text-emerald-500 mt-0.5" /> WGS84 coordinates required</li>
                      <li className="flex gap-2"><FiCheck className="text-emerald-500 mt-0.5" /> Include calibration certificates</li>
                    </ul>
                  </div>
                </div>
              </motion.div>
            )}

            {activeTab === 'my-data' && (
              <motion.div
                key="my-data"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="space-y-6"
              >
                <div className="flex justify-between items-end">
                   <div>
                     <h2 className="text-3xl font-bold text-white">My Datasets</h2>
                     <p className="text-slate-400 mt-1">Manage your contributions and track status</p>
                   </div>
                   <div className="flex gap-2">
                     <button className="p-2 bg-slate-800 rounded-lg text-slate-300 hover:text-white border border-slate-700"><FiFilter /></button>
                     <button className="px-4 py-2 bg-cyan-500 text-slate-900 font-bold rounded-lg hover:bg-cyan-400 transition-colors flex items-center gap-2">
                        <FiPlus /> New Upload
                     </button>
                   </div>
                </div>

                <div className="grid gap-4">
                  {uploadedFiles.map((file, idx) => (
                    <motion.div 
                      key={file.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: idx * 0.1 }}
                      className="bg-slate-900/40 border border-slate-800 rounded-2xl p-6 hover:border-cyan-500/30 hover:bg-slate-800/60 transition-all group backdrop-blur-sm"
                    >
                      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div className="flex items-start gap-4">
                           <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-xl
                             ${file.type === 'oceanographic' ? 'bg-cyan-500/10 text-cyan-400' : 
                               file.type === 'biodiversity' ? 'bg-emerald-500/10 text-emerald-400' : 
                               'bg-violet-500/10 text-violet-400'}`}>
                              {file.type === 'oceanographic' ? <IoWaterOutline /> : <FiDatabase />}
                           </div>
                           <div>
                             <h3 className="text-lg font-semibold text-white group-hover:text-cyan-400 transition-colors">{file.name}</h3>
                             <div className="flex flex-wrap gap-x-4 gap-y-1 mt-1 text-sm text-slate-400">
                               <span className="flex items-center gap-1"><FiCalendar className="w-3 h-3" /> {file.uploadedAt.toLocaleDateString()}</span>
                               <span className="flex items-center gap-1"><FaMapMarkerAlt className="w-3 h-3" /> {file.waterBody}</span>
                               <span className="flex items-center gap-1"><FiDatabase className="w-3 h-3" /> {formatFileSize(file.size)}</span>
                             </div>
                           </div>
                        </div>

                        <div className="flex items-center gap-4 self-end md:self-center">
                          <div className="text-right mr-4 hidden md:block">
                            <div className="text-2xl font-bold text-white">{file.downloads || 0}</div>
                            <div className="text-xs text-slate-500">Downloads</div>
                          </div>
                          
                          <div className={`px-3 py-1 rounded-full text-xs font-medium border ${
                             file.status === 'published' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 
                             'bg-orange-500/10 text-orange-400 border-orange-500/20'
                          }`}>
                            {file.status}
                          </div>

                          <div className="flex gap-2">
                             <button className="p-2 hover:bg-slate-700 rounded-lg text-slate-400 hover:text-white transition-colors"><FiEye /></button>
                             <button className="p-2 hover:bg-slate-700 rounded-lg text-slate-400 hover:text-cyan-400 transition-colors"><FiEdit /></button>
                             <button className="p-2 hover:bg-slate-700 rounded-lg text-slate-400 hover:text-red-400 transition-colors"><FiTrash2 /></button>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            )}

            {activeTab === 'analytics' && (
              <motion.div key="analytics" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-8">
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {/* Graph Placeholder - Styled */}
                    <div className="bg-slate-900/50 border border-slate-800 rounded-3xl p-6 h-80 relative overflow-hidden group backdrop-blur-sm">
                      <div className="absolute top-0 right-0 p-6 opacity-10 group-hover:opacity-20 transition-opacity">
                        <IoStatsChart className="w-32 h-32 text-cyan-500" />
                      </div>
                      <h3 className="text-lg font-bold text-white mb-6">Impact Over Time</h3>
                      <div className="flex items-end justify-between h-48 px-4 gap-2">
                        {researchImpact.map((d, i) => (
                           <div key={i} className="flex flex-col items-center gap-2 w-full">
                              <div className="w-full bg-slate-800 rounded-t-lg relative group/bar">
                                <motion.div 
                                  initial={{ height: 0 }} 
                                  animate={{ height: `${d.impact}%` }} 
                                  className="w-full bg-gradient-to-t from-cyan-600 to-cyan-400 rounded-t-lg absolute bottom-0 opacity-80 group-hover/bar:opacity-100 transition-opacity"
                                />
                              </div>
                              <span className="text-xs text-slate-500">{d.year}</span>
                           </div>
                        ))}
                      </div>
                    </div>

                    <div className="space-y-4">
                      <h3 className="text-lg font-bold text-white">Recent Activity</h3>
                      {[1,2,3].map((_, i) => (
                        <div key={i} className="flex gap-4 p-4 rounded-2xl bg-slate-900/30 border border-slate-800 hover:bg-slate-800/50 transition-colors backdrop-blur-sm">
                           <div className="w-10 h-10 rounded-full bg-blue-500/20 flex items-center justify-center text-blue-400 shrink-0">
                             <FiDownload />
                           </div>
                           <div>
                             <p className="text-sm text-slate-200"><span className="font-bold text-white">NOAA Research Lab</span> downloaded <span className="text-cyan-400">Bay of Bengal Salinity Data</span></p>
                             <p className="text-xs text-slate-500 mt-1">2 hours ago</p>
                           </div>
                        </div>
                      ))}
                    </div>
                 </div>
              </motion.div>
            )}

            {activeTab === 'guidelines' && (
              <motion.div key="guidelines" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                 <div className="space-y-6">
                    <div className="bg-slate-900/50 border border-slate-800 rounded-3xl p-8 backdrop-blur-sm">
                      <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2"><FiCheck className="text-emerald-400" /> Best Practices</h3>
                      <ul className="space-y-4 text-slate-300">
                        {["Use standardized file formats (NetCDF, CSV, Darwin Core).", "Ensure comprehensive metadata (ISO 19115).", "Provide detailed methodology and instrument calibration.", "Use WGS84 coordinate reference system."].map((item, i) => (
                          <li key={i} className="flex gap-3"><FiCheck className="text-emerald-500 mt-1 shrink-0" /> {item}</li>
                        ))}
                      </ul>
                    </div>
                 </div>
                 <div className="space-y-6">
                    <div className="bg-slate-900/50 border border-slate-800 rounded-3xl p-8 backdrop-blur-sm">
                      <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2"><FiAward className="text-violet-400" /> Contributor Benefits</h3>
                      <ul className="space-y-4 text-slate-300">
                        {["DOIs assigned to all published datasets.", "Track citations and research impact metrics.", "Annual recognition awards and badges.", "Priority access to SAGAR research cruises."].map((item, i) => (
                          <li key={i} className="flex gap-3"><FiAward className="text-violet-500 mt-1 shrink-0" /> {item}</li>
                        ))}
                      </ul>
                    </div>
                 </div>
              </motion.div>
            )}
          </AnimatePresence>

        </div>
      </main>

      {/* --- Success Modal --- */}
      <AnimatePresence>
        {showSuccessModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm"
              onClick={() => setShowSuccessModal(false)}
            />
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="relative bg-slate-900 border border-slate-700 rounded-3xl p-8 max-w-md w-full shadow-2xl shadow-emerald-500/10 overflow-hidden"
            >
              <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-emerald-500 to-cyan-500" />
              <div className="text-center">
                <div className="w-20 h-20 bg-emerald-500/20 rounded-full flex items-center justify-center mx-auto mb-6 ring-1 ring-emerald-500/50">
                  <FiCheck className="w-10 h-10 text-emerald-400" />
                </div>
                <h3 className="text-2xl font-bold text-white mb-2">Upload Successful!</h3>
                <p className="text-slate-400 mb-8">
                  Your data has been securely uploaded to SAGAR. It will undergo a quality check before publication.
                </p>
                <div className="grid grid-cols-2 gap-3">
                  <button onClick={() => setShowSuccessModal(false)} className="py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-medium transition-colors">
                    Upload More
                  </button>
                  <button onClick={() => { setShowSuccessModal(false); setActiveTab('my-data'); }} className="py-3 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-900 font-bold transition-colors">
                    View My Data
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default DataContributorPage;