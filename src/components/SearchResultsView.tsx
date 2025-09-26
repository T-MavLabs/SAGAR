import React, { useState } from 'react';
import { FiArrowRight, FiMaximize2, FiMinimize2 } from 'react-icons/fi';
import SearchWorldMap from './ui/search-world-map';
import ReactGlobeComponent from './ReactGlobeComponent';
import { DataPoint } from '../App';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  Tooltip,
  Legend,
  Filler,
  ArcElement,
  RadialLinearScale,
} from 'chart.js';
import { Bar, Line, Doughnut, Radar } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  Tooltip,
  Legend,
  Filler,
  ArcElement,
  RadialLinearScale,
);

export interface SearchResultSummary {
  scientificName: string;
  description?: string;
  locality?: string;
  basisOfRecord?: string;
  minDepthInMeters?: number | null;
  maxDepthInMeters?: number | null;
  coordinates?: { lat: number; lng: number } | null;
  occurrencesByYear?: Array<{ year: number; count: number }>; // from eventDate
  depthHistogram?: Array<{ depth: number; count: number }>;
}

interface SearchResultsViewProps {
  result: SearchResultSummary;
  onViewOnGlobe?: () => void;
  onBack?: () => void;
}

const cardClass =
  'bg-gray-900/50 backdrop-blur-sm border border-gray-700/50 rounded-xl p-6';

const headingClass = 'text-2xl md:text-3xl font-bold text-white';

const labelClass = 'text-sm text-gray-400';
const valueClass = 'text-sm text-gray-200';

