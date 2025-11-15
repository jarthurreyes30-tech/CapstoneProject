import { Heart, Shield, TrendingUp, Users, CheckCircle, ArrowRight, Sparkles, Zap } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { PublicNavbar } from "@/components/PublicNavbar";
import { useNavigate } from "react-router-dom";

export default function PublicAbout() {
  const navigate = useNavigate();

  const features = [
    {
      icon: Shield,
      title: "Verified Charities",
      description: "All charities are thoroughly verified and vetted before being listed"
    },
    {
      icon: TrendingUp,
      title: "Full Transparency",
      description: "Track exactly how your donations are being used with detailed reports"
    },
    {
      icon: Heart,
      title: "Easy Donations",
      description: "Simple and secure donation process with multiple payment options"
    },
    {
      icon: Users,
      title: "Community Impact",
      description: "Join thousands of donors making a real difference"
    }
  ];

  const stats = [
    { label: "Total Donations", value: "₱50M+", icon: Heart },
    { label: "Verified Charities", value: "150+", icon: Shield },
    { label: "Active Donors", value: "10,000+", icon: Users },
    { label: "Lives Impacted", value: "100,000+", icon: TrendingUp }
  ];

  const values = [
    {
      title: "Transparency",
      description: "Complete transparency in every donation. Track how funds are used with detailed reports."
    },
    {
      title: "Accountability",
      description: "Charities are held accountable. We verify legitimacy and monitor activities."
    },
    {
      title: "Impact",
      description: "Focus on creating real, measurable impact. Your donations directly help those in need."
    },
    {
      title: "Trust",
      description: "Building trust between donors and charities. Every transaction is secure and legitimate."
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      <PublicNavbar />
      
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-primary/10 via-primary/5 to-background border-b pt-20 sm:pt-20 lg:pt-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-14 lg:py-16 text-center">
          <div className="inline-flex items-center gap-2 sm:gap-3 mb-4 sm:mb-6 animate-in fade-in slide-in-from-top-4 duration-1000">
            <div className="relative group">
              {/* Outer glow rings */}
              <div className="absolute inset-0 bg-gradient-to-br from-orange-500 via-amber-500 to-yellow-500 rounded-xl sm:rounded-2xl blur-xl opacity-50 group-hover:opacity-70 transition-opacity animate-pulse"></div>
              <div className="absolute inset-0 bg-gradient-to-tr from-yellow-400 to-orange-600 rounded-xl sm:rounded-2xl blur-lg opacity-40 animate-pulse" style={{ animationDelay: '0.5s' }}></div>
              
              {/* Main logo container with 3D effect */}
              <div className="relative w-12 h-12 sm:w-16 sm:h-16 md:w-20 md:h-20 rounded-xl sm:rounded-2xl bg-gradient-to-br from-orange-500 via-amber-500 to-yellow-500 flex items-center justify-center shadow-2xl transform group-hover:scale-105 transition-all duration-300">
                {/* Inner gradient overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent rounded-xl sm:rounded-2xl"></div>
                
                {/* Main heart icon */}
                <Heart className="relative h-6 w-6 sm:h-8 sm:w-8 md:h-10 md:w-10 text-white fill-white drop-shadow-lg" />
                
                {/* Decorative sparkles */}
                <Sparkles className="absolute -top-1 -right-1 sm:-top-2 sm:-right-2 h-4 w-4 sm:h-5 sm:w-5 text-yellow-300 fill-yellow-300 animate-pulse drop-shadow-lg" />
                <Zap className="absolute -bottom-1 -left-1 sm:-bottom-2 sm:-left-2 h-3 w-3 sm:h-4 sm:w-4 text-orange-300 fill-orange-300 animate-pulse" style={{ animationDelay: '0.3s' }} />
              </div>
            </div>
            <h2 className="text-xl sm:text-3xl md:text-4xl font-bold bg-gradient-to-r from-orange-600 via-amber-600 to-yellow-600 bg-clip-text text-transparent drop-shadow-sm">
              GiveOra
            </h2>
          </div>
          <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold mb-4 sm:mb-6 px-2">
            Connecting Generous Hearts with Worthy Causes
          </h1>
          <p className="text-base sm:text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto mb-6 sm:mb-8 px-4">
            GiveOra is a transparent donation platform that connects donors with verified charities,
            ensuring your contributions make a real difference in communities across the Philippines.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center px-4">
            <Button size="lg" onClick={() => navigate('/auth/register')} className="w-full sm:w-auto h-11 sm:h-12">
              <Heart className="mr-2 h-4 w-4 sm:h-5 sm:w-5" />
              Start Donating
            </Button>
            <Button size="lg" variant="outline" onClick={() => navigate('/charities')} className="w-full sm:w-auto h-11 sm:h-12">
              Browse Charities
            </Button>
          </div>
        </div>
      </div>

      {/* Stats Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-14 lg:py-16">
        <div className="grid gap-4 sm:gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
          {stats.map((stat, index) => (
            <Card key={index}>
              <CardContent className="pt-5 sm:pt-6">
                <div className="flex items-center gap-3 sm:gap-4">
                  <div className="p-2 sm:p-3 bg-primary/10 rounded-lg">
                    <stat.icon className="h-5 w-5 sm:h-6 sm:w-6 text-primary" />
                  </div>
                  <div>
                    <p className="text-2xl sm:text-3xl font-bold">{stat.value}</p>
                    <p className="text-xs sm:text-sm text-muted-foreground">{stat.label}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Mission & Vision */}
      <div className="bg-muted/50 py-12 sm:py-14 lg:py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid gap-6 sm:gap-8 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="text-xl sm:text-2xl">Our Mission</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground leading-relaxed">
                  To create a transparent and trustworthy platform that empowers individuals to support
                  verified charitable organizations, ensuring every donation creates meaningful impact
                  in communities across the Philippines.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-xl sm:text-2xl">Our Vision</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground leading-relaxed">
                  A future where charitable giving is transparent, accessible, and impactful for everyone.
                  We envision a society where donors can confidently support causes they care about.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Features */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-14 lg:py-16">
        <div className="text-center mb-8 sm:mb-10 lg:mb-12 px-2">
          <h2 className="text-2xl sm:text-3xl font-bold mb-3 sm:mb-4">Why Choose GiveOra?</h2>
          <p className="text-base sm:text-lg md:text-xl text-muted-foreground">
            We make charitable giving transparent, secure, and impactful
          </p>
        </div>

        <div className="grid gap-4 sm:gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
          {features.map((feature, index) => (
            <Card key={index} className="text-center">
              <CardHeader>
                <div className="mx-auto p-3 bg-primary/10 rounded-lg w-fit mb-4">
                  <feature.icon className="h-8 w-8 text-primary" />
                </div>
                <CardTitle>{feature.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">{feature.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Our Values */}
      <div className="bg-muted/50 py-12 sm:py-14 lg:py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8 sm:mb-10 lg:mb-12 px-2">
            <h2 className="text-2xl sm:text-3xl font-bold mb-3 sm:mb-4">Our Core Values</h2>
            <p className="text-base sm:text-lg md:text-xl text-muted-foreground">
              The principles that guide everything we do
            </p>
          </div>

          <div className="grid gap-4 sm:gap-6 md:grid-cols-2">
            {values.map((value, index) => (
              <Card key={index}>
                <CardHeader>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-5 w-5 text-primary" />
                    <CardTitle>{value.title}</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">{value.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>

      {/* How It Works */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-14 lg:py-16">
        <div className="text-center mb-8 sm:mb-10 lg:mb-12 px-2">
          <h2 className="text-2xl sm:text-3xl font-bold mb-3 sm:mb-4">How It Works</h2>
          <p className="text-base sm:text-lg md:text-xl text-muted-foreground">
            Simple steps to make a difference
          </p>
        </div>

        <div className="grid gap-6 sm:gap-8 grid-cols-1 sm:grid-cols-2 md:grid-cols-3">
          <div className="text-center px-2">
            <div className="mx-auto w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-lg sm:text-xl md:text-2xl font-bold mb-3 sm:mb-4">
              1
            </div>
            <h3 className="text-lg sm:text-xl font-bold mb-2">Browse Charities</h3>
            <p className="text-muted-foreground">
              Explore our list of verified charities and their active campaigns
            </p>
          </div>

          <div className="text-center px-2">
            <div className="mx-auto w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-lg sm:text-xl md:text-2xl font-bold mb-3 sm:mb-4">
              2
            </div>
            <h3 className="text-lg sm:text-xl font-bold mb-2">Make a Donation</h3>
            <p className="text-muted-foreground">
              Choose your amount and payment method. Upload proof of payment
            </p>
          </div>

          <div className="text-center px-2">
            <div className="mx-auto w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-lg sm:text-xl md:text-2xl font-bold mb-3 sm:mb-4">
              3
            </div>
            <h3 className="text-lg sm:text-xl font-bold mb-2">Track Impact</h3>
            <p className="text-muted-foreground">
              See exactly how your donation is being used through transparency reports
            </p>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="container mx-auto px-3 sm:px-6 lg:px-8 py-8 sm:py-16 lg:py-20">
        <div className="max-w-4xl mx-auto">
          <div className="relative p-6 sm:p-10 md:p-12 lg:p-16 rounded-xl sm:rounded-3xl bg-gradient-to-br from-slate-900 to-slate-800 dark:from-slate-800 dark:to-slate-900 text-white text-center overflow-hidden">
            <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-10"></div>
            <div className="relative z-10">
              <h2 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold mb-3 sm:mb-6">Ready to Make a Difference?</h2>
              <p className="text-sm sm:text-base md:text-lg lg:text-xl text-gray-300 mb-5 sm:mb-8 lg:mb-10 max-w-2xl mx-auto px-2">
                Join thousands of donors and charities making a real difference. Start your journey today.
              </p>
              <div className="flex flex-col sm:flex-row gap-2.5 sm:gap-4 justify-center">
                <Button size="lg" onClick={() => navigate('/auth/register')} className="w-full sm:min-w-[200px] h-10 sm:h-11 lg:h-12 text-sm sm:text-base lg:text-lg font-semibold bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600">
                  Get Started Free
                  <ArrowRight className="ml-2 h-4 w-4 sm:h-5 sm:w-5" />
                </Button>
                <Button size="lg" variant="secondary" onClick={() => navigate('/auth/login')} className="w-full sm:min-w-[200px] h-10 sm:h-11 lg:h-12 text-sm sm:text-base lg:text-lg font-semibold bg-white text-slate-900 hover:bg-gray-100 hover:text-slate-900 border-0">
                  Sign In
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="border-t mt-8 sm:mt-16 lg:mt-20 bg-muted/30">
        <div className="container mx-auto px-3 sm:px-6 lg:px-8 py-6 sm:py-10 lg:py-12">
          <div className="max-w-6xl mx-auto">
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6 sm:gap-8 mb-6 sm:mb-8">
              <div className="sm:col-span-2 md:col-span-2">
                <div className="flex items-center gap-2 mb-3 sm:mb-4">
                  <div className="relative group">
                    {/* Glow effect */}
                    <div className="absolute inset-0 bg-gradient-to-br from-orange-500 to-amber-500 rounded-lg sm:rounded-xl blur-md opacity-50 group-hover:opacity-70 transition-opacity"></div>
                    {/* Main logo */}
                    <div className="relative w-8 h-8 sm:w-10 sm:h-10 rounded-lg sm:rounded-xl bg-gradient-to-br from-orange-500 via-amber-500 to-yellow-500 flex items-center justify-center shadow-lg">
                      <Heart className="h-4 w-4 sm:h-5 sm:w-5 text-white fill-white" />
                      <Sparkles className="absolute -top-0.5 -right-0.5 h-2 w-2 sm:h-2.5 sm:w-2.5 text-yellow-300 fill-yellow-300" />
                    </div>
                  </div>
                  <span className="text-lg sm:text-xl font-bold bg-gradient-to-r from-orange-600 via-amber-600 to-yellow-600 bg-clip-text text-transparent">GiveOra</span>
                </div>
                <p className="text-sm sm:text-base text-muted-foreground mb-4">
                  Connecting donors with verified charities to create lasting impact in communities.
                </p>
              </div>
              <div>
                <h4 className="text-sm sm:text-base font-semibold mb-3 sm:mb-4">Platform</h4>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li><a href="/charities" className="hover:text-primary transition-colors">Browse Charities</a></li>
                  <li><a href="/about" className="hover:text-primary transition-colors">About Us</a></li>
                </ul>
              </div>
              <div>
                <h4 className="text-sm sm:text-base font-semibold mb-3 sm:mb-4">Get Started</h4>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li><a href="/auth/register/donor" className="hover:text-primary transition-colors">Donor Registration</a></li>
                  <li><a href="/auth/register/charity" className="hover:text-primary transition-colors">Charity Registration</a></li>
                </ul>
              </div>
            </div>
            <div className="border-t pt-6 sm:pt-8 text-center text-xs sm:text-sm text-muted-foreground">
              <p>&copy; 2025 GiveOra. Built with purpose for a better tomorrow.</p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
