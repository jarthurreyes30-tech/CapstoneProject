import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { AlertTriangle, Eye, CheckCircle, XCircle, Clock, Search, Filter, User, Building2, TrendingUp, Coins, Ban, Shield, FileText, Calendar, AlertCircle, Info, Image as ImageIcon, Mail } from "lucide-react";
import { motion } from "framer-motion";
import { toast } from "sonner";
import axios from "axios";
import { reportsService } from "@/services/reports";
import { Label } from "@/components/ui/label";

interface Report {
  id: number;
  reporter: {
    id: number;
    name: string;
    email: string;
    profile_image?: string;
  };
  reporter_role: string;
  reported_entity_type: string;
  reported_entity_id: number;
  reported_entity?: {
    id: number;
    name: string;
    email?: string;
    profile_image?: string;
    logo_path?: string;
    role?: string;
  };
  target_type?: string;
  target_id?: number;
  reason: string;
  report_type?: string;
  severity?: 'pending' | 'low' | 'medium' | 'high' | 'critical';
  details?: string;
  description: string;
  evidence_path?: string;
  status: string;
  penalty_days?: number;
  admin_notes?: string;
  reviewed_by?: number;
  reviewed_at?: string;
  action_taken?: string;
  created_at: string;
}

interface ReportStatistics {
  total: number;
  pending: number;
  under_review: number;
  resolved: number;
  dismissed: number;
  by_reason: Array<{ reason: string; count: number }>;
  recent: Report[];
}

