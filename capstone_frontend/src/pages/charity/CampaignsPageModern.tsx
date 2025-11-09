import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { CampaignCard, Campaign } from "@/components/charity/CampaignCard";
import { CampaignCardSkeleton } from "@/components/charity/CampaignCardSkeleton";
import { Search, Plus, Grid3x3, List, Filter } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { charityService } from "@/services/charity";
import { CreateCampaignModal } from "@/components/charity/CreateCampaignModal";

/**
 * Modern Campaigns Page with Card View
 * Features card grid layout with filters and search
 */
const CampaignsPageModern = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [campaignToDelete, setCampaignToDelete] = useState<number | null>(null);
  const [isCreateOpen, setIsCreateOpen] = useState(false);

  useEffect(() => {
    loadCampaigns();
  }, [statusFilter]);

  const mapBackendStatus = (status?: string, endDate?: string, currentAmount?: number, targetAmount?: number): Campaign["status"] => {
    const s = (status || "").toLowerCase();
    
    // If status is draft, keep it as draft
    if (s === "draft") return "draft";
    
    // Check if campaign has ended (past end date)
    const now = new Date();
    const campaignEndDate = endDate ? new Date(endDate) : null;
    const hasEnded = campaignEndDate && campaignEndDate < now;
    
    // Calculate if goal is reached
    const goalReached = targetAmount && currentAmount && currentAmount >= targetAmount;
    
    // If campaign has ended OR goal is reached, mark as completed
    if (hasEnded || goalReached) {
      return "completed";
    }
    
    // Map backend statuses that explicitly indicate completion
    if (s === "completed" || s === "closed" || s === "archived") {
      return "completed";
    }
    
    // Active campaigns
    if (s === "published" || s === "active") return "active";
    
    return "active";
  };

  const loadCampaigns = async () => {
    try {
      setLoading(true);

      // Map UI filter to backend status values
      // For "completed", we fetch all published campaigns and filter client-side
      // because completed status is determined by end date and goal
      const backendStatus =
        statusFilter === "all" || statusFilter === "completed"
          ? undefined
          : statusFilter === "active"
          ? "published"
          : statusFilter === "pending"
          ? "draft"
          : statusFilter === "expired"
          ? "archived"
          : statusFilter;

      // Fetch campaigns for the authenticated charity admin (no charity ID needed)
      console.log('[STEP 1] Fetching campaigns with status:', backendStatus);
      
      const res = await charityService.getMyCampaigns({
        status: backendStatus,
      });
      
      console.log('[STEP 2] API Response received:', res);
      console.log('[STEP 2a] Response type:', typeof res);
      console.log('[STEP 2b] Response.data type:', typeof res.data);
      console.log('[STEP 2c] Response.data:', res.data);
      
      // Handle Laravel pagination response structure
      // The response is { data: [...], current_page, last_page, total, ... }
      const backendCampaigns = Array.isArray(res.data) ? res.data : (Array.isArray(res) ? res : []);
      
      console.log('[STEP 3] Backend campaigns extracted:', backendCampaigns);
      console.log('[STEP 3a] Campaigns count:', backendCampaigns.length);
      console.log('[STEP 3b] First campaign:', backendCampaigns[0]);

      // Map backend fields to CampaignCard type
      console.log('[STEP 4] Starting to map campaigns...');
      
      const mapped: Campaign[] = backendCampaigns
        .filter((c: any) => {
          console.log('[STEP 4a] Filtering campaign:', c?.id, c?.title);
          return c;
        })
        .map((c: any) => {
          console.log('[STEP 4b] Mapping campaign:', c.id, c.title);
          const mappedCampaign = {
          id: c.id,
          title: c.title,
          description: c.description || "",
          goal: c.target_amount || 0,
          amountRaised: c.current_amount || 0,
          donorsCount: c.donors_count || 0,
          views: c.views || 0,
          status: mapBackendStatus(c.status, c.end_date || c.deadline_at, c.current_amount, c.target_amount),
          bannerImage: c.cover_image_path || c.banner_image || c.image_path,
          endDate: c.end_date || c.deadline_at || "",
          createdAt: c.start_date || c.created_at,
        };
          console.log('[STEP 4c] Mapped campaign result:', mappedCampaign);
          return mappedCampaign;
        });

      console.log('[STEP 5] Mapped campaigns count:', mapped.length);
      console.log('[STEP 5a] Mapped campaigns:', mapped);
      
      // Filter by search and status (client-side)
      let filtered = mapped;
      
      // Apply search filter
      if (search) {
        console.log('[STEP 6] Applying search filter:', search);
        filtered = filtered.filter(
          (c) =>
            c.title.toLowerCase().includes(search.toLowerCase()) ||
            c.description.toLowerCase().includes(search.toLowerCase())
        );
        console.log('[STEP 6a] After search filter:', filtered.length);
      }
      
      // Apply status filter (client-side) to handle auto-determined statuses
      if (statusFilter !== "all") {
        console.log('[STEP 7] Applying status filter:', statusFilter);
        filtered = filtered.filter((c) => {
          const matches = 
            (statusFilter === "active" && c.status === "active") ||
            (statusFilter === "completed" && c.status === "completed") ||
            (statusFilter === "pending" && c.status === "draft");
          console.log('[STEP 7a] Campaign', c.id, 'status:', c.status, 'matches:', matches);
          return matches;
        });
        console.log('[STEP 7b] After status filter:', filtered.length);
      }

      console.log('[STEP 8] Final filtered campaigns:', filtered);
      console.log('[STEP 8a] Final count:', filtered.length);
      console.log('[STEP 9] Setting campaigns state...');
      setCampaigns(filtered);
      console.log('[STEP 10] ✓ Campaigns state set successfully!');
      console.log('=== CAMPAIGN LOADING COMPLETE ===========');
    } catch (err: any) {
      console.error('Campaign loading error (primary endpoint):', err);

      // Fallback: try public endpoint with charity ID (still sends auth header via service)
      try {
        if (user?.charity?.id) {
          console.log('[FALLBACK] Trying public endpoint /charities/{id}/campaigns with auth header...', user.charity.id);
          const res2 = await charityService.getCharityCampaigns(user.charity.id, {});
          const backendCampaigns2 = Array.isArray(res2.data) ? res2.data : (Array.isArray(res2) ? res2 : []);

          const mapped2: Campaign[] = backendCampaigns2.map((c: any) => ({
            id: c.id,
            title: c.title,
            description: c.description || "",
            goal: c.target_amount || 0,
            amountRaised: c.current_amount || 0,
            donorsCount: c.donors_count || 0,
            views: c.views || 0,
            status: mapBackendStatus(c.status, c.end_date || c.deadline_at, c.current_amount, c.target_amount),
            bannerImage: c.cover_image_path || c.banner_image || c.image_path,
            endDate: c.end_date || c.deadline_at || "",
            createdAt: c.start_date || c.created_at,
          }));

          // Apply optional client-side filters
          let filtered2 = mapped2;
          if (search) {
            filtered2 = filtered2.filter(
              (c) =>
                c.title.toLowerCase().includes(search.toLowerCase()) ||
                c.description.toLowerCase().includes(search.toLowerCase())
            );
          }
          if (statusFilter !== "all") {
            filtered2 = filtered2.filter((c) => {
              if (statusFilter === "active") return c.status === "active";
              if (statusFilter === "completed") return c.status === "completed";
              if (statusFilter === "pending") return c.status === "draft";
              return true;
            });
          }

          console.log('[FALLBACK] Loaded campaigns via public endpoint:', filtered2.length);
          setCampaigns(filtered2);

          // Show a subtle info toast only if primary failed but fallback worked
          toast({ title: "Loaded campaigns", description: "Using fallback endpoint.", });
          return;
        }
      } catch (fallbackErr) {
        console.error('Fallback endpoint also failed:', fallbackErr);
      }

      // If both fail, surface a helpful error
      const is404 = err?.response?.status === 404;
      toast({
        title: is404 ? "No Charity Found" : "Error",
        description: is404
          ? "Your account is not associated with a charity. Please contact support."
          : (err instanceof Error ? err.message : "Failed to load campaigns"),
        variant: "destructive",
      });

      setCampaigns([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = () => {
    loadCampaigns();
  };

  const handleEdit = (id: number) => {
    navigate(`/charity/campaigns/${id}/edit`);
  };

  const handleDelete = async () => {
    if (!campaignToDelete) return;
    try {
      // TODO: Replace with actual API call
      // await campaignsService.deleteCampaign(campaignToDelete);
      
      toast({ 
        title: "Success", 
        description: "Campaign deleted successfully" 
      });
      
      setCampaigns(campaigns.filter((c) => c.id !== campaignToDelete));
      setDeleteDialogOpen(false);
      setCampaignToDelete(null);
    } catch (err) {
      toast({
        title: "Error",
        description: err instanceof Error ? err.message : "Failed to delete campaign",
        variant: "destructive",
      });
    }
  };

  const handleToggleStatus = async (id: number, currentStatus: string) => {
    try {
      // TODO: Replace with actual API call
      // await campaignsService.updateCampaignStatus(id, newStatus);
      
      // Keep within supported statuses for CampaignCard
      const newStatus: Campaign["status"] = currentStatus === "active" ? "draft" : "active";
      
      setCampaigns(
        campaigns.map((c) =>
          c.id === id ? { ...c, status: newStatus } : c
        )
      );
      
      toast({
        title: "Success",
        description: `Campaign ${newStatus === "active" ? "activated" : "paused"} successfully`,
      });
    } catch (err) {
      toast({
        title: "Error",
        description: "Failed to update campaign status",
        variant: "destructive",
      });
    }
  };

  const handleShare = (id: number) => {
    const campaign = campaigns.find((c) => c.id === id);
    if (!campaign) return;

    const shareUrl = `${window.location.origin}/campaigns/${id}`;
    
    if (navigator.share) {
      navigator.share({
        title: campaign.title,
        text: campaign.description,
        url: shareUrl,
      });
    } else {
      navigator.clipboard.writeText(shareUrl);
      toast({
        title: "Link Copied",
        description: "Campaign link copied to clipboard",
      });
    }
  };

  const confirmDelete = (id: number) => {
    setCampaignToDelete(id);
    setDeleteDialogOpen(true);
  };

  return (
    <div className="min-h-screen bg-background p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Campaigns</h1>
          <p className="text-muted-foreground mt-1">
            Manage and monitor your fundraising campaigns
          </p>
        </div>
        <Button
          size="lg"
          className="bg-primary hover:bg-primary/90"
          onClick={() => setIsCreateOpen(true)}
        >
          <Plus className="h-5 w-5 mr-2" />
          Create Campaign
        </Button>
      </div>

      {/* Filters and Search */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row gap-4">
            {/* Search */}
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search campaigns by title or description..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                className="pl-10"
              />
            </div>

            {/* Status Filter */}
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full md:w-48">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Campaigns</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
              </SelectContent>
            </Select>

            {/* View Toggle */}
            <div className="flex gap-2">
              <Button
                variant={viewMode === "grid" ? "default" : "outline"}
                size="icon"
                onClick={() => setViewMode("grid")}
              >
                <Grid3x3 className="h-4 w-4" />
              </Button>
              <Button
                variant={viewMode === "list" ? "default" : "outline"}
                size="icon"
                onClick={() => setViewMode("list")}
              >
                <List className="h-4 w-4" />
              </Button>
            </div>

            {/* Search Button */}
            <Button onClick={handleSearch}>Search</Button>
          </div>
        </CardContent>
      </Card>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Campaigns
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-foreground">
              {campaigns.length}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Active Campaigns
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-green-600 dark:text-green-500">
              {campaigns.filter((c) => c.status === "active").length}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Raised
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-foreground">
              ₱{campaigns.reduce((sum, c) => sum + c.amountRaised, 0).toLocaleString()}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Donors
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-foreground">
              {campaigns.reduce((sum, c) => sum + c.donorsCount, 0)}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Campaigns Grid/List */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <CampaignCardSkeleton key={i} />
          ))}
        </div>
      ) : campaigns.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-muted-foreground text-lg">No campaigns found</p>
            <p className="text-muted-foreground text-sm mt-2">
              {search || statusFilter !== "all"
                ? "Try adjusting your filters"
                : "Create your first campaign to get started"}
            </p>
            {!search && statusFilter === "all" && (
              <Button
                className="mt-4"
                onClick={() => setIsCreateOpen(true)}
              >
                <Plus className="h-4 w-4 mr-2" />
                Create Campaign
              </Button>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {campaigns.map((campaign) => (
            <CampaignCard
              key={campaign.id}
              campaign={campaign}
              viewMode="admin"
              onEdit={handleEdit}
              onDelete={confirmDelete}
              onToggleStatus={handleToggleStatus}
              onShare={handleShare}
            />
          ))}
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Campaign?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the
              campaign and all associated data including donations and updates.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive hover:bg-destructive/90"
            >
              Delete Campaign
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Create Campaign Modal (shared) */}
      <CreateCampaignModal
        open={isCreateOpen}
        onOpenChange={setIsCreateOpen}
        charityId={user?.charity?.id}
        onSuccess={loadCampaigns}
      />
    </div>
  );
};

export default CampaignsPageModern;
