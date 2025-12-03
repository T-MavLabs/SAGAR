import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { FiArrowLeft, FiClock, FiTrash2, FiSearch, FiDatabase } from 'react-icons/fi';
import queryHistoryService, { QueryHistoryItem } from '../services/queryHistoryService';
import { SearchResultSummary } from './SearchResultsView';

interface QueryHistoryProps {
  onBack: () => void;
  onRestoreQuery: (result: SearchResultSummary) => void;
  onLogout?: () => void;
}

const QueryHistory: React.FC<QueryHistoryProps> = ({ onBack, onRestoreQuery, onLogout }) => {
  const [queries, setQueries] = useState<QueryHistoryItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  useEffect(() => {
    loadQueries();
  }, []);

  const loadQueries = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await queryHistoryService.getAllQueries(100);
      setQueries(data);
    } catch (e: any) {
      setError(e.message || 'Failed to load query history');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRestoreQuery = async (id: string) => {
    try {
      const record = await queryHistoryService.getQueryById(id);
      if (!record) {
        setError('Query not found');
        return;
      }

      const searchResult = queryHistoryService.convertToSearchResultSummary(record);
      if (!searchResult) {
        setError('Unable to restore query results');
        return;
      }

      onRestoreQuery(searchResult);
    } catch (e: any) {
      setError(e.message || 'Failed to restore query');
    }
  };

  const handleDeleteQuery = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this query from history?')) {
      return;
    }

    setDeletingId(id);
    try {
      const success = await queryHistoryService.deleteQuery(id);
      if (success) {
        setQueries(prev => prev.filter(q => q.id !== id));
      } else {
        setError('Failed to delete query');
      }
    } catch (e: any) {
      setError(e.message || 'Failed to delete query');
    } finally {
      setDeletingId(null);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getFilterSummary = (options: QueryHistoryItem['query_options']) => {
    if (!options) return null;
    const filters: string[] = [];
    if (options.waterBody) filters.push(`Water: ${options.waterBody}`);
    if (options.scientificName) filters.push(`Species: ${options.scientificName}`);
    if (options.minDepth !== undefined || options.maxDepth !== undefined) {
      const min = options.minDepth ?? 0;
      const max = options.maxDepth ?? '∞';
      filters.push(`Depth: ${min}-${max}m`);
    }
    if (options.dataTypes && options.dataTypes.length > 0) {
      filters.push(`Types: ${options.dataTypes.join(', ')}`);
    }
    return filters.length > 0 ? filters.join(' • ') : null;
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

            {/* Navigation */}
            <nav className="hidden md:flex items-center space-x-8">
              <button
                onClick={onBack}
                className="flex items-center space-x-2 text-gray-300 hover:text-marine-cyan transition-colors duration-200"
              >
                <FiArrowLeft className="w-4 h-4" />
                <span>Back to Dashboard</span>
              </button>
            </nav>

            {/* User Info & Logout */}
            <motion.div 
              className="flex items-center space-x-4"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5 }}
            >
              <span className="text-sm text-gray-300">Welcome, Dr. Vinu</span>
              {onLogout && (
                <button 
                  onClick={onLogout}
                  className="flex items-center space-x-2 px-4 py-2 bg-red-600/20 hover:bg-red-600/30 border border-red-500/30 rounded-lg transition-colors duration-200"
                >
                  <span>Logout</span>
                </button>
              )}
            </motion.div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="pt-24 px-6 pb-12">
        <div className="max-w-7xl mx-auto">
          {/* Page Header */}
          <motion.div 
            className="mb-8"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <div className="flex items-center space-x-3 mb-2">
              <FiClock className="w-8 h-8 text-marine-cyan" />
              <h1 className="text-4xl font-bold text-white">
                Query History
              </h1>
            </div>
            <p className="text-gray-400 mt-2">
              View and restore previous RAG queries and their results
            </p>
          </motion.div>

          {/* Error Message */}
          {error && (
            <motion.div
              className="mb-6 p-4 bg-red-900/20 border border-red-500/30 rounded-lg text-red-300"
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
            >
              {error}
            </motion.div>
          )}

          {/* Loading State */}
          {isLoading ? (
            <div className="py-16 text-center text-gray-400">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-marine-cyan mb-4"></div>
              <p>Loading query history...</p>
            </div>
          ) : queries.length === 0 ? (
            <motion.div
              className="py-16 text-center"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              <FiDatabase className="w-16 h-16 text-gray-600 mx-auto mb-4" />
              <p className="text-gray-400 text-lg mb-2">No query history yet</p>
              <p className="text-gray-500 text-sm">
                Your RAG queries will be saved here automatically
              </p>
            </motion.div>
          ) : (
            <motion.div
              className="space-y-4"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.4 }}
            >
              {queries.map((query, index) => {
                const filterSummary = getFilterSummary(query.query_options);
                return (
                  <motion.div
                    key={query.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.05 }}
                    className="bg-gray-900/50 backdrop-blur-sm border border-gray-700/50 rounded-xl p-6 hover:border-marine-cyan/50 transition-all duration-200"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        {/* Query Text */}
                        <div className="flex items-start space-x-3 mb-3">
                          <FiSearch className="w-5 h-5 text-marine-cyan mt-1 flex-shrink-0" />
                          <div className="flex-1">
                            <p className="text-white font-medium text-lg mb-2 break-words">
                              {query.query}
                            </p>
                            {filterSummary && (
                              <p className="text-sm text-gray-400 mb-2">
                                {filterSummary}
                              </p>
                            )}
                          </div>
                        </div>

                        {/* Answer Preview */}
                        <div className="ml-8 mb-3">
                          <p className="text-sm text-gray-300 line-clamp-2">
                            {query.answer_preview}
                          </p>
                        </div>

                        {/* Metadata */}
                        <div className="ml-8 flex items-center space-x-4 text-xs text-gray-500">
                          <span className="flex items-center space-x-1">
                            <FiClock className="w-3 h-3" />
                            <span>{formatDate(query.created_at)}</span>
                          </span>
                          <span className="flex items-center space-x-1">
                            <FiDatabase className="w-3 h-3" />
                            <span>{query.sources_count} sources</span>
                          </span>
                          {query.has_dashboard_summary && (
                            <span className="px-2 py-0.5 bg-marine-cyan/20 text-marine-cyan rounded">
                              Dashboard Summary
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex items-center space-x-2 flex-shrink-0">
                        <button
                          onClick={() => handleRestoreQuery(query.id)}
                          className="px-4 py-2 bg-marine-cyan text-marine-blue font-semibold rounded-lg hover:shadow-lg hover:shadow-marine-cyan/25 transition-all duration-200 flex items-center space-x-2"
                        >
                          <FiSearch className="w-4 h-4" />
                          <span>View Results</span>
                        </button>
                        <button
                          onClick={() => handleDeleteQuery(query.id)}
                          disabled={deletingId === query.id}
                          className="p-2 text-red-400 hover:text-red-300 hover:bg-red-900/20 rounded-lg transition-colors duration-200 disabled:opacity-50"
                          title="Delete query"
                        >
                          <FiTrash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </motion.div>
          )}
        </div>
      </main>
    </div>
  );
};

export default QueryHistory;

