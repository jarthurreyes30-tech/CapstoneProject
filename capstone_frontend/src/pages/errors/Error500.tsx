import React from 'react';
import { motion } from 'framer-motion';
import { ErrorLayout } from './ErrorLayout';
import { ServerCrash, AlertTriangle, Zap } from 'lucide-react';

const Error500: React.FC = () => {
  const ServerErrorIcon = () => (
    <div className="relative w-48 h-48">
      {/* Pulsing Alert Background */}
      <motion.div
        animate={{
          scale: [1, 1.2, 1],
          opacity: [0.2, 0.4, 0.2],
        }}
        transition={{
          duration: 2,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
        className="absolute inset-0 rounded-full bg-destructive/10"
      />

      {/* Main Server Icon */}
      <motion.div
        animate={{
          rotate: [0, 5, -5, 0],
        }}
        transition={{
          duration: 2,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
        className="absolute inset-0 flex items-center justify-center"
      >
        <ServerCrash className="w-24 h-24 text-destructive" strokeWidth={1.5} />
      </motion.div>

      {/* Warning Icons */}
      <motion.div
        animate={{
          y: [0, -5, 0],
          opacity: [0.6, 1, 0.6],
        }}
        transition={{
          duration: 1.5,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
        className="absolute top-2 left-1/2 -translate-x-1/2"
      >
        <AlertTriangle className="w-8 h-8 text-destructive/60" strokeWidth={2} />
      </motion.div>

      {/* Lightning Bolt */}
      <motion.div
        animate={{
          opacity: [0, 1, 0],
          scale: [0.8, 1.2, 0.8],
        }}
        transition={{
          duration: 2,
          repeat: Infinity,
          ease: 'easeInOut',
          times: [0, 0.5, 1],
        }}
        className="absolute bottom-4 right-8"
      >
        <Zap className="w-8 h-8 text-yellow-500/60" fill="currentColor" strokeWidth={0} />
      </motion.div>

      <motion.div
        animate={{
          opacity: [0, 1, 0],
          scale: [0.8, 1.2, 0.8],
        }}
        transition={{
          duration: 2,
          repeat: Infinity,
          ease: 'easeInOut',
          times: [0, 0.5, 1],
          delay: 0.3,
        }}
        className="absolute bottom-8 left-6"
      >
        <Zap className="w-6 h-6 text-yellow-500/60" fill="currentColor" strokeWidth={0} />
      </motion.div>
    </div>
  );

  return (
    <ErrorLayout
      errorCode="500"
      title="Internal Server Error"
      description="Something went wrong on our end. Our team has been notified and we're working to fix it."
      icon={<ServerErrorIcon />}
      showReportButton={true}
    />
  );
};

export default Error500;
