import { Heart, Loader2 } from "lucide-react";
import { useEffect, useState } from "react";

interface LoadingPageProps {
  message?: string;
  showProgress?: boolean;
}

export function LoadingPage({ 
  message = "Loading...", 
  showProgress = false 
}: LoadingPageProps) {
  const [progress, setProgress] = useState(0);
  const [dots, setDots] = useState("");

  useEffect(() => {
    if (showProgress) {
      const progressInterval = setInterval(() => {
        setProgress((prev) => {
          if (prev >= 90) return prev;
          return prev + Math.random() * 10;
        });
      }, 500);
      return () => clearInterval(progressInterval);
    }
  }, [showProgress]);

  useEffect(() => {
    const dotsInterval = setInterval(() => {
      setDots((prev) => (prev.length >= 3 ? "" : prev + "."));
    }, 500);
    return () => clearInterval(dotsInterval);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-primary/10 flex items-center justify-center p-4">
      <div className="text-center space-y-8 max-w-md">
        {/* Animated Hearts Loader */}
        <div className="relative h-32 flex items-center justify-center">
          {/* Outer rotating hearts */}
          <div className="absolute inset-0 animate-spin" style={{ animationDuration: '3s' }}>
            <Heart className="absolute top-0 left-1/2 -translate-x-1/2 h-8 w-8 text-primary/40 fill-primary/40" />
            <Heart className="absolute bottom-0 left-1/2 -translate-x-1/2 h-8 w-8 text-primary/40 fill-primary/40" />
            <Heart className="absolute left-0 top-1/2 -translate-y-1/2 h-8 w-8 text-primary/40 fill-primary/40" />
            <Heart className="absolute right-0 top-1/2 -translate-y-1/2 h-8 w-8 text-primary/40 fill-primary/40" />
          </div>
          
          {/* Middle rotating hearts */}
          <div className="absolute inset-4 animate-spin" style={{ animationDuration: '2s', animationDirection: 'reverse' }}>
            <Heart className="absolute top-0 left-1/2 -translate-x-1/2 h-10 w-10 text-primary/60 fill-primary/60" />
            <Heart className="absolute bottom-0 left-1/2 -translate-x-1/2 h-10 w-10 text-primary/60 fill-primary/60" />
            <Heart className="absolute left-0 top-1/2 -translate-y-1/2 h-10 w-10 text-primary/60 fill-primary/60" />
            <Heart className="absolute right-0 top-1/2 -translate-y-1/2 h-10 w-10 text-primary/60 fill-primary/60" />
          </div>

          {/* Center pulsing heart */}
          <Heart className="h-16 w-16 text-primary fill-primary animate-pulse relative z-10" />
        </div>

        {/* Loading Message */}
        <div className="space-y-3">
          <h2 className="text-2xl md:text-3xl font-bold text-foreground">
            {message}
            <span className="inline-block w-8 text-left">{dots}</span>
          </h2>
          <p className="text-sm text-muted-foreground">
            Making a difference, one moment at a time
          </p>
        </div>

        {/* Progress Bar */}
        {showProgress && (
          <div className="space-y-2">
            <div className="w-full bg-primary/10 rounded-full h-2 overflow-hidden">
              <div
                className="h-full bg-primary transition-all duration-500 ease-out rounded-full"
                style={{ width: `${progress}%` }}
              />
            </div>
            <p className="text-xs text-muted-foreground">
              {Math.round(progress)}% Complete
            </p>
          </div>
        )}

        {/* Animated Dots */}
        <div className="flex justify-center gap-2">
          <div
            className="h-3 w-3 rounded-full bg-primary animate-bounce"
            style={{ animationDelay: '0ms' }}
          />
          <div
            className="h-3 w-3 rounded-full bg-primary animate-bounce"
            style={{ animationDelay: '150ms' }}
          />
          <div
            className="h-3 w-3 rounded-full bg-primary animate-bounce"
            style={{ animationDelay: '300ms' }}
          />
        </div>

        {/* Inspirational Text */}
        <div className="pt-4">
          <p className="text-xs italic text-muted-foreground">
            "No act of kindness, no matter how small, is ever wasted."
          </p>
        </div>
      </div>
    </div>
  );
}

// Simple spinner version for inline use
export function LoadingSpinner({ size = "default" }: { size?: "sm" | "default" | "lg" }) {
  const sizeClasses = {
    sm: "h-4 w-4",
    default: "h-6 w-6",
    lg: "h-8 w-8"
  };

  return (
    <div className="flex items-center justify-center gap-2">
      <Loader2 className={`${sizeClasses[size]} animate-spin text-primary`} />
      <Heart className={`${sizeClasses[size]} text-primary fill-primary animate-pulse`} />
    </div>
  );
}

// Card loading skeleton
export function LoadingCard() {
  return (
    <div className="border rounded-lg p-6 space-y-4 animate-pulse">
      <div className="flex items-center gap-4">
        <div className="h-12 w-12 rounded-full bg-primary/10" />
        <div className="space-y-2 flex-1">
          <div className="h-4 bg-primary/10 rounded w-3/4" />
          <div className="h-3 bg-primary/10 rounded w-1/2" />
        </div>
      </div>
      <div className="space-y-2">
        <div className="h-3 bg-primary/10 rounded" />
        <div className="h-3 bg-primary/10 rounded w-5/6" />
      </div>
      <div className="flex gap-2">
        <div className="h-8 bg-primary/10 rounded w-20" />
        <div className="h-8 bg-primary/10 rounded w-20" />
      </div>
    </div>
  );
}

// Table loading skeleton
export function LoadingTable({ rows = 5 }: { rows?: number }) {
  return (
    <div className="space-y-3">
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="flex gap-4 items-center animate-pulse">
          <div className="h-10 bg-primary/10 rounded w-full" />
        </div>
      ))}
    </div>
  );
}
