import { useState, useEffect } from "react";
import { Search, Eye, CheckCircle, XCircle, AlertCircle, Building2, Mail, Phone, MapPin, FileText, Image as ImageIcon, TrendingUp, Calendar, ExternalLink, Download, Globe, Facebook, Instagram, Twitter, Linkedin, Youtube, Users, DollarSign, Target, Clock } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { motion } from "framer-motion";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import { adminService, Charity, CharityDocument } from "@/services/admin";


export default function Charities() {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [selectedCharity, setSelectedCharity] = useState<Charity | null>(null);
  const [isDetailDialogOpen, setIsDetailDialogOpen] = useState(false);
  const [isRejectDialogOpen, setIsRejectDialogOpen] = useState(false);
  const [rejectReason, setRejectReason] = useState("");
  const [charities, setCharities] = useState<Charity[]>([]);
  const [selectedDocument, setSelectedDocument] = useState<CharityDocument | null>(null);
  const [isDocRejectDialogOpen, setIsDocRejectDialogOpen] = useState(false);
  const [docRejectReason, setDocRejectReason] = useState("");
  const [isViewDocDialogOpen, setIsViewDocDialogOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    fetchCharities();
  }, [currentPage, filterStatus]);

  const fetchCharities = async () => {
    setIsLoading(true);
    try {
      const response = await adminService.getAllCharities(currentPage, {
        status: filterStatus !== 'all' ? filterStatus : undefined
      });
      setCharities(response.data);
    } catch (error: any) {
      console.error('Failed to fetch charities:', error);
      toast.error('Failed to load charities');
    } finally {
      setIsLoading(false);
    }
  };

  const handleViewDetail = async (charity: Charity) => {
    try {
      const details = await adminService.getCharityDetails(charity.id);
      setSelectedCharity(details);
      setIsDetailDialogOpen(true);
    } catch (error) {
      toast.error('Failed to load charity details');
    }
  };

  const handleApprove = async (charityId: number) => {
    try {
      await adminService.approveCharity(charityId);
      toast.success("Charity approved successfully");
      setIsDetailDialogOpen(false);
      fetchCharities(); // Refresh list
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to approve charity');
    }
  };

  const handleReject = async () => {
    if (!rejectReason.trim()) {
      toast.error("Please provide a rejection reason");
      return;
    }
    if (!selectedCharity) return;

    try {
      await adminService.rejectCharity(selectedCharity.id, rejectReason);
      toast.success("Charity rejected");
      setIsRejectDialogOpen(false);
      setIsDetailDialogOpen(false);
      setRejectReason("");
      fetchCharities(); // Refresh list
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to reject charity');
    }
  };

  const handleRequestInfo = (charityId: number) => {
    toast.info("Information request sent to charity");
    setIsDetailDialogOpen(false);
  };

  const handleApproveDocument = async (documentId: number) => {
    try {
      await adminService.approveDocument(documentId);
      toast.success("Document approved successfully");
      // Refresh charity details
      if (selectedCharity) {
        const details = await adminService.getCharityDetails(selectedCharity.id);
        setSelectedCharity(details);
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to approve document');
    }
  };

  const handleRejectDocument = async () => {
    if (!docRejectReason.trim()) {
      toast.error("Please provide a rejection reason");
      return;
    }
    if (!selectedDocument) return;

    try {
      await adminService.rejectDocument(selectedDocument.id, docRejectReason);
      toast.success("Document rejected");
      setIsDocRejectDialogOpen(false);
      setDocRejectReason("");
      // Refresh charity details
      if (selectedCharity) {
        const details = await adminService.getCharityDetails(selectedCharity.id);
        setSelectedCharity(details);
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to reject document');
    }
  };

  const handleViewDocument = (doc: CharityDocument) => {
    setSelectedDocument(doc);
    setIsViewDocDialogOpen(true);
  };

  const getDocumentStatusBadge = (status: string) => {
    switch (status.toLowerCase()) {
      case "approved":
        return <Badge className="bg-green-600">Approved</Badge>;
      case "rejected":
        return <Badge variant="destructive">Rejected</Badge>;
      case "pending":
        return <Badge variant="secondary">Pending Review</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status.toLowerCase()) {
      case "approved":
        return <Badge className="bg-green-600">Approved</Badge>;
      case "rejected":
        return <Badge variant="destructive">Rejected</Badge>;
      case "pending":
        return <Badge variant="secondary">Pending</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  const filteredCharities = charities.filter(charity => {
    const matchesSearch = charity.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (charity.contact_email && charity.contact_email.toLowerCase().includes(searchTerm.toLowerCase())) ||
                         (charity.reg_no && charity.reg_no.toLowerCase().includes(searchTerm.toLowerCase()));
    return matchesSearch;
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-muted-foreground">Loading charities...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h1 className="text-4xl font-bold tracking-tight bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
          Charity Management
        </h1>
        <p className="text-muted-foreground mt-2 text-lg">
          Review and manage charity applications
        </p>
      </motion.div>

      <div className="flex gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search charities..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9"
          />
        </div>
        <Select value={filterStatus} onValueChange={setFilterStatus}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="approved">Approved</SelectItem>
            <SelectItem value="rejected">Rejected</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Charity Cards Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {filteredCharities.length === 0 ? (
          <div className="col-span-full text-center py-12 text-muted-foreground">
            <Building2 className="h-16 w-16 mx-auto mb-4 opacity-50" />
            <p className="text-lg">No charities found</p>
          </div>
        ) : (
          filteredCharities.map((charity, index) => (
            <motion.div
              key={charity.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              whileHover={{ scale: 1.02 }}
              className="cursor-pointer"
              onClick={() => handleViewDetail(charity)}
            >
              <Card className="hover:shadow-lg transition-all duration-300 border-l-4 border-l-purple-500 bg-gradient-to-br from-purple-50/50 to-white dark:from-purple-950/20 dark:to-background overflow-hidden">
                {/* Background Image Header */}
                <div className="h-32 bg-gradient-to-r from-purple-500 to-pink-500 relative">
                  {(charity as any).background_image && (
                    <img 
                      src={(charity as any).background_image} 
                      alt="Background" 
                      className="w-full h-full object-cover"
                    />
                  )}
                  <div className="absolute inset-0 bg-black/30" />
                  {/* Logo */}
                  <div className="absolute -bottom-8 left-6">
                    <div className="h-16 w-16 rounded-lg bg-white dark:bg-gray-800 p-2 shadow-lg border-2 border-white dark:border-gray-700">
                      {(charity as any).logo ? (
                        <img 
                          src={(charity as any).logo} 
                          alt="Logo" 
                          className="w-full h-full object-contain"
                        />
                      ) : (
                        <Building2 className="h-full w-full text-purple-500" />
                      )}
                    </div>
                  </div>
                  {/* Status Badge */}
                  <div className="absolute top-3 right-3">
                    {getStatusBadge(charity.verification_status)}
                  </div>
                </div>

                <CardContent className="pt-12 p-6">
                  {/* Charity Info */}
                  <div className="mb-4">
                    <h3 className="font-bold text-lg mb-1 truncate">{charity.name}</h3>
                    {charity.contact_email && (
                      <p className="text-sm text-muted-foreground truncate flex items-center gap-1">
                        <Mail className="h-3 w-3" />
                        {charity.contact_email}
                      </p>
                    )}
                    {charity.reg_no && (
                      <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                        <FileText className="h-3 w-3" />
                        Reg: {charity.reg_no}
                      </p>
                    )}
                  </div>

                  {/* Mission Preview */}
                  {charity.mission && (
                    <p className="text-xs text-muted-foreground mb-4 line-clamp-2">
                      {charity.mission}
                    </p>
                  )}

                  {/* Quick Stats */}
                  {(charity.campaigns_count || charity.donations_count || charity.followers_count) && (
                    <div className="flex gap-2 mb-4 text-xs">
                      {charity.campaigns_count !== undefined && (
                        <div className="flex items-center gap-1 text-muted-foreground">
                          <Target className="h-3 w-3" />
                          <span>{charity.campaigns_count}</span>
                        </div>
                      )}
                      {charity.donations_count !== undefined && (
                        <div className="flex items-center gap-1 text-muted-foreground">
                          <DollarSign className="h-3 w-3" />
                          <span>{charity.donations_count}</span>
                        </div>
                      )}
                      {charity.followers_count !== undefined && (
                        <div className="flex items-center gap-1 text-muted-foreground">
                          <Users className="h-3 w-3" />
                          <span>{charity.followers_count}</span>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Stats */}
                  <div className="grid grid-cols-2 gap-3 mb-4">
                    <div className="p-2 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                      <p className="text-xs text-muted-foreground">Charity ID</p>
                      <p className="font-semibold text-purple-600">#{charity.id}</p>
                    </div>
                    <div className="p-2 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                      <p className="text-xs text-muted-foreground">Submitted</p>
                      <p className="font-semibold text-blue-600 text-xs">{new Date(charity.created_at).toLocaleDateString()}</p>
                    </div>
                  </div>

                  {/* Documents Count */}
                  {charity.documents && charity.documents.length > 0 && (
                    <div className="flex items-center gap-2 text-xs text-muted-foreground mb-4">
                      <FileText className="h-3 w-3" />
                      <span>{charity.documents.length} document(s) submitted</span>
                    </div>
                  )}

                  {/* Action Buttons - Only for Pending */}
                  {charity.verification_status === 'pending' && (
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        className="flex-1 text-green-600 hover:text-green-700"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleApprove(charity.id);
                        }}
                      >
                        <CheckCircle className="h-3 w-3 mr-1" />
                        Approve
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="flex-1 text-red-600 hover:text-red-700"
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedCharity(charity);
                          setIsRejectDialogOpen(true);
                        }}
                      >
                        <XCircle className="h-3 w-3 mr-1" />
                        Reject
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          ))
        )}
      </div>

      <Dialog open={isDetailDialogOpen} onOpenChange={setIsDetailDialogOpen}>
        <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-2xl">Charity Application Review</DialogTitle>
            <DialogDescription>
              Comprehensive review of charity registration and information
            </DialogDescription>
          </DialogHeader>
          {selectedCharity && (
            <div className="space-y-6 py-4">
              {/* Header with Logo and Background */}
              <div className="relative rounded-lg overflow-hidden">
                {/* Background Image */}
                <div className="h-48 bg-gradient-to-r from-purple-500 to-pink-500 relative">
                  {(selectedCharity as any).background_image && (
                    <img 
                      src={(selectedCharity as any).background_image} 
                      alt="Background" 
                      className="w-full h-full object-cover"
                    />
                  )}
                  <div className="absolute inset-0 bg-black/30" />
                </div>
                {/* Logo and Basic Info */}
                <div className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-black/80 to-transparent">
                  <div className="flex items-end gap-4">
                    <div className="h-24 w-24 rounded-lg bg-white p-2 shadow-lg">
                      {(selectedCharity as any).logo ? (
                        <img 
                          src={(selectedCharity as any).logo} 
                          alt="Logo" 
                          className="w-full h-full object-contain"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-gray-100 rounded">
                          <Building2 className="h-12 w-12 text-gray-400" />
                        </div>
                      )}
                    </div>
                    <div className="flex-1 text-white pb-2">
                      <h2 className="text-3xl font-bold">{selectedCharity.name}</h2>
                      <p className="text-white/90 flex items-center gap-2 mt-1">
                        <Mail className="h-4 w-4" />
                        {selectedCharity.contact_email}
                      </p>
                    </div>
                    <div className="pb-2">
                      {getStatusBadge(selectedCharity.verification_status)}
                    </div>
                  </div>
                </div>
              </div>

              {/* Tabbed Content */}
              <Tabs defaultValue="info" className="w-full">
                <TabsList className="grid w-full grid-cols-4">
                  <TabsTrigger value="info">Information</TabsTrigger>
                  <TabsTrigger value="documents">Documents</TabsTrigger>
                  <TabsTrigger value="campaigns">Campaigns</TabsTrigger>
                  <TabsTrigger value="compliance">Compliance</TabsTrigger>
                </TabsList>

                <TabsContent value="info" className="space-y-4 mt-4">
                  <ScrollArea className="h-[500px] pr-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="p-4 border rounded-lg hover:shadow-md transition-shadow bg-card">
                      <div className="flex items-center gap-3 mb-3">
                        <div className="p-2 bg-purple-100 dark:bg-purple-900/50 rounded-full">
                          <Building2 className="h-5 w-5 text-purple-600" />
                        </div>
                        <Label className="font-semibold text-lg">Organization Details</Label>
                      </div>
                      <div className="space-y-2 ml-11">
                        <div className="text-sm">
                          <span className="text-muted-foreground">Registration No:</span>
                          <span className="ml-2 font-medium">{selectedCharity.reg_no || 'N/A'}</span>
                        </div>
                        <div className="text-sm">
                          <span className="text-muted-foreground">Type:</span>
                          <span className="ml-2 font-medium">{(selectedCharity as any).type || 'N/A'}</span>
                        </div>
                        <div className="text-sm">
                          <span className="text-muted-foreground">Founded:</span>
                          <span className="ml-2 font-medium">{(selectedCharity as any).founded_date || 'N/A'}</span>
                        </div>
                      </div>
                    </div>

                    <div className="p-4 border rounded-lg hover:shadow-md transition-shadow bg-card">
                      <div className="flex items-center gap-3 mb-3">
                        <div className="p-2 bg-blue-100 dark:bg-blue-900/50 rounded-full">
                          <MapPin className="h-5 w-5 text-blue-600" />
                        </div>
                        <Label className="font-semibold text-lg">Contact Information</Label>
                      </div>
                      <div className="space-y-2 ml-11">
                        <div className="flex items-center gap-2 text-sm">
                          <Phone className="h-4 w-4 text-muted-foreground" />
                          <span>{(selectedCharity as any).phone || 'Not provided'}</span>
                        </div>
                        <div className="flex items-start gap-2 text-sm">
                          <MapPin className="h-4 w-4 text-muted-foreground mt-0.5" />
                          <span>{(selectedCharity as any).address || 'Not provided'}</span>
                        </div>
                        {(selectedCharity as any).website && (
                          <div className="flex items-center gap-2 text-sm">
                            <ExternalLink className="h-4 w-4 text-muted-foreground" />
                            <a href={(selectedCharity as any).website} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                              Visit Website
                            </a>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="p-4 border rounded-lg hover:shadow-md transition-shadow bg-card col-span-2">
                      <div className="flex items-center gap-3 mb-3">
                        <div className="p-2 bg-green-100 dark:bg-green-900/50 rounded-full">
                          <FileText className="h-5 w-5 text-green-600" />
                        </div>
                        <Label className="font-semibold text-lg">Mission Statement</Label>
                      </div>
                      <p className="text-sm text-muted-foreground ml-11">
                        {selectedCharity.mission || 'No mission statement provided'}
                      </p>
                    </div>

                    {selectedCharity.vision && (
                      <div className="p-4 border rounded-lg hover:shadow-md transition-shadow bg-card col-span-2">
                        <div className="flex items-center gap-3 mb-3">
                          <div className="p-2 bg-indigo-100 dark:bg-indigo-900/50 rounded-full">
                            <Eye className="h-5 w-5 text-indigo-600" />
                          </div>
                          <Label className="font-semibold text-lg">Vision Statement</Label>
                        </div>
                        <p className="text-sm text-muted-foreground ml-11">
                          {selectedCharity.vision}
                        </p>
                      </div>
                    )}

                    {selectedCharity.description && (
                      <div className="p-4 border rounded-lg hover:shadow-md transition-shadow bg-card col-span-2">
                        <div className="flex items-center gap-3 mb-3">
                          <div className="p-2 bg-orange-100 dark:bg-orange-900/50 rounded-full">
                            <FileText className="h-5 w-5 text-orange-600" />
                          </div>
                          <Label className="font-semibold text-lg">Description</Label>
                        </div>
                        <p className="text-sm text-muted-foreground ml-11">
                          {selectedCharity.description}
                        </p>
                      </div>
                    )}

                    {selectedCharity.goals && (
                      <div className="p-4 border rounded-lg hover:shadow-md transition-shadow bg-card col-span-2">
                        <div className="flex items-center gap-3 mb-3">
                          <div className="p-2 bg-yellow-100 dark:bg-yellow-900/50 rounded-full">
                            <Target className="h-5 w-5 text-yellow-600" />
                          </div>
                          <Label className="font-semibold text-lg">Goals & Objectives</Label>
                        </div>
                        <p className="text-sm text-muted-foreground ml-11">
                          {selectedCharity.goals}
                        </p>
                      </div>
                    )}

                    {/* Social Media Links */}
                    {(selectedCharity.facebook_url || selectedCharity.instagram_url || selectedCharity.twitter_url || selectedCharity.linkedin_url || selectedCharity.youtube_url) && (
                      <div className="p-4 border rounded-lg hover:shadow-md transition-shadow bg-card col-span-2">
                        <div className="flex items-center gap-3 mb-3">
                          <div className="p-2 bg-pink-100 dark:bg-pink-900/50 rounded-full">
                            <Globe className="h-5 w-5 text-pink-600" />
                          </div>
                          <Label className="font-semibold text-lg">Social Media</Label>
                        </div>
                        <div className="flex flex-wrap gap-3 ml-11">
                          {selectedCharity.facebook_url && (
                            <a href={selectedCharity.facebook_url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 px-3 py-2 bg-blue-50 dark:bg-blue-900/20 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-colors">
                              <Facebook className="h-4 w-4 text-blue-600" />
                              <span className="text-sm">Facebook</span>
                            </a>
                          )}
                          {selectedCharity.instagram_url && (
                            <a href={selectedCharity.instagram_url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 px-3 py-2 bg-pink-50 dark:bg-pink-900/20 rounded-lg hover:bg-pink-100 dark:hover:bg-pink-900/30 transition-colors">
                              <Instagram className="h-4 w-4 text-pink-600" />
                              <span className="text-sm">Instagram</span>
                            </a>
                          )}
                          {selectedCharity.twitter_url && (
                            <a href={selectedCharity.twitter_url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 px-3 py-2 bg-sky-50 dark:bg-sky-900/20 rounded-lg hover:bg-sky-100 dark:hover:bg-sky-900/30 transition-colors">
                              <Twitter className="h-4 w-4 text-sky-600" />
                              <span className="text-sm">Twitter</span>
                            </a>
                          )}
                          {selectedCharity.linkedin_url && (
                            <a href={selectedCharity.linkedin_url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 px-3 py-2 bg-blue-50 dark:bg-blue-900/20 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-colors">
                              <Linkedin className="h-4 w-4 text-blue-700" />
                              <span className="text-sm">LinkedIn</span>
                            </a>
                          )}
                          {selectedCharity.youtube_url && (
                            <a href={selectedCharity.youtube_url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 px-3 py-2 bg-red-50 dark:bg-red-900/20 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/30 transition-colors">
                              <Youtube className="h-4 w-4 text-red-600" />
                              <span className="text-sm">YouTube</span>
                            </a>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Operating Hours */}
                    {selectedCharity.operating_hours && (
                      <div className="p-4 border rounded-lg hover:shadow-md transition-shadow bg-card col-span-2">
                        <div className="flex items-center gap-3 mb-3">
                          <div className="p-2 bg-teal-100 dark:bg-teal-900/50 rounded-full">
                            <Clock className="h-5 w-5 text-teal-600" />
                          </div>
                          <Label className="font-semibold text-lg">Operating Hours</Label>
                        </div>
                        <p className="text-sm text-muted-foreground ml-11">
                          {selectedCharity.operating_hours}
                        </p>
                      </div>
                    )}
                  </div>
                  </ScrollArea>
                </TabsContent>

                <TabsContent value="documents" className="space-y-4 mt-4">
                  <ScrollArea className="h-[500px] pr-4">
                  {selectedCharity.documents && selectedCharity.documents.length > 0 ? (
                    <div className="grid gap-3">
                      {selectedCharity.documents.map((doc, index) => (
                        <motion.div
                          key={doc.id}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: index * 0.1 }}
                          className="p-4 border rounded-lg hover:shadow-md transition-all hover:border-purple-300 bg-card"
                        >
                          <div className="flex items-start justify-between mb-3">
                            <div className="flex items-start gap-3 flex-1">
                              <div className="p-3 bg-purple-100 dark:bg-purple-900/50 rounded-lg">
                                <FileText className="h-6 w-6 text-purple-600" />
                              </div>
                              <div className="flex-1">
                                <div className="flex items-center gap-2 mb-1">
                                  <h4 className="font-semibold">{doc.document_type}</h4>
                                  {getDocumentStatusBadge(doc.verification_status)}
                                </div>
                                <p className="text-xs text-muted-foreground">
                                  Uploaded: {new Date(doc.created_at).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
                                </p>
                                {doc.verified_at && (
                                  <p className="text-xs text-muted-foreground">
                                    Verified: {new Date(doc.verified_at).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
                                  </p>
                                )}
                                {doc.rejection_reason && (
                                  <div className="mt-2 p-2 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded">
                                    <p className="text-xs text-red-600 dark:text-red-400">
                                      <strong>Rejection Reason:</strong> {doc.rejection_reason}
                                    </p>
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                          <div className="flex gap-2 ml-14">
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => handleViewDocument(doc)}
                            >
                              <Eye className="h-4 w-4 mr-2" />
                              View
                            </Button>
                            {doc.file_url && (
                              <Button 
                                variant="outline" 
                                size="sm"
                                onClick={() => window.open(doc.file_url, '_blank')}
                              >
                                <Download className="h-4 w-4 mr-2" />
                                Download
                              </Button>
                            )}
                            {doc.verification_status === 'pending' && (
                              <>
                                <Button 
                                  variant="outline" 
                                  size="sm"
                                  className="text-green-600 hover:text-green-700"
                                  onClick={() => handleApproveDocument(doc.id)}
                                >
                                  <CheckCircle className="h-4 w-4 mr-2" />
                                  Approve
                                </Button>
                                <Button 
                                  variant="outline" 
                                  size="sm"
                                  className="text-red-600 hover:text-red-700"
                                  onClick={() => {
                                    setSelectedDocument(doc);
                                    setIsDocRejectDialogOpen(true);
                                  }}
                                >
                                  <XCircle className="h-4 w-4 mr-2" />
                                  Reject
                                </Button>
                              </>
                            )}
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-12 text-muted-foreground">
                      <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
                      <p>No documents submitted</p>
                    </div>
                  )}
                  </ScrollArea>
                </TabsContent>

                <TabsContent value="campaigns" className="space-y-4 mt-4">
                  {(selectedCharity as any).campaigns && (selectedCharity as any).campaigns.length > 0 ? (
                    <div className="grid gap-3">
                      {(selectedCharity as any).campaigns.map((campaign: any, index: number) => (
                        <motion.div
                          key={index}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: index * 0.1 }}
                          className="p-4 border rounded-lg hover:shadow-md transition-all hover:border-purple-300 bg-card"
                        >
                          <div className="flex items-start justify-between mb-3">
                            <div className="flex-1">
                              <h4 className="font-semibold text-lg">{campaign.title}</h4>
                              <p className="text-sm text-muted-foreground mt-1">{campaign.description}</p>
                            </div>
                            <Badge variant={campaign.status === 'active' ? 'default' : 'secondary'}>
                              {campaign.status}
                            </Badge>
                          </div>
                          <div className="space-y-2">
                            <div className="flex items-center justify-between text-sm">
                              <span className="text-muted-foreground">Goal:</span>
                              <span className="font-semibold">₱{campaign.goal?.toLocaleString() || 0}</span>
                            </div>
                            <div className="flex items-center justify-between text-sm">
                              <span className="text-muted-foreground">Raised:</span>
                              <span className="font-semibold text-green-600">₱{campaign.raised?.toLocaleString() || 0}</span>
                            </div>
                            <Progress value={(campaign.raised / campaign.goal) * 100 || 0} className="h-2" />
                            <div className="flex items-center justify-between text-xs text-muted-foreground">
                              <span>{((campaign.raised / campaign.goal) * 100 || 0).toFixed(1)}% funded</span>
                              <span>{campaign.donors || 0} donors</span>
                            </div>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-12 text-muted-foreground">
                      <TrendingUp className="h-12 w-12 mx-auto mb-4 opacity-50" />
                      <p>No campaigns created yet</p>
                    </div>
                  )}
                </TabsContent>

                <TabsContent value="compliance" className="space-y-4 mt-4">
                  <div className="grid gap-4">
                    <div className="p-4 border rounded-lg bg-card">
                      <div className="flex items-center gap-3 mb-3">
                        <div className="p-2 bg-blue-100 dark:bg-blue-900/50 rounded-full">
                          <Calendar className="h-5 w-5 text-blue-600" />
                        </div>
                        <Label className="font-semibold text-lg">Registration Details</Label>
                      </div>
                      <div className="space-y-2 ml-11">
                        <div className="text-sm">
                          <span className="text-muted-foreground">Submitted:</span>
                          <span className="ml-2 font-medium">{new Date(selectedCharity.created_at).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</span>
                        </div>
                        {(selectedCharity as any).verified_at && (
                          <div className="text-sm">
                            <span className="text-muted-foreground">Verified:</span>
                            <span className="ml-2 font-medium">{new Date((selectedCharity as any).verified_at).toLocaleDateString()}</span>
                          </div>
                        )}
                      </div>
                    </div>

                    {selectedCharity.verification_notes && (
                      <div className="p-4 border rounded-lg bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800">
                        <div className="flex items-center gap-3 mb-2">
                          <AlertCircle className="h-5 w-5 text-yellow-600" />
                          <Label className="font-semibold text-lg">Admin Notes</Label>
                        </div>
                        <p className="text-sm text-muted-foreground ml-8">
                          {selectedCharity.verification_notes}
                        </p>
                      </div>
                    )}
                  </div>
                </TabsContent>
              </Tabs>
            </div>
          )}
          <DialogFooter className="flex gap-2">
            {selectedCharity?.verification_status === "pending" && (
              <>
                <Button
                  variant="outline"
                  onClick={() => handleRequestInfo(selectedCharity.id)}
                  className="border-orange-300 text-orange-600 hover:bg-orange-50"
                >
                  <AlertCircle className="h-4 w-4 mr-2" />
                  Request Info
                </Button>
                <Button
                  variant="destructive"
                  onClick={() => setIsRejectDialogOpen(true)}
                >
                  <XCircle className="h-4 w-4 mr-2" />
                  Reject
                </Button>
                <Button onClick={() => handleApprove(selectedCharity.id)} className="bg-green-600 hover:bg-green-700">
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Approve
                </Button>
              </>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Charity Rejection Dialog */}
      <Dialog open={isRejectDialogOpen} onOpenChange={setIsRejectDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reject Charity Application</DialogTitle>
            <DialogDescription>
              Please provide a reason for rejection
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <Textarea
              placeholder="Enter rejection reason..."
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              rows={4}
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsRejectDialogOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleReject}>
              Confirm Rejection
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Document Rejection Dialog */}
      <Dialog open={isDocRejectDialogOpen} onOpenChange={setIsDocRejectDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reject Document</DialogTitle>
            <DialogDescription>
              Please provide a reason for rejecting this document
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div>
              <Label className="text-sm font-medium mb-2 block">Document Type</Label>
              <p className="text-sm text-muted-foreground">{selectedDocument?.document_type}</p>
            </div>
            <div>
              <Label htmlFor="docReason" className="text-sm font-medium mb-2 block">Rejection Reason</Label>
              <Textarea
                id="docReason"
                placeholder="Enter detailed reason for rejection..."
                value={docRejectReason}
                onChange={(e) => setDocRejectReason(e.target.value)}
                rows={4}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => {
              setIsDocRejectDialogOpen(false);
              setDocRejectReason("");
            }}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleRejectDocument}>
              Confirm Rejection
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* View Document Dialog */}
      <Dialog open={isViewDocDialogOpen} onOpenChange={setIsViewDocDialogOpen}>
        <DialogContent className="max-w-7xl w-[95vw] h-[95vh] max-h-[95vh] p-0 gap-0 flex flex-col">
          <DialogHeader className="px-6 py-4 border-b shrink-0">
            <DialogTitle className="text-xl">Document Viewer</DialogTitle>
            <DialogDescription className="text-base">
              {selectedDocument?.document_type}
            </DialogDescription>
          </DialogHeader>
          
          <div className="flex-1 overflow-hidden flex flex-col min-h-0">
            {selectedDocument?.file_url && (
              <>
                {/* Document Preview - Full Height */}
                <div className="flex-1 bg-gray-100 dark:bg-gray-900 overflow-hidden">
                  <iframe
                    src={selectedDocument.file_url}
                    className="w-full h-full border-0"
                    title="Document Preview"
                    style={{ minHeight: '100%' }}
                  />
                </div>

                {/* Rejection Reason - Fixed at Bottom if exists */}
                {selectedDocument.rejection_reason && (
                  <div className="shrink-0 p-4 bg-red-50 dark:bg-red-900/20 border-t-2 border-red-200 dark:border-red-800">
                    <div className="flex items-start gap-2">
                      <AlertCircle className="h-5 w-5 text-red-600 dark:text-red-400 shrink-0 mt-0.5" />
                      <div>
                        <p className="text-sm font-semibold text-red-900 dark:text-red-100 mb-1">
                          Rejection Reason:
                        </p>
                        <p className="text-sm text-red-700 dark:text-red-300">
                          {selectedDocument.rejection_reason}
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>

          <DialogFooter className="px-6 py-4 border-t shrink-0 flex-row justify-end gap-2">
            {selectedDocument?.verification_status === 'pending' && (
              <>
                <Button
                  variant="outline"
                  className="text-green-600 hover:text-green-700 hover:bg-green-50"
                  onClick={() => {
                    if (selectedDocument) {
                      handleApproveDocument(selectedDocument.id);
                      setIsViewDocDialogOpen(false);
                    }
                  }}
                >
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Approve Document
                </Button>
                <Button
                  variant="destructive"
                  onClick={() => {
                    setIsViewDocDialogOpen(false);
                    setIsDocRejectDialogOpen(true);
                  }}
                >
                  <XCircle className="h-4 w-4 mr-2" />
                  Reject Document
                </Button>
              </>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
