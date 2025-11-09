import React from 'react';
import { motion } from 'framer-motion';
import { ErrorLayout } from './ErrorLayout';
import { Wrench, Cog, Settings, Construction } from 'lucide-react';

const Error503: React.FC = () => {
  const MaintenanceIcon = () => (
    <div className="relative w-48 h-48">
      {/* Rotating Glow Background */}
      <motion.div
        animate={{
          rotate: 360,
          scale: [1, 1.15, 1],
        }}
        transition={{
          rotate: { duration: 20, repeat: Infinity, ease: 'linear' },
          scale: { duration: 3, repeat: Infinity, ease: 'easeInOut' },
        }}
        className="absolute inset-0 rounded-full bg-gradient-to-br from-blue-500/10 to-purple-500/10"
      />

      {/* Main Construction Icon */}
      <motion.div
        animate={{
          y: [0, -8, 0],
        }}
        transition={{
          duration: 2.5,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
        className="absolute inset-0 flex items-center justify-center"
      >
        <Construction className="w-24 h-24 text-blue-600 dark:text-blue-400" strokeWidth={1.5} />
      </motion.div>

      {/* Rotating Gears */}
      <motion.div
        animate={{ rotate: 360 }}
        transition={{
          duration: 8,
          repeat: Infinity,
          ease: 'linear',
        }}
        className="absolute top-8 right-4"
      >
        <Cog className="w-12 h-12 text-blue-500/40" strokeWidth={1.5} />
      </motion.div>

      <motion.div
        animate={{ rotate: -360 }}
        transition={{
          duration: 10,
          repeat: Infinity,
          ease: 'linear',
        }}
        className="absolute bottom-8 left-4"
      >
        <Settings className="w-10 h-10 text-purple-500/40" strokeWidth={1.5} />
      </motion.div>

      {/* Wrench */}
      <motion.div
        animate={{
          rotate: [0, 15, -15, 0],
        }}
        transition={{
          duration: 3,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
        className="absolute top-4 left-8"
      >
        <Wrench className="w-8 h-8 text-blue-600/50 dark:text-blue-400/50" strokeWidth={1.5} />
      </motion.div>
    </div>
  );

  return (
    <ErrorLayout
      errorCode="503"
      title="Maintenance Mode"
      description="We're currently performing scheduled maintenance to improve your experience. We'll be back shortly!"
      icon={<MaintenanceIcon />}
      showReportButton={false}
    />
  );
};

export default Error503;
