import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, BookOpen, Shield, Zap } from 'lucide-react';

interface WelcomeScreenProps {
  onStart: () => void;
  isLoading?: boolean;
  loadingProgress?: number;
}

export const WelcomeScreen: React.FC<WelcomeScreenProps> = ({ 
  onStart, 
  isLoading = false, 
  loadingProgress = 0 
}) => {


  const features = [
    {
      icon: <BookOpen className="w-8 h-8" />,
      title: "Smart Notes",
      description: "AI-powered writing assistance and intelligent organization"
    },
    {
      icon: <Shield className="w-8 h-8" />,
      title: "End-to-End Encryption",
      description: "Military-grade security for your most sensitive thoughts"
    },
    {
      icon: <Zap className="w-8 h-8" />,
      title: "Lightning Fast",
      description: "Instant search, real-time sync, and seamless performance"
    }
  ];

  useEffect(() => {
    if (!isLoading) {
      // Auto-redirect after 2 seconds, no need for manual button
      const timer = setTimeout(() => onStart(), 2000);
      return () => clearTimeout(timer);
    }
  }, [isLoading, onStart]);

  // Remove cycling logic to keep features stable
  // useEffect(() => {
  //   if (isLoading) {
  //     const interval = setInterval(() => {
  //       setCurrentStep((prev) => (prev + 1) % features.length);
  //     }, 2000);
  //     return () => clearInterval(interval);
  //   }
  // }, [isLoading, features.length]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-purple-900 flex items-center justify-center p-8 relative overflow-hidden">
        {/* Background Pattern */}
        <motion.div 
          className="absolute inset-0 opacity-5"
          animate={{ 
            y: [0, -10, 0],
            x: [0, 5, 0]
          }}
          transition={{ 
            duration: 20,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        >
          <div className="absolute inset-0" style={{
            backgroundImage: `radial-gradient(circle at 25% 25%, #6366f1 2px, transparent 2px),
                              radial-gradient(circle at 75% 75%, #8b5cf6 2px, transparent 2px)`,
            backgroundSize: '50px 50px'
          }} />
        </motion.div>
        
        <div className="text-center max-w-2xl relative z-10">
          {/* Logo Animation */}
          <motion.div
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="mb-8"
          >
            <div className="relative">
              <motion.div
                animate={{ 
                  rotate: 360,
                  scale: [1, 1.1, 1]
                }}
                transition={{ 
                  rotate: { duration: 3, repeat: Infinity, ease: "linear" },
                  scale: { duration: 2, repeat: Infinity, ease: "easeInOut" }
                }}
                className="w-32 h-32 mx-auto bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 rounded-3xl flex items-center justify-center shadow-2xl"
              >
                <Sparkles className="w-16 h-16 text-white" />
              </motion.div>
              
              {/* Glowing effect */}
              <motion.div
                animate={{ 
                  opacity: [0.5, 1, 0.5],
                  scale: [1, 1.2, 1]
                }}
                transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                className="absolute inset-0 bg-gradient-to-br from-indigo-400 via-purple-400 to-pink-400 rounded-3xl blur-xl opacity-30"
              />
            </div>
          </motion.div>

          {/* App Title */}
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="text-5xl md:text-6xl font-bold mb-4 bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 bg-clip-text text-transparent"
          >
            Next-Gen Notes
          </motion.h1>

          {/* Tagline */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="text-xl md:text-2xl text-gray-600 dark:text-gray-300 mb-12 font-light"
          >
            The future of note-taking is here
          </motion.p>

          {/* Loading Progress */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6 }}
            className="mb-8"
          >
            <div className="w-full max-w-md mx-auto bg-gray-200 dark:bg-gray-700 rounded-full h-3 overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${loadingProgress}%` }}
                transition={{ duration: 1, ease: "easeOut" }}
                className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full"
              />
            </div>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
              Initializing... {Math.round(loadingProgress)}%
            </p>
          </motion.div>

          {/* Feature Highlights */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.8 }}
            className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8"
          >
            {features.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 1 + index * 0.2 }}
                className="text-center p-4 rounded-xl bg-white dark:bg-gray-800 shadow-lg transition-all duration-300 relative hover:shadow-xl"
              >
                <div className="text-indigo-500 mb-3 flex justify-center">
                  <motion.div
                    animate={isLoading ? { 
                      scale: [1, 1.1, 1],
                      opacity: [0.8, 1, 0.8]
                    } : {}}
                    transition={{ 
                      duration: 2,
                      repeat: isLoading ? Infinity : 0,
                      ease: "easeInOut"
                    }}
                  >
                    {feature.icon}
                  </motion.div>
                </div>
                <h3 className="font-semibold text-gray-800 dark:text-gray-200 mb-2">
                  {feature.title}
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {feature.description}
                </p>
                

              </motion.div>
            ))}
          </motion.div>

          {/* Loading Dots */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 1.5 }}
            className="flex justify-center space-x-2"
          >
            {[0, 1, 2].map((i) => (
              <motion.div
                key={i}
                animate={{ 
                  scale: [1, 1.2, 1],
                  opacity: [0.5, 1, 0.5]
                }}
                transition={{ 
                  duration: 1.5,
                  repeat: Infinity,
                  delay: i * 0.2
                }}
                className="w-3 h-3 bg-indigo-500 rounded-full"
              />
            ))}
          </motion.div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-purple-900 flex items-center justify-center p-8 relative overflow-hidden">
      {/* Background Pattern */}
      <motion.div 
        className="absolute inset-0 opacity-5"
        animate={{ 
          y: [0, -10, 0],
          x: [0, 5, 0]
        }}
        transition={{ 
          duration: 20,
          repeat: Infinity,
          ease: "easeInOut"
        }}
      >
        <div className="absolute inset-0" style={{
          backgroundImage: `radial-gradient(circle at 25% 25%, #6366f1 2px, transparent 2px),
                            radial-gradient(circle at 75% 75%, #8b5cf6 2px, transparent 2px)`,
          backgroundSize: '50px 50px'
        }} />
      </motion.div>
      
      <div className="text-center max-w-2xl relative z-10">
        {/* Logo */}
        <motion.div
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="mb-8"
        >
          <div className="relative">
            <motion.div
              animate={{ 
                scale: [1, 1.05, 1]
              }}
              transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
              className="w-32 h-32 mx-auto bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 rounded-3xl flex items-center justify-center shadow-2xl"
            >
              <Sparkles className="w-16 h-16 text-white" />
            </motion.div>
            
            {/* Subtle glow */}
            <div className="absolute inset-0 bg-gradient-to-br from-indigo-400 via-purple-400 to-pink-400 rounded-3xl blur-xl opacity-20" />
          </div>
        </motion.div>

        {/* App Title */}
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="text-5xl md:text-6xl font-bold mb-4 bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 bg-clip-text text-transparent"
        >
          Next-Gen Notes
        </motion.h1>

        {/* Tagline */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="text-xl md:text-2xl text-gray-600 dark:text-gray-300 mb-8 font-light"
        >
          The future of note-taking is here
        </motion.p>

        {/* Feature Highlights */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.6 }}
          className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12"
        >
          {features.map((feature, index) => (
                         <motion.div
               key={index}
               initial={{ opacity: 0, y: 20 }}
               animate={{ opacity: 1, y: 0 }}
               transition={{ duration: 0.6, delay: 0.8 + index * 0.2 }}
               whileHover={{ 
                 scale: 1.05,
                 y: -5,
                 transition: { duration: 0.2 }
               }}
               className="text-center p-6 rounded-xl bg-white dark:bg-gray-800 shadow-lg hover:shadow-xl transition-all duration-300"
             >
              <div className="text-indigo-500 mb-4 flex justify-center">
                {feature.icon}
              </div>
              <h3 className="font-semibold text-gray-800 dark:text-gray-200 mb-2">
                {feature.title}
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {feature.description}
              </p>
            </motion.div>
          ))}
        </motion.div>

        {/* Auto-redirect message */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 1.2 }}
          className="mt-8 text-center"
        >
          <motion.div
            animate={{ 
              scale: [1, 1.05, 1],
              opacity: [0.7, 1, 0.7]
            }}
            transition={{ 
              duration: 2,
              repeat: Infinity,
              ease: "easeInOut"
            }}
            className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 rounded-lg"
          >
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
              className="w-4 h-4 border-2 border-indigo-500 border-t-transparent rounded-full"
            />
            Redirecting to main app...
          </motion.div>
        </motion.div>

        {/* Keyboard shortcuts hint */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 1.2 }}
          className="mt-8 text-sm text-gray-500 dark:text-gray-400"
        >
          <p className="mb-2">Quick start with keyboard shortcuts:</p>
          <div className="flex flex-wrap justify-center gap-3">
            <span className="px-3 py-1 bg-gray-100 dark:bg-gray-800 rounded-lg font-mono">⌘+N</span>
            <span className="px-3 py-1 bg-gray-100 dark:bg-gray-800 rounded-lg font-mono">⌘+K</span>
            <span className="px-3 py-1 bg-gray-100 dark:bg-gray-800 rounded-lg font-mono">⌘+S</span>
          </div>
        </motion.div>
      </div>
    </div>
  );
};
