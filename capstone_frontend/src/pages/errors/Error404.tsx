import React from 'react';
import { motion } from 'framer-motion';
import { ErrorLayout } from './ErrorLayout';
import { SearchX, MapPin, Compass } from 'lucide-react';

const Error404: React.FC = () => {
  const NotFoundIcon = () => (
    <div className="relative w-48 h-48">
      {/* Animated Circle Background */}
      <motion.div
        animate={{
          scale: [1, 1.1, 1],
          opacity: [0.3, 0.5, 0.3],
        }}
        transition={{
          duration: 3,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
        className="absolute inset-0 rounded-full bg-primary/10"
      />

      {/* Main Icon */}
      <motion.div
        animate={{
          y: [0, -10, 0],
        }}
        transition={{
          duration: 2.5,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
        className="absolute inset-0 flex items-center justify-center"
      >
        <SearchX className="w-24 h-24 text-primary" strokeWidth={1.5} />
      </motion.div>

      {/* Orbiting Icons */}
      <motion.div
        animate={{ rotate: 360 }}
        transition={{
          duration: 15,
          repeat: Infinity,
          ease: 'linear',
        }}
        className="absolute inset-0"
      >
        <MapPin
          className="absolute top-4 right-8 w-8 h-8 text-primary/40"
          strokeWidth={1.5}
        />
      </motion.div>

      <motion.div
        animate={{ rotate: -360 }}
        transition={{
          duration: 20,
          repeat: Infinity,
          ease: 'linear',
        }}
        className="absolute inset-0"
      >
        <Compass
          className="absolute bottom-4 left-8 w-8 h-8 text-primary/40"
          strokeWidth={1.5}
        />
      </motion.div>
    </div>
  );

  return (
    <ErrorLayout
      errorCode="404"
      title="Page Not Found"
      description="The page you're looking for doesn't exist or has been moved. Let's get you back on track."
      icon={<NotFoundIcon />}
      showReportButton={false}
    />
  );
};

export default Error404;
