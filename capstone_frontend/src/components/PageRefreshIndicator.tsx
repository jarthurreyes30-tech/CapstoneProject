import { useEffect, useState } from "react";
import { Heart, RefreshCw } from "lucide-react";
import { Progress } from "@/components/ui/progress";

export function PageRefreshIndicator({ message = "Refreshing..." }: { message?: string }) {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setProgress((prev) => (prev >= 95 ? prev : prev + Math.random() * 15));
    }, 200);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm flex items-center justify-center">
      <div className="bg-card border-2 rounded-lg p-8 shadow-2xl max-w-md w-full mx-4">
        <div className="text-center space-y-6">
          <div className="relative inline-block">
            <div className="absolute inset-0 animate-ping opacity-75">
              <RefreshCw className="h-16 w-16 text-primary/30" />
            </div>
            <RefreshCw className="h-16 w-16 text-primary animate-spin" />
          </div>
          
          <div className="space-y-2">
            <h3 className="text-xl font-semibold">{message}</h3>
            <p className="text-sm text-muted-foreground">Please wait...</p>
          </div>

          <div className="space-y-2">
            <Progress value={progress} className="h-2" />
            <p className="text-xs text-muted-foreground">{Math.round(progress)}%</p>
          </div>

          <div className="flex justify-center gap-2">
            <Heart className="h-6 w-6 text-primary fill-primary animate-pulse" />
            <Heart className="h-6 w-6 text-primary fill-primary animate-pulse delay-150" />
            <Heart className="h-6 w-6 text-primary fill-primary animate-pulse delay-300" />
          </div>
        </div>
      </div>
    </div>
  );
}

// Top bar version (less intrusive)
export function TopBarRefreshIndicator() {
  return (
    <div className="fixed top-0 left-0 right-0 z-50 bg-primary h-1">
      <div className="h-full bg-primary-foreground animate-pulse" 
           style={{ animation: 'slide 1.5s ease-in-out infinite' }} />
      <style>{`
        @keyframes slide {
          0%, 100% { transform: translateX(-100%); }
          50% { transform: translateX(100%); }
        }
      `}</style>
    </div>
  );
}
