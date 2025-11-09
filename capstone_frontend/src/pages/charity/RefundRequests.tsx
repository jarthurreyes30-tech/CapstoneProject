import { useEffect, useState } from "react";
import { FileText, Calendar, AlertCircle, CheckCircle2, XCircle, Clock, Eye, User, DollarSign, MessageSquare } from "lucide-react";
import api from "@/lib/axios";
import { useNavigate } from "react-router-dom";
import { buildStorageUrl } from "@/lib/api";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";

interface RefundRequest {
  id: number;
  donation_id: number;
  user_id: number;
  charity_id: number;
  reason: string;
  proof_url: string | null;
  status: 'pending' | 'approved' | 'denied' | 'cancelled';
  charity_response: string | null;
  refund_amount: number;
  created_at: string;
  reviewed_at: string | null;
  donation: {
    id: number;
    amount: number;
    donated_at: string;
    campaign: {
      id: number;
      title: string;
    } | null;
  };
  user: {
    id: number;
    name: string;
    email: string;
  };
  reviewer: {
    id: number;
    name: string;
  } | null;
}

interface RefundStats {
  total: number;
  pending: number;
  approved: number;
  denied: number;
  total_amount_requested: number;
  total_amount_approved: number;
}

export default function CharityRefundRequests() {
  const [refunds, setRefunds] = useState<RefundRequest[]>([]);
  const [stats, setStats] = useState<RefundStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedRefund, setSelectedRefund] = useState<RefundRequest | null>(null);
  const [reviewDialog, setReviewDialog] = useState(false);
  const [action, setAction] = useState<'approve' | 'deny'>('approve');
  const [response, setResponse] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [activeTab, setActiveTab] = useState('pending');
  const API_URL = import.meta.env.VITE_API_URL;

  useEffect(() => {
    fetchRefunds();
    fetchStats();
  }, []);

  const fetchRefunds = async () => {
    try {
      setLoading(true);
      const response = await api.get('/charity/refunds');
      setRefunds(response.data.refunds || []);
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to load refund requests');
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await api.get('/charity/refunds/statistics');
      setStats(response.data.statistics);
    } catch (error: any) {
      console.error('Failed to load stats:', error);
    }
  };

  const handleReview = (refund: RefundRequest, reviewAction: 'approve' | 'deny') => {
    setSelectedRefund(refund);
    setAction(reviewAction);
    setResponse('');
    setReviewDialog(true);
  };

  const submitReview = async () => {
    if (!selectedRefund) return;

    setSubmitting(true);
    try {
      await api.post(`/charity/refunds/${selectedRefund.id}/respond`, {
        action,
        response: response.trim() || null,
      });

      toast.success(
        action === 'approve' 
          ? 'Refund approved. The donor has been notified.'
          : 'Refund denied. The donor has been notified.'
      );
      
      setReviewDialog(false);
      setSelectedRefund(null);
      setResponse('');
      fetchRefunds();
      fetchStats();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to submit response');
    } finally {
      setSubmitting(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge variant="secondary" className="bg-yellow-100 text-yellow-800"><Clock className="h-3 w-3 mr-1" />Pending</Badge>;
      case 'approved':
        return <Badge variant="secondary" className="bg-green-100 text-green-800"><CheckCircle2 className="h-3 w-3 mr-1" />Approved</Badge>;
      case 'denied':
        return <Badge variant="secondary" className="bg-red-100 text-red-800"><XCircle className="h-3 w-3 mr-1" />Denied</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  const filteredRefunds = refunds.filter(refund => {
    if (activeTab === 'all') return true;
    return refund.status === activeTab;
  });

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div>
        <div className="flex items-center gap-3 mb-2">
          <div className="h-10 w-10 rounded-full bg-amber-500/10 flex items-center justify-center">
            <FileText className="h-5 w-5 text-amber-600" />
          </div>
          <h1 className="text-3xl font-bold">Refund Requests</h1>
        </div>
        <p className="text-muted-foreground">
          Review and respond to donor refund requests
        </p>
      </div>

      {/* Stats */}
      {stats && (
        <div className="grid gap-4 grid-cols-2 md:grid-cols-3 lg:grid-cols-6">
          <Card className="border-l-4 border-l-blue-500">
            <CardHeader className="pb-2">
              <CardTitle className="text-xs font-medium text-muted-foreground">Total</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">{stats.total}</div>
            </CardContent>
          </Card>
          <Card className="border-l-4 border-l-yellow-500">
            <CardHeader className="pb-2">
              <CardTitle className="text-xs font-medium text-muted-foreground">Pending</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-yellow-600">{stats.pending}</div>
            </CardContent>
          </Card>
          <Card className="border-l-4 border-l-green-500">
            <CardHeader className="pb-2">
              <CardTitle className="text-xs font-medium text-muted-foreground">Approved</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{stats.approved}</div>
            </CardContent>
          </Card>
          <Card className="border-l-4 border-l-red-500">
            <CardHeader className="pb-2">
              <CardTitle className="text-xs font-medium text-muted-foreground">Denied</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">{stats.denied}</div>
            </CardContent>
          </Card>
          <Card className="border-l-4 border-l-purple-500">
            <CardHeader className="pb-2">
              <CardTitle className="text-xs font-medium text-muted-foreground">Requested</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-lg font-bold text-purple-600">₱{stats.total_amount_requested.toLocaleString()}</div>
            </CardContent>
          </Card>
          <Card className="border-l-4 border-l-emerald-500">
            <CardHeader className="pb-2">
              <CardTitle className="text-xs font-medium text-muted-foreground">Approved</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-lg font-bold text-emerald-600">₱{stats.total_amount_approved.toLocaleString()}</div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Refunds List */}
      <Card>
        <CardHeader>
          <CardTitle>Refund Requests</CardTitle>
          <CardDescription>Review and respond to refund requests from donors</CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-4 mb-6">
              <TabsTrigger value="all">All ({stats?.total || 0})</TabsTrigger>
              <TabsTrigger value="pending">Pending ({stats?.pending || 0})</TabsTrigger>
              <TabsTrigger value="approved">Approved ({stats?.approved || 0})</TabsTrigger>
              <TabsTrigger value="denied">Denied ({stats?.denied || 0})</TabsTrigger>
            </TabsList>

            <TabsContent value={activeTab}>
              {loading ? (
                <div className="text-center py-12">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
                  <p className="mt-4 text-muted-foreground">Loading refund requests...</p>
                </div>
              ) : filteredRefunds.length === 0 ? (
                <div className="text-center py-12">
                  <FileText className="h-12 w-12 text-muted-foreground/40 mx-auto mb-4" />
                  <p className="text-muted-foreground">No refund requests found</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {filteredRefunds.map((refund) => (
                    <Card key={refund.id} className="hover:shadow-md transition-shadow">
                      <CardContent className="p-6">
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex-1">
                            <div className="flex items-start justify-between mb-3">
                              <div>
                                <h3 className="font-semibold text-lg">
                                  {refund.donation.campaign?.title || 'General Donation'}
                                </h3>
                                <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
                                  <User className="h-3 w-3" />
                                  <span>{refund.user.name}</span>
                                  <span>•</span>
                                  <span>{refund.user.email}</span>
                                </div>
                              </div>
                              {getStatusBadge(refund.status)}
                            </div>

                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm mb-4">
                              <div>
                                <p className="text-muted-foreground">Amount</p>
                                <p className="font-semibold text-lg">₱{refund.refund_amount.toLocaleString()}</p>
                              </div>
                              <div>
                                <p className="text-muted-foreground">Donated On</p>
                                <p className="font-semibold">{new Date(refund.donation.donated_at).toLocaleDateString()}</p>
                              </div>
                              <div>
                                <p className="text-muted-foreground">Requested</p>
                                <p className="font-semibold">{new Date(refund.created_at).toLocaleDateString()}</p>
                              </div>
                              <div>
                                <p className="text-muted-foreground">Refund ID</p>
                                <p className="font-semibold">#{refund.id}</p>
                              </div>
                            </div>

                            <div className="bg-muted/50 rounded-lg p-4 mb-4">
                              <p className="text-sm text-muted-foreground mb-1">Reason:</p>
                              <p className="text-sm line-clamp-3">{refund.reason}</p>
                            </div>

                            {refund.proof_url && (
                              <div className="mb-4">
                                <a
                                  href={buildStorageUrl(refund.proof_url) || '#'}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-primary hover:underline text-sm flex items-center gap-2"
                                >
                                  <FileText className="h-4 w-4" />
                                  View Proof Document
                                </a>
                              </div>
                            )}

                            {refund.status === 'pending' && (
                              <div className="flex gap-2">
                                <Button
                                  variant="default"
                                  size="sm"
                                  onClick={() => handleReview(refund, 'approve')}
                                  className="bg-green-600 hover:bg-green-700"
                                >
                                  <CheckCircle2 className="h-4 w-4 mr-2" />
                                  Approve
                                </Button>
                                <Button
                                  variant="destructive"
                                  size="sm"
                                  onClick={() => handleReview(refund, 'deny')}
                                >
                                  <XCircle className="h-4 w-4 mr-2" />
                                  Deny
                                </Button>
                              </div>
                            )}

                            {refund.charity_response && (
                              <div className="mt-4 bg-blue-50 border border-blue-200 rounded-lg p-3">
                                <p className="text-sm font-semibold text-blue-900 mb-1">Your Response:</p>
                                <p className="text-sm text-blue-800">{refund.charity_response}</p>
                                {refund.reviewed_at && (
                                  <p className="text-xs text-blue-600 mt-2">
                                    Responded on {new Date(refund.reviewed_at).toLocaleDateString()}
                                  </p>
                                )}
                              </div>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Review Dialog */}
      <Dialog open={reviewDialog} onOpenChange={setReviewDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {action === 'approve' ? 'Approve Refund Request' : 'Deny Refund Request'}
            </DialogTitle>
            <DialogDescription>
              Provide a response to the donor about their refund request
            </DialogDescription>
          </DialogHeader>

          {selectedRefund && (
            <div className="space-y-4">
              {/* Warning Banner */}
              <div className={`p-4 rounded-lg border-2 ${
                action === 'approve' ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'
              }`}>
                <div className="flex items-start gap-3">
                  {action === 'approve' ? (
                    <CheckCircle2 className="h-5 w-5 text-green-600 mt-0.5" />
                  ) : (
                    <XCircle className="h-5 w-5 text-red-600 mt-0.5" />
                  )}
                  <div>
                    <p className={`font-semibold ${action === 'approve' ? 'text-green-900' : 'text-red-900'} mb-1`}>
                      {action === 'approve' ? 'Approving Refund' : 'Denying Refund'}
                    </p>
                    <p className={`text-sm ${action === 'approve' ? 'text-green-800' : 'text-red-800'}`}>
                      {action === 'approve' 
                        ? 'You will need to process the refund manually to the donor\'s original payment method.'
                        : 'Make sure to provide a clear reason for denying this refund request.'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Refund Details */}
              <div className="bg-muted/50 rounded-lg p-4 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Donor:</span>
                  <span className="font-semibold">{selectedRefund.user.name}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Amount:</span>
                  <span className="font-semibold">₱{selectedRefund.refund_amount.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Campaign:</span>
                  <span className="font-semibold">{selectedRefund.donation.campaign?.title || 'General Fund'}</span>
                </div>
              </div>

              {/* Donor's Reason */}
              <div>
                <Label className="text-sm text-muted-foreground">Donor's Reason:</Label>
                <div className="mt-2 p-3 bg-muted rounded-lg">
                  <p className="text-sm">{selectedRefund.reason}</p>
                </div>
              </div>

              {/* Response */}
              <div>
                <Label htmlFor="response">Your Response (Optional)</Label>
                <Textarea
                  id="response"
                  placeholder={
                    action === 'approve'
                      ? 'Add a message (e.g., "Approved – refund sent via GCash" or "Your refund has been processed")'
                      : 'Explain why the refund is being denied (recommended)'
                  }
                  value={response}
                  onChange={(e) => setResponse(e.target.value)}
                  maxLength={1000}
                  className="mt-2 min-h-[100px]"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  {response.length}/1000 characters
                </p>
              </div>

              {/* Next Steps */}
              {action === 'approve' && (
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                  <p className="text-sm text-yellow-900">
                    <strong>Remember:</strong> After approval, you must manually process the refund to the donor through their original payment method (e.g., bank transfer, GCash, etc.). The donor will be notified by email.
                  </p>
                </div>
              )}
            </div>
          )}

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setReviewDialog(false)}
              disabled={submitting}
            >
              Cancel
            </Button>
            <Button
              variant={action === 'approve' ? 'default' : 'destructive'}
              onClick={submitReview}
              disabled={submitting}
              className={action === 'approve' ? 'bg-green-600 hover:bg-green-700' : ''}
            >
              {submitting ? 'Submitting...' : action === 'approve' ? 'Approve Refund' : 'Deny Refund'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
