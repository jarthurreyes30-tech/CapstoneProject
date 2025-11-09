// This is the COMPLETE working code for Saved.tsx
// Copy this to: src/pages/donor/Saved.tsx

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Bookmark, Trash2, Heart, Calendar, DollarSign, TrendingUp, Building2, FileText, Eye, MapPin } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import api from "@/lib/axios";
import { useNavigate } from "react-router-dom";

interface SavedItem {
  id: number;
  savable_id: number;
  savable_type: string;
  savable?: any;
  created_at: string;
}

interface GroupedSaved {
  campaigns: SavedItem[];
  charities: SavedItem[];
  posts: SavedItem[];
}

export default function Saved() {
  const [grouped, setGrouped] = useState<GroupedSaved>({
    campaigns: [],
    charities: [],
    posts: []
  });
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("campaigns");
  const [removeDialog, setRemoveDialog] = useState<{ open: boolean; item: SavedItem | null }>({
    open: false,
    item: null,
  });
  const { toast } = useToast();
  const navigate = useNavigate();
  const API_URL = import.meta.env.VITE_API_URL;

  useEffect(() => {
    fetchSaved();
  }, []);

  const fetchSaved = async () => {
    try {
      const response = await api.get("/me/saved");
      const data = response.data;
      
      if (data.grouped) {
        setGrouped(data.grouped);
      } else if (Array.isArray(data)) {
        setGrouped({
          campaigns: data,
          charities: [],
          posts: []
        });
      }
    } catch (error) {
      console.error("Failed to fetch saved items", error);
      toast({
        title: "Error",
        description: "Failed to load saved items",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleRemove = async () => {
    if (!removeDialog.item) return;

    try {
      await api.delete(`/me/saved/${removeDialog.item.id}`);
      toast({
        title: "Success",
        description: "Item removed from saved",
      });
      setRemoveDialog({ open: false, item: null });
      fetchSaved();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to remove item",
        variant: "destructive",
      });
    }
  };

  const getProgressPercentage = (current: number, goal: number) => {
    return Math.min((current / goal) * 100, 100);
  };

  const getTotalCount = () => {
    return grouped.campaigns.length + grouped.charities.length + grouped.posts.length;
  };

  if (loading) {
    return (
      <div className="container max-w-6xl mx-auto p-6">
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="container max-w-6xl mx-auto p-6">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center gap-3 mb-2">
          <div className="h-12 w-12 rounded-full bg-gradient-to-br from-yellow-100 to-amber-100 dark:from-yellow-900/30 dark:to-amber-900/30 flex items-center justify-center">
            <Bookmark className="h-6 w-6 text-yellow-600 dark:text-yellow-400" />
          </div>
          <div>
            <h1 className="text-3xl font-bold">Saved Items</h1>
            <p className="text-muted-foreground">
              {getTotalCount()} {getTotalCount() === 1 ? 'item' : 'items'} saved for later
            </p>
          </div>
        </div>
      </div>

      {getTotalCount() === 0 ? (
        <Card>
          <CardContent className="pt-6">
            <div className="text-center py-12">
              <Bookmark className="h-16 w-16 mx-auto text-muted-foreground mb-4 opacity-20" />
              <h3 className="text-lg font-semibold mb-2">No Saved Items Yet</h3>
              <p className="text-muted-foreground mb-4">
                Save charities, campaigns, and posts to access them quickly later
              </p>
              <div className="flex gap-2 justify-center">
                <Button onClick={() => navigate("/donor/charities")}>
                  Browse Charities
                </Button>
                <Button variant="outline" onClick={() => navigate("/donor/campaigns/browse")}>
                  Browse Campaigns
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      ) : (
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="campaigns" className="flex items-center gap-2">
              <Heart className="h-4 w-4" />
              Campaigns ({grouped.campaigns.length})
            </TabsTrigger>
            <TabsTrigger value="charities" className="flex items-center gap-2">
              <Building2 className="h-4 w-4" />
              Charities ({grouped.charities.length})
            </TabsTrigger>
            <TabsTrigger value="posts" className="flex items-center gap-2">
              <FileText className="h-4 w-4" />
              Posts ({grouped.posts.length})
            </TabsTrigger>
          </TabsList>

          {/* Campaigns Tab */}
          <TabsContent value="campaigns" className="mt-6">
            {grouped.campaigns.length === 0 ? (
              <Card>
                <CardContent className="pt-6">
                  <div className="text-center py-8">
                    <Heart className="h-12 w-12 mx-auto text-muted-foreground mb-3 opacity-20" />
                    <p className="text-muted-foreground">No saved campaigns</p>
                    <Button 
                      variant="link" 
                      onClick={() => navigate("/donor/campaigns/browse")}
                      className="mt-2"
                    >
                      Browse Campaigns
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-4">
                {grouped.campaigns.map((item) => {
                  const campaign = item.savable;
                  if (!campaign) return null;

                  return (
                    <Card key={item.id} className="overflow-hidden">
                      <div className="md:flex">
                        <div className="md:w-1/3">
                          {campaign.cover_image_path ? (
                            <img
                              src={`${API_URL}/storage/${campaign.cover_image_path}`}
                              alt={campaign.title}
                              className="w-full h-48 md:h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-48 md:h-full bg-gradient-to-br from-primary/10 to-primary/5 flex items-center justify-center">
                              <Heart className="h-12 w-12 text-muted-foreground opacity-20" />
                            </div>
                          )}
                        </div>
                        <div className="md:w-2/3">
                          <CardHeader>
                            <div className="flex items-start justify-between gap-4">
                              <div className="flex-1">
                                <CardTitle className="text-xl line-clamp-2">{campaign.title}</CardTitle>
                                {campaign.charity && (
                                  <CardDescription className="flex items-center gap-1 mt-1">
                                    <Building2 className="h-3.5 w-3.5" />
                                    {campaign.charity.name}
                                  </CardDescription>
                                )}
                              </div>
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => setRemoveDialog({ open: true, item })}
                                className="flex-shrink-0"
                              >
                                <Trash2 className="h-4 w-4 text-destructive" />
                              </Button>
                            </div>
                          </CardHeader>
                          <CardContent className="space-y-4">
                            {/* Progress */}
                            {campaign.goal_amount && (
                              <div>
                                <div className="flex justify-between text-sm mb-2">
                                  <span className="text-muted-foreground">Progress</span>
                                  <span className="font-semibold">
                                    {getProgressPercentage(campaign.current_amount || 0, campaign.goal_amount).toFixed(0)}%
                                  </span>
                                </div>
                                <div className="w-full bg-muted rounded-full h-2">
                                  <div
                                    className="bg-gradient-to-r from-primary to-primary/80 h-2 rounded-full transition-all"
                                    style={{ width: `${getProgressPercentage(campaign.current_amount || 0, campaign.goal_amount)}%` }}
                                  />
                                </div>
                              </div>
                            )}

                            {/* Stats */}
                            <div className="grid grid-cols-2 gap-4">
                              <div className="flex items-center gap-2">
                                <DollarSign className="h-4 w-4 text-green-600 dark:text-green-400" />
                                <div>
                                  <p className="text-xs text-muted-foreground">Raised</p>
                                  <p className="font-semibold">₱{(campaign.current_amount || 0).toLocaleString()}</p>
                                </div>
                              </div>
                              <div className="flex items-center gap-2">
                                <TrendingUp className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                                <div>
                                  <p className="text-xs text-muted-foreground">Goal</p>
                                  <p className="font-semibold">₱{(campaign.goal_amount || 0).toLocaleString()}</p>
                                </div>
                              </div>
                            </div>

                            {/* Actions */}
                            <div className="flex gap-2">
                              <Button
                                onClick={() => navigate(`/campaigns/${campaign.id}`)}
                                className="flex-1"
                              >
                                View Campaign
                              </Button>
                            </div>
                          </CardContent>
                        </div>
                      </div>
                    </Card>
                  );
                })}
              </div>
            )}
          </TabsContent>

          {/* Charities Tab */}
          <TabsContent value="charities" className="mt-6">
            {grouped.charities.length === 0 ? (
              <Card>
                <CardContent className="pt-6">
                  <div className="text-center py-8">
                    <Building2 className="h-12 w-12 mx-auto text-muted-foreground mb-3 opacity-20" />
                    <p className="text-muted-foreground">No saved charities</p>
                    <Button 
                      variant="link" 
                      onClick={() => navigate("/donor/charities")}
                      className="mt-2"
                    >
                      Browse Charities
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {grouped.charities.map((item) => {
                  const charity = item.savable;
                  if (!charity) return null;

                  return (
                    <Card key={item.id} className="group hover:shadow-lg transition-shadow">
                      <CardHeader>
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex items-start gap-3 flex-1">
                            <div className="h-12 w-12 rounded-lg bg-muted flex items-center justify-center flex-shrink-0 overflow-hidden">
                              {charity.logo_path ? (
                                <img
                                  src={`${API_URL}/storage/${charity.logo_path}`}
                                  alt={charity.name}
                                  className="h-full w-full object-cover"
                                />
                              ) : (
                                <Building2 className="h-6 w-6 text-muted-foreground" />
                              )}
                            </div>
                            <div className="flex-1 min-w-0">
                              <CardTitle className="text-lg line-clamp-2">{charity.name}</CardTitle>
                              {charity.description && (
                                <CardDescription className="line-clamp-2 mt-1">
                                  {charity.description}
                                </CardDescription>
                              )}
                            </div>
                          </div>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => setRemoveDialog({ open: true, item })}
                            className="flex-shrink-0"
                          >
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        {charity.city && (
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <MapPin className="h-4 w-4" />
                            {charity.city}, {charity.province}
                          </div>
                        )}
                        <Button
                          onClick={() => navigate(`/donor/charity/${charity.id}`)}
                          className="w-full"
                          size="sm"
                        >
                          <Eye className="h-4 w-4 mr-2" />
                          View Profile
                        </Button>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            )}
          </TabsContent>

          {/* Posts Tab */}
          <TabsContent value="posts" className="mt-6">
            {grouped.posts.length === 0 ? (
              <Card>
                <CardContent className="pt-6">
                  <div className="text-center py-8">
                    <FileText className="h-12 w-12 mx-auto text-muted-foreground mb-3 opacity-20" />
                    <p className="text-muted-foreground">No saved posts</p>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-4">
                {grouped.posts.map((item) => {
                  const post = item.savable;
                  if (!post) return null;

                  return (
                    <Card key={item.id}>
                      <CardHeader>
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex-1">
                            <CardTitle className="text-lg line-clamp-2">{post.title}</CardTitle>
                            {post.charity && (
                              <CardDescription className="flex items-center gap-1 mt-1">
                                <Building2 className="h-3.5 w-3.5" />
                                {post.charity.name}
                              </CardDescription>
                            )}
                          </div>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => setRemoveDialog({ open: true, item })}
                          >
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </div>
                      </CardHeader>
                      <CardContent>
                        {post.content && (
                          <p className="text-sm text-muted-foreground line-clamp-3 mb-4">
                            {post.content}
                          </p>
                        )}
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => navigate(`/donor/charity/${post.charity_id}`)}
                        >
                          <Eye className="h-4 w-4 mr-2" />
                          View Post
                        </Button>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            )}
          </TabsContent>
        </Tabs>
      )}

      {/* Remove Dialog */}
      <Dialog open={removeDialog.open} onOpenChange={(open) => setRemoveDialog({ ...removeDialog, open })}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Remove Saved Item?</DialogTitle>
            <DialogDescription>
              This item will be removed from your saved items. You can always save it again later.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setRemoveDialog({ open: false, item: null })}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleRemove}>
              Remove
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