export default function AdminReports() {
  const [reports, setReports] = useState<Report[]>([]);
  const [statistics, setStatistics] = useState<ReportStatistics | null>(null);
  const [selectedReport, setSelectedReport] = useState<Report | null>(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [isReviewOpen, setIsReviewOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [entityTypeFilter, setEntityTypeFilter] = useState("all");
  const [reasonFilter, setReasonFilter] = useState("all");

  // Review form state
  const [reviewStatus, setReviewStatus] = useState("");
  const [actionTaken, setActionTaken] = useState("");
  const [adminNotes, setAdminNotes] = useState("");
  const [penaltyDays, setPenaltyDays] = useState<number | null>(null);
  const [customDays, setCustomDays] = useState("");
  const [adminSeverity, setAdminSeverity] = useState<'low' | 'medium' | 'high' | 'critical' | ''>('');
  const [suspending, setSuspending] = useState(false);

  useEffect(() => {
    fetchReports();
    fetchStatistics();
  }, [statusFilter, entityTypeFilter, reasonFilter, searchTerm]);

  const fetchReports = async () => {
    try {
      const params = new URLSearchParams();
      if (statusFilter !== "all") params.append("status", statusFilter);
      if (entityTypeFilter !== "all") params.append("entity_type", entityTypeFilter);
      if (reasonFilter !== "all") params.append("reason", reasonFilter);
      if (searchTerm) params.append("search", searchTerm);

      const response = await axios.get(`/admin/reports?${params.toString()}`);
      setReports(response.data.data || []);
    } catch (error) {
      console.error("Failed to fetch reports:", error);
      toast.error("Failed to fetch reports");
      setReports([]); // Ensure reports is always an array
    } finally {
      setLoading(false);
    }
  };

  const fetchStatistics = async () => {
    try {
      const response = await axios.get("/admin/reports/statistics");
      setStatistics(response.data);
    } catch (error) {
      console.error("Failed to fetch statistics:", error);
    }
  };

  const handleViewDetails = async (report: Report) => {
    try {
      const response = await axios.get(`/admin/reports/${report.id}`);
      setSelectedReport(response.data.report);
      setIsDetailsOpen(true);
    } catch (error) {
      toast.error("Failed to fetch report details");
    }
  };

  const handleReviewReport = (report: Report) => {
    setSelectedReport(report);
    resetReviewForm();
    // Set default penalty based on severity if available
    if (report.severity) {
      const severityMap = { low: 3, medium: 7, high: 15 };
      setPenaltyDays(severityMap[report.severity as keyof typeof severityMap] || 7);
    } else {
      setPenaltyDays(7);
    }
    setIsReviewOpen(true);
  };

  const handleApproveReport = async () => {
    if (!selectedReport) return;
    
    const days = customDays ? parseInt(customDays) : penaltyDays;
    
    if (!days || days < 1) {
      toast.error("Please select or enter penalty days");
      return;
    }

    try {
      setSuspending(true);
      await reportsService.approveReport(selectedReport.id, {
        penalty_days: days,
        admin_notes: adminNotes,
      });

      toast.success(`Report approved. User suspended for ${days} days.`);
      setIsReviewOpen(false);
      resetReviewForm();
      fetchReports();
      fetchStatistics();
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to approve report");
    } finally {
      setSuspending(false);
    }
  };

  const handleRejectReport = async () => {
    if (!selectedReport) return;
    
    if (!adminNotes || adminNotes.length < 10) {
      toast.error("Please provide admin notes (minimum 10 characters)");
      return;
    }

    try {
      setSuspending(true);
      await reportsService.rejectReport(selectedReport.id, adminNotes);

      toast.success("Report rejected. No action taken.");
      setIsReviewOpen(false);
      resetReviewForm();
      fetchReports();
      fetchStatistics();
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to reject report");
    } finally {
      setSuspending(false);
    }
  };

  const resetReviewForm = () => {
    setAdminNotes("");
    setPenaltyDays(null);
    setCustomDays("");
    setReviewStatus("");
    setActionTaken("");
  };

  const deleteReport = async (reportId: number) => {
    if (!confirm("Are you sure you want to delete this report?")) return;

    try {
      await axios.delete(`/admin/reports/${reportId}`);
      toast.success("Report deleted successfully");
      fetchReports();
      fetchStatistics();
    } catch (error) {
      toast.error("Failed to delete report");
    }
  };

  const getStatusBadge = (status: string) => {
    const variants = {
      pending: "destructive",
      under_review: "default",
      resolved: "default",
      dismissed: "secondary",
    } as const;

    const colors = {
      pending: "bg-red-100 text-red-800",
      under_review: "bg-yellow-100 text-yellow-800",
      resolved: "bg-green-100 text-green-800",
      dismissed: "bg-gray-100 text-gray-800",
    };

    return (
      <Badge className={colors[status as keyof typeof colors]}>
        {status.replace("_", " ").toUpperCase()}
      </Badge>
    );
  };

  const formatReason = (reason: string) => {
    return reason.replace(/_/g, " ").replace(/\b\w/g, l => l.toUpperCase());
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4"
      >
        <div>
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold tracking-tight bg-gradient-to-r from-red-600 to-orange-600 bg-clip-text text-transparent">
            Reports Management
          </h1>
          <p className="text-muted-foreground mt-2 text-sm sm:text-base md:text-lg">
            Review and manage user reports
          </p>
        </div>
      </motion.div>

      {/* Statistics Cards */}
      {statistics && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
            <Card className="border-l-4 border-l-blue-500 bg-gradient-to-br from-blue-50 to-white dark:from-blue-950/30 dark:to-background">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Total Reports</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-blue-600">{statistics.total}</div>
              </CardContent>
            </Card>
          </motion.div>
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
            <Card className="border-l-4 border-l-red-500 bg-gradient-to-br from-red-50 to-white dark:from-red-950/30 dark:to-background">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Pending</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-red-600">{statistics.pending}</div>
              </CardContent>
            </Card>
          </motion.div>
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
            <Card className="border-l-4 border-l-yellow-500 bg-gradient-to-br from-yellow-50 to-white dark:from-yellow-950/30 dark:to-background">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Under Review</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-yellow-600">{statistics.under_review}</div>
              </CardContent>
            </Card>
          </motion.div>
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
            <Card className="border-l-4 border-l-green-500 bg-gradient-to-br from-green-50 to-white dark:from-green-950/30 dark:to-background">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Resolved</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-green-600">{statistics.resolved}</div>
              </CardContent>
            </Card>
          </motion.div>
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}>
            <Card className="border-l-4 border-l-gray-500 bg-gradient-to-br from-gray-50 to-white dark:from-gray-800/30 dark:to-background">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Dismissed</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-gray-600">{statistics.dismissed}</div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      )}

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filters
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search reports..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="under_review">Under Review</SelectItem>
                <SelectItem value="resolved">Resolved</SelectItem>
                <SelectItem value="dismissed">Dismissed</SelectItem>
              </SelectContent>
            </Select>
            <Select value={entityTypeFilter} onValueChange={setEntityTypeFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Filter by entity type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="user">User</SelectItem>
                <SelectItem value="charity">Charity</SelectItem>
                <SelectItem value="campaign">Campaign</SelectItem>
                <SelectItem value="donation">Donation</SelectItem>
              </SelectContent>
            </Select>
            <Select value={reasonFilter} onValueChange={setReasonFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Filter by reason" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Reasons</SelectItem>
                <SelectItem value="fraud">Fraud</SelectItem>
                <SelectItem value="fake_proof">Fake Proof</SelectItem>
                <SelectItem value="inappropriate_content">Inappropriate Content</SelectItem>
                <SelectItem value="scam">Scam</SelectItem>
                <SelectItem value="fake_charity">Fake Charity</SelectItem>
                <SelectItem value="misuse_of_funds">Misuse of Funds</SelectItem>
                <SelectItem value="spam">Spam</SelectItem>
                <SelectItem value="harassment">Harassment</SelectItem>
                <SelectItem value="other">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Reports Cards Grid */}
      <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
        {(reports || []).length === 0 ? (
          <div className="col-span-full text-center py-12 text-muted-foreground">
            <AlertTriangle className="h-16 w-16 mx-auto mb-4 opacity-50" />
            <p className="text-lg">No reports found</p>
          </div>
        ) : (
          (reports || []).map((report, index) => {
            const getEntityIcon = () => {
              switch(report.reported_entity_type) {
                case 'user': return User;
                case 'charity': return Building2;
                case 'campaign': return TrendingUp;
                case 'donation': return Coins;
                default: return AlertTriangle;
              }
            };
            const EntityIcon = getEntityIcon();
            
            return (
              <motion.div
                key={report.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                whileHover={{ scale: 1.02 }}
                className="cursor-pointer"
                onClick={() => handleViewDetails(report)}
              >
                <Card className="hover:shadow-lg transition-all duration-300 border-l-4 border-l-red-500 bg-gradient-to-br from-red-50/50 to-white dark:from-red-950/20 dark:to-background">
                  <CardContent className="p-6">
                    {/* Report Header */}
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div className="p-3 bg-red-100 dark:bg-red-900/50 rounded-full">
                          <AlertTriangle className="h-6 w-6 text-red-600" />
                        </div>
                        <div>
                          <h3 className="font-bold text-lg">Report #{report.id}</h3>
                          <p className="text-xs text-muted-foreground">{formatReason(report.reason)}</p>
                        </div>
                      </div>
                      {getStatusBadge(report.status)}
                    </div>

                    {/* Reporter Info */}
                    <div className="mb-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                      <p className="text-xs text-muted-foreground mb-1">Reported by</p>
                      <p className="font-semibold text-sm">{report.reporter.name}</p>
                      <p className="text-xs text-muted-foreground">{report.reporter_role}</p>
                    </div>

                    {/* Entity Info */}
                    <div className="mb-4 p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                      <div className="flex items-center gap-2 mb-1">
                        <EntityIcon className="h-4 w-4 text-purple-600" />
                        <p className="text-xs text-muted-foreground">Reported Entity</p>
                      </div>
                      <p className="font-semibold text-sm capitalize">{report.reported_entity_type} #{report.reported_entity_id}</p>
                    </div>

                    {/* Description Preview */}
                    <p className="text-xs text-muted-foreground mb-4 line-clamp-2">
                      {report.description}
                    </p>

                    {/* Date */}
                    <div className="flex items-center gap-2 text-xs text-muted-foreground mb-4">
                      <Clock className="h-3 w-3" />
                      <span>{new Date(report.created_at).toLocaleDateString()}</span>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-2">
                      {report.status === "pending" && (
                        <Button
                          size="sm"
                          className="flex-1 bg-green-600 hover:bg-green-700"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleReviewReport(report);
                          }}
                        >
                          <CheckCircle className="h-3 w-3 mr-1" />
                          Review
                        </Button>
                      )}
                      <Button
                        variant="outline"
                        size="sm"
                        className="flex-1 text-red-600 hover:text-red-700"
                        onClick={(e) => {
                          e.stopPropagation();
                          deleteReport(report.id);
                        }}
                      >
                        <XCircle className="h-3 w-3 mr-1" />
                        Delete
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })
        )}
      </div>

      {/* Report Details Dialog */}
      <Dialog open={isDetailsOpen} onOpenChange={setIsDetailsOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Report Details</DialogTitle>
            <DialogDescription>
              Full details of report #{selectedReport?.id}
            </DialogDescription>
          </DialogHeader>
          {selectedReport && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium">Reporter</label>
                  <p className="text-sm">{selectedReport.reporter.name}</p>
                  <p className="text-xs text-muted-foreground">{selectedReport.reporter.email}</p>
                </div>
                <div>
                  <label className="text-sm font-medium">Status</label>
                  <div className="mt-1">{getStatusBadge(selectedReport.status)}</div>
                </div>
              </div>
              <div>
                <label className="text-sm font-medium">Description</label>
                <p className="text-sm mt-1 p-2 bg-gray-50 dark:bg-gray-800 rounded">{selectedReport.description}</p>
              </div>
              {selectedReport.evidence_path && (
                <div>
                  <label className="text-sm font-medium">Evidence</label>
                  <p className="text-sm mt-1">
                    <a 
                      href={`${import.meta.env.VITE_API_URL}/storage/${selectedReport.evidence_path}`} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:underline"
                    >
                      View Evidence File
                    </a>
                  </p>
                </div>
              )}
              {selectedReport.admin_notes && (
                <div>
                  <label className="text-sm font-medium">Admin Notes</label>
                  <p className="text-sm mt-1 p-2 bg-blue-50 dark:bg-blue-900/20 rounded">{selectedReport.admin_notes}</p>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Review Report Dialog */}
      <Dialog open={isReviewOpen} onOpenChange={setIsReviewOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-orange-600" />
              Review Report #{selectedReport?.id}
            </DialogTitle>
            <DialogDescription>
              Approve to suspend user or reject to dismiss the report
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-6">
            {/* Enhanced Report Information */}
            {selectedReport && (
              <>
                {/* Report Details Card */}
                <Card className="border-2 border-orange-200 dark:border-orange-800 bg-gradient-to-br from-orange-50/50 to-white dark:from-orange-950/20 dark:to-background">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base flex items-center gap-2">
                      <AlertTriangle className="h-5 w-5 text-orange-600" />
                      Report Details
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <p className="text-xs text-muted-foreground mb-1">Report Type</p>
                        <p className="font-semibold text-base">{formatReason(selectedReport.reason)}</p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground mb-1">Current Severity</p>
                        {selectedReport.severity && selectedReport.severity !== 'pending' ? (
                          <Badge variant={
                            selectedReport.severity === 'critical' || selectedReport.severity === 'high' 
                              ? 'destructive' 
                              : selectedReport.severity === 'medium' 
                                ? 'default' 
                                : 'secondary'
                          }>
                            {selectedReport.severity.toUpperCase()}
                          </Badge>
                        ) : (
                          <Badge variant="outline" className="text-gray-500">PENDING - Admin will decide</Badge>
                        )}
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground mb-1">Reported Entity</p>
                        <p className="font-semibold capitalize">{selectedReport.reported_entity_type} #{selectedReport.reported_entity_id}</p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground mb-1">Submitted On</p>
                        <p className="font-medium text-sm">{new Date(selectedReport.created_at).toLocaleString()}</p>
                      </div>
                    </div>
                    
                    {/* Reporter and Reported User Info - Two Column Layout */}
                    <div className="border-t pt-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* Reporter Info */}
                        <div>
                          <p className="text-xs text-muted-foreground mb-2 font-semibold">Reported By</p>
                          <div className="flex items-center gap-3 p-3 bg-blue-50 dark:bg-blue-950/30 rounded-lg border border-blue-200 dark:border-blue-800">
                            {selectedReport.reporter.profile_image ? (
                              <img 
                                src={`${import.meta.env.VITE_API_URL}/storage/${selectedReport.reporter.profile_image}`}
                                alt={selectedReport.reporter.name}
                                className="h-12 w-12 rounded-full object-cover border-2 border-blue-300"
                                onError={(e) => {
                                  console.error('Failed to load reporter image:', selectedReport.reporter.profile_image);
                                  e.currentTarget.style.display = 'none';
                                  e.currentTarget.nextElementSibling?.classList.remove('hidden');
                                }}
                              />
                            ) : null}
                            <div className={`h-12 w-12 rounded-full bg-blue-100 dark:bg-blue-900/50 flex items-center justify-center border-2 border-blue-300 ${selectedReport.reporter.profile_image ? 'hidden' : ''}`}>
                              <User className="h-6 w-6 text-blue-600" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="font-semibold truncate">{selectedReport.reporter.name}</p>
                              <p className="text-xs text-muted-foreground truncate">{selectedReport.reporter.email}</p>
                              <p className="text-xs text-blue-600 font-medium mt-0.5">{selectedReport.reporter_role}</p>
                            </div>
                          </div>
                        </div>
                        
                        {/* Reported User/Entity Info */}
                        <div>
                          <p className="text-xs text-muted-foreground mb-2 font-semibold">Reported {selectedReport.reported_entity_type}</p>
                          <div className="flex items-center gap-3 p-3 bg-red-50 dark:bg-red-950/30 rounded-lg border border-red-200 dark:border-red-800">
                            {selectedReport.reported_entity ? (
                              <>
                                {(selectedReport.reported_entity.profile_image || selectedReport.reported_entity.logo_path) ? (
                                  <img 
                                    src={`${import.meta.env.VITE_API_URL}/storage/${selectedReport.reported_entity.profile_image || selectedReport.reported_entity.logo_path}`}
                                    alt={selectedReport.reported_entity.name}
                                    className="h-12 w-12 rounded-full object-cover border-2 border-red-300"
                                    onError={(e) => {
                                      console.error('Failed to load entity image:', selectedReport.reported_entity.profile_image || selectedReport.reported_entity.logo_path);
                                      e.currentTarget.style.display = 'none';
                                      e.currentTarget.nextElementSibling?.classList.remove('hidden');
                                    }}
                                  />
                                ) : null}
                                <div className={`h-12 w-12 rounded-full bg-red-100 dark:bg-red-900/50 flex items-center justify-center border-2 border-red-300 ${(selectedReport.reported_entity.profile_image || selectedReport.reported_entity.logo_path) ? 'hidden' : ''}`}>
                                  {selectedReport.reported_entity_type === 'charity' ? (
                                    <Building2 className="h-6 w-6 text-red-600" />
                                  ) : (
                                    <User className="h-6 w-6 text-red-600" />
                                  )}
                                </div>
                                <div className="flex-1 min-w-0">
                                  <p className="font-semibold truncate">{selectedReport.reported_entity.name}</p>
                                  {selectedReport.reported_entity.email && (
                                    <p className="text-xs text-muted-foreground truncate">{selectedReport.reported_entity.email}</p>
                                  )}
                                  <p className="text-xs text-red-600 font-medium mt-0.5">ID: #{selectedReport.reported_entity.id}</p>
                                </div>
                              </>
                            ) : (
                              <>
                                <div className="h-12 w-12 rounded-full bg-red-100 dark:bg-red-900/50 flex items-center justify-center border-2 border-red-300">
                                  <AlertCircle className="h-6 w-6 text-red-600" />
                                </div>
                                <div className="flex-1">
                                  <p className="font-semibold capitalize">{selectedReport.reported_entity_type}</p>
                                  <p className="text-xs text-muted-foreground">ID: #{selectedReport.reported_entity_id}</p>
                                  <p className="text-xs text-red-600">Entity not found</p>
                                </div>
                              </>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    {/* Full Description */}
                    <div className="border-t pt-4">
                      <p className="text-xs text-muted-foreground mb-2">Report Description</p>
                      <div className="p-3 bg-gray-50 dark:bg-gray-900/50 rounded-lg border">
                        <p className="text-sm whitespace-pre-wrap">{selectedReport.details || selectedReport.description}</p>
                      </div>
                    </div>
                    
                    {/* Evidence */}
                    {selectedReport.evidence_path && (
                      <div className="border-t pt-4">
                        <p className="text-xs text-muted-foreground mb-2">Evidence Submitted</p>
                        <a 
                          href={`${import.meta.env.VITE_API_URL}/storage/${selectedReport.evidence_path}`} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-2 px-4 py-2 bg-purple-50 dark:bg-purple-950/30 hover:bg-purple-100 dark:hover:bg-purple-950/50 rounded-lg text-purple-700 dark:text-purple-300 transition-colors"
                        >
                          <ImageIcon className="h-4 w-4" />
                          View Evidence File
                        </a>
                      </div>
                    )}
                  </CardContent>
                </Card>
                
                {/* Admin Decision Section */}
                <Card className="border-2 border-green-200 dark:border-green-800">
                  <CardHeader className="pb-3 bg-green-50 dark:bg-green-950/30">
                    <CardTitle className="text-base flex items-center gap-2">
                      <Shield className="h-5 w-5 text-green-600" />
                      Admin Decision
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4 pt-4">
                    {/* Severity Selection */}
                    <div className="space-y-2">
                      <Label className="text-sm font-semibold">Set Severity Level <span className="text-red-500">*</span></Label>
                      <p className="text-xs text-muted-foreground mb-2">As admin, you determine the final severity of this report</p>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                        <Button
                          type="button"
                          variant={adminSeverity === 'low' ? "default" : "outline"}
                          onClick={() => setAdminSeverity('low')}
                          className="w-full"
                        >
                          Low
                        </Button>
                        <Button
                          type="button"
                          variant={adminSeverity === 'medium' ? "default" : "outline"}
                          onClick={() => setAdminSeverity('medium')}
                          className="w-full"
                        >
                          Medium
                        </Button>
                        <Button
                          type="button"
                          variant={adminSeverity === 'high' ? "default" : "outline"}
                          onClick={() => setAdminSeverity('high')}
                          className="w-full bg-orange-600 hover:bg-orange-700 text-white"
                        >
                          High
                        </Button>
                        <Button
                          type="button"
                          variant={adminSeverity === 'critical' ? "default" : "outline"}
                          onClick={() => setAdminSeverity('critical')}
                          className="w-full bg-red-600 hover:bg-red-700 text-white"
                        >
                          Critical
                        </Button>
                      </div>
                    </div>

            {/* Penalty Days Selection */}
            <div className="space-y-2">
              <Label>Suspension Duration (if approving)</Label>
              <div className="grid grid-cols-3 gap-2">
                <Button
                  type="button"
                  variant={penaltyDays === 3 ? "default" : "outline"}
                  onClick={() => { setPenaltyDays(3); setCustomDays(""); }}
                  className="w-full"
                >
                  3 Days
                </Button>
                <Button
                  type="button"
                  variant={penaltyDays === 7 ? "default" : "outline"}
                  onClick={() => { setPenaltyDays(7); setCustomDays(""); }}
                  className="w-full"
                >
                  7 Days
                </Button>
                <Button
                  type="button"
                  variant={penaltyDays === 15 ? "default" : "outline"}
                  onClick={() => { setPenaltyDays(15); setCustomDays(""); }}
                  className="w-full"
                >
                  15 Days
                </Button>
              </div>
              <div className="flex gap-2 items-center">
                <Label className="text-sm whitespace-nowrap">Custom:</Label>
                <Input
                  type="number"
                  min="1"
                  max="90"
                  placeholder="Enter days"
                  value={customDays}
                  onChange={(e) => { setCustomDays(e.target.value); setPenaltyDays(null); }}
                  className="flex-1"
                />
              </div>
            </div>

                    {/* Admin Notes */}
                    <div className="space-y-2">
                      <Label className="text-sm font-semibold">Admin Notes <span className="text-red-500">*</span></Label>
                      <p className="text-xs text-muted-foreground mb-2">Required for all decisions. Explain your reasoning.</p>
                      <Textarea
                        value={adminNotes}
                        onChange={(e) => setAdminNotes(e.target.value)}
                        placeholder="Provide detailed notes about your decision and reasoning..."
                        rows={4}
                        className="resize-none"
                      />
                    </div>
                  </CardContent>
                </Card>
              </>
            )}

            {/* Action Buttons */}
            <Card className="border-t-4 border-t-gray-300 dark:border-t-gray-700 bg-gray-50 dark:bg-gray-900/50">
              <CardContent className="pt-6">
                <div className="flex flex-col sm:flex-row gap-3 justify-end">
                  <Button 
                    variant="outline" 
                    onClick={() => setIsReviewOpen(false)} 
                    disabled={suspending}
                    className="order-3 sm:order-1"
                  >
                    Cancel
                  </Button>
                  <Button 
                    variant="outline"
                    onClick={handleRejectReport}
                    disabled={suspending}
                    className="order-2 text-gray-700 hover:bg-gray-100 border-2"
                  >
                    <XCircle className="h-4 w-4 mr-2" />
                    Dismiss Report
                  </Button>
                  <Button 
                    onClick={handleApproveReport}
                    disabled={suspending}
                    className="order-1 sm:order-3 bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700 text-white font-semibold shadow-lg"
                  >
                    {suspending ? (
                      <>
                        <Clock className="h-4 w-4 mr-2 animate-spin" />
                        Processing...
                      </>
                    ) : (
                      <>
                        <Ban className="h-4 w-4 mr-2" />
                        Approve & Suspend User
                      </>
                    )}
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground text-center mt-3">
                  ⚠️ Make sure all information is reviewed before taking action
                </p>
              </CardContent>
            </Card>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
