import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Wrench, 
  Heart, 
  Clock, 
  Mail, 
  Twitter, 
  Facebook,
  RefreshCw,
  Sparkles
} from "lucide-react";
import { useEffect, useState } from "react";

const Maintenance = () => {
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const handleRefresh = () => {
    window.location.reload();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-primary/10 flex items-center justify-center p-4">
      <Card className="max-w-3xl w-full p-8 md:p-12 shadow-2xl border-2">
        <div className="text-center space-y-8">
          {/* Animated Icon */}
          <div className="relative inline-block">
            <div className="absolute inset-0 animate-ping">
              <Wrench className="h-24 w-24 text-primary/30" />
            </div>
            <Wrench className="h-24 w-24 text-primary relative z-10 animate-pulse" />
          </div>

          {/* Status Badge */}
          <div className="flex justify-center">
            <Badge variant="outline" className="px-4 py-2 text-base border-2 border-primary">
              <Sparkles className="h-4 w-4 mr-2 inline" />
              Under Maintenance
            </Badge>
          </div>

          {/* Main Message */}
          <div className="space-y-4">
            <h1 className="text-4xl md:text-5xl font-bold text-foreground">
              We're Making Things Better!
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto">
              Our platform is currently undergoing scheduled maintenance to improve your experience. 
              We're working hard to bring you enhanced features and better performance.
            </p>
          </div>

          {/* Decorative Hearts */}
          <div className="flex justify-center gap-6 py-6">
            <div className="animate-bounce" style={{ animationDelay: '0ms' }}>
              <Heart className="h-8 w-8 text-primary/60 fill-primary/60" />
            </div>
            <div className="animate-bounce" style={{ animationDelay: '150ms' }}>
              <Heart className="h-10 w-10 text-primary/80 fill-primary/80" />
            </div>
            <div className="animate-bounce" style={{ animationDelay: '300ms' }}>
              <Heart className="h-12 w-12 text-primary fill-primary" />
            </div>
            <div className="animate-bounce" style={{ animationDelay: '450ms' }}>
              <Heart className="h-10 w-10 text-primary/80 fill-primary/80" />
            </div>
            <div className="animate-bounce" style={{ animationDelay: '600ms' }}>
              <Heart className="h-8 w-8 text-primary/60 fill-primary/60" />
            </div>
          </div>

          {/* Expected Time */}
          <Card className="p-6 bg-primary/5 border-primary/20">
            <div className="flex items-center justify-center gap-3 text-muted-foreground">
              <Clock className="h-5 w-5" />
              <div>
                <p className="text-sm font-medium">Expected Duration</p>
                <p className="text-2xl font-bold text-foreground">2-4 Hours</p>
              </div>
            </div>
          </Card>

          {/* Current Time */}
          <div className="text-sm text-muted-foreground">
            Current Time: {time.toLocaleTimeString()}
          </div>

          {/* Action Button */}
          <div className="pt-4">
            <Button
              size="lg"
              onClick={handleRefresh}
              className="gap-2 shadow-lg hover:shadow-xl transition-all"
            >
              <RefreshCw className="h-5 w-5" />
              Check Again
            </Button>
          </div>

          {/* Contact Information */}
          <div className="pt-8 border-t space-y-4">
            <p className="text-sm font-medium text-muted-foreground">
              Need urgent assistance?
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Button variant="outline" size="sm" className="gap-2">
                <Mail className="h-4 w-4" />
                support@charityhub.com
              </Button>
              <Button variant="outline" size="sm" className="gap-2">
                <Twitter className="h-4 w-4" />
                @CharityHub
              </Button>
              <Button variant="outline" size="sm" className="gap-2">
                <Facebook className="h-4 w-4" />
                /CharityHub
              </Button>
            </div>
          </div>

          {/* Inspirational Message */}
          <div className="pt-6">
            <blockquote className="text-sm italic text-muted-foreground border-l-4 border-primary pl-4 py-2 max-w-md mx-auto text-left">
              "We make a living by what we get, but we make a life by what we give."
              <footer className="text-xs mt-2 not-italic">— Winston Churchill</footer>
            </blockquote>
          </div>

          {/* Thank You Message */}
          <div className="pt-4">
            <p className="text-sm text-muted-foreground">
              Thank you for your patience and continued support! 💙
            </p>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default Maintenance;
