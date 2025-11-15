import { useState, useEffect } from "react";
import { Search, Heart, MapPin, CheckCircle, ArrowRight, Loader2, Sparkles } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { PublicNavbar } from "@/components/PublicNavbar";
import { useNavigate } from "react-router-dom";
import { API_URL, getImageUrl } from "@/config/api";

interface Charity {
  id: number;
  name: string;
  mission?: string;
  vision?: string;
  category?: string;
  address?: string;
  region?: string;
  municipality?: string;
  contact_email: string;
  contact_phone?: string;
  website?: string;
  logo_path?: string;
  cover_image?: string;
  verification_status: 'pending' | 'approved' | 'rejected';
  verified_at?: string;
  owner?: {
    name: string;
  };
}

export default function PublicCharities() {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [charities, setCharities] = useState<Charity[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchCharities();
  }, []);

  const fetchCharities = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_URL}/charities`);
      if (!response.ok) throw new Error('Failed to fetch charities');
      
      const data = await response.json();
      // Handle paginated response structure: data.charities.data
      const charitiesData = data?.charities?.data || [];
      // Backend already filters for approved charities, but double-check
      const approvedCharities = Array.isArray(charitiesData) 
        ? charitiesData.filter((charity: Charity) => charity.verification_status === 'approved')
        : [];
      setCharities(approvedCharities);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load charities');
      setCharities([]); // Ensure charities is always an array
    } finally {
      setLoading(false);
    }
  };

  const categories = ["all", "Education", "Healthcare", "Environment", "Food Security"];

  const filteredCharities = (charities || []).filter(charity => {
    const matchesSearch = charity.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = categoryFilter === "all" || charity.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="min-h-screen bg-background">
      <PublicNavbar />
      
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-primary/10 via-primary/5 to-background border-b pt-20">
        <div className="max-w-7xl mx-auto px-4 py-12">
          <h1 className="text-4xl font-bold mb-4">Verified Charities</h1>
          <p className="text-xl text-muted-foreground mb-8">
            Discover trusted organizations making a real difference
          </p>

          {/* Search and Filter */}
          <div className="flex gap-4 max-w-2xl">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search charities..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9"
              />
            </div>
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                {categories.map(cat => (
                  <SelectItem key={cat} value={cat}>
                    {cat === "all" ? "All Categories" : cat}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="mb-6">
          <p className="text-muted-foreground">
            Showing {filteredCharities.length} verified {filteredCharities.length === 1 ? 'charity' : 'charities'}
          </p>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="flex justify-center items-center py-12">
            <Loader2 className="h-8 w-8 animate-spin" />
            <span className="ml-2">Loading charities...</span>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="text-center py-12">
            <p className="text-destructive mb-4">{error}</p>
            <Button onClick={fetchCharities}>Try Again</Button>
          </div>
        )}

        {/* Charities Grid */}
        {!loading && !error && (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {(filteredCharities || []).map((charity) => (
              <Card key={charity.id} className="overflow-hidden hover:shadow-lg transition-shadow cursor-pointer"
                    onClick={() => navigate(`/charities/${charity.id}`)}>
                <div className="h-48 overflow-hidden relative">
                  <img
                    src={getImageUrl(charity.cover_image, "https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?w=600")}
                    alt={charity.name}
                    className="w-full h-full object-cover"
                  />
                  <Badge className="absolute top-2 right-2 bg-green-600">
                    <CheckCircle className="mr-1 h-3 w-3" />
                    Verified
                  </Badge>
                </div>
                <CardHeader>
                  <CardTitle className="text-xl">{charity.name}</CardTitle>
                  <CardDescription className="line-clamp-2">
                    {charity.mission || charity.vision || 'Making a difference in the community'}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <MapPin className="h-4 w-4" />
                    {charity.municipality && charity.region ? 
                      `${charity.municipality}, ${charity.region}` : 
                      charity.address || 'Philippines'}
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline">{charity.category || 'Community'}</Badge>
                  </div>
                  <Button 
                    className="w-full" 
                    onClick={(e) => {
                      e.stopPropagation();
                      navigate(`/charities/${charity.id}`);
                    }}
                  >
                    <Heart className="mr-2 h-4 w-4" />
                    View Details
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Empty State */}
        {!loading && !error && (filteredCharities || []).length === 0 && (
          <div className="text-center py-12">
            <p className="text-muted-foreground mb-4">No verified charities found.</p>
            <p className="text-sm text-muted-foreground">Check back later for new organizations.</p>
          </div>
        )}

        {/* CTA Section */}
        <div className="mt-12">
          <div className="relative p-6 sm:p-10 md:p-12 lg:p-16 rounded-xl sm:rounded-3xl bg-gradient-to-br from-slate-900 to-slate-800 dark:from-slate-800 dark:to-slate-900 text-white text-center overflow-hidden">
            <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-10"></div>
            <div className="relative z-10">
              <h2 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold mb-3 sm:mb-6">Ready to Make a Difference?</h2>
              <p className="text-sm sm:text-base md:text-lg lg:text-xl text-gray-300 mb-5 sm:mb-8 lg:mb-10 max-w-2xl mx-auto px-2">
                Join thousands of donors supporting verified charities
              </p>
              <div className="flex flex-col sm:flex-row gap-2.5 sm:gap-4 justify-center">
                <Button size="lg" onClick={() => navigate('/auth/register/donor')} className="w-full sm:min-w-[200px] h-10 sm:h-11 lg:h-12 text-sm sm:text-base lg:text-lg font-semibold bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600">
                  Register as Donor
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
