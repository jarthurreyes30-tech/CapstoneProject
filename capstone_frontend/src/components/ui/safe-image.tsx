import { useState } from "react";
import { ImageOff } from "lucide-react";

interface SafeImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  src?: string;
  alt: string;
  fallback?: React.ReactNode;
  className?: string;
}

export function SafeImage({ src, alt, fallback, className = "", ...props }: SafeImageProps) {
  const [error, setError] = useState(false);
  const [loading, setLoading] = useState(true);

  const handleError = () => {
    setError(true);
    setLoading(false);
  };

  const handleLoad = () => {
    setLoading(false);
  };

  if (error || !src) {
    return (
      <div className={`flex items-center justify-center bg-gray-100 ${className}`}>
        {fallback || (
          <div className="flex flex-col items-center justify-center p-4 text-gray-400">
            <ImageOff className="h-12 w-12 mb-2" />
            <span className="text-xs text-center">{alt || "Image unavailable"}</span>
          </div>
        )}
      </div>
    );
  }

  return (
    <>
      {loading && (
        <div className={`flex items-center justify-center bg-gray-100 ${className}`}>
          <div className="animate-pulse flex flex-col items-center">
            <div className="h-12 w-12 bg-gray-300 rounded-full"></div>
          </div>
        </div>
      )}
      <img
        src={src}
        alt={alt}
        className={`${className} ${loading ? 'hidden' : ''}`}
        onError={handleError}
        onLoad={handleLoad}
        {...props}
      />
    </>
  );
}

export default SafeImage;
