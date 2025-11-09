import { useLocation, useNavigate } from "react-router-dom";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Home, ArrowLeft, Heart, Search, HelpCircle } from "lucide-react";

const NotFound = () => {
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    console.error("404 Error: User attempted to access non-existent route:", location.pathname);
  }, [location.pathname]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-primary/10 flex items-center justify-center p-4">
      <Card className="max-w-2xl w-full p-8 md:p-12 shadow-2xl border-2">
        <div className="text-center space-y-6">
          {/* Animated 404 with Hearts */}
          <div className="relative">
            <h1 className="text-9xl md:text-[12rem] font-bold text-primary/20 select-none">
              404
            </h1>
            <div className="absolute inset-0 flex items-center justify-center">
              <Heart className="h-16 w-16 md:h-24 md:w-24 text-primary fill-primary animate-pulse" />
            </div>
          </div>

          {/* Message */}
          <div className="space-y-3">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground">
              Page Not Found
            </h2>
            <p className="text-lg text-muted-foreground max-w-md mx-auto">
              Oops! The page you're looking for seems to have wandered off. 
              But don't worry, there are many ways to make a difference!
            </p>
          </div>

          {/* Decorative Elements */}
          <div className="flex justify-center gap-4 py-4">
            <div className="animate-bounce delay-100">
              <Heart className="h-8 w-8 text-primary/60 fill-primary/60" />
            </div>
            <div className="animate-bounce delay-200">
              <Heart className="h-10 w-10 text-primary/80 fill-primary/80" />
            </div>
            <div className="animate-bounce delay-300">
              <Heart className="h-8 w-8 text-primary/60 fill-primary/60" />
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
            <Button
              size="lg"
              onClick={() => navigate('/')}
              className="gap-2 shadow-lg hover:shadow-xl transition-all"
            >
              <Home className="h-5 w-5" />
              Go Home
            </Button>
            <Button
              size="lg"
              variant="outline"
              onClick={() => navigate(-1)}
              className="gap-2"
            >
              <ArrowLeft className="h-5 w-5" />
              Go Back
            </Button>
          </div>

          {/* Quick Links */}
          <div className="pt-8 border-t">
            <p className="text-sm text-muted-foreground mb-4">
              Looking for something specific?
            </p>
            <div className="flex flex-wrap justify-center gap-3">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate('/charities')}
                className="gap-2"
              >
                <Search className="h-4 w-4" />
                Browse Charities
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate('/about')}
                className="gap-2"
              >
                <HelpCircle className="h-4 w-4" />
                About Us
              </Button>
            </div>
          </div>

          {/* Inspirational Quote */}
          <div className="pt-6">
            <blockquote className="text-sm italic text-muted-foreground border-l-4 border-primary pl-4 py-2 max-w-md mx-auto text-left">
              "The best way to find yourself is to lose yourself in the service of others."
              <footer className="text-xs mt-2 not-italic">— Mahatma Gandhi</footer>
            </blockquote>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default NotFound;
