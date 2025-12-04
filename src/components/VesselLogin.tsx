import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiArrowLeft, FiArrowRight, FiActivity, FiDatabase, FiCheckCircle, FiAlertCircle, FiPlay, FiSquare, FiFileText, FiCalendar } from 'react-icons/fi';
import { 
  TelemetryDataPoint, 
  processTelemetryData, 
  checkAPIHealth,
  generateArtificialTelemetryData 
} from '../services/vesselTelemetryService';
import {
  fetchVesselTelemetryFiles,
  fetchVesselTelemetryFilesByDate,
  getDatesWithUploads,
  VesselTelemetryFile
} from '../services/vesselTelemetrySupabaseService';
import QualityReport from './QualityReport';

interface VesselLoginProps {
  onBack: () => void;
}

interface QualityReport {
  summary?: {
    quality_status?: string;
    total_data_points?: number;
    flag_summary?: Record<string, number>;
  };
  detailed_metrics?: {
    overall_quality_score?: number;
    good_percentage?: number;
    suspect_percentage?: number;
    fail_percentage?: number;
  };
  test_results?: Record<string, any>;
  recommendations?: string[];
}

const VesselLogin: React.FC<VesselLoginProps> = ({ onBack }) => {
  const [isCollecting, setIsCollecting] = useState(false);
  const [telemetryData, setTelemetryData] = useState<TelemetryDataPoint[]>([]);
  const [dataSize, setDataSize] = useState(0); // Size in bytes
  const [threshold, setThreshold] = useState(100 * 1024); // Default 100KB threshold
  const [apiAvailable, setApiAvailable] = useState<boolean | null>(null);
  const [processingStatus, setProcessingStatus] = useState<{
    type: 'info' | 'success' | 'error';
    message: string;
  } | null>(null);
  const [processedFiles, setProcessedFiles] = useState<VesselTelemetryFile[]>([]);
  const [isLoadingFiles, setIsLoadingFiles] = useState(false);
  const [selectedReport, setSelectedReport] = useState<QualityReport | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const collectionIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const dataBufferRef = useRef<TelemetryDataPoint[]>([]);

  // Load processed files from Supabase on mount
  useEffect(() => {
    const loadFiles = async () => {
      setIsLoadingFiles(true);
      try {
        console.log('🔄 Loading vessel telemetry files from Supabase...');
        const files = await fetchVesselTelemetryFiles();
        console.log(`✅ Loaded ${files.length} files:`, files);
        setProcessedFiles(files);
        
        if (files.length === 0) {
          setProcessingStatus({
            type: 'info',
            message: 'No vessel telemetry files found in Supabase storage. Start collecting data to see files here.'
          });
        }
      } catch (error) {
        console.error('❌ Error loading files from Supabase:', error);
        setProcessingStatus({
          type: 'error',
          message: `Failed to load files from Supabase: ${error instanceof Error ? error.message : 'Unknown error'}`
        });
      } finally {
        setIsLoadingFiles(false);
      }
    };

    loadFiles();
  }, []);

  // Refresh files when a new file is processed
  const refreshFiles = async () => {
    try {
      const files = await fetchVesselTelemetryFiles();
      setProcessedFiles(files);
    } catch (error) {
      console.error('Error refreshing files from Supabase:', error);
    }
  };

  // Check API health on mount
  useEffect(() => {
    checkAPIHealth().then(result => {
      setApiAvailable(result.available);
      if (!result.available) {
        setProcessingStatus({
          type: 'error',
          message: 'DataProcessingEngine API is not available. Please check the connection.'
        });
      }
    });
  }, []);

  // Start/Stop data collection
  const toggleCollection = () => {
    if (isCollecting) {
      // Stop collection
      if (collectionIntervalRef.current) {
        clearInterval(collectionIntervalRef.current);
        collectionIntervalRef.current = null;
      }
      setIsCollecting(false);
    } else {
      // Start collection
      setIsCollecting(true);
      dataBufferRef.current = [];
      
      // Generate data every second (artificial data for now)
      collectionIntervalRef.current = setInterval(() => {
        const newData = generateArtificialTelemetryData(1);
        dataBufferRef.current.push(...newData);
        
        // Update state
        setTelemetryData(prev => [...prev, ...newData]);
        
        // Calculate size (approximate)
        const csvSize = JSON.stringify(dataBufferRef.current).length;
        setDataSize(csvSize);
        
        // Check if threshold is reached
        if (csvSize >= threshold) {
          handlePackageAndSend();
        }
      }, 1000);
    }
  };

  // Package data and send to processing engine
  const handlePackageAndSend = async () => {
    if (dataBufferRef.current.length === 0) return;
    
    const dataToSend = [...dataBufferRef.current];
    dataBufferRef.current = []; // Clear buffer
    
    const filename = `vessel-telemetry-${new Date().toISOString().replace(/[:.]/g, '-')}.csv`;
    
    setProcessingStatus({
      type: 'info',
      message: `Packaging ${dataToSend.length} data points and sending to processing engine...`
    });
    
    try {
      const result = await processTelemetryData(dataToSend, filename);
      
      if (result.success && result.qualityReport) {
        setProcessingStatus({
          type: 'success',
          message: `Data processed successfully! Quality Score: ${result.qualityReport.detailed_metrics?.overall_quality_score?.toFixed(1) || 'N/A'}%`
        });
        
        // Add to processed files list
        const qualityReportWithFileName = result.qualityReport ? {
          ...result.qualityReport,
          file_name: result.processedFile || filename
        } : null;
        
        // Refresh files from Supabase instead of adding locally
        // The file is already in Supabase from the processing engine
        await refreshFiles();
        
        // Reset data size
        setDataSize(0);
        setTelemetryData([]);
        
        // Clear status after 3 seconds
        setTimeout(() => {
          setProcessingStatus(null);
        }, 3000);
      } else {
        throw new Error(result.error || 'Processing failed');
      }
    } catch (error: any) {
      setProcessingStatus({
        type: 'error',
        message: `Failed to process data: ${error.message}`
      });
      
      // Restore data to buffer if processing failed
      dataBufferRef.current = [...dataToSend, ...dataBufferRef.current];
    }
  };

  // Manual send button
  const handleManualSend = () => {
    if (telemetryData.length === 0) {
      setProcessingStatus({
        type: 'error',
        message: 'No data collected yet. Start data collection first.'
      });
      return;
    }
    handlePackageAndSend();
  };

  // Format file size
  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(2)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
  };

  // Helper to get local date string (YYYY-MM-DD) without timezone issues
  const getLocalDateString = (date: Date): string => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  // Helper to extract date from filename
  const extractDateFromFilename = (filename: string): Date | null => {
    try {
      const match = filename.match(/vessel-telemetry-(\d{4}-\d{2}-\d{2})T/);
      if (match) {
        const dateStr = match[1];
        return new Date(dateStr + 'T00:00:00');
      }
      return null;
    } catch (error) {
      return null;
    }
  };

  // Get dates with uploads from Supabase files
  const [datesWithUploads, setDatesWithUploads] = useState<Set<string>>(new Set());

  // Update dates with uploads when files change
  useEffect(() => {
    const updateDates = async () => {
      const dates = await getDatesWithUploads();
      setDatesWithUploads(dates);
    };
    updateDates();
  }, [processedFiles]);

  // Filter files by selected date (using local dates)
  const filteredFiles = selectedDate
    ? processedFiles.filter(file => {
        // Extract date from filename or use timestamp
        const fileDateStr = getLocalDateString(
          extractDateFromFilename(file.filename) || new Date(file.timestamp)
        );
        const selectedDateStr = getLocalDateString(selectedDate);
        return fileDateStr === selectedDateStr;
      })
    : processedFiles;

  // Calendar helper functions
  const [currentMonth, setCurrentMonth] = useState(new Date());

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    const days = [];
    // Add empty cells for days before the first day of the month
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null);
    }
    // Add all days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      days.push(new Date(year, month, day));
    }
    return days;
  };

  const formatDateForComparison = (date: Date): string => {
    return getLocalDateString(date);
  };

  const handleDateClick = (date: Date | null) => {
    if (date) {
      const dateStr = formatDateForComparison(date);
      if (selectedDate && formatDateForComparison(selectedDate) === dateStr) {
        setSelectedDate(null); // Deselect if clicking the same date
      } else {
        setSelectedDate(date);
      }
    }
  };

  const navigateMonth = (direction: 'prev' | 'next') => {
    setCurrentMonth(prev => {
      const newDate = new Date(prev);
      if (direction === 'prev') {
        newDate.setMonth(prev.getMonth() - 1);
      } else {
        newDate.setMonth(prev.getMonth() + 1);
      }
      return newDate;
    });
  };

  const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (collectionIntervalRef.current) {
        clearInterval(collectionIntervalRef.current);
      }
    };
  }, []);

  return (
    <div className="min-h-screen bg-marine-blue text-white">
      {/* Header */}
      <header className="bg-marine-dark/50 backdrop-blur-sm border-b border-marine-cyan/20 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={onBack}
                className="p-2 hover:bg-marine-cyan/20 rounded-lg transition-colors"
              >
                <FiArrowLeft className="w-5 h-5" />
              </button>
              <h1 className="text-2xl font-bold">Vessel Telemetry</h1>
            </div>
            <div className="flex items-center gap-2">
              {apiAvailable === true && (
                <span className="flex items-center gap-2 text-green-400">
                  <FiCheckCircle className="w-4 h-4" />
                  <span className="text-sm">API Connected</span>
                </span>
              )}
              {apiAvailable === false && (
                <span className="flex items-center gap-2 text-red-400">
                  <FiAlertCircle className="w-4 h-4" />
                  <span className="text-sm">API Disconnected</span>
                </span>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex gap-6 max-w-7xl mx-auto px-6 py-8">
        {/* Calendar Sidebar */}
        <motion.aside
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="w-80 flex-shrink-0 bg-marine-dark/50 backdrop-blur-sm rounded-lg p-4 border border-marine-cyan/20 h-fit sticky top-24"
        >
          <div className="flex items-center gap-3 mb-4">
            <FiCalendar className="w-5 h-5 text-marine-cyan" />
            <h2 className="text-lg font-semibold">Calendar</h2>
          </div>

          {/* Month Navigation */}
          <div className="flex items-center justify-between mb-4">
            <button
              onClick={() => navigateMonth('prev')}
              className="p-1 hover:bg-marine-cyan/20 rounded transition-colors"
            >
              <FiArrowLeft className="w-4 h-4" />
            </button>
            <h3 className="text-base font-semibold">
              {monthNames[currentMonth.getMonth()]} {currentMonth.getFullYear()}
            </h3>
            <button
              onClick={() => navigateMonth('next')}
              className="p-1 hover:bg-marine-cyan/20 rounded transition-colors"
            >
              <FiArrowRight className="w-4 h-4" />
            </button>
          </div>

          {/* Calendar Grid */}
          <div className="grid grid-cols-7 gap-1 mb-2">
            {dayNames.map(day => (
              <div key={day} className="text-center text-xs text-gray-400 font-semibold py-1">
                {day}
              </div>
            ))}
          </div>

          <div className="grid grid-cols-7 gap-1">
            {getDaysInMonth(currentMonth).map((date, index) => {
              if (!date) {
                return <div key={`empty-${index}`} className="aspect-square" />;
              }

              const dateStr = formatDateForComparison(date);
              const hasUploads = datesWithUploads.has(dateStr);
              const isSelected = selectedDate && formatDateForComparison(selectedDate) === dateStr;
              const isToday = formatDateForComparison(new Date()) === dateStr;

              return (
                <button
                  key={dateStr}
                  onClick={() => handleDateClick(date)}
                  className={`aspect-square rounded text-sm transition-all ${
                    isSelected
                      ? 'bg-marine-cyan text-marine-blue font-bold'
                      : hasUploads
                      ? 'bg-marine-cyan/30 text-marine-cyan hover:bg-marine-cyan/40 font-semibold'
                      : isToday
                      ? 'bg-marine-dark border border-marine-cyan/50 text-white'
                      : 'bg-marine-dark/30 text-gray-300 hover:bg-marine-dark/50'
                  }`}
                  title={hasUploads ? `${date.getDate()} - Has uploads` : date.getDate().toString()}
                >
                  {date.getDate()}
                </button>
              );
            })}
          </div>

          {/* Selected Date Info */}
          {selectedDate && (
            <div className="mt-4 pt-4 border-t border-marine-cyan/20">
              <p className="text-xs text-gray-400 mb-1">Selected Date:</p>
              <p className="text-sm font-semibold text-marine-cyan">
                {selectedDate.toLocaleDateString('en-US', {
                  month: 'long',
                  day: 'numeric',
                  year: 'numeric'
                })}
              </p>
              <button
                onClick={() => setSelectedDate(null)}
                className="mt-2 text-xs text-gray-400 hover:text-white transition-colors"
              >
                Clear filter
              </button>
            </div>
          )}

          {/* Upload Stats */}
          <div className="mt-4 pt-4 border-t border-marine-cyan/20">
            <p className="text-xs text-gray-400 mb-2">Upload Summary</p>
            <div className="space-y-1">
              <div className="flex justify-between text-xs">
                <span className="text-gray-300">Total Files:</span>
                <span className="font-semibold text-marine-cyan">{processedFiles.length}</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-gray-300">Days with Uploads:</span>
                <span className="font-semibold text-marine-cyan">{datesWithUploads.size}</span>
              </div>
              {selectedDate && (
                <div className="flex justify-between text-xs">
                  <span className="text-gray-300">Selected Date:</span>
                  <span className="font-semibold text-marine-cyan">{filteredFiles.length} files</span>
                </div>
              )}
            </div>
          </div>
        </motion.aside>

        {/* Main Content Area */}
        <div className="flex-1 min-w-0">
        {/* Status Messages */}
        {processingStatus && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className={`mb-6 p-4 rounded-lg ${
              processingStatus.type === 'success' 
                ? 'bg-green-500/20 border border-green-500/50' 
                : processingStatus.type === 'error'
                ? 'bg-red-500/20 border border-red-500/50'
                : 'bg-blue-500/20 border border-blue-500/50'
            }`}
          >
            <div className="flex items-center gap-2">
              {processingStatus.type === 'success' && <FiCheckCircle className="w-5 h-5 text-green-400" />}
              {processingStatus.type === 'error' && <FiAlertCircle className="w-5 h-5 text-red-400" />}
              {processingStatus.type === 'info' && <FiActivity className="w-5 h-5 text-blue-400" />}
              <p>{processingStatus.message}</p>
            </div>
          </motion.div>
        )}

        {/* Control Panel */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          {/* Data Collection Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-marine-dark/50 backdrop-blur-sm rounded-lg p-6 border border-marine-cyan/20"
          >
            <div className="flex items-center gap-3 mb-4">
              <FiActivity className="w-6 h-6 text-marine-cyan" />
              <h2 className="text-xl font-semibold">Data Collection</h2>
            </div>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-gray-300">Status:</span>
                <span className={`font-semibold ${isCollecting ? 'text-green-400' : 'text-gray-400'}`}>
                  {isCollecting ? 'Collecting...' : 'Stopped'}
                </span>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-gray-300">Data Points:</span>
                <span className="font-semibold">{telemetryData.length}</span>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-gray-300">Data Size:</span>
                <span className="font-semibold">{formatFileSize(dataSize)}</span>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-gray-300">Threshold:</span>
                <input
                  type="number"
                  value={threshold / 1024}
                  onChange={(e) => setThreshold(Number(e.target.value) * 1024)}
                  disabled={isCollecting}
                  className="w-24 px-2 py-1 bg-marine-dark border border-marine-cyan/30 rounded text-white text-sm"
                  min="1"
                />
                <span className="text-sm text-gray-400">KB</span>
              </div>
              
              <div className="pt-4 border-t border-marine-cyan/20">
                <div className="w-full bg-marine-dark rounded-full h-2 mb-4">
                  <div
                    className="bg-marine-cyan h-2 rounded-full transition-all duration-300"
                    style={{ width: `${Math.min((dataSize / threshold) * 100, 100)}%` }}
                  />
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={toggleCollection}
                    className={`flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-lg font-semibold transition-all ${
                      isCollecting
                        ? 'bg-red-600 hover:bg-red-700 text-white'
                        : 'bg-marine-cyan hover:bg-marine-cyan/80 text-marine-blue'
                    }`}
                  >
                    {isCollecting ? (
                      <>
                        <FiSquare className="w-4 h-4" />
                        Stop Collection
                      </>
                    ) : (
                      <>
                        <FiPlay className="w-4 h-4" />
                        Start Collection
                      </>
                    )}
                  </button>
                  <button
                    onClick={handleManualSend}
                    disabled={telemetryData.length === 0 || isCollecting}
                    className="px-4 py-2 bg-marine-teal hover:bg-marine-teal/80 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg font-semibold transition-all"
                  >
                    Send Now
                  </button>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Processing Status Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-marine-dark/50 backdrop-blur-sm rounded-lg p-6 border border-marine-cyan/20"
          >
            <div className="flex items-center gap-3 mb-4">
              <FiDatabase className="w-6 h-6 text-marine-cyan" />
              <h2 className="text-xl font-semibold">Processing Status</h2>
            </div>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-gray-300">Files Processed:</span>
                <span className="font-semibold">{processedFiles.length}</span>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-gray-300">API Status:</span>
                <span className={`font-semibold ${
                  apiAvailable === true ? 'text-green-400' : 
                  apiAvailable === false ? 'text-red-400' : 
                  'text-yellow-400'
                }`}>
                  {apiAvailable === true ? 'Connected' : 
                   apiAvailable === false ? 'Disconnected' : 
                   'Checking...'}
                </span>
              </div>
              
              {processedFiles.length > 0 && (
                <div className="pt-4 border-t border-marine-cyan/20">
                  <p className="text-sm text-gray-400 mb-2">Latest File:</p>
                  <p className="text-sm font-mono text-marine-cyan truncate">
                    {processedFiles[processedFiles.length - 1].filename}
                  </p>
                </div>
              )}
            </div>
          </motion.div>
        </div>

        {/* Processed Files List */}
        {isLoadingFiles ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-marine-dark/50 backdrop-blur-sm rounded-lg p-6 border border-marine-cyan/20"
          >
            <div className="text-center py-8">
              <FiActivity className="w-8 h-8 text-marine-cyan mx-auto mb-4 animate-pulse" />
              <p className="text-gray-400">Loading files from Supabase...</p>
            </div>
          </motion.div>
        ) : processedFiles.length > 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-marine-dark/50 backdrop-blur-sm rounded-lg p-6 border border-marine-cyan/20"
          >
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold flex items-center gap-2">
                <FiDatabase className="w-5 h-5 text-marine-cyan" />
                Processed Files ({filteredFiles.length})
              </h2>
              <button
                onClick={refreshFiles}
                className="flex items-center gap-2 px-3 py-1.5 bg-marine-cyan/20 hover:bg-marine-cyan/30 border border-marine-cyan/50 rounded-lg text-sm font-semibold text-marine-cyan transition-all"
                title="Refresh files from Supabase"
              >
                <FiActivity className="w-4 h-4" />
                Refresh
              </button>
            </div>
            
            <div className="space-y-3">
              {filteredFiles.length === 0 ? (
                <div className="text-center py-8 text-gray-400">
                  {selectedDate ? (
                    <p>No files uploaded on {selectedDate.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</p>
                  ) : (
                    <p>No files processed yet</p>
                  )}
                </div>
              ) : (
                filteredFiles.slice().reverse().map((file, index) => (
                <div
                  key={index}
                  className="bg-marine-dark/30 rounded-lg p-4 border border-marine-cyan/10"
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1">
                      <p className="font-semibold text-marine-cyan">{file.filename}</p>
                      <p className="text-sm text-gray-400 mt-1">
                        {new Date(file.timestamp).toLocaleString()} • {file.dataPoints} data points
                      </p>
                    </div>
                  <div className="flex items-center gap-3">
                    {file.qualityReport && (
                      <div className="text-right">
                        <div className={`inline-flex items-center gap-1 px-2 py-1 rounded text-xs font-semibold ${
                          file.qualityReport.summary?.quality_status === 'GOOD' 
                            ? 'bg-green-500/20 text-green-400'
                            : file.qualityReport.summary?.quality_status === 'SUSPECT'
                            ? 'bg-yellow-500/20 text-yellow-400'
                            : 'bg-red-500/20 text-red-400'
                        }`}>
                          {file.qualityReport.detailed_metrics?.overall_quality_score?.toFixed(1) || 'N/A'}%
                        </div>
                        <p className="text-xs text-gray-400 mt-1">
                          {file.qualityReport.summary?.quality_status || 'UNKNOWN'}
                        </p>
                      </div>
                    )}
                    {file.qualityReport && (
                      <button
                        onClick={() => setSelectedReport(file.qualityReport)}
                        className="flex items-center gap-2 px-3 py-1.5 bg-marine-cyan/20 hover:bg-marine-cyan/30 border border-marine-cyan/50 rounded-lg text-sm font-semibold text-marine-cyan transition-all"
                      >
                        <FiFileText className="w-4 h-4" />
                        View Report
                      </button>
                    )}
                  </div>
                  </div>
                  
                  {file.qualityReport && file.qualityReport.recommendations && file.qualityReport.recommendations.length > 0 && (
                    <div className="mt-2 pt-2 border-t border-marine-cyan/10">
                      <p className="text-xs text-gray-400">Recommendations:</p>
                      <ul className="text-xs text-gray-300 mt-1 list-disc list-inside">
                        {file.qualityReport.recommendations.slice(0, 2).map((rec: string, i: number) => (
                          <li key={i}>{rec}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
                ))
              )}
            </div>
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-marine-dark/50 backdrop-blur-sm rounded-lg p-6 border border-marine-cyan/20"
          >
            <div className="text-center py-8">
              <FiDatabase className="w-8 h-8 text-gray-500 mx-auto mb-4" />
              <p className="text-gray-400">No vessel telemetry files found in Supabase storage</p>
            </div>
          </motion.div>
        )}
        </div>

        {/* Quality Report Modal */}
        <AnimatePresence>
          {selectedReport && (
            <QualityReport
              qualityReport={selectedReport}
              onClose={() => setSelectedReport(null)}
            />
          )}
        </AnimatePresence>
      </main>
    </div>
  );
};

export default VesselLogin;

