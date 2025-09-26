import React, { useEffect, useMemo, useState, Suspense } from 'react';
import ReactDOM from 'react-dom';
import { motion } from 'framer-motion';
import { FiArrowLeft, FiFilter, FiPlus, FiActivity, FiTrendingUp, FiSearch, FiX } from 'react-icons/fi';
import { Project, DataPoint } from '../App';
import ReactGlobeComponent from './ReactGlobeComponent';
import { Card, CardTitle, CardDescription, CardSkeletonContainer } from './ui/aceternityCards';
import { DataService } from '../services/dataService';
import { SearchResultSummary } from './SearchResultsView';

interface GlobeViewProps {
  selectedProject: Project | null;
  onShowSearchResults?: (result: SearchResultSummary) => void;
}

const GlobeView: React.FC<GlobeViewProps> = ({ selectedProject, onShowSearchResults }) => {
  const [dataPoints, setDataPoints] = useState<DataPoint[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [dataLayer, setDataLayer] = useState<'Species Occurrences' | 'Sea Surface Temperature (SST)' | 'Salinity' | 'Chlorophyll Concentration' | 'eDNA Detections'>('Species Occurrences');
  type ActiveFilter = 
    | { type: 'species'; value: string }
    | { type: 'waterBody'; value: string }
    | { type: 'locality'; value: string }
    | { type: 'depth'; min: number; max: number }
    | { type: 'date'; start: string; end: string }
    | { type: 'method'; values: string[] };
  const [activeFilters, setActiveFilters] = useState<ActiveFilter[]>([]);
  const [newSpecies, setNewSpecies] = useState('');
  const [newWaterBody, setNewWaterBody] = useState('');
  const [newLocality, setNewLocality] = useState('');
  const [depthMin, setDepthMin] = useState<number>(0);
  const [depthMax, setDepthMax] = useState<number>(1000);
  const [dateStart, setDateStart] = useState('');
  const [dateEnd, setDateEnd] = useState('');
  const [methods, setMethods] = useState<string[]>([]);
  const [analysisInput, setAnalysisInput] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisSteps, setAnalysisSteps] = useState<string[]>([]);
  const [insight, setInsight] = useState<string | null>(null);
  const [activeMode, setActiveMode] = useState<'Analyse' | 'Visualise' | 'Study'>('Analyse');
  const [globeFocused, setGlobeFocused] = useState<boolean>(false);

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setGlobeFocused(false);
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, []);

  // Leave globe focus when switching away from Analyse
  useEffect(() => {
    if (activeMode === 'Visualise') {
      setGlobeFocused(false);
    }
  }, [activeMode]);

  useEffect(() => {
    const load = async () => {
      setIsLoading(true);
      const svc = DataService.getInstance();
      const pts = await svc.loadOccurrenceData();
      setDataPoints(pts);
      setIsLoading(false);
    };
    load();
  }, []);

  const uniqueSpecies = useMemo(() => Array.from(new Set(dataPoints.map(d => d.scientificName))).sort(), [dataPoints]);
  const uniqueWaterBodies = useMemo(() => Array.from(new Set(dataPoints.map(d => d.waterBody))).filter(Boolean).sort(), [dataPoints]);
  const uniqueLocalities = useMemo(() => Array.from(new Set(dataPoints.map(d => d.locality))).filter(Boolean).sort(), [dataPoints]);
  const uniqueMethods = useMemo(() => Array.from(new Set(dataPoints.map(d => d.samplingProtocol))).filter(Boolean).sort(), [dataPoints]);

  const filteredData = useMemo(() => {
    let result = dataPoints;
    for (const f of activeFilters) {
      switch (f.type) {
        case 'species':
          result = result.filter(p => p.scientificName.toLowerCase().includes(f.value.toLowerCase()));
          break;
        case 'waterBody':
          result = result.filter(p => p.waterBody === f.value);
          break;
        case 'locality':
          result = result.filter(p => p.locality === f.value);
          break;
        case 'depth':
          result = result.filter(p => (p.minimumDepthInMeters >= f.min && p.maximumDepthInMeters <= f.max));
          break;
        case 'date':
          result = result.filter(p => {
            const d = new Date(p.eventDate).getTime();
            const s = f.start ? new Date(f.start).getTime() : -Infinity;
            const e = f.end ? new Date(f.end).getTime() : Infinity;
            return !isNaN(d) && d >= s && d <= e;
          });
          break;
        case 'method':
          result = result.filter(p => f.values.includes(p.samplingProtocol));
          break;
      }
    }
    return result;
  }, [dataPoints, activeFilters]);

  const liveFeedData = [
    'New species discovered in Andaman Sea',
    'Temperature anomaly detected in Arabian Sea',
    'Coral bleaching alert in Bay of Bengal',
    'Plankton bloom observed in Indian Ocean',
    'Deep sea survey completed successfully'
  ];

  // Helper functions to generate chart data
  const generateOccurrencesByYear = (data: DataPoint[]) => {
    const yearCounts: { [year: number]: number } = {};
    data.forEach(point => {
      const year = new Date(point.eventDate).getFullYear();
      if (!isNaN(year)) {
        yearCounts[year] = (yearCounts[year] || 0) + 1;
      }
    });
    return Object.entries(yearCounts).map(([year, count]) => ({
      year: parseInt(year),
      count
    })).sort((a, b) => a.year - b.year);
  };

  const generateDepthHistogram = (data: DataPoint[]) => {
    const depthCounts: { [depth: number]: number } = {};
    data.forEach(point => {
      const avgDepth = Math.round((point.minimumDepthInMeters + point.maximumDepthInMeters) / 2);
      depthCounts[avgDepth] = (depthCounts[avgDepth] || 0) + 1;
    });
    return Object.entries(depthCounts).map(([depth, count]) => ({
      depth: parseInt(depth),
      count
    })).sort((a, b) => a.depth - b.depth);
  };

  const generateCategoryCounts = (data: DataPoint[], key: 'waterBody' | 'samplingProtocol') => {
    const counts: { [name: string]: number } = {};
    data.forEach(point => {
      const val = (point as any)[key];
      if (val) counts[val] = (counts[val] || 0) + 1;
    });
    return Object.entries(counts)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 12);
  };

  // no-op here; VisualiseView will compute from raw data

  const handleAnalyze = async () => {
    if (!analysisInput.trim()) return;
    setIsAnalyzing(true);
    setAnalysisSteps([
      'Analyzing patterns in filtered occurrences...',
      'Correlating with oceanographic context (SST, salinity, chlorophyll)...',
      'Summarizing insights...'
    ]);
    await new Promise(r => setTimeout(r, 1200));
    await new Promise(r => setTimeout(r, 1200));
    await new Promise(r => setTimeout(r, 800));
    
    // Generate mock search result based on filtered data
    const mockResult: SearchResultSummary = {
      scientificName: analysisInput.trim() || 'Species Analysis',
      description: `Analysis results for "${analysisInput.trim()}" based on ${filteredData.length} filtered occurrences. This species shows interesting distribution patterns across the marine environment.`,
      locality: filteredData.length > 0 ? filteredData[0].locality : 'Unknown',
      basisOfRecord: filteredData.length > 0 ? 'Preserved Specimen' : 'Unknown',
      minDepthInMeters: filteredData.length > 0 ? Math.min(...filteredData.map(d => d.minimumDepthInMeters)) : null,
      maxDepthInMeters: filteredData.length > 0 ? Math.max(...filteredData.map(d => d.maximumDepthInMeters)) : null,
      coordinates: filteredData.length > 0 ? {
        lat: filteredData[0].decimalLatitude,
        lng: filteredData[0].decimalLongitude
      } : null,
      occurrencesByYear: generateOccurrencesByYear(filteredData),
      depthHistogram: generateDepthHistogram(filteredData)
    };
    
    setInsight('Insight: The species Puerulus sewelli is frequently found in the Andaman Sea at depths between 300-500m. This correlates with areas of lower oxygen concentration.');
    setIsAnalyzing(false);
    setAnalysisInput('');
    
    // Create transition overlay by cloning the current globe canvas
    try {
      const globeWrapper = document.querySelector('.sagar-main-globe') as HTMLElement | null;
      const globeCanvas = globeWrapper?.querySelector('canvas') as HTMLCanvasElement | null;
      if (globeCanvas) {
        const from = globeCanvas.getBoundingClientRect();
        const overlay = document.createElement('div');
        overlay.style.position = 'fixed';
        overlay.style.left = from.left + 'px';
        overlay.style.top = from.top + 'px';
        overlay.style.width = from.width + 'px';
        overlay.style.height = from.height + 'px';
        overlay.style.borderRadius = '16px';
        overlay.style.overflow = 'hidden';
        overlay.style.zIndex = '9999';
        overlay.style.pointerEvents = 'none';
        const clone = globeCanvas.cloneNode(true) as HTMLCanvasElement;
        overlay.appendChild(clone);
        document.body.appendChild(overlay);
        (window as any).__sagarTransition = { overlay };
      }
    } catch {}

    // Show search results
    if (onShowSearchResults) {
      onShowSearchResults(mockResult);
    }
  };

  return (
    <div className="min-h-screen bg-marine-blue relative overflow-hidden">
      <header className={`fixed top-0 left-0 right-0 z-50 transition-all ${globeFocused ? 'filter blur-sm pointer-events-none' : ''}`}>
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            <motion.button
              onClick={() => window.dispatchEvent(new Event('backToProjects'))}
              className="flex items-center space-x-2 px-4 py-2 bg-white/20 hover:bg-white/30 border border-white/30 rounded-xl backdrop-blur-sm transition-all duration-200"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <FiArrowLeft className="w-4 h-4" />
              <span>Back to Projects</span>
            </motion.button>

            <div className="text-center">
              <h1 className="text-xl font-bold text-white">
                {selectedProject?.title ?? 'SAGAR - (Spatio-temporal Analytics Gateway for Aquatic Resources)'}
              </h1>
            <div className="mt-2 flex justify-center">
              <div className="inline-flex bg-white/15 border border-white/25 rounded-xl overflow-hidden backdrop-blur-sm">
                {(['Analyse','Visualise','Study'] as const).map((mode, idx) => (
                  <button
                    key={mode}
                    onClick={() => setActiveMode(mode)}
                    className={`px-4 py-2 text-sm transition-colors ${
                      activeMode === mode
                        ? 'bg-white/30 text-white font-semibold'
                        : 'text-white/80 hover:bg-white/20'
                    } ${idx !== 0 ? 'border-l border-white/25' : ''}`}
                  >
                    {mode}
                  </button>
                ))}
              </div>
            </div>
            <div className="mt-2 h-5 flex items-center justify-center">
              <p className={`text-sm text-gray-400 ${activeMode === 'Analyse' ? '' : 'opacity-0'}`}>Interactive 3D Globe Visualization</p>
            </div>
            </div>
            <div className="w-32" />
          </div>
        </div>
      </header>

      {activeMode === 'Analyse' ? (
      <div className="relative pt-20 h-screen flex">
        {/* Floating left sidebar container without solid background */}
        <motion.div 
          className={`w-80 backdrop-blur-md border border-white/20 rounded-2xl shadow-2xl shadow-black/20 m-4 p-6 overflow-y-auto scrollbar-hide z-20 transition-all ${globeFocused ? 'filter blur-md pointer-events-none' : ''}`}
          initial={{ x: -320 }}
          animate={{ x: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="space-y-6">
            {/* Project blurb */}
            <div className="text-white/80 text-sm">
              {selectedProject?.description ?? 'Select a project to view details.'}
            </div>

            {/* Active Data Layer */}
            <div>
              <h3 className="text-lg font-semibold text-white mb-2">Active Data Layer</h3>
              <select
                value={dataLayer}
                onChange={(e) => setDataLayer(e.target.value as typeof dataLayer)}
                className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white focus:border-marine-cyan focus:outline-none backdrop-blur-sm"
              >
                <option>Species Occurrences</option>
                <option>Sea Surface Temperature (SST)</option>
                <option>Salinity</option>
                <option>Chlorophyll Concentration</option>
                <option>eDNA Detections</option>
              </select>
              {dataLayer !== 'Species Occurrences' && (
                <p className="mt-2 text-xs text-white/70">Placeholder layer for future integration.</p>
              )}
            </div>

            {/* Dynamic Filters */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <h4 className="text-sm font-semibold text-white">Active Filters</h4>
                <motion.button
                  className="flex items-center space-x-2 px-3 py-2 bg-white/10 border border-white/20 rounded text-white/90 hover:bg-white/20 transition-all duration-200 backdrop-blur-sm"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => {
                    if (newSpecies) {
                      setActiveFilters(prev => [...prev, { type: 'species', value: newSpecies }]);
                      setNewSpecies('');
                      return;
                    }
                    if (newWaterBody) {
                      setActiveFilters(prev => [...prev, { type: 'waterBody', value: newWaterBody }]);
                      setNewWaterBody('');
                      return;
                    }
                    if (newLocality) {
                      setActiveFilters(prev => [...prev, { type: 'locality', value: newLocality }]);
                      setNewLocality('');
                      return;
                    }
                    if (methods.length) {
                      setActiveFilters(prev => [...prev, { type: 'method', values: methods }]);
                      setMethods([]);
                      return;
                    }
                    if (dateStart || dateEnd) {
                      setActiveFilters(prev => [...prev, { type: 'date', start: dateStart, end: dateEnd }]);
                      setDateStart('');
                      setDateEnd('');
                      return;
                    }
                    setActiveFilters(prev => [...prev, { type: 'depth', min: depthMin, max: depthMax }]);
                  }}
                >
                  <FiPlus className="w-4 h-4" />
                  <span>Create New Filter</span>
                </motion.button>
              </div>

              <div className="space-y-3">
                <div>
                  <label className="block text-xs text-white/70 mb-1">Species Name</label>
                  <input list="species-list" value={newSpecies} onChange={(e) => setNewSpecies(e.target.value)} placeholder="e.g., Harpiliopsis depressa" className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded text-white text-sm focus:border-marine-cyan focus:outline-none backdrop-blur-sm" />
                  <datalist id="species-list">
                    {uniqueSpecies.slice(0, 100).map(name => (
                      <option key={name} value={name} />
                    ))}
                  </datalist>
                </div>
                <div>
                  <label className="block text-xs text-white/70 mb-1">Water Body</label>
                  <select value={newWaterBody} onChange={(e) => setNewWaterBody(e.target.value)} className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded text-white text-sm focus:border-marine-cyan focus:outline-none backdrop-blur-sm">
                    <option value="">Select water body</option>
                    {uniqueWaterBodies.map(w => <option key={w} value={w}>{w}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs text-white/70 mb-1">Location (Locality)</label>
                  <select value={newLocality} onChange={(e) => setNewLocality(e.target.value)} className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded text-white text-sm focus:border-marine-cyan focus:outline-none backdrop-blur-sm">
                    <option value="">Select locality</option>
                    {uniqueLocalities.slice(0, 200).map(l => <option key={l} value={l}>{l}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs text-white/70 mb-1">Depth Range (m)</label>
                  <div className="grid grid-cols-2 gap-2">
                    <input type="number" value={depthMin} onChange={(e) => setDepthMin(Number(e.target.value))} placeholder="Min" className="px-3 py-2 bg-white/10 border border-white/20 rounded text-white text-sm focus:border-marine-cyan focus:outline-none backdrop-blur-sm" />
                    <input type="number" value={depthMax} onChange={(e) => setDepthMax(Number(e.target.value))} placeholder="Max" className="px-3 py-2 bg-white/10 border border-white/20 rounded text-white text-sm focus:border-marine-cyan focus:outline-none backdrop-blur-sm" />
                  </div>
                </div>
                <div>
                  <label className="block text-xs text-white/70 mb-1">Date Range</label>
                  <div className="grid grid-cols-2 gap-2">
                    <input type="date" value={dateStart} onChange={(e) => setDateStart(e.target.value)} className="px-3 py-2 bg-white/10 border border-white/20 rounded text-white text-sm focus:border-marine-cyan focus:outline-none backdrop-blur-sm" />
                    <input type="date" value={dateEnd} onChange={(e) => setDateEnd(e.target.value)} className="px-3 py-2 bg-white/10 border border-white/20 rounded text-white text-sm focus:border-marine-cyan focus:outline-none backdrop-blur-sm" />
                  </div>
                </div>
                <div>
                  <label className="block text-xs text-white/70 mb-1">Collection Method</label>
                  <select multiple value={methods} onChange={(e) => setMethods(Array.from(e.target.selectedOptions).map(o => o.value))} className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded text-white text-sm focus:border-marine-cyan focus:outline-none min-h-[80px] backdrop-blur-sm">
                    {uniqueMethods.map(m => <option key={m} value={m}>{m}</option>)}
                  </select>
                </div>
              </div>

              <div className="mt-3 flex flex-wrap gap-2">
                {activeFilters.map((f, idx) => (
                  <span key={`${f.type}-${idx}`} className="inline-flex items-center space-x-2 px-2 py-1 bg-white/10 border border-white/20 rounded text-xs text-white/90 backdrop-blur-sm">
                    <span>
                      {f.type === 'species' && `Species IS ${f.value}`}
                      {f.type === 'waterBody' && `Water Body IS ${f.value}`}
                      {f.type === 'locality' && `Locality IS ${f.value}`}
                      {f.type === 'depth' && `Depth IS BETWEEN ${f.min}m AND ${f.max}m`}
                      {f.type === 'date' && `Date BETWEEN ${f.start || '...'} AND ${f.end || '...'}`}
                      {f.type === 'method' && `Method IS ${f.values.join(', ')}`}
                    </span>
                    <button onClick={() => setActiveFilters(prev => prev.filter((_, i) => i !== idx))} className="text-white/70 hover:text-white">
                      <FiX className="w-3 h-3" />
                    </button>
                  </span>
                ))}
              </div>
            </div>

            {/* AI-Powered Analysis */}
            <div>
              <h4 className="text-sm font-medium text-white mb-3 flex items-center">
                <FiTrendingUp className="w-4 h-4 mr-2" />
                AI-Powered Analysis
              </h4>
              <div className="space-y-3">
                <textarea
                  value={analysisInput}
                  onChange={(e) => setAnalysisInput(e.target.value)}
                  placeholder="Ask a question about the data..."
                  className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-xl text-white text-sm resize-none focus:border-marine-cyan focus:outline-none backdrop-blur-sm"
                  rows={3}
                />
                <motion.button
                  onClick={handleAnalyze}
                  disabled={isAnalyzing || !analysisInput.trim()}
                  className="w-full flex items-center justify-center space-x-2 px-4 py-2 bg-gradient-to-r from-marine-cyan/30 to-marine-green/30 border border-marine-cyan/50 rounded-xl text-white hover:from-marine-cyan/40 hover:to-marine-green/40 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 backdrop-blur-sm"
                  whileHover={{ scale: isAnalyzing ? 1 : 1.02 }}
                  whileTap={{ scale: isAnalyzing ? 1 : 0.98 }}
                >
                  {isAnalyzing ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-marine-cyan"></div>
                      <span>Analyzing...</span>
                    </>
                  ) : (
                    <>
                      <FiSearch className="w-4 h-4" />
                      <span>Analyze</span>
                    </>
                  )}
                </motion.button>
                {/* Steps and Insight */}
                <div className="text-xs text-white/70 space-y-1">
                  {analysisSteps.map((s, i) => (<div key={i}>• {s}</div>))}
                </div>
                {insight && (
                  <div className="p-3 bg-white/10 border border-white/20 rounded-xl text-sm text-white/90 backdrop-blur-sm">
                    {insight}
                  </div>
                )}
              </div>
            </div>

            {/* Live Feed */}
            <div>
              <h4 className="text-sm font-medium text-white mb-3 flex items-center">
                <FiActivity className="w-4 h-4 mr-2" />
                Live Reactions
              </h4>
              <div className="space-y-2 max-h-32 overflow-y-auto">
                {liveFeedData.map((item, index) => (
                  <motion.div
                    key={index}
                    className="p-2 bg-white/10 border border-white/20 rounded-xl text-xs text-white/90 backdrop-blur-sm"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.1 }}
                  >
                    {item}
                  </motion.div>
                ))}
              </div>
            </div>

            {/* Specialized Data Modules */}
            <SpecializedModules />
          </div>
        </motion.div>

        {/* Full-area globe background */}
        {!isLoading && (
          <Suspense fallback={null}>
            {/* Backdrop when focused */}
            {globeFocused && (
              <div 
                className="absolute inset-0 z-30 bg-black/40 backdrop-blur-sm"
              />
            )}
            {globeFocused && (
              <button
                type="button"
                onClick={() => setGlobeFocused(false)}
                className="absolute z-50 top-4 left-4 px-3 py-1.5 rounded-lg bg-white/20 hover:bg-white/30 border border-white/30 text-white text-sm backdrop-blur-md transition-colors"
              >
                Back to normal view
              </button>
            )}
            <div
              className={`absolute inset-0 bg-transparent ${globeFocused ? 'z-40 scale-110 md:scale-125' : 'z-0 scale-100'} transition-transform duration-300 ease-out pointer-events-auto sagar-main-globe`}
            >
              <ReactGlobeComponent
                dataPoints={filteredData}
                onDataPointClick={() => {}}
                onCameraDistanceChange={(d) => {
                  // Blur UI automatically when zoomed in close (smaller distance)
                  const shouldFocus = d < 5.2; // threshold just beyond minDistance
                  setGlobeFocused(prev => shouldFocus ? true : prev && shouldFocus);
                }}
              />
            </div>
          </Suspense>
        )}

        {/* Center area keeps layout spacing; do not block pointer events to globe */}
        <div className="flex-1 relative z-0 pointer-events-none">
          {isLoading && (
            <div className="flex items-center justify-center h-full">
              <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-marine-cyan mx-auto mb-4"></div>
                <p className="text-gray-400">Loading Marine Data...</p>
              </div>
            </div>
          )}
      </div>

        {/* Bottom-centered search bar styled like the example; separate layer so globe stays interactive */}
        {!isLoading && (
          <div className={`pointer-events-none absolute inset-x-0 bottom-6 flex justify-center z-20 transition-all ${globeFocused ? 'filter blur-md' : ''}`}>
            <form
              onSubmit={(e) => { e.preventDefault(); handleAnalyze(); }}
              className="pointer-events-auto w-[min(760px,94%)] bg-black/30 backdrop-blur-md border border-white/15 rounded-2xl shadow-[0_0_0_1px_rgba(255,255,255,0.08)] p-2 pl-4 flex items-center gap-3"
            >
              <input
                type="text"
                placeholder="Ask the Ocean..."
                className="flex-1 bg-transparent outline-none text-white placeholder-white/80 tracking-wide"
                value={analysisInput}
                onChange={(e) => setAnalysisInput(e.target.value)}
              />
              <button
                type="submit"
                className="px-5 py-2 rounded-xl bg-white/10 border border-white/30 text-white hover:bg-white/15 transition-colors"
              >
                Analyze
              </button>
            </form>
          </div>
        )}


        {/* Right-side dataset info cards */}
        {!isLoading && (
          <aside className={`pointer-events-auto absolute right-4 top-24 z-30 flex flex-col gap-3 w-[300px] max-h-[70vh] overflow-y-auto scrollbar-hide transition-all ${globeFocused ? 'filter blur-md pointer-events-none' : ''}`}>
            {/* Helper to compute simple metrics inline */}
            {(() => {
              const total = filteredData.length;
              const uniqueSpeciesCount = new Set(filteredData.map(d => d.scientificName)).size;
              const uniqueWaterBodiesCount = new Set(filteredData.map(d => d.waterBody).filter(Boolean)).size;
              const dates = filteredData.map(d => new Date(d.eventDate).getTime()).filter(n => !isNaN(n));
              const minDate = dates.length ? new Date(Math.min(...dates)).toLocaleDateString() : 'N/A';
              const maxDate = dates.length ? new Date(Math.max(...dates)).toLocaleDateString() : 'N/A';
              const depths = filteredData.map(d => [d.minimumDepthInMeters, d.maximumDepthInMeters]).flat().filter(n => typeof n === 'number' && !isNaN(n));
              const minDepth = depths.length ? Math.min(...depths) : null;
              const maxDepth = depths.length ? Math.max(...depths) : null;

              return (
                <>
                  <Card className="pointer-events-auto">
                    <CardSkeletonContainer className="h-20" showGradient={false}>
                      <div />
                    </CardSkeletonContainer>
                    <CardTitle>Total Occurrences</CardTitle>
                    <CardDescription className="text-2xl font-semibold tracking-wide text-marine-cyan">{total}</CardDescription>
                  </Card>
                  <Card className="pointer-events-auto">
                    <CardSkeletonContainer className="h-20" showGradient={false}>
                      <div />
                    </CardSkeletonContainer>
                    <CardTitle>Unique Species</CardTitle>
                    <CardDescription className="text-2xl font-semibold tracking-wide text-marine-cyan">{uniqueSpeciesCount}</CardDescription>
                  </Card>
                  <Card className="pointer-events-auto">
                    <CardSkeletonContainer className="h-20" showGradient={false}>
                      <div />
                    </CardSkeletonContainer>
                    <CardTitle>Water Bodies Covered</CardTitle>
                    <CardDescription className="text-2xl font-semibold tracking-wide text-marine-cyan">{uniqueWaterBodiesCount}</CardDescription>
                  </Card>
                  <Card className="pointer-events-auto">
                    <CardSkeletonContainer className="h-16" showGradient={false}>
                      <div />
                    </CardSkeletonContainer>
                    <CardTitle>Date Range</CardTitle>
                    <CardDescription className="text-white/80">{minDate} — {maxDate}</CardDescription>
                  </Card>
                  <Card className="pointer-events-auto">
                    <CardSkeletonContainer className="h-16" showGradient={false}>
                      <div />
                    </CardSkeletonContainer>
                    <CardTitle>Depth Range</CardTitle>
                    <CardDescription className="text-white/80">{minDepth !== null && maxDepth !== null ? `${minDepth}m — ${maxDepth}m` : 'N/A'}</CardDescription>
                  </Card>
                </>
              );
            })()}
          </aside>
        )}
      </div>
      ) : activeMode === 'Visualise' ? (
        <VisualiseView allData={dataPoints} />
      ) : (
        <StudyView />
      )}
    </div>
  );
};

type XYPoint = { x: number | string; y: number };

type VisualiseViewProps = {
  allData: DataPoint[];
};

function VisualiseView({ allData }: VisualiseViewProps) {
  const [template, setTemplate] = useState<string>('');
  const [selectedDatasets, setSelectedDatasets] = useState<Array<'occurrencesByYear' | 'depthHistogram' | 'waterBodies' | 'methods'>>([]);
  const [prompt, setPrompt] = useState<string>('');
  const [analysis, setAnalysis] = useState<string>('');
  const [filterExpr, setFilterExpr] = useState<string>('');
  const [binSize, setBinSize] = useState<number>(100);

  const uniqueWaterBodies = useMemo(() => Array.from(new Set(allData.map(d => d.waterBody))).filter(Boolean).sort(), [allData]);
  const uniqueMethods = useMemo(() => Array.from(new Set(allData.map(d => d.samplingProtocol))).filter(Boolean).sort(), [allData]);
  const uniqueLocalities = useMemo(() => Array.from(new Set(allData.map(d => d.locality))).filter(Boolean).sort(), [allData]);
  const uniqueSpecies = useMemo(() => Array.from(new Set(allData.map(d => d.scientificName))).filter(Boolean).sort(), [allData]);

  const filtered = useMemo(() => {
    if (!filterExpr.trim()) return allData;
    const clauses = filterExpr.split(/[,;\n]+/).map(s => s.trim()).filter(Boolean);
    return allData.filter(row => {
      return clauses.every(cl => {
        const [k, v] = cl.split(/[:=]/).map(s => s.trim());
        if (!k || v == null) return true;
        const rv = (row as any)[k];
        if (rv == null) return false;
        if (/^\d+\-\d+$/.test(v)) {
          const [a,b] = v.split('-').map(Number);
          const num = Number(rv);
          if (isNaN(num)) return false;
          return num >= a && num <= b;
        }
        if (/\d{4}-\d{2}-\d{2}\s*to\s*\d{4}-\d{2}-\d{2}/i.test(v)) {
          const [s,e] = v.split(/to/i).map(s=>s.trim());
          const t = new Date(String(rv)).getTime();
          return t >= new Date(s).getTime() && t <= new Date(e).getTime();
        }
        return String(rv).toLowerCase().includes(v.toLowerCase());
      });
    });
  }, [allData, filterExpr]);

  const allowedCharts = ['Line','Area','Bar','Scatter','Pie','Heatmap','Box','Violin'] as const;

  const occurrencesByYear = useMemo(() => {
    const build = (src: DataPoint[]) => {
      const yearCounts: { [year: number]: number } = {};
      src.forEach(point => {
        const year = new Date(point.eventDate).getFullYear();
        if (!isNaN(year)) yearCounts[year] = (yearCounts[year] || 0) + 1;
      });
      return Object.entries(yearCounts).map(([year, count]) => ({ year: parseInt(year), count })).sort((a, b) => a.year - b.year);
    };
    let out = build(filtered.length ? filtered : allData);
    if (!out.length) {
      const now = new Date().getFullYear();
      out = Array.from({ length: 10 }, (_, i) => ({ year: now - 9 + i, count: 20 + Math.floor(Math.random() * 80) }));
    }
    return out;
  }, [filtered, allData]);

  const depthHistogram = useMemo(() => {
    const build = (src: DataPoint[]) => {
      const depthCounts: { [depth: number]: number } = {};
      src.forEach(point => {
        const avgDepth = Math.round((point.minimumDepthInMeters + point.maximumDepthInMeters) / 2);
        if (!isNaN(avgDepth)) depthCounts[avgDepth] = (depthCounts[avgDepth] || 0) + 1;
      });
      return Object.entries(depthCounts).map(([depth, count]) => ({ depth: parseInt(depth), count })).sort((a, b) => a.depth - b.depth);
    };
    let out = build(filtered.length ? filtered : allData);
    if (!out.length) {
      out = Array.from({ length: 10 }, (_, i) => ({ depth: i * 100, count: 10 + Math.floor(Math.random() * 40) }));
    }
    return out;
  }, [filtered, allData]);

  const categoryCounts = useMemo(() => {
    const aggregate = (src: DataPoint[], key: 'waterBody' | 'samplingProtocol') => {
      const counts: { [name: string]: number } = {};
      src.forEach(point => {
        const val = (point as any)[key];
        if (val) counts[val] = (counts[val] || 0) + 1;
      });
      const arr = Object.entries(counts).map(([name, count]) => ({ name, count })).sort((a, b) => b.count - a.count).slice(0, 20);
      if (arr.length) return arr;
      // Sample categories when no data
      const labels = key === 'waterBody' ? ['Indian Ocean','Arabian Sea','Bay of Bengal','Pacific','Atlantic'] : ['Net Tow','ROV','Dredge','eDNA','CTD'];
      return labels.map((n, i) => ({ name: n, count: 10 + (i * 7) }));
    };
    const src = filtered.length ? filtered : allData;
    return {
      waterBodies: aggregate(src, 'waterBody'),
      methods: aggregate(src, 'samplingProtocol')
    };
  }, [filtered, allData]);

  const content = () => {
    // 1) Build per-dataset series
    const series: Record<string, XYPoint[]> = {};
    const useSets = selectedDatasets.length ? selectedDatasets : (['occurrencesByYear','depthHistogram','waterBodies','methods'] as const);
    useSets.forEach(ds => {
      if (ds === 'occurrencesByYear') series[ds] = occurrencesByYear.map(d => ({ x: d.year, y: d.count }));
      if (ds === 'depthHistogram') series[ds] = depthHistogram.map(d => ({ x: d.depth, y: d.count }));
      if (ds === 'waterBodies') series[ds] = categoryCounts.waterBodies.map(d => ({ x: d.name, y: d.count }));
      if (ds === 'methods') series[ds] = categoryCounts.methods.map(d => ({ x: d.name, y: d.count }));
    });

    // 2) Merge series into a single view for basic charts (sum y by x)
    const merged: Record<string | number, number> = {};
    Object.values(series).forEach(arr => {
      arr.forEach(p => { const key = p.x as any; merged[key] = (merged[key] || 0) + p.y; });
    });
    const xy: XYPoint[] = Object.entries(merged).map(([x,y]) => ({ x: isNaN(Number(x)) ? x : Number(x), y: y as number }))
      .sort((a,b) => (typeof a.x === 'number' && typeof b.x === 'number') ? (a.x as number) - (b.x as number) : String(a.x).localeCompare(String(b.x)));

    const isCategorical = xy.some(d => typeof d.x !== 'number');

    switch (template as any) {
      case 'Line':
        return isCategorical ? (
          <SimpleBarChart data={xy} xLabel="category" yLabel="count" rotateLabels />
        ) : (
          <SimpleLineChart data={xy} xLabel="x" yLabel="count" />
        );
      case 'Area':
        return isCategorical ? (
          <SimpleBarChart data={xy} xLabel="category" yLabel="count" rotateLabels />
        ) : (
          <SimpleAreaChart data={xy} xLabel="x" yLabel="count" />
        );
      case 'Bar':
        return <SimpleBarChart data={xy} xLabel={isCategorical ? 'category' : 'x'} yLabel="count" rotateLabels={isCategorical} />;
      case 'Pie':
        return <SimplePie data={xy} />;
      case 'Heatmap': {
        // Simple heatmap: x vs dataset index counts
        const dsKeys = Object.keys(series);
        const matrix: { x: number; y: number; v: number }[] = [];
        dsKeys.forEach((name, yi) => {
          series[name].forEach(p => {
            const xv = typeof p.x === 'number' ? (p.x as number) : dsKeys.indexOf(name);
            matrix.push({ x: xv, y: yi, v: p.y });
          });
        });
        return <SimpleHeatmap data={matrix} xLabel="x" yLabel="dataset" xIsTime={false} />;
      }
      case 'Scatter': {
        // Year vs depth scatter if both sets available; else numeric x vs y
        const hasYear = !!series['occurrencesByYear'];
        const pts = hasYear ? filtered.map(p => ({ x: new Date(p.eventDate).getFullYear(), y: Math.round((p.minimumDepthInMeters + p.maximumDepthInMeters) / 2) }))
                            : xy.filter(d => typeof d.x === 'number');
        return <SimpleScatter data={pts as any} xLabel="x" yLabel="y" />;
      }
      case 'Box': {
        const vals = filtered.map(p => Math.round((p.minimumDepthInMeters + p.maximumDepthInMeters) / 2));
        return <SimpleBoxPlot values={vals} xLabel="depth" />;
      }
      case 'Violin': {
        const vals = filtered.map(p => Math.round((p.minimumDepthInMeters + p.maximumDepthInMeters) / 2));
        return <SimpleViolinPlot values={vals} xLabel="depth" />;
      }
      default:
        return (
          <div className="w-full h-full flex items-center justify-center text-white/60 text-sm">
            Select a graph/chart template to preview.
          </div>
        );
    }
  };

  return (
    <div className="pt-20 min-h-screen relative">
      {/* Non-interactive globe background */}
      <Suspense fallback={null}>
        <div className="absolute inset-0 z-0 pointer-events-none opacity-90">
          <ReactGlobeComponent
            dataPoints={[]}
            onDataPointClick={() => {}}
            onCameraDistanceChange={undefined}
            showStarsOnly
          />
        </div>
      </Suspense>
      <div className="relative z-10 max-w-6xl mx-auto px-6 py-10">
        <div className="flex flex-wrap items-center gap-4 justify-between bg-white/5 border border-white/15 rounded-2xl px-4 py-3 backdrop-blur-md">
          <h2 className="text-2xl font-extrabold tracking-wide text-white">Visualise</h2>
          <div className="flex items-center gap-3">
            <Dropdown
              value={template}
              onChange={(v) => setTemplate(v as typeof template)}
              options={[...allowedCharts] as unknown as string[]}
            />
            <MultiSelect
              values={selectedDatasets}
              onChange={(vals) => setSelectedDatasets(vals as any)}
              options={[
                { value: 'occurrencesByYear', label: 'Occurrences Over Years' },
                { value: 'depthHistogram', label: 'Depth Histogram' },
                { value: 'waterBodies', label: 'Water Bodies' },
                { value: 'methods', label: 'Methods' }
              ]}
            />
          </div>
        </div>
        <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
          <div className="md:col-span-2">
            <label className="block text-xs text-white/70 mb-1">Prompt (Natural language)</label>
            <input value={prompt} onChange={(e) => setPrompt(e.target.value)} placeholder="e.g., Compare water bodies vs methods across years; highlight anomalies" className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white text-sm focus:border-marine-cyan focus:outline-none" />
          </div>
          <div>
            <label className="block text-xs text-white/70 mb-1">Bin size (m) for depth</label>
            <input type="number" min={10} step={10} value={binSize} onChange={(e)=>setBinSize(Math.max(10, Number(e.target.value)||100))} className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white text-sm focus:border-marine-cyan focus:outline-none" />
          </div>
        </div>
        <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
          <div>
            <label className="block text-xs text-white/70 mb-1">Filters (e.g., waterBody:Arabian Sea; depth:100-300)</label>
            <input value={filterExpr} onChange={(e)=>setFilterExpr(e.target.value)} placeholder="field:value; field2:start-end" className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white text-sm focus:border-marine-cyan focus:outline-none" />
          </div>
          
        </div>
        <div className="mt-6 bg-black/30 backdrop-blur-md border border-white/15 rounded-2xl p-4 overflow-hidden relative">
          <div className="h-[460px] w-full relative z-10">{content()}</div>
          {analysis && (
            <div className="mt-4 text-sm text-white/90 bg-white/5 border border-white/15 rounded-xl px-4 py-3 backdrop-blur-sm">{analysis}</div>
          )}
          <div className="mt-3 flex justify-end">
            <button
              onClick={() => {
                // Simple prompt-driven analysis stub
                const insight = `Analysis: Generated a ${template} chart from ${selectedDatasets.length} dataset(s). ${prompt ? `Prompt interpreted: ${prompt}. ` : ''}Sample insight: the central tendency appears stable with mild variation.`;
                setAnalysis(insight);
              }}
              className="px-4 py-2 bg-white/10 border border-white/25 rounded-lg text-white hover:bg-white/15"
            >
              Run Analysis
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function SimpleLineChart({ data, xLabel, yLabel }: { data: XYPoint[]; xLabel: string; yLabel: string }) {
  const width = 920;
  const height = 280;
  const margin = { top: 10, right: 20, bottom: 40, left: 48 };
  const innerW = width - margin.left - margin.right;
  const innerH = height - margin.top - margin.bottom;
  const numericData = data.filter(d => typeof d.x === 'number') as { x: number; y: number }[];
  const minX = Math.min(...numericData.map(d => d.x));
  const maxX = Math.max(...numericData.map(d => d.x));
  const maxY = Math.max(1, ...numericData.map(d => d.y));
  const sx = (x: number) => margin.left + ((x - minX) / Math.max(1, maxX - minX)) * innerW;
  const sy = (y: number) => margin.top + innerH - (y / maxY) * innerH;
  const path = numericData
    .map((d, i) => `${i === 0 ? 'M' : 'L'} ${sx(d.x)} ${sy(d.y)}`)
    .join(' ');
  const ticks = 5;
  const yTicks = Array.from({ length: ticks + 1 }, (_, i) => Math.round((i * maxY) / ticks));
  const xTicks = Array.from({ length: Math.min(6, numericData.length) }, (_, i) =>
    Math.round(minX + (i * (maxX - minX)) / Math.max(1, Math.min(5, numericData.length - 1)))
  );
  return (
    <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-full">
      <g>
        <line x1={margin.left} y1={margin.top + innerH} x2={margin.left + innerW} y2={margin.top + innerH} stroke="#6b7280" strokeOpacity={0.5} />
        <line x1={margin.left} y1={margin.top} x2={margin.left} y2={margin.top + innerH} stroke="#6b7280" strokeOpacity={0.5} />
        {yTicks.map(t => (
          <g key={t}>
            <line x1={margin.left} y1={sy(t)} x2={margin.left + innerW} y2={sy(t)} stroke="#6b7280" strokeOpacity={0.15} />
            <text x={margin.left - 8} y={sy(t)} fill="#cbd5e1" fontSize="10" textAnchor="end" dominantBaseline="middle">{t}</text>
          </g>
        ))}
        {xTicks.map(t => (
          <text key={t} x={sx(t)} y={margin.top + innerH + 16} fill="#cbd5e1" fontSize="10" textAnchor="middle">{t}</text>
        ))}
        <text x={margin.left + innerW / 2} y={height - 4} fill="#e5e7eb" fontSize="11" textAnchor="middle">{xLabel}</text>
        <text x={12} y={margin.top + innerH / 2} fill="#e5e7eb" fontSize="11" textAnchor="middle" transform={`rotate(-90 12 ${margin.top + innerH / 2})`}>{yLabel}</text>
        <path d={path} fill="none" stroke="#22d3ee" strokeWidth={2} />
        {numericData.map((d, i) => (
          <circle key={i} cx={sx(d.x)} cy={sy(d.y)} r={2.5} fill="#22d3ee" />
        ))}
      </g>
    </svg>
  );
}

function SimpleBarChart({ data, xLabel, yLabel, rotateLabels }: { data: XYPoint[]; xLabel: string; yLabel: string; rotateLabels?: boolean }) {
  const width = 920;
  const height = 280;
  const margin = { top: 10, right: 20, bottom: rotateLabels ? 70 : 40, left: 48 };
  const innerW = width - margin.left - margin.right;
  const innerH = height - margin.top - margin.bottom;
  const maxY = Math.max(1, ...data.map(d => d.y));
  const barW = data.length ? innerW / data.length : innerW;
  const sy = (y: number) => margin.top + innerH - (y / maxY) * innerH;
  const yTicks = Array.from({ length: 5 + 1 }, (_, i) => Math.round((i * maxY) / 5));
  return (
    <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-full">
      <g>
        <line x1={margin.left} y1={margin.top + innerH} x2={margin.left + innerW} y2={margin.top + innerH} stroke="#6b7280" strokeOpacity={0.5} />
        <line x1={margin.left} y1={margin.top} x2={margin.left} y2={margin.top + innerH} stroke="#6b7280" strokeOpacity={0.5} />
        {yTicks.map(t => (
          <g key={t}>
            <line x1={margin.left} y1={sy(t)} x2={margin.left + innerW} y2={sy(t)} stroke="#6b7280" strokeOpacity={0.15} />
            <text x={margin.left - 8} y={sy(t)} fill="#cbd5e1" fontSize="10" textAnchor="end" dominantBaseline="middle">{t}</text>
          </g>
        ))}
        {data.map((d, i) => {
          const x = margin.left + i * barW + 4;
          const w = Math.max(2, barW - 8);
          const y = sy(d.y);
          const h = margin.top + innerH - y;
          return (
            <g key={i}>
              <rect x={x} y={y} width={w} height={h} fill="#22d3ee" fillOpacity={0.7} />
              <title>{`${d.x}: ${d.y}`}</title>
              <text
                x={x + w / 2}
                y={margin.top + innerH + (rotateLabels ? 26 : 14)}
                fill="#cbd5e1"
                fontSize="10"
                textAnchor="middle"
                transform={rotateLabels ? `rotate(-40 ${x + w / 2} ${margin.top + innerH + 26})` : undefined}
              >
                {String(d.x)}
              </text>
            </g>
          );
        })}
        <text x={margin.left + innerW / 2} y={height - 4} fill="#e5e7eb" fontSize="11" textAnchor="middle">{xLabel}</text>
        <text x={12} y={margin.top + innerH / 2} fill="#e5e7eb" fontSize="11" textAnchor="middle" transform={`rotate(-90 12 ${margin.top + innerH / 2})`}>{yLabel}</text>
      </g>
    </svg>
  );
}

function SimpleAreaChart({ data, xLabel, yLabel }: { data: XYPoint[]; xLabel: string; yLabel: string }) {
  const width = 920; const height = 280;
  const margin = { top: 10, right: 20, bottom: 40, left: 48 };
  const innerW = width - margin.left - margin.right;
  const innerH = height - margin.top - margin.bottom;
  const numeric = data.filter(d => typeof d.x === 'number') as { x: number; y: number }[];
  const minX = Math.min(...numeric.map(d => d.x));
  const maxX = Math.max(...numeric.map(d => d.x));
  const maxY = Math.max(1, ...numeric.map(d => d.y));
  const sx = (x: number) => margin.left + ((x - minX) / Math.max(1, maxX - minX)) * innerW;
  const sy = (y: number) => margin.top + innerH - (y / maxY) * innerH;
  const path = numeric.map((d, i) => `${i === 0 ? 'M' : 'L'} ${sx(d.x)} ${sy(d.y)}`).join(' ');
  const area = `M ${sx(numeric[0]?.x || 0)} ${sy(0)} ` + numeric.map(d => `L ${sx(d.x)} ${sy(d.y)}`).join(' ') + ` L ${sx(numeric[numeric.length-1]?.x || 0)} ${sy(0)} Z`;
  return (
    <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-full">
      <path d={area} fill="#22d3ee22" stroke="none" />
      <path d={path} fill="none" stroke="#22d3ee" strokeWidth={2} />
      <text x={margin.left + innerW / 2} y={height - 4} fill="#e5e7eb" fontSize="11" textAnchor="middle">{xLabel}</text>
      <text x={12} y={margin.top + innerH / 2} fill="#e5e7eb" fontSize="11" textAnchor="middle" transform={`rotate(-90 12 ${margin.top + innerH / 2})`}>{yLabel}</text>
    </svg>
  );
}

function SimpleScatter({ data, xLabel, yLabel }: { data: XYPoint[]; xLabel: string; yLabel: string }) {
  const width = 920; const height = 280;
  const margin = { top: 10, right: 20, bottom: 40, left: 48 };
  const innerW = width - margin.left - margin.right;
  const innerH = height - margin.top - margin.bottom;
  const numeric = data.filter(d => typeof d.x === 'number') as { x: number; y: number }[];
  const minX = Math.min(...numeric.map(d => d.x));
  const maxX = Math.max(...numeric.map(d => d.x));
  const maxY = Math.max(1, ...numeric.map(d => d.y));
  const sx = (x: number) => margin.left + ((x - minX) / Math.max(1, maxX - minX)) * innerW;
  const sy = (y: number) => margin.top + innerH - (y / maxY) * innerH;
  return (
    <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-full">
      {numeric.map((d, i) => (<circle key={i} cx={sx(d.x)} cy={sy(d.y)} r={3} fill="#22d3ee" fillOpacity={0.8} />))}
      <text x={margin.left + innerW / 2} y={height - 4} fill="#e5e7eb" fontSize="11" textAnchor="middle">{xLabel}</text>
      <text x={12} y={margin.top + innerH / 2} fill="#e5e7eb" fontSize="11" textAnchor="middle" transform={`rotate(-90 12 ${margin.top + innerH / 2})`}>{yLabel}</text>
    </svg>
  );
}

function SimplePie({ data }: { data: XYPoint[] }) {
  const width = 420; const height = 260; const r = Math.min(width, height) / 2 - 10; const cx = width/2; const cy = height/2;
  const total = Math.max(1, data.reduce((s, d) => s + d.y, 0));
  let angle = -Math.PI / 2;
  const slices = data.map((d, i) => {
    const a = (d.y / total) * Math.PI * 2;
    const start = angle; const end = angle + a; angle = end;
    const x1 = cx + r * Math.cos(start), y1 = cy + r * Math.sin(start);
    const x2 = cx + r * Math.cos(end), y2 = cy + r * Math.sin(end);
    const large = a > Math.PI ? 1 : 0;
    const path = `M ${cx} ${cy} L ${x1} ${y1} A ${r} ${r} 0 ${large} 1 ${x2} ${y2} Z`;
    const hue = (i * 47) % 360;
    return { path, color: `hsl(${hue} 90% 55% / 0.9)`, label: String(d.x), value: d.y };
  });
  return (
    <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-full">
      {slices.map((s, i) => (<path key={i} d={s.path} fill={s.color} stroke="#0b1220" />))}
      <g transform={`translate(${width - 120},20)`}>
        {slices.slice(0,8).map((s,i) => (
          <g key={i} transform={`translate(0, ${i*18})`}>
            <rect width="12" height="12" fill={s.color} />
            <text x="16" y="10" fill="#e5e7eb" fontSize="11">{s.label} ({s.value})</text>
          </g>
        ))}
      </g>
    </svg>
  );
}

function SimpleHeatmap({ data, xLabel, yLabel, xIsTime }: { data: { x: number; y: number; v: number }[]; xLabel: string; yLabel: string; xIsTime?: boolean }) {
  const width = 920; const height = 260;
  const margin = { top: 10, right: 20, bottom: 40, left: 60 };
  const innerW = width - margin.left - margin.right;
  const innerH = height - margin.top - margin.bottom;
  const xs = Array.from(new Set(data.map(d => d.x))).sort((a,b)=>a-b);
  const ys = Array.from(new Set(data.map(d => d.y))).sort((a,b)=>a-b);
  const maxV = Math.max(1, ...data.map(d => d.v));
  const cw = innerW / Math.max(1, xs.length);
  const ch = innerH / Math.max(1, ys.length);
  const color = (v: number) => `hsl(${220 - Math.round((v/maxV)*180)} 80% 50%)`;
  return (
    <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-full">
      {data.map((d, i) => {
        const xi = xs.indexOf(d.x); const yi = ys.indexOf(d.y);
        return <rect key={i} x={margin.left + xi*cw} y={margin.top + yi*ch} width={cw-1} height={ch-1} fill={color(d.v)} />;
      })}
      <text x={margin.left + innerW / 2} y={height - 4} fill="#e5e7eb" fontSize="11" textAnchor="middle">{xLabel}</text>
      <text x={12} y={margin.top + innerH / 2} fill="#e5e7eb" fontSize="11" textAnchor="middle" transform={`rotate(-90 12 ${margin.top + innerH / 2})`}>{yLabel}</text>
    </svg>
  );
}

function SimpleBoxPlot({ values, xLabel }: { values: number[]; xLabel: string }) {
  const width = 920; const height = 260; const margin = { top: 20, right: 20, bottom: 40, left: 48 };
  const innerW = width - margin.left - margin.right; const innerH = height - margin.top - margin.bottom;
  const sorted = [...values].filter(v => !isNaN(v)).sort((a,b)=>a-b);
  const q = (p: number) => sorted[Math.floor(p*(sorted.length-1))] || 0;
  const q1 = q(0.25), q2 = q(0.5), q3 = q(0.75); const min = sorted[0] || 0; const max = sorted[sorted.length-1] || 0;
  const sy = (v: number) => margin.top + innerH - ((v - min) / Math.max(1, max - min)) * innerH;
  const cx = margin.left + innerW/2;
  return (
    <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-full">
      <line x1={cx} x2={cx} y1={sy(min)} y2={sy(max)} stroke="#cbd5e1" />
      <rect x={cx-60} width={120} y={sy(q3)} height={Math.max(2, sy(q1)-sy(q3))} fill="#22d3ee22" stroke="#22d3ee" />
      <line x1={cx-60} x2={cx+60} y1={sy(q2)} y2={sy(q2)} stroke="#22d3ee" />
      <line x1={cx-30} x2={cx+30} y1={sy(min)} y2={sy(min)} stroke="#cbd5e1" />
      <line x1={cx-30} x2={cx+30} y1={sy(max)} y2={sy(max)} stroke="#cbd5e1" />
      <text x={width/2} y={height - 4} fill="#e5e7eb" fontSize="11" textAnchor="middle">{xLabel}</text>
    </svg>
  );
}

function SimpleViolinPlot({ values, xLabel }: { values: number[]; xLabel: string }) {
  const width = 920; const height = 260; const margin = { top: 20, right: 20, bottom: 40, left: 48 };
  const innerW = width - margin.left - margin.right; const innerH = height - margin.top - margin.bottom;
  const sorted = [...values].filter(v => !isNaN(v)).sort((a,b)=>a-b);
  const min = sorted[0] || 0; const max = sorted[sorted.length-1] || 0;
  const bins = 30; const counts = Array(bins).fill(0);
  sorted.forEach(v => { const i = Math.min(bins-1, Math.floor(((v - min) / Math.max(1, max - min)) * bins)); counts[i]++; });
  const maxC = Math.max(1, ...counts);
  const path = counts.map((c, i) => {
    const y = margin.top + (i / bins) * innerH;
    const w = (c / maxC) * 120;
    return `M ${width/2 - w} ${y} L ${width/2 + w} ${y}`;
  }).join(' ');
  return (
    <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-full">
      <path d={path} stroke="#22d3ee" strokeOpacity={0.6} />
      <text x={width/2} y={height - 4} fill="#e5e7eb" fontSize="11" textAnchor="middle">{xLabel}</text>
    </svg>
  );
}

// Lightweight portal to render dropdown menus above all content
function MenuPortal({ children }: { children: React.ReactNode }) {
  if (typeof document === 'undefined') return null;
  return ReactDOM.createPortal(children as any, document.body);
}

function Dropdown({ value, onChange, options, maxWidth }: { value: string; onChange: (v: string) => void; options: string[]; maxWidth?: string }) {
  const [open, setOpen] = useState(false);
  const [pos, setPos] = useState<{ left: number; top: number; width: number; upward: boolean }>({ left: 0, top: 0, width: 0, upward: false });
  const wrapperRef = React.useRef<HTMLDivElement | null>(null);
  const btnRef = React.useRef<HTMLButtonElement | null>(null);
  const compute = () => {
    const el = btnRef.current; if (!el) return;
    const r = el.getBoundingClientRect();
    const left = r.left + window.scrollX;
    const belowTop = r.bottom + window.scrollY + 8;
    const menuHeight = Math.min(560, Math.max(240, window.innerHeight * 0.7));
    const wouldOverflow = belowTop + menuHeight > window.scrollY + window.innerHeight;
    const top = wouldOverflow ? (r.top + window.scrollY - 8) : belowTop; // if overflow, open upwards
    setPos({ left, top, width: r.width, upward: wouldOverflow });
  };
  useEffect(() => {
    const onDoc = (e: MouseEvent | TouchEvent) => {
      if (!wrapperRef.current) return;
      const target = e.target as Node;
      if (!wrapperRef.current.contains(target)) setOpen(false);
    };
    const onWin = () => open && compute();
    document.addEventListener('mousedown', onDoc);
    document.addEventListener('touchstart', onDoc as any, { passive: true } as any);
    window.addEventListener('scroll', onWin, true);
    window.addEventListener('resize', onWin);
    return () => {
      document.removeEventListener('mousedown', onDoc);
      document.removeEventListener('touchstart', onDoc as any);
      window.removeEventListener('scroll', onWin, true);
      window.removeEventListener('resize', onWin);
    };
  }, [open]);
  useEffect(() => { if (open) compute(); }, [open]);
  return (
    <div ref={wrapperRef} className="relative" style={{ maxWidth: maxWidth || '320px' }}>
      <button
        ref={btnRef}
        type="button"
        onClick={() => setOpen(o => !o)}
        className="px-4 py-2 rounded-xl bg-white/10 border border-white/25 text-white text-sm flex items-center justify-between gap-6 min-w-[220px] hover:bg-white/15"
      >
        <span className="truncate">{value || 'Select graph/chart template'}</span>
        <span className={`transition-transform ${open ? 'rotate-180' : ''}`}>▾</span>
      </button>
      {open && (
        <MenuPortal>
          <div
            className={`fixed ${pos.upward ? 'bottom-auto' : ''} bg-black/80 backdrop-blur-md border border-white/20 rounded-xl shadow-2xl overflow-auto z-[99999]`}
            style={{ left: pos.left, top: pos.upward ? undefined : pos.top, width: pos.width, maxHeight: '72vh', ...(pos.upward ? { bottom: window.innerHeight - pos.top } : {}) }}
          >
            {options.map(opt => (
              <button
                key={opt}
                type="button"
                onClick={() => { onChange(opt); setOpen(false); }}
                className={`w-full text-left px-4 py-2 text-sm ${opt === value ? 'bg-white/15 text-white' : 'text-white/90 hover:bg-white/10'}`}
              >
                {opt}
              </button>
            ))}
          </div>
        </MenuPortal>
      )}
    </div>
  );
}

function MultiSelect({ values, onChange, options }: { values: string[]; onChange: (v: string[]) => void; options: { value: string; label: string }[] }) {
  const [open, setOpen] = useState(false);
  const [pos, setPos] = useState<{ left: number; top: number; width: number; upward: boolean }>({ left: 0, top: 0, width: 0, upward: false });
  const wrapperRef = React.useRef<HTMLDivElement | null>(null);
  const btnRef = React.useRef<HTMLButtonElement | null>(null);
  const compute = () => {
    const el = btnRef.current; if (!el) return;
    const r = el.getBoundingClientRect();
    const left = r.left + window.scrollX;
    const belowTop = r.bottom + window.scrollY + 8;
    const menuHeight = Math.min(560, Math.max(240, window.innerHeight * 0.7));
    const wouldOverflow = belowTop + menuHeight > window.scrollY + window.innerHeight;
    const top = wouldOverflow ? (r.top + window.scrollY - 8) : belowTop;
    setPos({ left, top, width: r.width, upward: wouldOverflow });
  };
  useEffect(() => {
    const onDoc = (e: MouseEvent | TouchEvent) => {
      if (!wrapperRef.current) return;
      const target = e.target as Node;
      if (!wrapperRef.current.contains(target)) setOpen(false);
    };
    const onWin = () => open && compute();
    document.addEventListener('mousedown', onDoc);
    document.addEventListener('touchstart', onDoc as any, { passive: true } as any);
    window.addEventListener('scroll', onWin, true);
    window.addEventListener('resize', onWin);
    return () => {
      document.removeEventListener('mousedown', onDoc);
      document.removeEventListener('touchstart', onDoc as any);
      window.removeEventListener('scroll', onWin, true);
      window.removeEventListener('resize', onWin);
    };
  }, [open]);
  useEffect(() => { if (open) compute(); }, [open]);
  const toggle = (val: string) => {
    const set = new Set(values);
    if (set.has(val)) set.delete(val); else set.add(val);
    onChange(Array.from(set));
  };
  return (
    <div ref={wrapperRef} className="relative" style={{ maxWidth: '340px' }}>
      <button ref={btnRef} type="button" onClick={() => setOpen(o=>!o)} className="px-4 py-2 rounded-xl bg-white/10 border border-white/25 text-white text-sm flex items-center justify-between gap-6 min-w-[240px] hover:bg-white/15">
        <span className="truncate">{values.length ? `${values.length} dataset(s) selected` : 'Select a dataset'}</span>
        <span className={`transition-transform ${open ? 'rotate-180' : ''}`}>▾</span>
      </button>
      {open && (
        <MenuPortal>
          <div
            className="fixed bg-black/80 backdrop-blur-md border border-white/20 rounded-xl shadow-2xl overflow-auto z-[99999]"
            style={{ left: pos.left, top: pos.upward ? undefined : pos.top, width: pos.width, maxHeight: '72vh', ...(pos.upward ? { bottom: window.innerHeight - pos.top } : {}) }}
          >
            {options.map(opt => (
              <label key={opt.value} className="flex items-center gap-3 px-4 py-2 text-sm text-white/90 hover:bg-white/10 cursor-pointer">
                <input type="checkbox" checked={values.includes(opt.value)} onChange={() => toggle(opt.value)} />
                <span>{opt.label}</span>
              </label>
            ))}
          </div>
        </MenuPortal>
      )}
    </div>
  );
}

export default GlobeView;

function Lineage({ name }: { name: string }) {
  const [lineage, setLineage] = useState<string[]>([]);
  useEffect(() => {
    const go = async () => {
      try {
        const res = await fetch(`https://api.gbif.org/v1/species/match?name=${encodeURIComponent(name)}`);
        const j = await res.json();
        const key = j.usageKey || j.speciesKey || j.acceptedUsageKey;
        if (!key) { setLineage([]); return; }
        const sRes = await fetch(`https://api.gbif.org/v1/species/${key}`);
        const s = await sRes.json();
        const parts: string[] = [];
        if (s.kingdom) parts.push(s.kingdom);
        if (s.phylum) parts.push(s.phylum);
        if (s.class) parts.push(s.class);
        if (s.order) parts.push(s.order);
        if (s.family) parts.push(s.family);
        if (s.genus) parts.push(s.genus);
        if (s.species) parts.push(s.species);
        setLineage(parts);
      } catch {
        setLineage([]);
      }
    };
    go();
  }, [name]);
  if (!lineage.length) return null;
  return (
    <div className="text-white/70 text-xs mb-2">Lineage: {lineage.join(' › ')}</div>
  );
}

function StudyView() {
  const [tab, setTab] = useState<'Taxonomy' | 'Otolith' | 'eDNA'>('Taxonomy');
  const [search, setSearch] = useState('');
  return (
    <div className="pt-20 min-h-screen relative">
      <Suspense fallback={null}>
        <div className="absolute inset-0 z-0 pointer-events-none opacity-90">
          <ReactGlobeComponent dataPoints={[]} onDataPointClick={() => {}} onCameraDistanceChange={undefined} showStarsOnly />
        </div>
      </Suspense>
      <div className="relative z-10 max-w-7xl mx-auto px-6 py-8">
        <div className="flex flex-wrap items-center gap-3 mb-4">
          {(['Taxonomy','Otolith','eDNA'] as const).map(name => (
            <button key={name} onClick={() => setTab(name)} className={`px-4 py-2 rounded-xl border text-sm ${tab===name ? 'border-white/40 bg-white/10 text-white' : 'border-white/20 text-white/80 hover:bg-white/10'}`}>{name}</button>
          ))}
          <div className="flex-1" />
          <input value={search} onChange={(e)=>setSearch(e.target.value)} placeholder="Quick search..." className="px-4 py-2 bg-white/10 border border-white/20 rounded-xl text-white text-sm focus:border-marine-cyan focus:outline-none min-w-[260px]" />
          <button className="px-3 py-2 bg-white/10 border border-white/20 rounded-xl text-white text-sm">Export (mock)</button>
        </div>
        <div className="bg-black/30 backdrop-blur-md border border-white/15 rounded-2xl p-4">
          {tab === 'Taxonomy' && <TaxonomyModule globalSearch={search} />}
          {tab === 'Otolith' && <OtolithModule globalSearch={search} />}
          {tab === 'eDNA' && <EDNAModule globalSearch={search} />}
        </div>
      </div>
    </div>
  );
}

function TaxonomyModule({ globalSearch }: { globalSearch: string }) {
  const mockTree = {
    Animalia: {
      Chordata: {
        Actinopterygii: {
          Carangidae: {
            Caranx: ['Caranx ignobilis','Caranx melampygus','Caranx sexfasciatus']
          },
          Scombridae: { Thunnus: ['Thunnus albacares','Thunnus obesus','Thunnus thynnus'] },
          Lutjanidae: { Lutjanus: ['Lutjanus campechanus','Lutjanus bohar'] },
          Serranidae: { Epinephelus: ['Epinephelus marginatus','Epinephelus coioides'] }
        },
        Chondrichthyes: {
          Carcharhinidae: { Carcharhinus: ['Carcharhinus limbatus','Carcharhinus leucas'] }
        }
      }
    }
  } as const;
  const mockDetails: Record<string, { common: string[]; iucn: 'LC'|'NT'|'VU'|'EN'|'CR'; habitats: string[]; lengthCm: [number, number]; diet: string[]; refs: string[]; occurrencesByRegion: { x: string; y: number }[]; images: string[] }>= {
    'Caranx ignobilis': { common: ['Giant trevally'], iucn: 'NT', habitats: ['Coastal','Reef'], lengthCm: [60,170], diet: ['Fish','Crustaceans'], refs: ['FishBase','IUCN 2015'], occurrencesByRegion: [{x:'Indian',y:38},{x:'Pacific',y:55},{x:'Atlantic',y:2}], images: [] },
    'Thunnus albacares': { common: ['Yellowfin tuna'], iucn: 'NT', habitats: ['Pelagic','Open ocean'], lengthCm: [100,239], diet: ['Fish','Squid'], refs: ['FAO','IUCN 2021'], occurrencesByRegion: [{x:'Indian',y:44},{x:'Pacific',y:62},{x:'Atlantic',y:28}], images: [] },
    'Lutjanus campechanus': { common: ['Red snapper'], iucn: 'VU', habitats: ['Reef','Shelf'], lengthCm: [50,100], diet: ['Crustaceans','Fish'], refs: ['NOAA','IUCN 2018'], occurrencesByRegion: [{x:'Atlantic',y:70},{x:'Indian',y:5},{x:'Pacific',y:14}], images: [] },
    'Epinephelus marginatus': { common: ['Dusky grouper'], iucn: 'EN', habitats: ['Reef','Caves'], lengthCm: [60,150], diet: ['Fish','Octopus'], refs: ['IUCN 2020'], occurrencesByRegion: [{x:'Atlantic',y:25},{x:'Mediterranean',y:48},{x:'Indian',y:9}], images: [] },
    'Carcharhinus limbatus': { common: ['Blacktip shark'], iucn: 'VU', habitats: ['Coastal','Estuaries'], lengthCm: [120,200], diet: ['Fish'], refs: ['IUCN 2019'], occurrencesByRegion: [{x:'Atlantic',y:33},{x:'Indian',y:21},{x:'Pacific',y:27}], images: [] }
  };
  const [query, setQuery] = useState('');
  const [liveResults, setLiveResults] = useState<string[]>([]);
  const [path, setPath] = useState<string[]>(['Animalia']);
  const [selected, setSelected] = useState<string | null>(null);
  const [loadingReal, setLoadingReal] = useState(false);
  const [realCommon, setRealCommon] = useState<string[]>([]);
  const [realRegions, setRealRegions] = useState<{ x: string; y: number }[]>([]);
  const [realImages, setRealImages] = useState<string[]>([]);
  const [realRank, setRealRank] = useState<string>('');
  const [realSci, setRealSci] = useState<string>('');
  const [realAuth, setRealAuth] = useState<string>('');
  const [lineageObj, setLineageObj] = useState<{ parts: string[] } | null>(null);
  const level = path.reduce<any>((acc, key) => (acc && acc[key]) || acc, mockTree);
  const entries = Array.isArray(level) ? level.map((n) => ({ key: n, isLeaf: true })) : Object.keys(level || {}).map(k => ({ key: k, isLeaf: Array.isArray((level as any)[k]) }));
  const queryAll = (query || globalSearch).toLowerCase();
  const filtered = queryAll ? entries.filter(e => e.key.toLowerCase().includes(queryAll)) : entries;
  const [favorites, setFavorites] = useState<string[]>([]);

  // Fetch live data from GBIF when a species is selected
  useEffect(() => {
    const fetchGbif = async (name: string) => {
      try {
        setLoadingReal(true);
        setRealCommon([]); setRealRegions([]); setRealImages([]); setRealRank(''); setRealSci(''); setRealAuth(''); setLineageObj(null);
        const matchRes = await fetch(`https://api.gbif.org/v1/species/match?name=${encodeURIComponent(name)}`);
        const match = await matchRes.json();
        const key = match.usageKey || match.speciesKey || match.acceptedUsageKey;
        if (key) {
          // vernacular names
          try {
            const vRes = await fetch(`https://api.gbif.org/v1/species/${key}/vernacularNames`);
            const vJson = await vRes.json();
            const names: string[] = (vJson?.results || []).map((r: any) => r.vernacularName as string).filter(Boolean);
            const uniq: string[] = Array.from(new Set<string>(names));
            setRealCommon(uniq.slice(0, 6));
          } catch {}
          try {
            const sRes = await fetch(`https://api.gbif.org/v1/species/${key}`);
            const s = await sRes.json();
            setRealRank(s.rank || '');
            setRealSci(s.scientificName || name);
            setRealAuth(s.authorship || '');
            const parts: string[] = [];
            if (s.kingdom) parts.push(s.kingdom);
            if (s.phylum) parts.push(s.phylum);
            if (s.class) parts.push(s.class);
            if (s.order) parts.push(s.order);
            if (s.family) parts.push(s.family);
            if (s.genus) parts.push(s.genus);
            if (s.species) parts.push(s.species);
            setLineageObj({ parts });
          } catch {}
        }
        // Occurrence facet by country
        try {
          const base = key ? `taxonKey=${key}` : `scientificName=${encodeURIComponent(name)}`;
          const facetRes = await fetch(`https://api.gbif.org/v1/occurrence/search?limit=0&${base}&facet=country&facetLimit=8`);
          const facet = await facetRes.json();
          const regions = (facet?.facets?.[0]?.counts || []).map((c: any) => ({ x: c.name, y: c.count })).slice(0, 8);
          if (regions.length) {
            setRealRegions(regions);
          } else {
            // fallback global count
            const cnt = facet?.count || 0;
            if (cnt) setRealRegions([{ x: 'Global', y: cnt }]);
          }
        } catch {}
        // Images
        try {
          const base = key ? `taxonKey=${key}` : `scientificName=${encodeURIComponent(name)}`;
          const imgRes = await fetch(`https://api.gbif.org/v1/occurrence/search?${base}&mediaType=StillImage&limit=9`);
          const imgJson = await imgRes.json();
          const imgs: string[] = [];
          for (const r of imgJson.results || []) {
            if (r.media && r.media.length) {
              for (const m of r.media) {
                if (m.identifier) imgs.push(m.identifier);
              }
            }
          }
          let finalImgs = imgs.slice(0, 9);
          if (!finalImgs.length) {
            // Wikipedia thumbnail fallback
            try {
              const title = encodeURIComponent(name.replace(/\s+/g, '_'));
              const wRes = await fetch(`https://en.wikipedia.org/api/rest_v1/page/summary/${title}`);
              const w = await wRes.json();
              if (w?.thumbnail?.source) finalImgs = [w.thumbnail.source];
            } catch {}
          }
          setRealImages(finalImgs);
        } catch {}
      } catch {
      } finally {
        setLoadingReal(false);
      }
    };
    if (selected) fetchGbif(selected);
  }, [selected]);
  return (
    <div>
      <div className="flex items-center gap-3 mb-3 relative">
        <input
          value={query}
          onChange={async (e)=>{
            const val = e.target.value; setQuery(val);
            if (val.length >= 3) {
              try {
                const res = await fetch(`https://api.gbif.org/v1/species/suggest?q=${encodeURIComponent(val)}&limit=8`);
                const j = await res.json();
                setLiveResults((j || []).map((r: any) => r.scientificName).filter(Boolean));
              } catch { setLiveResults([]); }
            } else { setLiveResults([]); }
          }}
          placeholder="Search taxonomy (live from GBIF)..."
          className="flex-1 px-4 py-2 bg-white/10 border border-white/20 rounded-xl text-white text-sm focus:border-marine-cyan focus:outline-none"
        />
        {liveResults.length > 0 && (
          <div className="absolute left-0 right-0 top-10 bg-black/80 backdrop-blur-md border border-white/20 rounded-xl shadow-2xl z-[9999] max-h-60 overflow-auto">
            {liveResults.map((name) => (
              <button key={name} className="w-full text-left px-4 py-2 text-white/90 hover:bg-white/10 text-sm" onClick={()=>{ setSelected(name); setLiveResults([]); }}>
                {name}
              </button>
            ))}
          </div>
        )}
        <button onClick={()=>{ setQuery(''); setPath(['Animalia']); }} className="px-3 py-2 bg-white/10 border border-white/20 rounded-xl text-white text-sm">Reset</button>
        <button onClick={()=>setFavorites([])} className="px-3 py-2 bg-white/10 border border-white/20 rounded-xl text-white text-sm">Clear favorites</button>
      </div>
      <div className="text-white/70 text-xs mb-2">
        Path: {path.map((seg, idx) => (
          <button key={idx} className={`underline-offset-2 ${idx===path.length-1 ? 'text-white/80' : 'text-white/60 underline hover:text-white/80'}`} onClick={()=> setPath(path.slice(0, idx+1))}>{seg}</button>
        )).reduce((prev: any, curr: any) => prev===null ? [curr] : [...prev, ' › ', curr], null)}
        {path.length>1 && (
          <button className="ml-2 px-2 py-0.5 border border-white/20 rounded text-white/70" onClick={()=> setPath(p=>p.slice(0, -1))}>Back</button>
        )}
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="border border-white/15 rounded-xl p-3 bg-white/5 max-h-[420px] overflow-auto">
          {filtered.map(e => (
            <div
              key={e.key}
              className="flex items-center justify-between px-2 py-2 rounded hover:bg-white/10 cursor-pointer"
              onClick={()=>{ if (e.isLeaf) { setSelected(e.key); } else { setSelected(null); setPath(p=>[...p, e.key]); } }}
            >
              <span className="text-white/90 text-sm">{e.key}</span>
              <div className="flex items-center gap-2">
                <button onClick={(ev)=>{ ev.stopPropagation(); setFavorites(prev => prev.includes(e.key) ? prev.filter(x=>x!==e.key) : [...prev, e.key]); }} className="text-xs px-2 py-1 border border-white/20 rounded text-white/70 hover:bg-white/10">{favorites.includes(e.key) ? 'Unsave' : 'Save'}</button>
                <span className="text-white/60 text-xs">{e.isLeaf ? 'species' : 'open'}</span>
              </div>
            </div>
          ))}
        </div>
        <div className="border border-white/15 rounded-xl p-3 bg-white/5 lg:col-span-2">
          <div className="flex items-center justify-between mb-2">
            <div className="text-white/90 font-semibold">{(realSci || selected) || 'Details'}{realAuth ? ` ${realAuth}` : ''}</div>
            {selected && <span className="text-white/60 text-xs border border-white/20 rounded px-2 py-0.5">Rank: {realRank || 'species'}</span>}
          </div>
          {!selected && (
            <div className="text-white/70 text-sm">Select a species to view description, images, references, and mock analytics.</div>
          )}
          {selected && (
            <div>
              {lineageObj && (
                <div className="text-white/70 text-xs mb-2">
                  Lineage: {lineageObj.parts.map((p, i) => (
                    <button key={i} className="underline underline-offset-2 hover:text-white/90 mr-1" onClick={()=>{ setSelected(null); setPath(['Animalia']); setQuery(p); }}>
                      {p}
                    </button>
                  )).reduce((prev: any, curr: any) => prev===null ? [curr] : [...prev, '›', curr], null)}
                </div>
              )}
              <div className="flex flex-wrap gap-2 mb-3">
                {((realCommon.length && realCommon) || mockDetails[selected]?.common || ['Common name unknown']).map(c => (<span key={c} className="px-2 py-1 rounded border border-white/20 text-white/80 text-xs">{c}</span>))}
                <span className="px-2 py-1 rounded border border-white/20 text-white/80 text-xs">IUCN: {mockDetails[selected]?.iucn || '—'}</span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <div className="text-white/80 text-sm mb-1">Habitats</div>
                  <div className="flex flex-wrap gap-2 mb-3">
                    {(mockDetails[selected]?.habitats || ['Pelagic']).map(h => (<span key={h} className="px-2 py-1 rounded bg-white/5 border border-white/15 text-white/80 text-xs">{h}</span>))}
                  </div>
                  <div className="text-white/80 text-sm mb-1">Size (cm)</div>
                  <div className="text-white/70 text-sm">{mockDetails[selected]?.lengthCm ? `${mockDetails[selected]!.lengthCm[0]}–${mockDetails[selected]!.lengthCm[1]} cm` : '—'}</div>
                  <div className="text-white/80 text-sm mt-3 mb-1">Diet</div>
                  <div className="flex flex-wrap gap-2">
                    {(mockDetails[selected]?.diet || ['Fish']).map(d => (<span key={d} className="px-2 py-1 rounded bg-white/5 border border-white/15 text-white/80 text-xs">{d}</span>))}
                  </div>
                </div>
                <div>
                  <div className="text-white/80 text-sm mb-1">Occurrences by region (mock)</div>
                  <div className="h-40">
                    <SimpleBarChart data={((realRegions.length && realRegions) || (mockDetails[selected]?.occurrencesByRegion || [])).map(r => ({ x: r.x, y: r.y }))} xLabel="Region" yLabel="Count" rotateLabels />
                  </div>
                </div>
              </div>
              <div className="mt-3">
                <div className="text-white/80 text-sm mb-1">References</div>
                <ul className="list-disc pl-5 text-white/70 text-sm">
                  {(mockDetails[selected]?.refs || ['IUCN']).map(r => (<li key={r}>{r}</li>))}
                </ul>
              </div>
              <div className="mt-3">
                <div className="text-white/80 text-sm mb-1">Image gallery (mock)</div>
                {loadingReal && <div className="text-white/60 text-sm">Loading images...</div>}
                <div className="grid grid-cols-3 gap-2">
                  {(realImages.length ? realImages : [0,1,2,3,4,5]).map((src, i) => (
                    typeof src === 'string'
                      ? <img key={i} src={src} className="h-20 w-full object-cover rounded border border-white/10" />
                      : <div key={i} className="h-20 rounded border border-white/10 bg-white/5" />
                  ))}
                </div>
              </div>
            </div>
          )}
          {favorites.length > 0 && (
            <div className="mt-4">
              <div className="text-white/80 text-sm mb-2">Favorites</div>
              <div className="flex flex-wrap gap-2">
                {favorites.map(f => (<span key={f} className="px-2 py-1 border border-white/20 rounded text-white/80 text-xs">{f}</span>))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function OtolithModule({ globalSearch }: { globalSearch: string }) {
  const [images, setImages] = useState<string[]>([]);
  const [measurements, setMeasurements] = useState<{ file: string; lengthMm: number; widthMm: number }[]>([]);
  const [aiGuess, setAiGuess] = useState<string>('');
  const [scale, setScale] = useState<number>(1.0);
  const [activeIdx, setActiveIdx] = useState<number>(-1);
  const [annotate, setAnnotate] = useState<boolean>(false);
  const [edgeView, setEdgeView] = useState<boolean>(false);
  const [clicks, setClicks] = useState<{ x: number; y: number }[]>([]);
  const onUpload = (files: FileList | null) => {
    if (!files) return;
    const arr = Array.from(files);
    arr.forEach(f => {
      const url = URL.createObjectURL(f);
      setImages(prev => [...prev, url]);
      // mock morphometrics
      setMeasurements(prev => [...prev, { file: f.name, lengthMm: 3 + Math.random()*7, widthMm: 1 + Math.random()*3 }]);
    });
    if (activeIdx === -1 && arr.length) setActiveIdx(0);
  };

  const exportCsv = () => {
    const header = 'file,length_mm,width_mm\n';
    const rows = measurements.map(m => `${m.file},${m.lengthMm.toFixed(2)},${m.widthMm.toFixed(2)}`).join('\n');
    const blob = new Blob([header + rows], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = 'otolith_measurements.csv'; a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div>
      <div className="flex items-center gap-3 mb-3">
        <input type="file" accept="image/*" multiple onChange={(e)=>onUpload(e.target.files)} className="text-white/80" />
        <button onClick={()=>setAiGuess('Mock AI: likely Thunnus albacares (juvenile), age ≈ 2 years')} className="px-3 py-2 bg-white/10 border border-white/20 rounded-xl text-white text-sm">Run AI Guess</button>
        <label className="text-white/70 text-xs">Calibration (px/mm):</label>
        <input type="number" step={0.1} value={scale} onChange={(e)=>setScale(Number(e.target.value)||1)} className="w-24 px-2 py-1 bg-white/10 border border-white/20 rounded text-white text-sm" />
        <button onClick={()=>setAnnotate(a=>!a)} className={`px-3 py-2 rounded-xl text-white text-sm border ${annotate ? 'bg-white/20 border-white/40' : 'bg-white/10 border-white/20'}`}>{annotate ? 'Annotate: ON' : 'Annotate: OFF'}</button>
        <button onClick={()=>setEdgeView(v=>!v)} className={`px-3 py-2 rounded-xl text-white text-sm border ${edgeView ? 'bg-white/20 border-white/40' : 'bg-white/10 border-white/20'}`}>{edgeView ? 'Edge view' : 'Normal view'}</button>
        <button onClick={exportCsv} className="px-3 py-2 bg-white/10 border border-white/20 rounded-xl text-white text-sm">Export CSV</button>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="border border-white/15 rounded-xl p-3 bg-white/5 max-h-[420px] overflow-auto grid grid-cols-3 gap-3 lg:col-span-1">
          {images.map((src, i) => (
            <img key={i} src={src} alt="otolith" onClick={()=>setActiveIdx(i)} className={`w-full h-24 object-cover rounded-lg border ${activeIdx===i ? 'border-white/40' : 'border-white/10'} cursor-pointer`} />
          ))}
          {!images.length && <div className="text-white/60 text-sm col-span-3">Upload otolith images to preview here.</div>}
        </div>
        <div className="border border-white/15 rounded-xl p-3 bg-white/5 lg:col-span-2">
          <div className="text-white/90 font-semibold mb-2">Viewer</div>
          {activeIdx >= 0 ? (
            <div className="relative w-full h-[320px] rounded-xl overflow-hidden border border-white/10">
              <img src={images[activeIdx]} className={`absolute inset-0 w-full h-full object-contain ${edgeView ? 'filter contrast-150 brightness-110 saturate-0' : ''}`} />
              {annotate && (
                <div
                  className="absolute inset-0"
                  onClick={(e)=>{
                    const rect = (e.currentTarget as HTMLDivElement).getBoundingClientRect();
                    const x = e.clientX - rect.left; const y = e.clientY - rect.top;
                    const pts = [...clicks, { x, y }];
                    if (pts.length === 2) {
                      const dx = pts[1].x - pts[0].x; const dy = pts[1].y - pts[0].y;
                      const px = Math.sqrt(dx*dx + dy*dy);
                      const mm = px / (scale || 1);
                      setMeasurements(prev => {
                        const file = `image_${activeIdx+1}`;
                        return [...prev, { file, lengthMm: mm, widthMm: 0 }];
                      });
                      setClicks([]);
                    } else {
                      setClicks(pts);
                    }
                  }}
                >
                  {clicks.map((p, idx)=>(<div key={idx} className="absolute w-2 h-2 bg-marine-cyan rounded-full" style={{ left: p.x-4, top: p.y-4 }} />))}
                  {clicks.length===2 && (
                    <svg className="absolute inset-0 w-full h-full pointer-events-none">
                      <line x1={clicks[0].x} y1={clicks[0].y} x2={clicks[1].x} y2={clicks[1].y} stroke="#22d3ee" strokeWidth="2" />
                    </svg>
                  )}
                </div>
              )}
            </div>
          ) : (
            <div className="text-white/60 text-sm">Select a thumbnail to view and annotate.</div>
          )}
        </div>
        <div className="border border-white/15 rounded-xl p-3 bg-white/5">
          <div className="text-white/90 font-semibold mb-2">Measurements (mock)</div>
          <table className="w-full text-white/80 text-sm">
            <thead>
              <tr className="text-white/60">
                <th className="text-left py-1">File</th>
                <th className="text-left py-1">Length (mm)</th>
                <th className="text-left py-1">Width (mm)</th>
              </tr>
            </thead>
            <tbody>
              {measurements.filter(m => !globalSearch || m.file.toLowerCase().includes(globalSearch.toLowerCase())).map((m, idx) => (
                <tr key={idx} className="border-t border-white/10">
                  <td className="py-1">{m.file}</td>
                  <td className="py-1">{(m.lengthMm * 1).toFixed(2)}</td>
                  <td className="py-1">{(m.widthMm * 1).toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>
          {aiGuess && <div className="mt-3 text-white/90 text-sm">{aiGuess}</div>}
        </div>
      </div>
    </div>
  );
}

function EDNAModule({ globalSearch }: { globalSearch: string }) {
  const [fasta, setFasta] = useState<string>('');
  const [results, setResults] = useState<{ header: string; match: string; score: number; length: number; gene: string }[]>([]);
  const [minIdentity, setMinIdentity] = useState<number>(85);
  const [marker, setMarker] = useState<string>('COI');
  const [loading, setLoading] = useState<boolean>(false);

  const mockDb: { species: string; gene: string; barcode: string }[] = [
    { species: 'Thunnus albacares', gene: 'COI', barcode: 'ATGCTACTGTTATTAATTCGAGCTGAATTAGGTCAACCTGGGTTT' },
    { species: 'Caranx ignobilis', gene: 'COI', barcode: 'ATGCTGCTGTCATTGATTCGAGCAGAATTAGGTCAACCTGGCCTT' },
    { species: 'Lutjanus campechanus', gene: 'COI', barcode: 'ATGCCACTGTTATTAATTCGAACAGAATTAGGCCAACCTGGATTT' },
    { species: 'Epinephelus marginatus', gene: 'COI', barcode: 'ATGCTACTGTTATCAATTCGAACAGAATTAGGTCAACCAGGGTTT' },
  ];

  const parseFasta = (text: string) => {
    const lines = text.split(/\r?\n/);
    const entries: { header: string; seq: string }[] = [];
    let header = '';
    let seq: string[] = [];
    for (const l of lines) {
      if (!l) continue;
      if (l.startsWith('>')) { if (header) entries.push({ header, seq: seq.join('').toUpperCase().replace(/[^ACGT]/g,'') }); header = l.slice(1).trim(); seq = []; }
      else seq.push(l.trim());
    }
    if (header) entries.push({ header, seq: seq.join('').toUpperCase().replace(/[^ACGT]/g,'') });
    return entries;
  };

  const identity = (a: string, b: string) => {
    const n = Math.min(a.length, b.length);
    if (!n) return 0;
    let same = 0; for (let i=0;i<n;i++){ if (a[i]===b[i]) same++; }
    return Math.round((same/n)*100);
  };

  const runMatch = async () => {
    setLoading(true);
    try {
      const entries = parseFasta(fasta);
      const out: { header: string; match: string; score: number; length: number; gene: string }[] = [];
      for (const e of entries) {
        let best = { species: 'Unknown', score: 0, gene: marker };
        for (const row of mockDb.filter(r=> marker==='other' ? true : r.gene===marker)) {
          const score = identity(e.seq, row.barcode);
          if (score > best.score) best = { species: row.species, score, gene: row.gene };
        }
        if (best.score < minIdentity) best.species = 'Low confidence';
        out.push({ header: e.header || 'read', match: best.species, score: best.score, length: e.seq.length, gene: best.gene });
      }
      setResults(out);
    } finally {
      setLoading(false);
    }
  };

  const loadSample = () => setFasta(`>read1\nATGCTACTGTTATTAATTCGAGCTGAATTAGGTCAACCTGGGTTT\n>read2\nATGCTGCTGTCATTGATTCGAGCAGAATTAGGTCAACCTGGCCTT`);

  const onUploadFile = async (fileList: FileList | null) => {
    if (!fileList || !fileList.length) return;
    const file = fileList[0];
    const text = await file.text();
    setFasta(text);
  };

  const exportCsv = () => {
    const header = 'read,match,identity,length,gene\n';
    const rows = results.map(r => `${r.header},${r.match},${r.score},${r.length},${r.gene}`).join('\n');
    const blob = new Blob([header + rows], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url; a.download = 'edna_results.csv'; a.click(); URL.revokeObjectURL(url);
  };

  const dist = Object.entries(results.reduce<Record<string, number>>((acc, r) => { acc[r.match] = (acc[r.match]||0) + 1; return acc; }, {})).map(([k,v])=>({ x:k, y:v }));

  return (
    <div>
      <div className="flex flex-wrap items-start gap-3 mb-3">
        <textarea value={fasta} onChange={(e)=>setFasta(e.target.value)} placeholder=">read\nATGC..." className="flex-1 h-40 px-4 py-2 bg-white/10 border border-white/20 rounded-xl text-white text-sm focus:border-marine-cyan focus:outline-none" />
        <div className="flex flex-col gap-2 min-w-[220px]">
          <input type="file" accept=".fa,.fasta,.txt" onChange={(e)=>onUploadFile(e.target.files)} className="text-white/80" />
          <button onClick={loadSample} className="px-3 py-2 bg-white/10 border border-white/20 rounded-xl text-white text-sm">Load sample</button>
          <button onClick={runMatch} disabled={loading || !fasta.trim()} className="px-3 py-2 bg-white/10 border border-white/20 rounded-xl text-white text-sm disabled:opacity-60">{loading ? 'Matching…' : 'Match sequences'}</button>
          <button onClick={exportCsv} disabled={!results.length} className="px-3 py-2 bg-white/10 border border-white/20 rounded-xl text-white text-sm disabled:opacity-60">Export CSV</button>
        </div>
        <div className="flex flex-col gap-2 min-w-[180px]">
          <label className="text-white/70 text-xs">Marker</label>
          <select value={marker} onChange={(e)=>setMarker(e.target.value)} className="px-3 py-2 bg-white/10 border border-white/20 rounded text-white text-sm">
            <option>COI</option>
            <option>12S</option>
            <option>16S</option>
            <option>rbcL</option>
            <option>other</option>
          </select>
          <label className="text-white/70 text-xs">Min identity (%)</label>
          <input type="number" min={50} max={100} value={minIdentity} onChange={(e)=>setMinIdentity(Math.max(50, Math.min(100, Number(e.target.value)||85)))} className="px-3 py-2 bg-white/10 border border-white/20 rounded text-white text-sm" />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="border border-white/15 rounded-xl p-3 bg-white/5 lg:col-span-2">
          <div className="text-white/90 font-semibold mb-2">Results</div>
          {!results.length && <div className="text-white/60 text-sm">Paste FASTA or upload a file, then click Match sequences.</div>}
          {results.length > 0 && (
            <table className="w-full text-white/80 text-sm">
              <thead>
                <tr className="text-white/60">
                  <th className="text-left py-1">Read</th>
                  <th className="text-left py-1">Best match</th>
                  <th className="text-left py-1">Identity (%)</th>
                  <th className="text-left py-1">Length</th>
                  <th className="text-left py-1">Marker</th>
                </tr>
              </thead>
              <tbody>
                {results.filter(r => !globalSearch || r.match.toLowerCase().includes(globalSearch.toLowerCase()) || r.header.toLowerCase().includes(globalSearch.toLowerCase())).map((r, i) => (
                  <tr key={i} className="border-t border-white/10">
                    <td className="py-1">{r.header}</td>
                    <td className="py-1">{r.match}</td>
                    <td className="py-1">{r.score}</td>
                    <td className="py-1">{r.length}</td>
                    <td className="py-1">{r.gene}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
        <div className="border border-white/15 rounded-xl p-3 bg-white/5">
          <div className="text-white/90 font-semibold mb-2">Species distribution (mocked from matches)</div>
          <div className="h-56">
            <SimplePie data={dist.length ? dist : [{ x:'No hits', y:1 }]} />
          </div>
        </div>
      </div>
    </div>
  );
}

// Sidebar inline component: Specialized Modules
const SpecializedModules: React.FC = () => {
  const [active, setActive] = useState<'Taxonomy' | 'Otolith' | 'eDNA'>('Taxonomy');

  return (
    <div>
      <h4 className="text-sm font-medium text-white mb-3">Specialized Modules</h4>
      <div className="flex items-center gap-2 mb-3">
        {['Taxonomy', 'Otolith', 'eDNA'].map((tab) => (
          <button
            key={tab}
            onClick={() => setActive(tab as typeof active)}
            className={`px-3 py-1 rounded border text-xs backdrop-blur-sm ${
              active === tab
                ? 'border-marine-cyan text-marine-cyan bg-white/10'
                : 'border-white/20 text-white/80 hover:bg-white/10'
            }`}
          >
            {tab === 'Taxonomy' ? 'Taxonomy Explorer' : tab === 'Otolith' ? 'Otolith Morphology' : 'eDNA Matcher'}
          </button>
        ))}
      </div>
      <div className="p-3 bg-white/10 border border-white/20 rounded-xl text-xs text-white/90 backdrop-blur-sm">
        {active === 'Taxonomy' && 'Explore hierarchical relationships of taxa (placeholder).'}
        {active === 'Otolith' && 'Otolith morphology module placeholder.'}
        {active === 'eDNA' && 'eDNA matching module placeholder.'}
      </div>
    </div>
  );
};

