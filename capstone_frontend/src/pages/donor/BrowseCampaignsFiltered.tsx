import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Search, Filter, X, MapPin, Calendar } from 'lucide-react';
import { buildApiUrl, buildStorageUrl, getAuthToken } from '@/lib/api';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';
import { CampaignCard, Campaign as CampaignCardType } from '@/components/charity/CampaignCard';
import api from '@/lib/axios';

export default function BrowseCampaignsFiltered() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [campaigns, setCampaigns] = useState<any[]>([]);
  const [filterOptions, setFilterOptions] = useState<any>(null);
  const [showFilters, setShowFilters] = useState(false);
  const [pagination, setPagination] = useState<any>(null);
  const [savedCampaignIds, setSavedCampaignIds] = useState<Set<number>>(new Set());

  // Filter state
  const [filters, setFilters] = useState({
    search: '',
    campaign_type: '',
    region: '',
    province: '',
    city: '',
    min_goal: '',
    max_goal: '',
    start_date: '',
    end_date: '',
  });

  useEffect(() => {
    fetchFilterOptions();
    fetchCampaigns();
    fetchSavedCampaigns();
  }, []);

  const fetchFilterOptions = async () => {
    try {
      const res = await fetch(buildApiUrl('/campaigns/filter-options'));
      
      if (!res.ok) {
        console.error(`Filter options fetch failed: ${res.status} ${res.statusText}`);
        return;
      }
      
      const contentType = res.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        console.error('Filter options response is not JSON:', contentType);
        return;
      }
      
      const data = await res.json();
      setFilterOptions(data);
    } catch (error) {
      console.error('Filter options error:', error);
    }
  };

  const fetchCampaigns = async (page = 1) => {
    try {
      setLoading(true);

      // Build query params
      const params = new URLSearchParams();
      Object.entries(filters).forEach(([key, value]) => {
        if (value) params.append(key, value.toString());
      });
      params.append('page', page.toString());
      params.append('per_page', '12');

      const res = await fetch(buildApiUrl(`/campaigns/filter?${params.toString()}`));
      
      if (!res.ok) {
        console.error(`Campaigns fetch failed: ${res.status} ${res.statusText}`);
        toast.error(`Failed to load campaigns: ${res.status} ${res.statusText}`);
        setLoading(false);
        return;
      }
      
      const contentType = res.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        console.error('Campaigns response is not JSON:', contentType);
        const text = await res.text();
        console.error('Response body:', text.substring(0, 200));
        toast.error('Server returned invalid response');
        setLoading(false);
        return;
      }
      
      const data = await res.json();
      
      setCampaigns(data.data || []);
      setPagination({
        current_page: data.current_page,
        last_page: data.last_page,
        total: data.total,
      });
    } catch (error) {
      console.error('Campaigns error:', error);
      toast.error('Failed to load campaigns');
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (key: string, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const applyFilters = () => {
    fetchCampaigns(1);
  };

  const clearFilters = () => {
    setFilters({
      search: '',
      campaign_type: '',
      region: '',
      province: '',
      city: '',
      min_goal: '',
      max_goal: '',
      start_date: '',
      end_date: '',
    });
    setTimeout(() => fetchCampaigns(1), 100);
  };

  const fetchSavedCampaigns = async () => {
    try {
      const response = await api.get('/me/saved');
      const data = response.data;
      const campaignIds = new Set<number>();
      
      if (data.grouped?.campaigns) {
        data.grouped.campaigns.forEach((item: any) => {
          if (item.savable_id) {
            campaignIds.add(item.savable_id);
          }
        });
      }
      
      setSavedCampaignIds(campaignIds);
    } catch (error) {
      console.error('Error fetching saved campaigns:', error);
    }
  };

  const handleSaveToggle = (campaignId: number, isSaved: boolean) => {
    setSavedCampaignIds(prev => {
      const newSet = new Set(prev);
      if (isSaved) {
        newSet.add(campaignId);
      } else {
        newSet.delete(campaignId);
      }
      return newSet;
    });
  };

  const convertToCampaignCard = (campaign: any): CampaignCardType => {
    const targetAmount = parseFloat(campaign.target_amount || 0);
    const currentAmount = parseFloat(campaign.current_amount || 0);
    const endDate = campaign.end_date || campaign.deadline_at || new Date().toISOString();
    
    // Calculate days left
    const daysLeft = Math.max(0, Math.ceil(
      (new Date(endDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)
    ));
    
    // Determine status
    let status: CampaignCardType['status'] = 'active';
    if (campaign.status === 'draft') status = 'draft';
    else if (campaign.status === 'closed' || campaign.status === 'archived') status = 'completed';
    else if (daysLeft === 0) status = 'expired';
    else if (currentAmount >= targetAmount) status = 'completed';
    
    return {
      id: campaign.id,
      title: campaign.title,
      description: campaign.description || '',
      goal: targetAmount,
      amountRaised: currentAmount,
      donorsCount: campaign.donors_count || 0,
      views: campaign.views || 0,
      status: status,
      bannerImage: campaign.cover_image_path,
      endDate: endDate,
      createdAt: campaign.created_at || new Date().toISOString(),
    };
  };

  const activeFilterCount = Object.values(filters).filter(v => v !== '').length;

  if (loading && !campaigns.length) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12 space-y-8">
        <Skeleton className="h-10 w-64" />
        <Skeleton className="h-12 w-full max-w-2xl" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map(i => (
            <div key={i} className="space-y-3">
              <Skeleton className="h-48 w-full rounded-lg" />
              <Skeleton className="h-6 w-3/4" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-2/3" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold">Browse Campaigns</h1>
          <p className="text-sm sm:text-base text-muted-foreground mt-1">
            {pagination?.total || 0} campaigns available
          </p>
        </div>
        <Button
          variant={showFilters ? 'default' : 'outline'}
          onClick={() => setShowFilters(!showFilters)}
          className="gap-2"
        >
          <Filter className="h-4 w-4" />
          Filters
          {activeFilterCount > 0 && (
            <Badge variant="secondary" className="ml-1">
              {activeFilterCount}
            </Badge>
          )}
        </Button>
      </div>

      {/* Search Bar */}
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search campaigns by title, description, or beneficiaries..."
            value={filters.search}
            onChange={(e) => handleFilterChange('search', e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && applyFilters()}
            className="pl-10"
          />
        </div>
        <Button onClick={applyFilters}>Search</Button>
      </div>

      {/* Filters Panel */}
      {showFilters && filterOptions && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Filter Campaigns</CardTitle>
              <Button variant="ghost" size="sm" onClick={clearFilters} className="gap-2">
                <X className="h-4 w-4" />
                Clear All
              </Button>
            </div>
          </CardHeader>
          <CardContent className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* Campaign Type */}
            <div className="space-y-2">
              <Label>Campaign Type</Label>
              <Select value={filters.campaign_type || undefined} onValueChange={(v) => handleFilterChange('campaign_type', v === 'all' ? '' : v)}>
                <SelectTrigger>
                  <SelectValue placeholder="All types" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All types</SelectItem>
                  {filterOptions.types.map((type: any) => (
                    <SelectItem key={type.value} value={type.value}>
                      {type.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Region */}
            <div className="space-y-2">
              <Label>Region</Label>
              <Select value={filters.region || undefined} onValueChange={(v) => handleFilterChange('region', v === 'all' ? '' : v)}>
                <SelectTrigger>
                  <SelectValue placeholder="All regions" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All regions</SelectItem>
                  {filterOptions.regions.map((region: string) => (
                    <SelectItem key={region} value={region}>
                      {region}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Province */}
            <div className="space-y-2">
              <Label>Province</Label>
              <Select value={filters.province || undefined} onValueChange={(v) => handleFilterChange('province', v === 'all' ? '' : v)}>
                <SelectTrigger>
                  <SelectValue placeholder="All provinces" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All provinces</SelectItem>
                  {filterOptions.provinces.map((province: string) => (
                    <SelectItem key={province} value={province}>
                      {province}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* City */}
            <div className="space-y-2">
              <Label>City</Label>
              <Select value={filters.city || undefined} onValueChange={(v) => handleFilterChange('city', v === 'all' ? '' : v)}>
                <SelectTrigger>
                  <SelectValue placeholder="All cities" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All cities</SelectItem>
                  {filterOptions.cities.map((city: string) => (
                    <SelectItem key={city} value={city}>
                      {city}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Min Goal */}
            <div className="space-y-2">
              <Label>Minimum Goal (₱)</Label>
              <Input
                type="number"
                placeholder="0"
                value={filters.min_goal}
                onChange={(e) => handleFilterChange('min_goal', e.target.value)}
              />
            </div>

            {/* Max Goal */}
            <div className="space-y-2">
              <Label>Maximum Goal (₱)</Label>
              <Input
                type="number"
                placeholder="No limit"
                value={filters.max_goal}
                onChange={(e) => handleFilterChange('max_goal', e.target.value)}
              />
            </div>

            {/* Start Date */}
            <div className="space-y-2">
              <Label>Start Date (From)</Label>
              <Input
                type="date"
                value={filters.start_date}
                onChange={(e) => handleFilterChange('start_date', e.target.value)}
              />
            </div>

            {/* End Date */}
            <div className="space-y-2">
              <Label>End Date (Until)</Label>
              <Input
                type="date"
                value={filters.end_date}
                onChange={(e) => handleFilterChange('end_date', e.target.value)}
              />
            </div>

            {/* Apply Button */}
            <div className="flex items-end">
              <Button onClick={applyFilters} className="w-full">
                Apply Filters
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Active Filters */}
      {activeFilterCount > 0 && !showFilters && (
        <div className="flex flex-wrap gap-2">
          {filters.campaign_type && (
            <Badge variant="secondary" className="gap-1">
              Type: {filterOptions?.types.find((t: any) => t.value === filters.campaign_type)?.label}
              <X
                className="h-3 w-3 cursor-pointer"
                onClick={() => {
                  handleFilterChange('campaign_type', '');
                  setTimeout(applyFilters, 100);
                }}
              />
            </Badge>
          )}
          {filters.region && (
            <Badge variant="secondary" className="gap-1">
              Region: {filters.region}
              <X
                className="h-3 w-3 cursor-pointer"
                onClick={() => {
                  handleFilterChange('region', '');
                  setTimeout(applyFilters, 100);
                }}
              />
            </Badge>
          )}
          {filters.province && (
            <Badge variant="secondary" className="gap-1">
              Province: {filters.province}
              <X
                className="h-3 w-3 cursor-pointer"
                onClick={() => {
                  handleFilterChange('province', '');
                  setTimeout(applyFilters, 100);
                }}
              />
            </Badge>
          )}
          {/* Add more active filter badges as needed */}
        </div>
      )}

      {/* Campaigns Grid */}
      {campaigns.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {campaigns.map((campaign) => (
            <CampaignCard
              key={campaign.id}
              campaign={convertToCampaignCard(campaign)}
              viewMode="donor"
              isSaved={savedCampaignIds.has(campaign.id)}
              onSaveToggle={handleSaveToggle}
            />
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="py-12 text-center">
            <Filter className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
            <h3 className="text-lg font-semibold mb-2">No campaigns found</h3>
            <p className="text-muted-foreground mb-4">
              Try adjusting your filters to see more results
            </p>
            <Button onClick={clearFilters} variant="outline">
              Clear Filters
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Pagination */}
      {pagination && pagination.last_page > 1 && (
        <div className="flex justify-center gap-2">
          <Button
            variant="outline"
            disabled={pagination.current_page === 1}
            onClick={() => fetchCampaigns(pagination.current_page - 1)}
          >
            Previous
          </Button>
          <div className="flex items-center gap-2 px-4">
            Page {pagination.current_page} of {pagination.last_page}
          </div>
          <Button
            variant="outline"
            disabled={pagination.current_page === pagination.last_page}
            onClick={() => fetchCampaigns(pagination.current_page + 1)}
          >
            Next
          </Button>
        </div>
      )}
    </div>
  );
}
