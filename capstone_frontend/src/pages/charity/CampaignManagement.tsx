import { useState, useEffect } from "react";
import { Plus, Edit, Trash2, Eye, Calendar, Target, Grid3x3, List, Wallet } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Progress } from "@/components/ui/progress";
import { toast } from "sonner";
import { useAuth } from "@/context/AuthContext";
import { campaignService, Campaign as ApiCampaign } from "@/services/campaigns";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CampaignCard, Campaign as CampaignCardType } from "@/components/charity/CampaignCard";
import { CampaignCardSkeleton } from "@/components/charity/CampaignCardSkeleton";
import { AddDonationChannelModal } from "@/components/campaign/AddDonationChannelModal";
import { CreateCampaignModal } from "@/components/charity/CreateCampaignModal";
import { EditCampaignModal } from "@/components/charity/EditCampaignModal";

interface Campaign {
  id: number;
  title: string;
  description: string;
  target_amount: number;
  current_amount: number;
  start_date: string;
  end_date: string;
  status: 'draft' | 'published' | 'closed' | 'archived';
  donation_type: 'one_time' | 'recurring';
  cover_image_path?: string;
  charity_id: number;
}

export default function CampaignManagement() {
  const { user } = useAuth();
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [isDonationChannelModalOpen, setIsDonationChannelModalOpen] = useState(false);
  const [selectedCampaign, setSelectedCampaign] = useState<Campaign | null>(null);
  const [viewMode, setViewMode] = useState<"table" | "cards">("cards");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [sortBy, setSortBy] = useState<string>("newest");

  useEffect(() => {
    loadCampaigns();
  }, []);

  // Map backend status to actual status based on end date and goal
  const mapCampaignStatus = (status: string, endDate: string, currentAmount: number, targetAmount: number): Campaign['status'] => {
    const s = (status || "").toLowerCase();
    
    // If status is draft, keep it as draft
    if (s === "draft") return "draft";
    
    // Check if campaign has ended (past end date)
    const now = new Date();
    const campaignEndDate = endDate ? new Date(endDate) : null;
    const hasEnded = campaignEndDate && campaignEndDate < now;
    
    // Calculate if goal is reached
    const goalReached = targetAmount && currentAmount && currentAmount >= targetAmount;
    
    // If campaign has ended OR goal is reached, mark as closed (completed)
    if (hasEnded || goalReached) {
      return "closed";
    }
    
    // Map backend statuses that explicitly indicate completion
    if (s === "completed" || s === "closed" || s === "archived") {
      return "closed";
    }
    
    // Active campaigns
    if (s === "published" || s === "active") return "published";
    
    return "published";
  };

  const loadCampaigns = async () => {
    try {
      if (!user?.charity?.id) {
        toast.error("No charity found for your account");
        setLoading(false);
        return;
      }
      console.log('[CM] Fetching campaigns for charity:', user.charity.id);

      // Primary: authenticated endpoint should return ALL campaigns for owner
      let formattedCampaigns: Campaign[] = [];
      try {
        console.log('[CM][PRIMARY] GET /charity/campaigns');
        const mine = await campaignService.getMyCampaigns(1);
        console.log('[CM][PRIMARY] Response:', mine);
        const mineList = Array.isArray((mine as any).data) ? (mine as any).data : (Array.isArray(mine) ? mine : []);
        console.log('[CM][PRIMARY] Count:', mineList.length);
        formattedCampaigns = mineList.map((campaign: ApiCampaign) => {
          const targetAmount = parseFloat(String(campaign.target_amount || 0));
          const currentAmount = parseFloat(String(campaign.current_amount || 0));
          const endDate = (campaign as any).end_date || '';
          const status = mapCampaignStatus((campaign as any).status, endDate, currentAmount, targetAmount);
          return {
            id: (campaign as any).id,
            title: (campaign as any).title,
            description: (campaign as any).description || "",
            target_amount: targetAmount,
            current_amount: currentAmount,
            start_date: (campaign as any).start_date || "",
            end_date: endDate,
            status: status,
            donation_type: (campaign as any).donation_type,
            cover_image_path: (campaign as any).cover_image_path,
            charity_id: (campaign as any).charity_id
          };
        });
        console.log('[CM][PRIMARY] Final campaigns count:', formattedCampaigns.length);
      } catch (e) {
        console.error('[CM][PRIMARY] Failed:', e);
      }

      // Fallback: public endpoint (will show only published if not owner)
      if (formattedCampaigns.length === 0) {
        try {
          console.log('[CM][FALLBACK] GET /charities/{id}/campaigns');
          const response = await campaignService.getCampaigns(user.charity.id);
          console.log('[CM][FALLBACK] Public response:', response);
          const list = Array.isArray((response as any).data) ? (response as any).data : (Array.isArray(response) ? response : []);
          console.log('[CM][FALLBACK] Public count:', list.length);
          formattedCampaigns = list.map((campaign: ApiCampaign) => {
            const targetAmount = parseFloat(String(campaign.target_amount || 0));
            const currentAmount = parseFloat(String(campaign.current_amount || 0));
            const endDate = campaign.end_date || '';
            const status = mapCampaignStatus(campaign.status, endDate, currentAmount, targetAmount);
            return {
              id: campaign.id,
              title: campaign.title,
              description: campaign.description || "",
              target_amount: targetAmount,
              current_amount: currentAmount,
              start_date: campaign.start_date || "",
              end_date: endDate,
              status: status,
              donation_type: campaign.donation_type,
              cover_image_path: campaign.cover_image_path,
              charity_id: campaign.charity_id
            };
          });
        } catch (e) {
          console.error('[CM][FALLBACK] Failed:', e);
        }
      }

      setCampaigns(formattedCampaigns);
    } catch (error: any) {
      console.error("Failed to load campaigns:", error);
      toast.error(error.response?.data?.message || "Failed to load campaigns");
    } finally {
      setLoading(false);
    }
  };

  const handleCreateSuccess = () => {
    loadCampaigns();
  };

  const handleEditSuccess = () => {
    loadCampaigns();
    setSelectedCampaign(null);
  };

  const handleEdit = (campaign: Campaign) => {
    setSelectedCampaign(campaign);
    setIsEditDialogOpen(true);
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Are you sure you want to delete this campaign?")) return;

    try {
      await campaignService.deleteCampaign(id);
      toast.success("Campaign deleted successfully");
      loadCampaigns();
    } catch (error: any) {
      console.error("Failed to delete campaign:", error);
      toast.error(error.response?.data?.message || "Failed to delete campaign");
    }
  };

  const handleView = (campaign: Campaign) => {
    setSelectedCampaign(campaign);
    setIsViewDialogOpen(true);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'published':
        return <Badge className="bg-green-600">Published</Badge>;
      case 'closed':
        return <Badge className="bg-blue-600">Closed</Badge>;
      case 'draft':
        return <Badge variant="secondary">Draft</Badge>;
      case 'archived':
        return <Badge variant="outline">Archived</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  const getDonationTypeBadge = (type: string) => {
    return type === 'recurring' 
      ? <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-200">Recurring</Badge>
      : <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">One-Time</Badge>;
  };

  const getProgress = (current: number, target: number) => {
    return target > 0 ? (current / target) * 100 : 0;
  };

  // Filter and sort campaigns
  const getFilteredAndSortedCampaigns = () => {
    let filtered = campaigns;

    // Apply status filter
    if (statusFilter !== "all") {
      filtered = filtered.filter((c) => c.status === statusFilter);
    }

    // Apply sorting
    const sorted = [...filtered].sort((a, b) => {
      switch (sortBy) {
        case "newest":
          return new Date(b.start_date).getTime() - new Date(a.start_date).getTime();
        case "oldest":
          return new Date(a.start_date).getTime() - new Date(b.start_date).getTime();
        case "highest":
          return b.target_amount - a.target_amount;
        case "progress":
          const progressA = a.target_amount > 0 ? (a.current_amount / a.target_amount) * 100 : 0;
          const progressB = b.target_amount > 0 ? (b.current_amount / b.target_amount) * 100 : 0;
          return progressB - progressA;
        default:
          return 0;
      }
    });

    return sorted;
  };

  // Convert Campaign to CampaignCardType
  const convertToCampaignCard = (campaign: Campaign): CampaignCardType => {
    // Map status
    let cardStatus: "active" | "completed" | "draft" | "expired" = "draft";
    if (campaign.status === "published") cardStatus = "active";
    else if (campaign.status === "closed") cardStatus = "completed";
    else if (campaign.status === "archived") cardStatus = "expired";
    else cardStatus = "draft";

    return {
      id: campaign.id,
      title: campaign.title,
      description: campaign.description,
      goal: campaign.target_amount,
      amountRaised: campaign.current_amount,
      donorsCount: 0, // TODO: Get from API
      views: 0, // TODO: Get from API
      status: cardStatus,
      bannerImage: (campaign as any).cover_image_path || (campaign as any).banner_image || (campaign as any).image_path,
      endDate: campaign.end_date,
      createdAt: campaign.start_date,
    };
  };

  const handleCardEdit = (id: number) => {
    const campaign = campaigns.find((c) => c.id === id);
    if (campaign) handleEdit(campaign);
  };

  const handleCardDelete = (id: number) => {
    handleDelete(id);
  };

  const handleToggleStatus = async (id: number, currentStatus: string) => {
    const campaign = campaigns.find((c) => c.id === id);
    if (!campaign) return;

    try {
      // When pausing, keep as published but you might want a "paused" status
      // For now, toggle between published and draft
      let newStatus: "draft" | "published" | "closed" | "archived";
      
      if (campaign.status === "published") {
        newStatus = "draft"; // Pausing
      } else {
        newStatus = "published"; // Activating
      }
      
      await campaignService.updateCampaign(id, {
        ...campaign,
        status: newStatus,
      });
      
      toast.success(`Campaign ${newStatus === "published" ? "activated" : "paused"} successfully`);
      loadCampaigns();
    } catch (error: any) {
      console.error("Failed to update campaign status:", error);
      toast.error("Failed to update campaign status");
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
      toast.success("Campaign link copied to clipboard");
    }
  };

  return (
    <div className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8 xl:px-12 py-6 md:py-10 space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-foreground mb-2">Campaigns</h1>
          <p className="text-muted-foreground">
            Create and manage your fundraising campaigns
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2 sm:gap-3 justify-start md:justify-end">
          {/* View Toggle */}
          <div className="flex gap-1 border rounded-md p-1 shrink-0">
            <Button
              variant={viewMode === "cards" ? "default" : "ghost"}
              size="sm"
              onClick={() => setViewMode("cards")}
            >
              <Grid3x3 className="h-4 w-4" />
            </Button>
            <Button
              variant={viewMode === "table" ? "default" : "ghost"}
              size="sm"
              onClick={() => setViewMode("table")}
            >
              <List className="h-4 w-4" />
            </Button>
          </div>
          
          {/* Action Buttons */}
          <Button 
            className="bg-primary hover:bg-primary/90 h-10 w-full sm:w-auto shrink-0"
            onClick={() => setIsCreateDialogOpen(true)}
          >
            <Plus className="mr-2 h-4 w-4" />
            Create Campaign
          </Button>
          <Button
            variant="outline"
            className="h-10 w-full sm:w-auto shrink-0"
            onClick={() => setIsDonationChannelModalOpen(true)}
          >
            <Wallet className="mr-2 h-4 w-4" />
            Add Donation Channel
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid gap-2 sm:gap-3 lg:gap-4 xl:gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Campaigns</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{campaigns.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Published Campaigns</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {campaigns.filter(c => c.status === 'published').length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Raised</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ₱{campaigns.reduce((sum, c) => sum + c.current_amount, 0).toLocaleString()}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters & Sort */}
      <Card className="p-4">
        <div className="flex flex-col gap-4">
          {/* Filter Buttons */}
          <div className="flex flex-col sm:flex-row sm:items-center gap-3">
            <span className="text-sm font-medium text-muted-foreground flex-shrink-0">Filter:</span>
            <div className="-mx-1 overflow-x-auto [scrollbar-width:none] [-ms-overflow-style:none]">
              <div className="inline-flex items-center gap-2 whitespace-nowrap px-1">
              {[
                { value: "all", label: "All" },
                { value: "published", label: "Active" },
                { value: "closed", label: "Completed" },
                { value: "draft", label: "Pending" },
              ].map((filter) => (
                <button
                  key={filter.value}
                  onClick={() => setStatusFilter(filter.value)}
                  className={`px-3 sm:px-4 py-2 h-9 text-xs sm:text-sm font-medium rounded-lg transition-colors ${
                    statusFilter === filter.value
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted hover:bg-muted/80 text-foreground"
                  }`}
                >
                  {filter.label}
                </button>
              ))}
              </div>
            </div>
          </div>
          
          {/* Sort Dropdown */}
          <div className="flex flex-col sm:flex-row sm:items-center gap-3">
            <span className="text-sm font-medium text-muted-foreground flex-shrink-0">Sort:</span>
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger id="sort-by" className="w-full sm:w-[200px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="newest">Newest</SelectItem>
                <SelectItem value="oldest">Oldest</SelectItem>
                <SelectItem value="highest">Highest Target</SelectItem>
                <SelectItem value="progress">Most Funded</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </Card>

      {/* Campaigns View */}
      {viewMode === "table" ? (
        <Card>
          <CardHeader>
            <CardTitle>All Campaigns</CardTitle>
            <CardDescription>Manage your fundraising campaigns</CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="py-12 text-center text-muted-foreground">Loading campaigns...</div>
            ) : getFilteredAndSortedCampaigns().length === 0 ? (
              <div className="py-12 text-center text-muted-foreground">No campaigns match the selected filters.</div>
            ) : (
              <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Campaign</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Target</TableHead>
                <TableHead>Progress</TableHead>
                <TableHead>Duration</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {getFilteredAndSortedCampaigns().map((campaign) => (
                <TableRow key={campaign.id}>
                  <TableCell>
                    <div>
                      <p className="font-medium">{campaign.title}</p>
                      <p className="text-sm text-muted-foreground line-clamp-1">
                        {campaign.description}
                      </p>
                    </div>
                  </TableCell>
                  <TableCell>{getDonationTypeBadge(campaign.donation_type)}</TableCell>
                  <TableCell>₱{campaign.target_amount.toLocaleString()}</TableCell>
                  <TableCell>
                    <div className="space-y-1">
                      <Progress value={getProgress(campaign.current_amount, campaign.target_amount)} />
                      <p className="text-xs text-muted-foreground">
                        ₱{campaign.current_amount.toLocaleString()} / ₱{campaign.target_amount.toLocaleString()}
                      </p>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="text-sm">
                      {campaign.start_date && <p>{new Date(campaign.start_date).toLocaleDateString()}</p>}
                      {campaign.end_date && <p className="text-muted-foreground">to {new Date(campaign.end_date).toLocaleDateString()}</p>}
                    </div>
                  </TableCell>
                  <TableCell>{getStatusBadge(campaign.status)}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button variant="ghost" size="icon" onClick={() => handleView(campaign)}>
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => handleEdit(campaign)}>
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => handleDelete(campaign.id)}>
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
            </Table>
            )}
          </CardContent>
        </Card>
      ) : (
        /* Card View */
        loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <CampaignCardSkeleton key={i} />
            ))}
          </div>
        ) : getFilteredAndSortedCampaigns().length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <p className="text-muted-foreground text-lg">
                {campaigns.length === 0 ? "No campaigns yet" : "No campaigns match the selected filters"}
              </p>
              <p className="text-muted-foreground text-sm mt-2">
                {campaigns.length === 0 
                  ? "Create your first campaign to start fundraising!" 
                  : "Try adjusting your filters to see more campaigns."}
              </p>
              {campaigns.length === 0 && (
                <Button className="mt-4" onClick={() => setIsCreateDialogOpen(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Create Campaign
                </Button>
              )}
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
            {getFilteredAndSortedCampaigns().map((campaign) => (
              <CampaignCard
                key={campaign.id}
                campaign={convertToCampaignCard(campaign)}
                viewMode="admin"
                onEdit={handleCardEdit}
                onDelete={handleCardDelete}
                onToggleStatus={handleToggleStatus}
                onShare={handleShare}
              />
            ))}
          </div>
        )
      )}

      {/* Create Campaign Modal */}
      <CreateCampaignModal
        open={isCreateDialogOpen}
        onOpenChange={setIsCreateDialogOpen}
        charityId={user?.charity?.id}
        onSuccess={handleCreateSuccess}
      />

      {/* Edit Campaign Modal */}
      {selectedCampaign && (
        <EditCampaignModal
          open={isEditDialogOpen}
          onOpenChange={setIsEditDialogOpen}
          campaign={selectedCampaign}
          onSuccess={handleEditSuccess}
        />
      )}

      {/* View Campaign Dialog */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{selectedCampaign?.title}</DialogTitle>
            <DialogDescription>Campaign Details</DialogDescription>
          </DialogHeader>
          {selectedCampaign && (
            <div className="space-y-4">
              <div>
                <Label>Description</Label>
                <p className="text-sm text-muted-foreground mt-1">{selectedCampaign.description}</p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Donation Type</Label>
                  <div className="mt-1">{getDonationTypeBadge(selectedCampaign.donation_type)}</div>
                </div>
                <div>
                  <Label>Status</Label>
                  <div className="mt-1">{getStatusBadge(selectedCampaign.status)}</div>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Target Amount</Label>
                  <p className="text-lg font-bold">₱{selectedCampaign.target_amount.toLocaleString()}</p>
                </div>
                <div>
                  <Label>Current Amount</Label>
                  <p className="text-lg font-bold text-green-600">₱{selectedCampaign.current_amount.toLocaleString()}</p>
                </div>
              </div>
              <div>
                <Label>Progress</Label>
                <Progress value={getProgress(selectedCampaign.current_amount, selectedCampaign.target_amount)} className="mt-2" />
                <p className="text-sm text-muted-foreground mt-1">
                  {getProgress(selectedCampaign.current_amount, selectedCampaign.target_amount).toFixed(1)}% achieved
                </p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Start Date</Label>
                  <p className="text-sm">{selectedCampaign.start_date ? new Date(selectedCampaign.start_date).toLocaleDateString() : 'Not set'}</p>
                </div>
                <div>
                  <Label>End Date</Label>
                  <p className="text-sm">{selectedCampaign.end_date ? new Date(selectedCampaign.end_date).toLocaleDateString() : 'Not set'}</p>
                </div>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsViewDialogOpen(false)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add Donation Channel Modal */}
      <AddDonationChannelModal
        open={isDonationChannelModalOpen}
        onOpenChange={(open) => {
          setIsDonationChannelModalOpen(open);
        }}
        onSuccess={() => {
          toast.success("Donation channel added successfully!");
          setIsDonationChannelModalOpen(false);
        }}
      />
    </div>
  );
}
