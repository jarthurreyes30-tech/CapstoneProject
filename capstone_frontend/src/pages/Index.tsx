import { Link } from 'react-router-dom';
import { Heart, Building2, ArrowRight, Shield, TrendingUp, Users, Target, CheckCircle2, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { PublicNavbar } from '@/components/PublicNavbar';
import { useEffect, useState } from 'react';
import axios from '@/lib/axios';

interface Stats {
  total_charities: number;
  total_campaigns: number;
  total_donors: number;
  total_donations: number;
  total_donation_count: number;
  lives_impacted: number;
}

const Index = () => {
  const [stats, setStats] = useState<Stats>({
    total_charities: 0,
    total_campaigns: 0,
    total_donors: 0,
    total_donations: 0,
    total_donation_count: 0,
    lives_impacted: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await axios.get('/public/stats');
        setStats(response.data);
      } catch (error) {
        console.error('Error fetching stats:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchStats();
  }, []);

  const formatNumber = (num: number) => {
    if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
    if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
    return num.toLocaleString();
  };

  const formatCurrency = (amount: number) => {
    return '₱' + amount.toLocaleString('en-PH', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
      {/* Navbar */}
      <PublicNavbar />
      
      {/* Hero Section */}
      <div className="container mx-auto px-4 py-16 pt-28">
        <div className="max-w-6xl mx-auto text-center space-y-8">
          {/* Logo/Brand Area */}
          <div className="inline-flex items-center gap-3 mb-4 animate-in fade-in slide-in-from-top-4 duration-1000">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-orange-500 to-amber-500 flex items-center justify-center shadow-lg">
              <Heart className="h-7 w-7 text-white fill-white" />
            </div>
            <h2 className="text-3xl font-bold bg-gradient-to-r from-orange-600 to-amber-600 bg-clip-text text-transparent">CharityConnect</h2>
          </div>

          {/* Hero Content */}
          <div className="space-y-6 animate-in fade-in slide-in-from-top-6 duration-1000 delay-150">
            <h1 className="text-5xl md:text-7xl font-bold tracking-tight leading-tight">
              Making a difference,
              <span className="block text-transparent bg-clip-text bg-gradient-to-r from-orange-500 via-amber-500 to-yellow-500"> together</span>
            </h1>
            <p className="text-xl md:text-2xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
              Connect with verified charities. Support meaningful causes. Create lasting impact in your community through transparent and secure giving.
            </p>
          </div>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-6 animate-in fade-in slide-in-from-top-8 duration-1000 delay-300">
            <Link to="/auth/register">
              <Button size="lg" className="min-w-[220px] h-14 text-lg font-semibold bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 shadow-lg hover:shadow-xl transition-all">
                Get Started
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
            <Link to="/charities">
              <Button size="lg" variant="outline" className="min-w-[220px] h-14 text-lg font-semibold border-2 hover:bg-accent">
                Browse Charities
              </Button>
            </Link>
          </div>

        </div>
      </div>

      {/* Statistics Section */}
      <div className="container mx-auto px-4 py-20">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-orange-100 dark:bg-orange-950 text-orange-700 dark:text-orange-300 mb-4">
              <Sparkles className="h-4 w-4" />
              <span className="text-sm font-semibold">Real-time Impact</span>
            </div>
            <h2 className="text-4xl md:text-5xl font-bold mb-4">Our Growing Community</h2>
            <p className="text-lg text-muted-foreground">Together, we're making a real difference</p>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
            <div className="col-span-2 p-8 rounded-2xl bg-gradient-to-br from-orange-500 to-amber-600 text-white shadow-xl">
              <div className="flex items-center gap-3 mb-3">
                <div className="p-3 bg-white/20 rounded-xl backdrop-blur-sm">
                  <TrendingUp className="h-6 w-6" />
                </div>
                <div>
                  <p className="text-sm font-medium opacity-90">Total Raised</p>
                  <p className="text-3xl md:text-4xl font-bold">
                    {loading ? '...' : formatCurrency(stats.total_donations)}
                  </p>
                </div>
              </div>
              <p className="text-sm opacity-80 mt-2">From {formatNumber(stats.total_donation_count)} donations</p>
            </div>

            <div className="p-6 rounded-2xl bg-card border-2 border-border hover:border-orange-500 transition-all hover:shadow-lg group">
              <div className="flex flex-col items-center text-center">
                <div className="p-3 rounded-xl bg-blue-100 dark:bg-blue-950 text-blue-600 dark:text-blue-400 mb-3 group-hover:scale-110 transition-transform">
                  <Building2 className="h-6 w-6" />
                </div>
                <p className="text-3xl font-bold mb-1">{loading ? '...' : formatNumber(stats.total_charities)}</p>
                <p className="text-sm text-muted-foreground font-medium">Verified Charities</p>
              </div>
            </div>

            <div className="p-6 rounded-2xl bg-card border-2 border-border hover:border-orange-500 transition-all hover:shadow-lg group">
              <div className="flex flex-col items-center text-center">
                <div className="p-3 rounded-xl bg-green-100 dark:bg-green-950 text-green-600 dark:text-green-400 mb-3 group-hover:scale-110 transition-transform">
                  <Target className="h-6 w-6" />
                </div>
                <p className="text-3xl font-bold mb-1">{loading ? '...' : formatNumber(stats.total_campaigns)}</p>
                <p className="text-sm text-muted-foreground font-medium">Active Campaigns</p>
              </div>
            </div>

            <div className="p-6 rounded-2xl bg-card border-2 border-border hover:border-orange-500 transition-all hover:shadow-lg group">
              <div className="flex flex-col items-center text-center">
                <div className="p-3 rounded-xl bg-purple-100 dark:bg-purple-950 text-purple-600 dark:text-purple-400 mb-3 group-hover:scale-110 transition-transform">
                  <Users className="h-6 w-6" />
                </div>
                <p className="text-3xl font-bold mb-1">{loading ? '...' : formatNumber(stats.total_donors)}</p>
                <p className="text-sm text-muted-foreground font-medium">Active Donors</p>
              </div>
            </div>

            <div className="p-6 rounded-2xl bg-card border-2 border-border hover:border-orange-500 transition-all hover:shadow-lg group">
              <div className="flex flex-col items-center text-center">
                <div className="p-3 rounded-xl bg-rose-100 dark:bg-rose-950 text-rose-600 dark:text-rose-400 mb-3 group-hover:scale-110 transition-transform">
                  <Heart className="h-6 w-6" />
                </div>
                <p className="text-3xl font-bold mb-1">{loading ? '...' : formatNumber(stats.lives_impacted)}</p>
                <p className="text-sm text-muted-foreground font-medium">Lives Impacted</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Why Choose Us Section */}
      <div className="container mx-auto px-4 py-20">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-4">Why Choose CharityConnect?</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              A platform built on trust, transparency, and meaningful impact
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="p-8 rounded-2xl bg-card border-2 border-border hover:border-orange-500 transition-all hover:shadow-xl group">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <Shield className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-2xl font-bold mb-4">100% Verified</h3>
              <p className="text-muted-foreground leading-relaxed">
                Every charity undergoes rigorous verification. Your donations reach legitimate organizations committed to making a difference.
              </p>
              <ul className="mt-6 space-y-3">
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                  <span className="text-sm">Document verification</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                  <span className="text-sm">Background checks</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                  <span className="text-sm">Continuous monitoring</span>
                </li>
              </ul>
            </div>

            <div className="p-8 rounded-2xl bg-card border-2 border-border hover:border-orange-500 transition-all hover:shadow-xl group">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-green-500 to-green-600 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <TrendingUp className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-2xl font-bold mb-4">Full Transparency</h3>
              <p className="text-muted-foreground leading-relaxed">
                Track exactly how your donations are used. View real-time updates, fund allocations, and campaign milestones.
              </p>
              <ul className="mt-6 space-y-3">
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                  <span className="text-sm">Real-time tracking</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                  <span className="text-sm">Detailed fund reports</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                  <span className="text-sm">Impact measurements</span>
                </li>
              </ul>
            </div>

            <div className="p-8 rounded-2xl bg-card border-2 border-border hover:border-orange-500 transition-all hover:shadow-xl group">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-purple-500 to-purple-600 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <Heart className="h-8 w-8 text-white fill-white" />
              </div>
              <h3 className="text-2xl font-bold mb-4">Real Impact</h3>
              <p className="text-muted-foreground leading-relaxed">
                Join a community dedicated to creating lasting change. Every contribution directly supports those in need.
              </p>
              <ul className="mt-6 space-y-3">
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                  <span className="text-sm">Direct contributions</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                  <span className="text-sm">Measurable outcomes</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                  <span className="text-sm">Community stories</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Call to Action Cards */}
      <div className="container mx-auto px-4 py-20">
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-2 gap-8">
            {/* For Donors */}
            <div className="relative p-10 rounded-3xl bg-gradient-to-br from-orange-500 to-amber-600 text-white overflow-hidden group hover:shadow-2xl transition-all">
              <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -mr-32 -mt-32 group-hover:scale-150 transition-transform duration-700"></div>
              <div className="relative z-10">
                <div className="w-20 h-20 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center mb-6">
                  <Heart className="h-10 w-10" />
                </div>
                <h3 className="text-3xl font-bold mb-4">For Donors</h3>
                <p className="text-lg mb-6 opacity-90 leading-relaxed">
                  Make a difference with every donation. Browse verified charities, support campaigns you care about, and track your impact in real-time.
                </p>
                <ul className="space-y-3 mb-8">
                  <li className="flex items-center gap-3">
                    <CheckCircle2 className="h-5 w-5 flex-shrink-0" />
                    <span>Secure payment processing</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <CheckCircle2 className="h-5 w-5 flex-shrink-0" />
                    <span>Tax-deductible receipts</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <CheckCircle2 className="h-5 w-5 flex-shrink-0" />
                    <span>Anonymous giving options</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <CheckCircle2 className="h-5 w-5 flex-shrink-0" />
                    <span>Impact tracking dashboard</span>
                  </li>
                </ul>
                <Link to="/auth/register/donor">
                  <Button size="lg" className="bg-white text-orange-600 hover:bg-gray-100 font-semibold group/btn">
                    Start Giving Today
                    <ArrowRight className="ml-2 h-5 w-5 group-hover/btn:translate-x-1 transition-transform" />
                  </Button>
                </Link>
              </div>
            </div>

            {/* For Charities */}
            <div className="relative p-10 rounded-3xl bg-gradient-to-br from-blue-600 to-indigo-700 text-white overflow-hidden group hover:shadow-2xl transition-all">
              <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -mr-32 -mt-32 group-hover:scale-150 transition-transform duration-700"></div>
              <div className="relative z-10">
                <div className="w-20 h-20 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center mb-6">
                  <Building2 className="h-10 w-10" />
                </div>
                <h3 className="text-3xl font-bold mb-4">For Charities</h3>
                <p className="text-lg mb-6 opacity-90 leading-relaxed">
                  Amplify your mission and reach more donors. Create compelling campaigns, share your impact, and build lasting relationships with supporters.
                </p>
                <ul className="space-y-3 mb-8">
                  <li className="flex items-center gap-3">
                    <CheckCircle2 className="h-5 w-5 flex-shrink-0" />
                    <span>Campaign management tools</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <CheckCircle2 className="h-5 w-5 flex-shrink-0" />
                    <span>Donor relationship management</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <CheckCircle2 className="h-5 w-5 flex-shrink-0" />
                    <span>Transparent fund tracking</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <CheckCircle2 className="h-5 w-5 flex-shrink-0" />
                    <span>Analytics & reporting</span>
                  </li>
                </ul>
                <Link to="/auth/register/charity">
                  <Button size="lg" className="bg-white text-blue-600 hover:bg-gray-100 font-semibold group/btn">
                    Join Our Platform
                    <ArrowRight className="ml-2 h-5 w-5 group-hover/btn:translate-x-1 transition-transform" />
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Final CTA Section */}
      <div className="container mx-auto px-4 py-20">
        <div className="max-w-4xl mx-auto">
          <div className="relative p-12 md:p-16 rounded-3xl bg-gradient-to-br from-slate-900 to-slate-800 dark:from-slate-800 dark:to-slate-900 text-white text-center overflow-hidden">
            <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-10"></div>
            <div className="relative z-10">
              <h2 className="text-4xl md:text-5xl font-bold mb-6">Ready to Make an Impact?</h2>
              <p className="text-xl text-gray-300 mb-10 max-w-2xl mx-auto">
                Join thousands of donors and charities making a real difference. Start your journey today.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link to="/auth/register">
                  <Button size="lg" className="min-w-[200px] h-14 text-lg font-semibold bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600">
                    Get Started Free
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                </Link>
                <Link to="/auth/login">
                  <Button size="lg" variant="outline" className="min-w-[200px] h-14 text-lg font-semibold border-2 border-white/20 hover:bg-white/10 text-white">
                    Sign In
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="border-t mt-20 bg-muted/30">
        <div className="container mx-auto px-4 py-12">
          <div className="max-w-6xl mx-auto">
            <div className="grid md:grid-cols-4 gap-8 mb-8">
              <div className="md:col-span-2">
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-orange-500 to-amber-500 flex items-center justify-center">
                    <Heart className="h-5 w-5 text-white fill-white" />
                  </div>
                  <span className="text-xl font-bold">CharityConnect</span>
                </div>
                <p className="text-muted-foreground mb-4">
                  Connecting donors with verified charities to create lasting impact in communities.
                </p>
              </div>
              <div>
                <h4 className="font-semibold mb-4">Platform</h4>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li><Link to="/charities" className="hover:text-primary transition-colors">Browse Charities</Link></li>
                  <li><Link to="/about" className="hover:text-primary transition-colors">About Us</Link></li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold mb-4">Get Started</h4>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li><Link to="/auth/register/donor" className="hover:text-primary transition-colors">Donor Registration</Link></li>
                  <li><Link to="/auth/register/charity" className="hover:text-primary transition-colors">Charity Registration</Link></li>
                </ul>
              </div>
            </div>
            <div className="border-t pt-8 text-center text-sm text-muted-foreground">
              <p>&copy; 2025 CharityConnect. Built with purpose for a better tomorrow.</p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
