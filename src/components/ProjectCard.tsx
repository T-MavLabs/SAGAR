import React from 'react';
import { motion } from 'framer-motion';
import { FiArrowRight, FiCalendar } from 'react-icons/fi';
import { Project } from '../App';

interface ProjectCardProps {
  project: Project;
  onSelect: () => void;
}

const ProjectCard: React.FC<ProjectCardProps> = ({ project, onSelect }) => {
  const getWaterBodyColor = (waterBody: string) => {
    switch (waterBody) {
      case 'Arabian Sea':
        return 'bg-marine-green';
      case 'Bay of Bengal':
        return 'bg-marine-yellow';
      case 'Andaman Sea':
        return 'bg-marine-cyan';
      default:
        return 'bg-marine-orange';
    }
  };

  const handleKey = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      onSelect();
    }
  };

  return (
    <motion.div
      role="button"
      tabIndex={0}
      onClick={onSelect}
      onKeyDown={handleKey}
      className="group relative cursor-pointer bg-gray-900/50 backdrop-blur-sm border border-gray-700/50 rounded-xl p-6 hover:border-marine-cyan/50 hover:shadow-lg hover:shadow-marine-cyan/10 transition-all duration-300 h-80 flex flex-col"
      whileHover={{ y: -5 }}
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3 }}
    >
      {/* Glow effect on hover */}
      <div className="absolute inset-0 rounded-xl bg-marine-cyan/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      
      {/* Tags */}
      <div className="flex flex-wrap gap-2 mb-4">
        {project.tags.map((tag, index) => (
          <motion.span
            key={tag}
            className={`px-3 py-1 text-xs font-medium rounded-full ${getWaterBodyColor(project.waterBody)} text-marine-blue`}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.2, delay: index * 0.1 }}
          >
            {tag}
          </motion.span>
        ))}
      </div>

      {/* Project Title */}
      <motion.h3 
        className="text-xl font-bold text-white mb-2 group-hover:text-marine-cyan transition-colors duration-200"
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.3, delay: 0.1 }}
      >
        {project.title}
      </motion.h3>

      {/* Date */}
      <motion.div 
        className="flex items-center text-gray-400 text-sm mb-3"
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.3, delay: 0.2 }}
      >
        <FiCalendar className="w-4 h-4 mr-2" />
        <span>{new Date(project.date).toLocaleDateString()}</span>
      </motion.div>

      {/* Description */}
      <motion.p 
        className="text-gray-300 text-sm mb-4 line-clamp-2 flex-1"
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.3, delay: 0.3 }}
      >
        {project.description}
      </motion.p>

      {/* Bottom Section - Progress Bar and Button */}
      <div className="mt-auto">
        {/* Progress Bar */}
        <motion.div 
          className="mb-4"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.3, delay: 0.4 }}
        >
          <div className="flex justify-between text-sm text-gray-400 mb-1">
            <span>Progress</span>
            <span>{project.progress}%</span>
          </div>
          <div className="w-full bg-gray-700 rounded-full h-2">
            <motion.div
              className="bg-marine-cyan h-2 rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${project.progress}%` }}
              transition={{ duration: 1, delay: 0.5 }}
            />
          </div>
        </motion.div>

        {/* Open Project CTA (visual only; click handled by card) */}
        <motion.div
          className="w-full flex items-center justify-center space-x-2 px-4 py-3 bg-marine-cyan/20 border border-marine-cyan/30 rounded-lg text-marine-cyan group-hover:bg-marine-cyan/30 group-hover:border-marine-cyan/50 transition-all duration-200"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.5 }}
        >
          <span className="font-medium">Open Project</span>
          <FiArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform duration-200" />
        </motion.div>
      </div>
    </motion.div>
  );
};

export default ProjectCard;
