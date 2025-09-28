import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiHome, FiDatabase, FiDollarSign, FiLogOut, FiCode, FiSearch, FiBarChart2, FiActivity, FiGlobe, FiCalendar, FiFilter } from 'react-icons/fi';

interface APIDocumentationProps {
  onBack: () => void;
  onLogout?: () => void;
}

const APIDocumentation: React.FC<APIDocumentationProps> = ({ onBack, onLogout }) => {
  const [activeTab, setActiveTab] = useState<'occurrences' | 'taxonomy' | 'edna'>('occurrences');
  
  // Mock data
  const mockOccurrencesData = {
    "Arabian Sea": { total: 1250, data: [] },
    "Bay of Bengal": { total: 980, data: [] },
    "Andaman Sea": { total: 750, data: [] }
  };

  const mockTaxonomyData = [
    { gbifKey: "12345", scientificName: "Thunnus albacares", rank: "SPECIES" },
    { gbifKey: "12346", scientificName: "Carcharhinus leucas", rank: "SPECIES" },
    { gbifKey: "12347", scientificName: "Acropora palmata", rank: "SPECIES" }
  ];

  const mockSpeciesDetails = {
    "12345": {
      scientificName: "Thunnus albacares",
      authorship: "(Bonnaterre, 1788)",
      rank: "SPECIES",
      lineage: ["Animalia", "Chordata", "Actinopterygii", "Perciformes", "Scombridae", "Thunnus", "Thunnus albacares"],
      commonNames: [
        { name: "Yellowfin Tuna", language: "eng" },
        { name: "Ahi", language: "haw" }
      ],
      image: "https://via.placeholder.com/200x150/00d4ff/ffffff?text=Thunnus+albacares"
    }
  };

  const mockEDNAResults = {
    jobId: "edna_12345",
    status: "completed",
    results: [
      { species: "Thunnus albacares", confidence: 0.95, marker: "COI" },
      { species: "Carcharhinus leucas", confidence: 0.87, marker: "COI" },
      { species: "Acropora palmata", confidence: 0.92, marker: "rbcL" }
    ],
    summary: {
      "Thunnus albacares": 35,
      "Carcharhinus leucas": 28,
      "Acropora palmata": 37
    }
  };

  const [queryParams, setQueryParams] = useState({
    waterBody: 'All Water Bodies',
    scientificName: '',
    startDate: '',
    endDate: '',
    limit: 20,
    offset: 0
  });

  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [selectedSpecies, setSelectedSpecies] = useState<any>(null);
  const [ednaParams, setEdnaParams] = useState({
    sequences: '>Seq1\nAGTCGATCGATCGATCGATACGTAGCTAGCTAGCTACG\n>Seq2\nCGATCGATCGATCGATACGTAGCTAGCTAGCTACGT',
    marker: 'COI (Cytochrome c oxidase I)',
    minIdentity: 0.97
  });

  const [showOccurrenceResults, setShowOccurrenceResults] = useState(false);
  const [showEDNAResults, setShowEDNAResults] = useState(false);

  const generateOccurrenceURL = () => {
    const baseURL = 'https://api.sagar.example/v1/occurrences';
    const params = new URLSearchParams();
    
    if (queryParams.waterBody !== 'All Water Bodies') {
      params.append('waterBody', queryParams.waterBody);
    }
    if (queryParams.scientificName) {
      params.append('scientificName', queryParams.scientificName);
    }
    if (queryParams.startDate) {
      params.append('startDate', queryParams.startDate);
    }
    if (queryParams.endDate) {
      params.append('endDate', queryParams.endDate);
    }
    params.append('limit', queryParams.limit.toString());
    params.append('offset', queryParams.offset.toString());
    
    return `${baseURL}?${params.toString()}`;
  };

  const handleOccurrenceFetch = () => {
    setShowOccurrenceResults(true);
  };

  const handleTaxonomySearch = () => {
    if (searchQuery.trim()) {
      setSearchResults(mockTaxonomyData.filter(item => 
        item.scientificName.toLowerCase().includes(searchQuery.toLowerCase())
      ));
    }
  };

  const handleSpeciesSelect = (gbifKey: string) => {
    setSelectedSpecies(mockSpeciesDetails[gbifKey as keyof typeof mockSpeciesDetails]);
  };

  const handleEDNAAnalysis = () => {
    setShowEDNAResults(true);
  };

  const tabs = [
    { id: 'occurrences', label: '🌍 Occurrences', icon: FiGlobe },
    { id: 'taxonomy', label: '🐠 Taxonomy', icon: FiSearch },
    { id: 'edna', label: '🧬 eDNA Analysis', icon: FiActivity }
  ] as const;

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

            {/* Navigation */}
            <nav className="hidden md:flex items-center space-x-8">
              {[
                { name: 'Home', icon: FiHome, href: '#', onClick: onBack, isExternal: false },
                { name: 'Data Sources', icon: FiDatabase, href: 'https://sagar-data-ingestion.vercel.app/', onClick: undefined, isExternal: true },
                { name: 'API Documentation', icon: FiDollarSign, href: '#', onClick: undefined, isExternal: false, active: true }
              ].map((item, index) => (
                item.isExternal ? (
                  <motion.a
                    key={item.name}
                    href={item.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center space-x-2 text-gray-300 hover:text-marine-cyan transition-colors duration-200"
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
                    className={`flex items-center space-x-2 transition-colors duration-200 ${
                      item.active 
                        ? 'text-marine-cyan' 
                        : 'text-gray-300 hover:text-marine-cyan'
                    }`}
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

            {/* User Info & Logout */}
            <motion.div 
              className="flex items-center space-x-4"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5 }}
            >
              <span className="text-sm text-gray-300">Welcome, Dr. Vinu</span>
              <button 
                onClick={onLogout}
                className="flex items-center space-x-2 px-4 py-2 bg-red-600/20 hover:bg-red-600/30 border border-red-500/30 rounded-lg transition-colors duration-200"
              >
                <FiLogOut className="w-4 h-4" />
                <span>Logout</span>
              </button>
            </motion.div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="pt-24 px-6">
        <div className="max-w-7xl mx-auto">
          {/* Hero Section */}
          <motion.div 
            className="text-center mb-12"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
              Interactive API Explorer
            </h1>
            <p className="text-lg text-gray-300 max-w-3xl mx-auto">
              Explore marine biodiversity data through our comprehensive API endpoints. Test queries, visualize results, and understand data structures interactively.
            </p>
          </motion.div>

          {/* Tab Navigation */}
          <motion.div 
            className="mb-8"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {tabs.map((tab) => (
                <motion.button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`group relative cursor-pointer bg-gray-900/50 backdrop-blur-sm border rounded-xl p-6 transition-all duration-300 ${
                    activeTab === tab.id
                      ? 'border-marine-cyan/50 shadow-lg shadow-marine-cyan/10'
                      : 'border-gray-700/50 hover:border-marine-cyan/50 hover:shadow-lg hover:shadow-marine-cyan/10'
                  }`}
                  whileHover={{ y: -2 }}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.3 }}
                >
                  {/* Glow effect on hover */}
                  <div className={`absolute inset-0 rounded-xl transition-opacity duration-300 ${
                    activeTab === tab.id
                      ? 'bg-marine-cyan/10 opacity-100'
                      : 'bg-marine-cyan/5 opacity-0 group-hover:opacity-100'
                  }`} />
                  
                  <div className="relative flex flex-col items-center space-y-3">
                    <div className={`p-3 rounded-lg ${
                      activeTab === tab.id
                        ? 'bg-marine-cyan text-marine-blue'
                        : 'bg-gray-800/50 text-gray-300 group-hover:text-marine-cyan'
                    }`}>
                      <tab.icon className="w-6 h-6" />
                    </div>
                    <span className={`font-medium transition-colors duration-200 ${
                      activeTab === tab.id
                        ? 'text-marine-cyan'
                        : 'text-gray-300 group-hover:text-white'
                    }`}>
                      {tab.label}
                    </span>
                  </div>
                </motion.button>
              ))}
            </div>
          </motion.div>

          {/* Tab Content */}
          <AnimatePresence mode="wait">
            {activeTab === 'occurrences' && (
              <motion.div
                key="occurrences"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
                className="bg-gray-900/30 backdrop-blur-sm rounded-xl border border-gray-700 p-8"
              >
                <div className="mb-8">
                  <h2 className="text-2xl font-bold text-white mb-2">Occurrence Data Explorer</h2>
                  <p className="text-gray-300">
                    Explore marine species occurrence records using the GET /occurrences endpoint. Build custom queries with filters and see real-time URL generation.
                  </p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  {/* Query Builder */}
                  <div>
                    <h3 className="text-xl font-semibold text-white mb-4 flex items-center">
                      <FiFilter className="w-5 h-5 mr-2 text-marine-cyan" />
                      Query Builder
                    </h3>
                    
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm text-gray-300 mb-2">Water Body</label>
                        <select
                          value={queryParams.waterBody}
                          onChange={(e) => setQueryParams({...queryParams, waterBody: e.target.value})}
                          className="w-full px-3 py-2 bg-gray-800/50 border border-gray-600 rounded-lg text-white focus:border-marine-cyan focus:outline-none"
                        >
                          <option value="All Water Bodies">All Water Bodies</option>
                          <option value="Arabian Sea">Arabian Sea</option>
                          <option value="Bay of Bengal">Bay of Bengal</option>
                          <option value="Andaman Sea">Andaman Sea</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-sm text-gray-300 mb-2">Scientific Name</label>
                        <input
                          type="text"
                          value={queryParams.scientificName}
                          onChange={(e) => setQueryParams({...queryParams, scientificName: e.target.value})}
                          placeholder="e.g., Thunnus albacares"
                          className="w-full px-3 py-2 bg-gray-800/50 border border-gray-600 rounded-lg text-white focus:border-marine-cyan focus:outline-none"
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm text-gray-300 mb-2">Start Date</label>
                          <input
                            type="date"
                            value={queryParams.startDate}
                            onChange={(e) => setQueryParams({...queryParams, startDate: e.target.value})}
                            className="w-full px-3 py-2 bg-gray-800/50 border border-gray-600 rounded-lg text-white focus:border-marine-cyan focus:outline-none"
                          />
                        </div>
                        <div>
                          <label className="block text-sm text-gray-300 mb-2">End Date</label>
                          <input
                            type="date"
                            value={queryParams.endDate}
                            onChange={(e) => setQueryParams({...queryParams, endDate: e.target.value})}
                            className="w-full px-3 py-2 bg-gray-800/50 border border-gray-600 rounded-lg text-white focus:border-marine-cyan focus:outline-none"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm text-gray-300 mb-2">Results Limit</label>
                          <input
                            type="number"
                            value={queryParams.limit}
                            onChange={(e) => setQueryParams({...queryParams, limit: parseInt(e.target.value) || 20})}
                            className="w-full px-3 py-2 bg-gray-800/50 border border-gray-600 rounded-lg text-white focus:border-marine-cyan focus:outline-none"
                          />
                        </div>
                        <div>
                          <label className="block text-sm text-gray-300 mb-2">Offset</label>
                          <input
                            type="number"
                            value={queryParams.offset}
                            onChange={(e) => setQueryParams({...queryParams, offset: parseInt(e.target.value) || 0})}
                            className="w-full px-3 py-2 bg-gray-800/50 border border-gray-600 rounded-lg text-white focus:border-marine-cyan focus:outline-none"
                          />
                        </div>
                      </div>

                      <button
                        onClick={handleOccurrenceFetch}
                        className="w-full px-6 py-3 bg-marine-cyan text-marine-blue font-semibold rounded-lg hover:shadow-lg hover:shadow-marine-cyan/25 transition-all duration-200"
                      >
                         Fetch Occurrences
                      </button>
                    </div>
                  </div>

                  {/* Results Panel */}
                  <div>
                    <h3 className="text-xl font-semibold text-white mb-4 flex items-center">
                      <FiCode className="w-5 h-5 mr-2 text-marine-cyan" />
                      Results Panel
                    </h3>
                    
                    <div className="space-y-6">
                      {/* Generated URL */}
                      <div>
                        <h4 className="text-sm font-medium text-gray-300 mb-2">Generated Request URL</h4>
                        <div className="bg-gray-900 p-4 rounded-lg border border-gray-700">
                          <code className="text-sm text-marine-cyan break-all whitespace-pre-wrap overflow-wrap-anywhere">
                            {generateOccurrenceURL()}
                          </code>
                        </div>
                      </div>

                      {/* API Response */}
                      <div>
                        <h4 className="text-sm font-medium text-gray-300 mb-2">API Response</h4>
                        <div className="bg-gray-900 p-4 rounded-lg border border-gray-700 min-h-[200px]">
                          {showOccurrenceResults ? (
                            <pre className="text-sm text-gray-300 overflow-auto">
{JSON.stringify({
  "status": "success",
  "data": {
    "occurrences": [
      {
        "occurrenceId": "occ_12345",
        "scientificName": "Thunnus albacares",
        "waterBody": "Arabian Sea",
        "eventDate": "2023-06-15",
        "decimalLatitude": 12.3456,
        "decimalLongitude": 78.9012,
        "samplingProtocol": "Trawl Survey",
        "minimumDepthInMeters": 50,
        "maximumDepthInMeters": 100
      }
    ],
    "total": 1250,
    "limit": 20,
    "offset": 0
  }
}, null, 2)}
                            </pre>
                          ) : (
                            <p className="text-gray-400 italic">Click 'Fetch Occurrences' to see the API response.</p>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Data Visualization */}
                <div className="mt-8">
                  <h3 className="text-xl font-semibold text-white mb-4 flex items-center">
                    <FiBarChart2 className="w-5 h-5 mr-2 text-marine-cyan" />
                    Data Visualization
                  </h3>
                  <p className="text-gray-300 mb-4">Interactive charts showing occurrence patterns across different water bodies.</p>
                  
                  <div className="bg-gray-900/50 p-8 rounded-lg border border-gray-700 text-center">
                    {showOccurrenceResults ? (
                      <div className="space-y-4">
                        <h4 className="text-lg font-medium text-white">Total Occurrences by Water Body</h4>
                        <div className="grid grid-cols-3 gap-4">
                          {Object.entries(mockOccurrencesData).map(([waterBody, data]) => (
                            <div key={waterBody} className="bg-marine-cyan/20 p-4 rounded-lg border border-marine-cyan/30">
                              <div className="text-2xl font-bold text-marine-cyan">{data.total}</div>
                              <div className="text-sm text-gray-300">{waterBody}</div>
                            </div>
                          ))}
                        </div>
                      </div>
                    ) : (
                      <p className="text-gray-400 italic">📊 Chart will appear here after fetching data.</p>
                    )}
                  </div>
                </div>
              </motion.div>
            )}

            {activeTab === 'taxonomy' && (
              <motion.div
                key="taxonomy"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
                className="bg-gray-900/30 backdrop-blur-sm rounded-xl border border-gray-700 p-8"
              >
                <div className="mb-8">
                  <h2 className="text-2xl font-bold text-white mb-2">Taxonomy Browser</h2>
                  <p className="text-gray-300">
                    Search and explore marine species taxonomy using our comprehensive database. Use the GET /taxonomy/search endpoint to find species, then click results to view detailed information.
                  </p>
                </div>

                {/* Search Section */}
                <div className="mb-8">
                  <h3 className="text-xl font-semibold text-white mb-4 flex items-center">
                    <FiSearch className="w-5 h-5 mr-2 text-marine-cyan" />
                    Species Search
                  </h3>
                  
                  <div className="flex gap-4">
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Search for a species (e.g., Tuna, Shark, Coral)..."
                      className="flex-1 px-4 py-3 bg-gray-800/50 border border-gray-600 rounded-lg text-white focus:border-marine-cyan focus:outline-none"
                    />
                    <button
                      onClick={handleTaxonomySearch}
                      className="px-6 py-3 bg-marine-cyan text-marine-blue font-semibold rounded-lg hover:shadow-lg hover:shadow-marine-cyan/25 transition-all duration-200"
                    >
                      Search
                    </button>
                  </div>
                </div>

                {/* Search Results */}
                {searchResults.length > 0 && (
                  <div className="mb-8">
                    <h3 className="text-xl font-semibold text-white mb-4">Search Results</h3>
                    <div className="space-y-2">
                      {searchResults.map((result) => (
                        <div
                          key={result.gbifKey}
                          onClick={() => handleSpeciesSelect(result.gbifKey)}
                          className="p-4 bg-gray-800/50 border border-gray-600 rounded-lg cursor-pointer hover:bg-gray-700/50 hover:border-marine-cyan/50 transition-all duration-200"
                        >
                          <div className="flex justify-between items-center">
                            <div>
                              <div className="font-medium text-white">{result.scientificName}</div>
                              <div className="text-sm text-gray-400">GBIF Key: {result.gbifKey}</div>
                            </div>
                            <span className="px-2 py-1 bg-marine-cyan/20 text-marine-cyan text-xs rounded-full">
                              {result.rank}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Species Details */}
                {selectedSpecies && (
                  <div className="bg-gray-800/30 rounded-lg border border-gray-700 p-6">
                    <h3 className="text-xl font-semibold text-white mb-4">Species Details</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <img
                          src={selectedSpecies.image}
                          alt={selectedSpecies.scientificName}
                          className="w-full h-48 object-cover rounded-lg mb-4"
                        />
                        <div className="space-y-2">
                          <div>
                            <span className="text-sm text-gray-400">Scientific Name:</span>
                            <div className="text-lg font-medium text-white">{selectedSpecies.scientificName}</div>
                          </div>
                          <div>
                            <span className="text-sm text-gray-400">Authorship:</span>
                            <div className="text-white">{selectedSpecies.authorship}</div>
                          </div>
                          <div>
                            <span className="text-sm text-gray-400">Rank:</span>
                            <span className="ml-2 px-2 py-1 bg-marine-cyan/20 text-marine-cyan text-sm rounded-full">
                              {selectedSpecies.rank}
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="space-y-4">
                        <div>
                          <span className="text-sm text-gray-400">Taxonomic Lineage:</span>
                          <div className="mt-1 text-white">
                            {selectedSpecies.lineage.join(' → ')}
                          </div>
                        </div>
                        <div>
                          <span className="text-sm text-gray-400">Common Names:</span>
                          <div className="mt-1 space-y-1">
                            {selectedSpecies.commonNames.map((name: any, index: number) => (
                              <div key={index} className="text-white">
                                {name.name} <span className="text-gray-400">({name.language})</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </motion.div>
            )}

            {activeTab === 'edna' && (
              <motion.div
                key="edna"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
                className="bg-gray-900/30 backdrop-blur-sm rounded-xl border border-gray-700 p-8"
              >
                <div className="mb-8">
                  <h2 className="text-2xl font-bold text-white mb-2">eDNA Sequence Matcher</h2>
                  <p className="text-gray-300">
                    Analyze environmental DNA sequences using the POST /edna/match endpoint. Submit FASTA sequences, select genetic markers, and visualize species distribution patterns.
                  </p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  {/* Analysis Parameters */}
                  <div>
                    <h3 className="text-xl font-semibold text-white mb-4 flex items-center">
                      <FiActivity className="w-5 h-5 mr-2 text-marine-cyan" />
                      Analysis Parameters
                    </h3>
                    
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm text-gray-300 mb-2">FASTA Sequence</label>
                        <textarea
                          value={ednaParams.sequences}
                          onChange={(e) => setEdnaParams({...ednaParams, sequences: e.target.value})}
                          placeholder="Enter FASTA sequences here..."
                          rows={6}
                          className="w-full px-3 py-2 bg-gray-800/50 border border-gray-600 rounded-lg text-white focus:border-marine-cyan focus:outline-none font-mono text-sm"
                        />
                      </div>

                      <div>
                        <label className="block text-sm text-gray-300 mb-2">Genetic Marker</label>
                        <select
                          value={ednaParams.marker}
                          onChange={(e) => setEdnaParams({...ednaParams, marker: e.target.value})}
                          className="w-full px-3 py-2 bg-gray-800/50 border border-gray-600 rounded-lg text-white focus:border-marine-cyan focus:outline-none"
                        >
                          <option value="COI (Cytochrome c oxidase I)">COI (Cytochrome c oxidase I)</option>
                          <option value="12S rRNA">12S rRNA</option>
                          <option value="16S rRNA">16S rRNA</option>
                          <option value="rbcL">rbcL</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-sm text-gray-300 mb-2">
                          Minimum Identity: {ednaParams.minIdentity}
                        </label>
                        <input
                          type="range"
                          min="0.90"
                          max="1.0"
                          step="0.01"
                          value={ednaParams.minIdentity}
                          onChange={(e) => setEdnaParams({...ednaParams, minIdentity: parseFloat(e.target.value)})}
                          className="w-full"
                        />
                      </div>

                      <button
                        onClick={handleEDNAAnalysis}
                        className="w-full px-6 py-3 bg-marine-cyan text-marine-blue font-semibold rounded-lg hover:shadow-lg hover:shadow-marine-cyan/25 transition-all duration-200"
                      >
                        Submit for Analysis
                      </button>
                    </div>
                  </div>

                  {/* Results Panel */}
                  <div>
                    <h3 className="text-xl font-semibold text-white mb-4 flex items-center">
                      <FiCode className="w-5 h-5 mr-2 text-marine-cyan" />
                      Analysis Results
                    </h3>
                    
                    <div className="bg-gray-900 p-4 rounded-lg border border-gray-700 min-h-[400px]">
                      {showEDNAResults ? (
                        <pre className="text-sm text-gray-300 overflow-auto">
{JSON.stringify(mockEDNAResults, null, 2)}
                        </pre>
                      ) : (
                        <p className="text-gray-400 italic">Click 'Submit for Analysis' to see the results.</p>
                      )}
                    </div>
                  </div>
                </div>

                {/* Data Visualization */}
                <div className="mt-8">
                  <h3 className="text-xl font-semibold text-white mb-4 flex items-center">
                    <FiBarChart2 className="w-5 h-5 mr-2 text-marine-cyan" />
                    Species Distribution
                  </h3>
                  <p className="text-gray-300 mb-4">Visual representation of species matches found in the eDNA analysis.</p>
                  
                  <div className="bg-gray-900/50 p-8 rounded-lg border border-gray-700 text-center">
                    {showEDNAResults ? (
                      <div className="space-y-4">
                        <h4 className="text-lg font-medium text-white">eDNA Match Distribution</h4>
                        <div className="grid grid-cols-3 gap-4">
                          {Object.entries(mockEDNAResults.summary).map(([species, count]) => (
                            <div key={species} className="bg-marine-cyan/20 p-4 rounded-lg border border-marine-cyan/30">
                              <div className="text-2xl font-bold text-marine-cyan">{count}%</div>
                              <div className="text-sm text-gray-300">{species}</div>
                            </div>
                          ))}
                        </div>
                      </div>
                    ) : (
                      <p className="text-gray-400 italic">📊 Distribution chart will appear here after analysis.</p>
                    )}
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* API Reference Section */}
          <motion.div 
            className="mt-16"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
          >
            <h2 className="text-3xl font-bold text-white mb-8 text-center">API Input Format Reference</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* GET /occurrences */}
              <div className="bg-gray-900/30 backdrop-blur-sm rounded-xl border border-gray-700 p-6 min-w-0">
                <h3 className="text-xl font-semibold text-white mb-4 break-words">GET /occurrences</h3>
                <div className="bg-gray-900 p-4 rounded-lg mb-4">
                  <code className="text-sm text-marine-cyan break-all whitespace-pre-wrap overflow-wrap-anywhere">
                    GET /occurrences?waterBody=Arabian+Sea&scientificName=Thunnus+albacares&limit=20&offset=0
                  </code>
                </div>
                <div className="space-y-2 text-sm text-gray-300">
                  <div><strong>waterBody:</strong> string (optional)</div>
                  <div><strong>scientificName:</strong> string (optional)</div>
                  <div><strong>startDate:</strong> string (optional)</div>
                  <div><strong>endDate:</strong> string (optional)</div>
                  <div><strong>limit:</strong> integer (default: 20)</div>
                  <div><strong>offset:</strong> integer (default: 0)</div>
                </div>
              </div>

              {/* GET /taxonomy */}
              <div className="bg-gray-900/30 backdrop-blur-sm rounded-xl border border-gray-700 p-6 min-w-0">
                <h3 className="text-xl font-semibold text-white mb-4 break-words">GET /taxonomy</h3>
                <div className="space-y-4">
                  <div>
                    <div className="bg-gray-900 p-3 rounded-lg mb-2">
                      <code className="text-sm text-marine-cyan break-all whitespace-pre-wrap overflow-wrap-anywhere">
                        GET /taxonomy/search?q=tuna
                      </code>
                    </div>
                    <div className="bg-gray-900 p-3 rounded-lg">
                      <code className="text-sm text-marine-cyan break-all whitespace-pre-wrap overflow-wrap-anywhere">
                        GET /taxonomy/species/12345
                      </code>
                    </div>
                  </div>
                </div>
                <div className="space-y-2 text-sm text-gray-300 mt-4">
                  <div><strong>q:</strong> string (search query)</div>
                  <div><strong>rank:</strong> string (optional)</div>
                  <div><strong>gbifKey:</strong> integer (species ID)</div>
                </div>
              </div>

              {/* POST /edna/match */}
              <div className="bg-gray-900/30 backdrop-blur-sm rounded-xl border border-gray-700 p-6 min-w-0">
                <h3 className="text-xl font-semibold text-white mb-4 break-words">POST /edna/match</h3>
                <div className="bg-gray-900 p-4 rounded-lg mb-4">
                  <pre className="text-sm text-marine-cyan break-all whitespace-pre-wrap overflow-wrap-anywhere">
{`{
  "sequences": ">Seq1\\nAGTCGATCG...",
  "marker": "COI",
  "minIdentity": 0.97
}`}
                  </pre>
                </div>
                <div className="space-y-2 text-sm text-gray-300">
                  <div><strong>sequences:</strong> string (FASTA format)</div>
                  <div><strong>marker:</strong> string (genetic marker)</div>
                  <div><strong>minIdentity:</strong> float (0.90-1.0)</div>
                </div>
              </div>
            </div>

            {/* Additional Information */}
            <div className="mt-8 bg-gray-900/20 backdrop-blur-sm rounded-xl border border-gray-700 p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 text-center">
                <div className="min-w-0">
                  <h4 className="font-semibold text-white mb-2 break-words">Authentication</h4>
                  <p className="text-sm text-gray-300 break-words">All endpoints require API key authentication via the X-API-Key header.</p>
                </div>
                <div className="min-w-0">
                  <h4 className="font-semibold text-white mb-2 break-words">Rate Limits</h4>
                  <p className="text-sm text-gray-300 break-words">Standard rate limit: 1000 requests per hour per API key.</p>
                </div>
                <div className="min-w-0">
                  <h4 className="font-semibold text-white mb-2 break-words">Response Format</h4>
                  <p className="text-sm text-gray-300 break-words">All responses are in JSON format with consistent error handling.</p>
                </div>
                <div className="min-w-0">
                  <h4 className="font-semibold text-white mb-2 break-words">Base URL</h4>
                  <p className="text-sm text-marine-cyan break-all">https://api.sagar.example/v1/</p>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </main>
    </div>
  );
};

export default APIDocumentation;
