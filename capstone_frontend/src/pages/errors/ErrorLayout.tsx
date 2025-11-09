import React from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';

interface ErrorLayoutProps {
  errorCode: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  showReportButton?: boolean;
}

export const ErrorLayout: React.FC<ErrorLayoutProps> = ({
  errorCode,
  title,
  description,
  icon,
  showReportButton = false,
}) => {
  const navigate = useNavigate();

  const handleGoHome = () => {
    navigate('/');
  };

  const handleGoBack = () => {
    window.history.back();
  };

  const handleReport = () => {
    window.location.href = 'mailto:support@charityhub.com?subject=Error Report: ' + errorCode;
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-background via-background to-muted/20 transition-colors duration-500 overflow-hidden">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
        className="flex flex-col items-center justify-center w-full max-w-2xl mx-4 p-8 md:p-12 rounded-2xl shadow-2xl bg-card border border-border/50 text-center"
      >
        {/* Error Code Badge */}
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.4 }}
          className="inline-flex items-center justify-center px-4 py-2 mb-6 text-sm font-semibold rounded-full bg-destructive/10 text-destructive border border-destructive/20"
        >
          Error {errorCode}
        </motion.div>

        {/* Animated Icon */}
        <motion.div
          initial={{ scale: 0.5, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.3, duration: 0.5, type: 'spring', bounce: 0.4 }}
          className="mb-8"
        >
          {icon}
        </motion.div>

        {/* Title */}
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.4 }}
          className="text-4xl md:text-5xl font-bold mb-4 text-foreground"
        >
          {title}
        </motion.h1>

        {/* Description */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.4 }}
          className="text-lg text-muted-foreground mb-8 max-w-md"
        >
          {description}
        </motion.p>

        {/* Action Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6, duration: 0.4 }}
          className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto"
        >
          <Button
            onClick={handleGoHome}
            size="lg"
            className="min-w-[160px] font-semibold shadow-lg hover:shadow-xl transition-all duration-300"
          >
            Go Home
          </Button>
          <Button
            onClick={handleGoBack}
            variant="outline"
            size="lg"
            className="min-w-[160px] font-semibold hover:bg-accent transition-all duration-300"
          >
            Go Back
          </Button>
          {showReportButton && (
            <Button
              onClick={handleReport}
              variant="ghost"
              size="lg"
              className="min-w-[160px] font-semibold hover:bg-accent transition-all duration-300"
            >
              Report Issue
            </Button>
          )}
        </motion.div>

        {/* Footer / Support Info */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8, duration: 0.4 }}
          className="mt-10 pt-6 border-t border-border/50"
        >
          <p className="text-sm text-muted-foreground">
            Need help?{' '}
            <a
              href="mailto:support@charityhub.com"
              className="text-primary hover:underline font-medium transition-colors"
            >
              Contact our support team
            </a>
          </p>
        </motion.div>
      </motion.div>

      {/* Decorative Background Elements */}
      <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
        <motion.div
          animate={{
            scale: [1, 1.2, 1],
            rotate: [0, 90, 0],
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            ease: 'linear',
          }}
          className="absolute -top-1/4 -right-1/4 w-1/2 h-1/2 bg-primary/5 rounded-full blur-3xl"
        />
        <motion.div
          animate={{
            scale: [1, 1.3, 1],
            rotate: [0, -90, 0],
          }}
          transition={{
            duration: 25,
            repeat: Infinity,
            ease: 'linear',
          }}
          className="absolute -bottom-1/4 -left-1/4 w-1/2 h-1/2 bg-secondary/5 rounded-full blur-3xl"
        />
      </div>
    </div>
  );
};
