import { useEffect, useState } from "react";
import { Heart } from "lucide-react";

export function GlobalRefreshIndicator() {
  const [isLoading, setIsLoading] = useState(true);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    // Simulate initial page load
    const progressInterval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(progressInterval);
          setTimeout(() => setIsLoading(false), 300);
          return 100;
        }
        return prev + Math.random() * 20;
      });
    }, 100);

    return () => clearInterval(progressInterval);
  }, []);

  if (!isLoading) return null;

  return (
    <div className="fixed inset-0 z-[9999] bg-gradient-to-br from-primary/5 via-background to-primary/10 flex items-center justify-center">
      <div className="text-center space-y-6">
        {/* Animated Hearts */}
        <div className="relative h-24 flex items-center justify-center">
          <div className="absolute inset-0 animate-spin" style={{ animationDuration: '2s' }}>
            <Heart className="absolute top-0 left-1/2 -translate-x-1/2 h-6 w-6 text-primary/40 fill-primary/40" />
            <Heart className="absolute bottom-0 left-1/2 -translate-x-1/2 h-6 w-6 text-primary/40 fill-primary/40" />
            <Heart className="absolute left-0 top-1/2 -translate-y-1/2 h-6 w-6 text-primary/40 fill-primary/40" />
            <Heart className="absolute right-0 top-1/2 -translate-y-1/2 h-6 w-6 text-primary/40 fill-primary/40" />
          </div>
          <Heart className="h-12 w-12 text-primary fill-primary animate-pulse" />
        </div>

        {/* Progress Bar */}
        <div className="w-64 space-y-2">
          <div className="h-1.5 bg-primary/10 rounded-full overflow-hidden">
            <div
              className="h-full bg-primary transition-all duration-300 ease-out rounded-full"
              style={{ width: `${progress}%` }}
            />
          </div>
          <p className="text-sm text-muted-foreground">
            Loading... {Math.round(progress)}%
          </p>
        </div>

        {/* Bouncing Dots */}
        <div className="flex justify-center gap-2">
          <div className="h-2 w-2 rounded-full bg-primary animate-bounce" style={{ animationDelay: '0ms' }} />
          <div className="h-2 w-2 rounded-full bg-primary animate-bounce" style={{ animationDelay: '150ms' }} />
          <div className="h-2 w-2 rounded-full bg-primary animate-bounce" style={{ animationDelay: '300ms' }} />
        </div>
      </div>
    </div>
  );
}

// Minimal top bar version
export function TopBarLoader() {
  const [progress, setProgress] = useState(0);
  const [show, setShow] = useState(true);

  useEffect(() => {
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          setTimeout(() => setShow(false), 300);
          return 100;
        }
        return prev + Math.random() * 25;
      });
    }, 100);

    return () => clearInterval(interval);
  }, []);

  if (!show) return null;

  return (
    <div className="fixed top-0 left-0 right-0 z-[9999] h-1 bg-primary/10">
      <div
        className="h-full bg-primary transition-all duration-300 ease-out"
        style={{ width: `${progress}%` }}
      />
    </div>
  );
}