const SearchResultsView: React.FC<SearchResultsViewProps> = ({ result, onViewOnGlobe, onBack }) => {
  const {
    scientificName,
    occurrencesByYear = [],
    depthHistogram = [],
  } = result;

  // Chart zoom state management
  const [selectedChart, setSelectedChart] = useState<string | null>(null);
  const [isZoomMode, setIsZoomMode] = useState(false);

  const years = occurrencesByYear
    .slice()
    .sort((a, b) => a.year - b.year);

  const occurrencesBarData = {
    labels: years.map((d) => String(d.year)),
    datasets: [
      {
        label: 'Occurrences',
        data: years.map((d) => d.count),
        backgroundColor: 'rgba(34, 197, 94, 0.35)', // marine-green with opacity
        borderColor: 'rgba(34, 197, 94, 0.8)',
        borderWidth: 1,
        borderRadius: 4,
      },
    ],
  };

  const depthSorted = depthHistogram
    .slice()
    .sort((a, b) => a.depth - b.depth);

  const depthLineData = {
    labels: depthSorted.map((d) => `${d.depth}m`),
    datasets: [
      {
        label: 'Sightings',
        data: depthSorted.map((d) => d.count),
        fill: true,
        backgroundColor: 'rgba(14, 165, 233, 0.20)', // marine-cyan
        borderColor: 'rgba(14, 165, 233, 0.9)',
        pointRadius: 2,
        tension: 0.35,
      },
    ],
  };

  const commonChartOptions: any = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        labels: {
          color: '#e5e7eb',
        },
      },
      tooltip: {
        mode: 'index' as const,
        intersect: false,
      },
    },
    scales: {
      x: {
        ticks: { color: '#9ca3af' },
        grid: { color: 'rgba(75,85,99,0.2)' },
      },
      y: {
        ticks: { color: '#9ca3af' },
        grid: { color: 'rgba(75,85,99,0.2)' },
      },
    },
  };

  // Enhanced mock data for charts
  const waterBodyDistribution = {
    labels: ['Arabian Sea', 'Bay of Bengal', 'Andaman Sea', 'Indian Ocean', 'Laccadive Sea'],
    datasets: [{
      data: [42, 28, 18, 8, 4],
      backgroundColor: [
        'rgba(34, 197, 94, 0.8)',   // marine-green
        'rgba(255, 215, 0, 0.8)',   // marine-yellow
        'rgba(14, 165, 233, 0.8)',  // marine-cyan
        'rgba(255, 107, 53, 0.8)',  // marine-orange
        'rgba(168, 85, 247, 0.8)',  // purple
      ],
      borderColor: [
        'rgba(34, 197, 94, 1)',
        'rgba(255, 215, 0, 1)',
        'rgba(14, 165, 233, 1)',
        'rgba(255, 107, 53, 1)',
        'rgba(168, 85, 247, 1)',
      ],
      borderWidth: 2,
    }],
  };

  const temperatureProfile = {
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
    datasets: [
      {
        label: 'Surface Temp (°C)',
        data: [26.2, 26.8, 27.5, 28.9, 30.1, 29.8, 28.5, 27.9, 28.2, 28.8, 27.9, 26.5],
        borderColor: 'rgba(14, 165, 233, 0.9)',
        backgroundColor: 'rgba(14, 165, 233, 0.1)',
        tension: 0.4,
        fill: true,
      },
      {
        label: 'Deep Temp (°C)',
        data: [4.2, 4.1, 4.3, 4.5, 4.8, 4.9, 4.7, 4.4, 4.2, 4.1, 4.0, 4.1],
        borderColor: 'rgba(34, 197, 94, 0.9)',
        backgroundColor: 'rgba(34, 197, 94, 0.1)',
        tension: 0.4,
        fill: true,
      }
    ],
  };

  const samplingMethods = {
    labels: ['Dredging', 'Trawling', 'Diving', 'ROV', 'Submersible', 'eDNA', 'Trap', 'Net'],
    datasets: [{
      label: 'Sampling Methods',
      data: [18, 12, 25, 8, 4, 15, 6, 9],
      backgroundColor: 'rgba(255, 107, 53, 0.6)',
      borderColor: 'rgba(255, 107, 53, 0.9)',
      borderWidth: 1,
    }],
  };

  const environmentalFactors = {
    labels: ['Temperature', 'Salinity', 'Oxygen', 'pH', 'Pressure', 'Currents', 'Turbidity', 'Nutrients'],
    datasets: [{
      label: 'Environmental Impact',
      data: [85, 72, 68, 45, 90, 55, 38, 62],
      backgroundColor: 'rgba(255, 215, 0, 0.3)',
      borderColor: 'rgba(255, 215, 0, 0.9)',
      pointBackgroundColor: 'rgba(255, 215, 0, 0.9)',
      pointBorderColor: '#fff',
      pointHoverBackgroundColor: '#fff',
      pointHoverBorderColor: 'rgba(255, 215, 0, 0.9)',
    }],
  };

  // Additional chart data
  const seasonalDistribution = {
    labels: ['Q1 (Jan-Mar)', 'Q2 (Apr-Jun)', 'Q3 (Jul-Sep)', 'Q4 (Oct-Dec)'],
    datasets: [{
      label: 'Occurrences',
      data: [180, 320, 450, 280],
      backgroundColor: 'rgba(34, 197, 94, 0.6)',
      borderColor: 'rgba(34, 197, 94, 0.9)',
      borderWidth: 1,
    }],
  };

  const depthDistribution = {
    labels: ['0-5m', '5-10m', '10-20m', '20-50m', '50-100m', '100m+'],
    datasets: [{
      label: 'Depth Distribution',
      data: [450, 320, 180, 95, 45, 12],
      backgroundColor: 'rgba(14, 165, 233, 0.6)',
      borderColor: 'rgba(14, 165, 233, 0.9)',
      borderWidth: 1,
    }],
  };

  const researchInstitutions = {
    labels: ['CMLRE', 'NIO', 'CMFRI', 'NIOT', 'Others'],
    datasets: [{
      data: [35, 25, 20, 12, 8],
      backgroundColor: [
        'rgba(34, 197, 94, 0.8)',
        'rgba(14, 165, 233, 0.8)',
        'rgba(255, 107, 53, 0.8)',
        'rgba(255, 215, 0, 0.8)',
        'rgba(168, 85, 247, 0.8)',
      ],
      borderColor: [
        'rgba(34, 197, 94, 1)',
        'rgba(14, 165, 233, 1)',
        'rgba(255, 107, 53, 1)',
        'rgba(255, 215, 0, 1)',
        'rgba(168, 85, 247, 1)',
      ],
      borderWidth: 2,
    }],
  };

  const conservationTrends = {
    labels: ['2018', '2019', '2020', '2021', '2022', '2023', '2024'],
    datasets: [
      {
        label: 'Population Index',
        data: [85, 88, 82, 90, 92, 89, 94],
        borderColor: 'rgba(34, 197, 94, 0.9)',
        backgroundColor: 'rgba(34, 197, 94, 0.1)',
        tension: 0.4,
        fill: true,
      },
      {
        label: 'Threat Level',
        data: [25, 22, 28, 20, 18, 21, 16],
        borderColor: 'rgba(239, 68, 68, 0.9)',
        backgroundColor: 'rgba(239, 68, 68, 0.1)',
        tension: 0.4,
        fill: true,
      }
    ],
  };

  // Sample data points for visualization
  const sampleDataPoints: DataPoint[] = [
    {
      scientificName: scientificName || 'Harpiliopsis depressa',
      locality: 'Agatti Island, Lakshadweep',
      eventDate: '2023-03-15',
      decimalLatitude: 10.86,
      decimalLongitude: 72.2,
      waterBody: 'Arabian Sea',
      samplingProtocol: 'Dredging',
      minimumDepthInMeters: 2,
      maximumDepthInMeters: 10,
      identifiedBy: 'Dr. Marine Biologist'
    },
    {
      scientificName: scientificName || 'Harpiliopsis depressa',
      locality: 'Kavaratti Island, Lakshadweep',
      eventDate: '2023-05-22',
      decimalLatitude: 10.57,
      decimalLongitude: 72.64,
      waterBody: 'Arabian Sea',
      samplingProtocol: 'Diving',
      minimumDepthInMeters: 5,
      maximumDepthInMeters: 15,
      identifiedBy: 'Dr. Marine Biologist'
    },
    {
      scientificName: scientificName || 'Harpiliopsis depressa',
      locality: 'Minicoy Island, Lakshadweep',
      eventDate: '2023-07-08',
      decimalLatitude: 8.28,
      decimalLongitude: 73.05,
      waterBody: 'Arabian Sea',
      samplingProtocol: 'ROV',
      minimumDepthInMeters: 8,
      maximumDepthInMeters: 20,
      identifiedBy: 'Dr. Marine Biologist'
    },
    {
      scientificName: scientificName || 'Harpiliopsis depressa',
      locality: 'Androth Island, Lakshadweep',
      eventDate: '2023-09-12',
      decimalLatitude: 10.82,
      decimalLongitude: 73.65,
      waterBody: 'Arabian Sea',
      samplingProtocol: 'Trawling',
      minimumDepthInMeters: 3,
      maximumDepthInMeters: 12,
      identifiedBy: 'Dr. Marine Biologist'
    },
    {
      scientificName: scientificName || 'Harpiliopsis depressa',
      locality: 'Kadmat Island, Lakshadweep',
      eventDate: '2023-11-18',
      decimalLatitude: 11.23,
      decimalLongitude: 72.78,
      waterBody: 'Arabian Sea',
      samplingProtocol: 'eDNA',
      minimumDepthInMeters: 1,
      maximumDepthInMeters: 8,
      identifiedBy: 'Dr. Marine Biologist'
    }
  ];

  const globePoints: DataPoint[] = sampleDataPoints;

  // Chart definitions for zoomable layout
  const chartDefinitions = [
    {
      id: 'occurrences-by-year',
      title: 'Occurrences by Year',
      type: 'bar',
      data: occurrencesBarData,
      options: commonChartOptions,
      hasData: years.length > 0
    },
    {
      id: 'depth-profile',
      title: 'Depth Profile',
      type: 'line',
      data: depthLineData,
      options: commonChartOptions,
      hasData: depthSorted.length > 0
    },
    {
      id: 'water-body-distribution',
      title: 'Water Body Distribution',
      type: 'doughnut',
      data: waterBodyDistribution,
      options: {
        ...commonChartOptions,
        plugins: {
          ...commonChartOptions.plugins,
          legend: {
            position: 'bottom' as const,
            labels: { color: '#e5e7eb', padding: 10, font: { size: 10 } }
          }
        }
      },
      hasData: true
    },
    {
      id: 'temperature-profile',
      title: 'Temperature Profile',
      type: 'line',
      data: temperatureProfile,
      options: commonChartOptions,
      hasData: true
    },
    {
      id: 'sampling-methods',
      title: 'Sampling Methods',
      type: 'bar',
      data: samplingMethods,
      options: commonChartOptions,
      hasData: true
    },
    {
      id: 'environmental-factors',
      title: 'Environmental Factors',
      type: 'radar',
      data: environmentalFactors,
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            labels: { color: '#e5e7eb', font: { size: 10 } }
          }
        },
        scales: {
          r: {
            angleLines: { color: 'rgba(75,85,99,0.2)' },
            grid: { color: 'rgba(75,85,99,0.2)' },
            pointLabels: { color: '#9ca3af', font: { size: 10 } },
            ticks: { color: '#9ca3af', backdropColor: 'transparent', font: { size: 8 } }
          }
        }
      },
      hasData: true
    },
    {
      id: 'seasonal-distribution',
      title: 'Seasonal Distribution',
      type: 'bar',
      data: seasonalDistribution,
      options: commonChartOptions,
      hasData: true
    },
    {
      id: 'depth-distribution',
      title: 'Depth Distribution',
      type: 'bar',
      data: depthDistribution,
      options: commonChartOptions,
      hasData: true
    },
    {
      id: 'research-institutions',
      title: 'Research Institutions',
      type: 'doughnut',
      data: researchInstitutions,
      options: {
        ...commonChartOptions,
        plugins: {
          ...commonChartOptions.plugins,
          legend: {
            position: 'bottom' as const,
            labels: { color: '#e5e7eb', padding: 8, font: { size: 9 } }
          }
        }
      },
      hasData: true
    },
    {
      id: 'conservation-trends',
      title: 'Conservation Trends',
      type: 'line',
      data: conservationTrends,
      options: commonChartOptions,
      hasData: true
    }
  ];

  // Chart click handlers
  const handleChartClick = (chartId: string) => {
    setSelectedChart(chartId);
    setIsZoomMode(true);
  };

  const handleExitZoom = () => {
    setIsZoomMode(false);
    setSelectedChart(null);
  };

  // Render chart component based on type
  const renderChart = (chart: any, isZoomed: boolean = false) => {
    const height = isZoomed ? 'h-96' : 'h-48';
    
    if (!chart.hasData) {
      return (
        <div className={`w-full ${height} rounded-lg border border-gray-700/50 bg-gray-800/30 flex items-center justify-center text-gray-400 text-sm`}>
          No data
        </div>
      );
    }

    const chartProps = {
      data: chart.data,
      options: chart.options
    };

    switch (chart.type) {
      case 'bar':
        return <Bar {...chartProps} />;
      case 'line':
        return <Line {...chartProps} />;
      case 'doughnut':
        return <Doughnut {...chartProps} />;
      case 'radar':
        return <Radar {...chartProps} />;
      default:
        return <Bar {...chartProps} />;
    }
  };

  return (
    <div className="w-full bg-black">
      {/* Back button */}
      {onBack && (
        <div className="mb-6">
          <button
            onClick={onBack}
            className="flex items-center gap-2 px-4 py-2 text-gray-300 hover:text-white transition-colors duration-200"
          >
            <FiArrowRight className="w-4 h-4 rotate-180" />
            <span>Back to Globe</span>
          </button>
        </div>
      )}

      {/* Zoom Mode Layout */}
      {isZoomMode && selectedChart ? (
        <div className="flex h-screen">
          {/* Sidebar with all charts */}
          <div className="w-80 bg-gray-900/50 backdrop-blur-sm border-r border-gray-700/50 overflow-y-auto">
            <div className="p-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-white">Charts</h3>
                <button
                  onClick={handleExitZoom}
                  className="p-2 text-gray-400 hover:text-white transition-colors"
                  title="Exit Zoom Mode"
                >
                  <FiMinimize2 className="w-4 h-4" />
                </button>
              </div>
              
              <div className="space-y-3">
                {chartDefinitions.map((chart) => (
                  <div
                    key={chart.id}
                    onClick={() => setSelectedChart(chart.id)}
                    className={`p-3 rounded-lg border cursor-pointer transition-all duration-200 ${
                      selectedChart === chart.id
                        ? 'border-marine-cyan bg-marine-cyan/10'
                        : 'border-gray-700/50 bg-gray-800/30 hover:border-gray-600/50 hover:bg-gray-800/50'
                    }`}
                  >
                    <h4 className="text-sm font-medium text-white mb-2">{chart.title}</h4>
                    <div className="h-24">
                      {renderChart(chart, false)}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Main zoomed chart area */}
          <div className="flex-1 p-6">
            <div className="h-full bg-gray-900/50 backdrop-blur-sm border border-gray-700/50 rounded-xl p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-2xl font-bold text-white">
                  {chartDefinitions.find(c => c.id === selectedChart)?.title}
                </h2>
                <button
                  onClick={handleExitZoom}
                  className="flex items-center gap-2 px-4 py-2 text-gray-300 hover:text-white transition-colors duration-200"
                >
                  <FiMinimize2 className="w-4 h-4" />
                  <span>Exit Zoom</span>
                </button>
              </div>
              
              <div className="h-full">
                {renderChart(chartDefinitions.find(c => c.id === selectedChart)!, true)}
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* Normal Layout */
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Analysis Summary */}
        <section className={`${cardClass} lg:col-span-1`}>
          <div className="flex items-start justify-between mb-4">
            <h2 className="text-xl font-bold text-white">{scientificName}</h2>
          </div>
          <p className="text-gray-300 text-sm mb-4">
            Analysis results for "{scientificName}" based on 2529 filtered occurrences. This species shows interesting distribution patterns across the marine environment.
          </p>

          {/* Analysis Summary Section */}
          <div className="bg-gradient-to-r from-marine-cyan/10 to-marine-green/10 border border-marine-cyan/20 rounded-xl p-4 mb-4">
            <h3 className="text-sm font-semibold text-white mb-3 flex items-center gap-2">
              <div className="w-1.5 h-1.5 bg-marine-cyan rounded-full"></div>
              Analysis Summary
            </h3>
            <div className="space-y-2 text-xs text-gray-300">
              <p>
                <span className="text-marine-cyan font-medium">Distribution Pattern:</span> This species exhibits a concentrated distribution in the Arabian Sea region, with primary occurrences clustered around coastal areas and continental shelf regions.
              </p>
              <p>
                <span className="text-marine-cyan font-medium">Depth Preference:</span> The species shows a strong preference for shallow to mid-depth waters (2-10m), indicating benthic or demersal habitat association typical of reef-associated marine organisms.
              </p>
              <p>
                <span className="text-marine-cyan font-medium">Seasonal Trends:</span> Occurrence data reveals peak activity during monsoon and post-monsoon periods, suggesting potential correlation with nutrient availability and water temperature cycles.
              </p>
              <p>
                <span className="text-marine-cyan font-medium">Environmental Factors:</span> High correlation with temperature (85%) and pressure (90%) indicates sensitivity to thermocline variations and depth-related environmental gradients.
              </p>
              <p>
                <span className="text-marine-cyan font-medium">Conservation Status:</span> Current data suggests stable population trends with no immediate conservation concerns, though continued monitoring is recommended given climate change impacts on marine ecosystems.
              </p>
            </div>
          </div>

          {/* Data Cards */}
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-gray-800/40 border border-gray-700/50 rounded-lg p-3">
              <div className={labelClass}>Found In</div>
              <div className={`mt-1 ${valueClass} text-xs`}>CMLRE</div>
            </div>
            <div className="bg-gray-800/40 border border-gray-700/50 rounded-lg p-3">
              <div className={labelClass}>Depth Range</div>
              <div className={`mt-1 ${valueClass} text-xs`}>1m - 0m</div>
            </div>
            <div className="bg-gray-800/40 border border-gray-700/50 rounded-lg p-3">
              <div className={labelClass}>Basis</div>
              <div className={`mt-1 ${valueClass} text-xs`}>Preserved</div>
            </div>
            <div className="bg-gray-800/40 border border-gray-700/50 rounded-lg p-3">
              <div className={labelClass}>Total Occurrences</div>
              <div className={`mt-1 ${valueClass} text-xs text-marine-cyan font-semibold`}>2529</div>
            </div>
            <div className="bg-gray-800/40 border border-gray-700/50 rounded-lg p-3">
              <div className={labelClass}>Water Body</div>
              <div className={`mt-1 ${valueClass} text-xs`}>Arabian Sea</div>
            </div>
            <div className="bg-gray-800/40 border border-gray-700/50 rounded-lg p-3">
              <div className={labelClass}>Temperature Range</div>
              <div className={`mt-1 ${valueClass} text-xs`}>26°C - 30°C</div>
            </div>
            <div className="bg-gray-800/40 border border-gray-700/50 rounded-lg p-3">
              <div className={labelClass}>Salinity</div>
              <div className={`mt-1 ${valueClass} text-xs`}>35.2 PSU</div>
            </div>
            <div className="bg-gray-800/40 border border-gray-700/50 rounded-lg p-3">
              <div className={labelClass}>Conservation Status</div>
              <div className={`mt-1 ${valueClass} text-xs text-green-400`}>Least Concern</div>
            </div>
            <div className="bg-gray-800/40 border border-gray-700/50 rounded-lg p-3">
              <div className={labelClass}>Preserved Specimen</div>
              <div className={`mt-1 ${valueClass} text-xs`}>0</div>
            </div>
            <div className="bg-gray-800/40 border border-gray-700/50 rounded-lg p-3">
              <div className={labelClass}>Occurrences</div>
              <div className={`mt-1 ${valueClass} text-xs`}>0</div>
            </div>
          </div>
        </section>

        {/* Right Column - Charts and Map */}
        <section className={`${cardClass} lg:col-span-2`}>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-white">Geographic Distribution</h3>
          </div>
          <div className="h-64 mb-6">
            <SearchWorldMap
              dataPoints={sampleDataPoints.map(point => ({
                lat: point.decimalLatitude,
                lng: point.decimalLongitude,
                label: point.locality,
                locality: point.locality,
                scientificName: point.scientificName,
                waterBody: point.waterBody,
                eventDate: point.eventDate,
                samplingProtocol: point.samplingProtocol,
                minimumDepthInMeters: point.minimumDepthInMeters,
                maximumDepthInMeters: point.maximumDepthInMeters,
                identifiedBy: point.identifiedBy
              }))}
              color="#0ea5e9"
            />
          </div>

          {/* Interactive Globe Section - Below Geographic Distribution */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-white mb-4">Interactive Globe</h3>
            <div className="h-80 rounded-lg overflow-hidden border border-gray-700/50 sagar-result-globe">
              {globePoints.length > 0 ? (
                <ReactGlobeComponent
                  dataPoints={globePoints}
                  onDataPointClick={() => {}}
                  autoRotate={false}
                  focusOnData={true}
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-gray-400">No coordinates available</div>
              )}
            </div>
          </div>

          {/* Charts Row */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div 
              className="cursor-pointer group"
              onClick={() => handleChartClick('occurrences-by-year')}
            >
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-semibold text-white">Occurrences by Year</h3>
                <FiMaximize2 className="w-4 h-4 text-gray-400 group-hover:text-marine-cyan transition-colors" />
              </div>
              <div className="h-48">
                {renderChart(chartDefinitions.find(c => c.id === 'occurrences-by-year')!, false)}
              </div>
            </div>

            <div 
              className="cursor-pointer group"
              onClick={() => handleChartClick('depth-profile')}
            >
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-semibold text-white">Depth Profile</h3>
                <FiMaximize2 className="w-4 h-4 text-gray-400 group-hover:text-marine-cyan transition-colors" />
              </div>
              <div className="h-48">
                {renderChart(chartDefinitions.find(c => c.id === 'depth-profile')!, false)}
              </div>
            </div>
          </div>
        </section>

        {/* Additional Charts Section - Full width below */}
        <section className="col-span-full grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div 
            className={`${cardClass} cursor-pointer group`}
            onClick={() => handleChartClick('water-body-distribution')}
          >
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-semibold text-white">Water Body Distribution</h3>
              <FiMaximize2 className="w-4 h-4 text-gray-400 group-hover:text-marine-cyan transition-colors" />
            </div>
            <div className="h-48">
              {renderChart(chartDefinitions.find(c => c.id === 'water-body-distribution')!, false)}
            </div>
          </div>

          <div 
            className={`${cardClass} cursor-pointer group`}
            onClick={() => handleChartClick('temperature-profile')}
          >
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-semibold text-white">Temperature Profile</h3>
              <FiMaximize2 className="w-4 h-4 text-gray-400 group-hover:text-marine-cyan transition-colors" />
            </div>
            <div className="h-48">
              {renderChart(chartDefinitions.find(c => c.id === 'temperature-profile')!, false)}
            </div>
          </div>

          <div 
            className={`${cardClass} cursor-pointer group`}
            onClick={() => handleChartClick('sampling-methods')}
          >
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-semibold text-white">Sampling Methods</h3>
              <FiMaximize2 className="w-4 h-4 text-gray-400 group-hover:text-marine-cyan transition-colors" />
            </div>
            <div className="h-48">
              {renderChart(chartDefinitions.find(c => c.id === 'sampling-methods')!, false)}
            </div>
          </div>

          <div 
            className={`${cardClass} cursor-pointer group`}
            onClick={() => handleChartClick('environmental-factors')}
          >
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-semibold text-white">Environmental Factors</h3>
              <FiMaximize2 className="w-4 h-4 text-gray-400 group-hover:text-marine-cyan transition-colors" />
            </div>
            <div className="h-48">
              {renderChart(chartDefinitions.find(c => c.id === 'environmental-factors')!, false)}
            </div>
          </div>
        </section>

        {/* Second Row of Charts */}
        <section className="col-span-full grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div 
            className={`${cardClass} cursor-pointer group`}
            onClick={() => handleChartClick('seasonal-distribution')}
          >
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-semibold text-white">Seasonal Distribution</h3>
              <FiMaximize2 className="w-4 h-4 text-gray-400 group-hover:text-marine-cyan transition-colors" />
            </div>
            <div className="h-48">
              {renderChart(chartDefinitions.find(c => c.id === 'seasonal-distribution')!, false)}
            </div>
          </div>

          <div 
            className={`${cardClass} cursor-pointer group`}
            onClick={() => handleChartClick('depth-distribution')}
          >
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-semibold text-white">Depth Distribution</h3>
              <FiMaximize2 className="w-4 h-4 text-gray-400 group-hover:text-marine-cyan transition-colors" />
            </div>
            <div className="h-48">
              {renderChart(chartDefinitions.find(c => c.id === 'depth-distribution')!, false)}
            </div>
          </div>

          <div 
            className={`${cardClass} cursor-pointer group`}
            onClick={() => handleChartClick('research-institutions')}
          >
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-semibold text-white">Research Institutions</h3>
              <FiMaximize2 className="w-4 h-4 text-gray-400 group-hover:text-marine-cyan transition-colors" />
            </div>
            <div className="h-48">
              {renderChart(chartDefinitions.find(c => c.id === 'research-institutions')!, false)}
            </div>
          </div>

          <div 
            className={`${cardClass} cursor-pointer group`}
            onClick={() => handleChartClick('conservation-trends')}
          >
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-semibold text-white">Conservation Trends</h3>
              <FiMaximize2 className="w-4 h-4 text-gray-400 group-hover:text-marine-cyan transition-colors" />
            </div>
            <div className="h-48">
              {renderChart(chartDefinitions.find(c => c.id === 'conservation-trends')!, false)}
            </div>
          </div>
        </section>
        </div>
      )}
    </div>
  );
};

export default SearchResultsView;


