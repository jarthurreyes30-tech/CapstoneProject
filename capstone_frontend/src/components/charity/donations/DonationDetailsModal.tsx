import { useState } from "react";
import { 
  CheckCircle, XCircle, Download, FileText, User, 
  Calendar, DollarSign, CreditCard, MessageSquare, X,
  MapPin, Phone, Mail, Hash, Receipt, Image as ImageIcon, UserCircle2
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import { Donation } from "@/services/donations";
import { buildStorageUrl } from "@/lib/api";

interface DonationDetailsModalProps {
  donation: Donation | null;
  open: boolean;
  onClose: () => void;
  onConfirm: (id: number) => void;
  onReject: (id: number, reason: string) => void;
  onRefresh: () => void;
}

export default function DonationDetailsModal({
  donation,
  open,
  onClose,
  onConfirm,
  onReject,
  onRefresh,
}: DonationDetailsModalProps) {
  const [isRejectMode, setIsRejectMode] = useState(false);
  const [rejectReason, setRejectReason] = useState("");
  const [submitting, setSubmitting] = useState(false);

  if (!donation) return null;

  const handleConfirm = async () => {
    try {
      setSubmitting(true);
      await onConfirm(donation.id);
      toast.success("Donation confirmed successfully");
      onClose();
      onRefresh();
    } catch (error) {
      toast.error("Failed to confirm donation");
    } finally {
      setSubmitting(false);
    }
  };

  const handleReject = async () => {
    if (!rejectReason.trim()) {
      toast.error("Please provide a reason for rejection");
      return;
    }

    try {
      setSubmitting(true);
      await onReject(donation.id, rejectReason);
      toast.success("Donation rejected");
      setIsRejectMode(false);
      setRejectReason("");
      onClose();
      onRefresh();
    } catch (error) {
      toast.error("Failed to reject donation");
    } finally {
      setSubmitting(false);
    }
  };


  const handleDownloadProof = () => {
    if (donation.proof_path) {
      const imageUrl = buildStorageUrl(donation.proof_path);
      window.open(imageUrl, '_blank');
    }
  };

  const handleDownloadReceipt = () => {
    // TODO: Implement receipt download
    toast.info("Generating receipt...");
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge variant="secondary" className="bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300">Pending</Badge>;
      case 'completed':
        return <Badge className="bg-green-600 dark:bg-green-700">Completed</Badge>;
      case 'rejected':
        return <Badge variant="destructive">Rejected</Badge>;
      case 'refunded':
        return <Badge className="bg-orange-600 dark:bg-orange-700">Refunded</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  const API_URL = import.meta.env.VITE_API_URL || '';
  const proofImageUrl = donation.proof_path ? `${API_URL}/storage/${donation.proof_path}` : null;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-[95vw] sm:max-w-3xl lg:max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader className="flex-shrink-0">
          <DialogTitle className="flex items-center justify-between text-base sm:text-lg">
            <span>Donation Details</span>
            {getStatusBadge(donation.status)}
          </DialogTitle>
          <DialogDescription className="text-xs sm:text-sm">
            Transaction ID: #{donation.id.toString().padStart(6, '0')}
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto space-y-6 px-1">
          {/* Donor Information */}
          <div className="space-y-3">
            <h3 className="font-semibold flex items-center gap-2">
              {donation.donor?.profile_image ? (
                <div className="w-6 h-6 rounded-full overflow-hidden border border-primary">
                  <img
                    src={buildStorageUrl(donation.donor.profile_image)}
                    alt={donation.donor.name}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.currentTarget.parentElement!.innerHTML = '<svg class="w-6 h-6 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path></svg>';
                    }}
                  />
                </div>
              ) : (
                <div className="w-6 h-6 rounded-full bg-muted flex items-center justify-center border border-primary">
                  <User className="h-3 w-3 text-primary" />
                </div>
              )}
              Donor Information
              {donation.is_anonymous && (
                <Badge variant="secondary" className="ml-2 text-xs">Anonymous</Badge>
              )}
            </h3>
            <div className="p-4 bg-muted/50 rounded-lg">
              {(donation.donor || donation.donor_name) && (
                <div className="flex items-center gap-3 sm:gap-4 mb-4 pb-4 border-b">
                  <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-full overflow-hidden border-2 border-primary/20 flex-shrink-0 bg-muted flex items-center justify-center">
                    {donation.donor?.profile_image ? (
                      <img
                        src={buildStorageUrl(donation.donor.profile_image)}
                        alt={donation.donor?.name || donation.donor_name}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.currentTarget.style.display = 'none';
                          const parent = e.currentTarget.parentElement;
                          if (parent) {
                            parent.innerHTML = `<svg class="w-6 h-6 sm:w-8 sm:h-8 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path></svg>`;
                          }
                        }}
                      />
                    ) : (
                      <User className="w-6 h-6 sm:w-8 sm:h-8 text-muted-foreground" />
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="font-semibold text-base sm:text-lg truncate">
                      {donation.donor?.name || donation.donor_name || "Unknown"}
                      {donation.is_anonymous && (
                        <Badge variant="outline" className="ml-2 text-xs">Anonymous Donation</Badge>
                      )}
                    </p>
                    <p className="text-xs sm:text-sm text-muted-foreground truncate">
                      {donation.donor?.email || donation.donor_email || "N/A"}
                    </p>
                  </div>
                </div>
              )}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label className="text-xs text-muted-foreground flex items-center gap-1">
                    <User className="h-3 w-3" />
                    Name
                  </Label>
                  <p className="font-medium">
                    {donation.donor?.name || donation.donor_name || "Unknown"}
                    {donation.is_anonymous && (
                      <span className="ml-2 text-xs text-amber-600 dark:text-amber-400">(Public: Anonymous)</span>
                    )}
                  </p>
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground flex items-center gap-1">
                    <Mail className="h-3 w-3" />
                    Email
                  </Label>
                  <p className="font-medium text-sm break-all">
                    {donation.donor?.email || donation.donor_email || "N/A"}
                    {donation.is_anonymous && (
                      <span className="ml-2 text-xs text-amber-600 dark:text-amber-400">(Hidden from public)</span>
                    )}
                  </p>
                </div>
              </div>
            </div>
          </div>

          <Separator />

          {/* Donation Details */}
          <div className="space-y-3">
            <h3 className="font-semibold flex items-center gap-2">
              <DollarSign className="h-4 w-4 text-primary" />
              Donation Details
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
              <div className="p-3 sm:p-4 bg-gradient-to-br from-primary/10 to-primary/5 rounded-lg border border-primary/20">
                <Label className="text-xs text-muted-foreground">Amount</Label>
                <p className="text-xl sm:text-2xl md:text-3xl font-bold text-primary">
                  ₱{donation.amount.toLocaleString()}
                </p>
              </div>
              <div className="p-3 sm:p-4 bg-muted/50 rounded-lg">
                <Label className="text-xs text-muted-foreground">Campaign</Label>
                <p className="font-medium text-sm sm:text-base break-words">
                  {donation.campaign?.title || (
                    <span className="text-muted-foreground">General Donation</span>
                  )}
                </p>
              </div>
              <div className="p-3 sm:p-4 bg-muted/50 rounded-lg">
                <Label className="text-xs text-muted-foreground flex items-center gap-1">
                  <Calendar className="h-3 w-3" />
                  Date & Time
                </Label>
                <p className="font-medium text-sm sm:text-base">
                  {new Date(donation.donated_at).toLocaleDateString('en-US', {
                    month: 'long',
                    day: 'numeric',
                    year: 'numeric',
                  })}
                </p>
                <p className="text-xs sm:text-sm text-muted-foreground">
                  {new Date(donation.donated_at).toLocaleTimeString('en-US', {
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </p>
              </div>
              <div className="p-3 sm:p-4 bg-muted/50 rounded-lg">
                <Label className="text-xs text-muted-foreground flex items-center gap-1">
                  <CreditCard className="h-3 w-3" />
                  Payment Channel
                </Label>
                <p className="font-medium text-sm sm:text-base break-words">
                  {donation.channel_used || "Not specified"}
                </p>
              </div>
            </div>

            {/* Additional Info */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div>
                <Label className="text-xs text-muted-foreground">Purpose</Label>
                <p className="capitalize font-medium">{donation.purpose}</p>
              </div>
              <div>
                <Label className="text-xs text-muted-foreground">Recurring</Label>
                <p className="font-medium">{donation.is_recurring ? `Yes (${donation.recurring_type})` : 'No'}</p>
              </div>
              {donation.reference_number && (
                <div>
                  <Label className="text-xs text-muted-foreground flex items-center gap-1">
                    <Hash className="h-3 w-3" />
                    Reference Number
                  </Label>
                  <p className="font-mono text-xs font-medium">{donation.reference_number}</p>
                </div>
              )}
              {donation.external_ref && (
                <div>
                  <Label className="text-xs text-muted-foreground">External Reference</Label>
                  <p className="font-mono text-xs font-medium">{donation.external_ref}</p>
                </div>
              )}
              {donation.receipt_no && (
                <div>
                  <Label className="text-xs text-muted-foreground flex items-center gap-1">
                    <Receipt className="h-3 w-3" />
                    Receipt Number
                  </Label>
                  <p className="font-mono text-xs font-medium">{donation.receipt_no}</p>
                </div>
              )}
              {donation.created_at && (
                <div>
                  <Label className="text-xs text-muted-foreground">Submitted At</Label>
                  <p className="text-xs font-medium">
                    {new Date(donation.created_at).toLocaleString('en-US', {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </p>
                </div>
              )}
            </div>
            
            {/* Donor Message */}
            {donation.message && (
              <div className="p-4 bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 rounded-lg">
                <Label className="text-xs text-muted-foreground flex items-center gap-1 mb-2">
                  <MessageSquare className="h-3 w-3" />
                  Message from Donor
                </Label>
                <p className="text-sm italic">"{donation.message}"</p>
              </div>
            )}
            
            {/* Rejection Reason */}
            {donation.status === 'rejected' && donation.rejection_reason && (
              <div className="p-4 bg-destructive/10 border border-destructive/20 rounded-lg">
                <Label className="text-xs text-destructive font-semibold flex items-center gap-1 mb-2">
                  <XCircle className="h-3 w-3" />
                  Rejection Reason
                </Label>
                <p className="text-sm text-destructive/90">{donation.rejection_reason}</p>
              </div>
            )}
          </div>

          <Separator />

          {/* Proof of Donation */}
          <div className="space-y-3">
            <h3 className="font-semibold flex items-center gap-2">
              <FileText className="h-4 w-4 text-primary" />
              Proof of Donation
            </h3>
            <div className="p-4 border rounded-lg bg-muted/30">
              {donation.proof_path ? (
                <div className="space-y-3">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="flex items-center gap-2 min-w-0">
                      <FileText className="h-5 w-5 text-muted-foreground flex-shrink-0" />
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-medium">Donation proof uploaded</p>
                        <p className="text-xs text-muted-foreground break-all">{donation.proof_path.split('/').pop()}</p>
                      </div>
                    </div>
                    <Button variant="outline" size="sm" onClick={handleDownloadProof} className="flex-shrink-0">
                      <Download className="h-4 w-4 mr-2" />
                      <span className="hidden sm:inline">View/Download</span>
                      <span className="sm:hidden">View</span>
                    </Button>
                  </div>
                  {/* Image Preview */}
                  {donation.proof_path && (
                    <div className="mt-4 border rounded-lg overflow-hidden bg-white dark:bg-gray-900">
                      <div className="flex items-center gap-2 px-3 py-2 bg-muted/50 border-b">
                        <ImageIcon className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm font-medium">Proof Image Preview</span>
                      </div>
                      <div className="p-2 sm:p-4 flex items-center justify-center bg-muted/20">
                        <img 
                          src={buildStorageUrl(donation.proof_path)} 
                          alt="Proof of donation" 
                          className="w-full h-auto max-h-[300px] sm:max-h-[400px] md:max-h-[500px] rounded-lg shadow-lg object-contain"
                          onError={(e) => {
                            e.currentTarget.style.display = 'none';
                            const errorDiv = document.createElement('div');
                            errorDiv.className = 'text-center text-sm text-muted-foreground py-8';
                            errorDiv.innerHTML = '<p>Unable to preview image.</p><p class="text-xs mt-2">Click the View/Download button above to see the file.</p>';
                            e.currentTarget.parentElement?.appendChild(errorDiv);
                          }}
                        />
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground text-center py-4">
                  No proof of donation uploaded
                </p>
              )}
            </div>
          </div>

          {/* Reject Mode */}
          {isRejectMode && (
            <div className="space-y-3 p-4 border-2 border-destructive rounded-lg bg-destructive/5">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-destructive">Reject Donation</h3>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setIsRejectMode(false);
                    setRejectReason("");
                  }}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
              <div className="space-y-2">
                <Label htmlFor="reject-reason">Rejection Reason *</Label>
                <Textarea
                  id="reject-reason"
                  placeholder="e.g., Invalid proof of donation, duplicate submission, suspicious activity..."
                  value={rejectReason}
                  onChange={(e) => setRejectReason(e.target.value)}
                  rows={4}
                />
              </div>
              <Button
                variant="destructive"
                onClick={handleReject}
                disabled={submitting || !rejectReason.trim()}
                className="w-full"
              >
                {submitting ? "Rejecting..." : "Confirm Rejection"}
              </Button>
            </div>
          )}
        </div>

        <DialogFooter className="flex-shrink-0 flex-col sm:flex-row gap-2 border-t pt-4">
          <div className="flex gap-2 flex-1 w-full sm:w-auto">
            <Button variant="outline" onClick={handleDownloadReceipt} className="flex-1 sm:flex-initial text-xs sm:text-sm">
              <Download className="h-4 w-4 mr-1 sm:mr-2" />
              <span className="hidden xs:inline">Download Receipt</span>
              <span className="xs:hidden">Receipt</span>
            </Button>
          </div>
          
          {donation.status === 'pending' && !isRejectMode && (
            <div className="flex gap-2 w-full sm:w-auto">
              <Button
                variant="outline"
                onClick={() => setIsRejectMode(true)}
                className="text-destructive hover:text-destructive flex-1 sm:flex-initial text-xs sm:text-sm"
              >
                <XCircle className="h-4 w-4 mr-1 sm:mr-2" />
                Reject
              </Button>
              <Button onClick={handleConfirm} disabled={submitting} className="flex-1 sm:flex-initial text-xs sm:text-sm">
                <CheckCircle className="h-4 w-4 mr-1 sm:mr-2" />
                <span className="hidden sm:inline">{submitting ? "Confirming..." : "Confirm Donation"}</span>
                <span className="sm:hidden">{submitting ? "..." : "Confirm"}</span>
              </Button>
            </div>
          )}
          
          {donation.status !== 'pending' && (
            <Button variant="outline" onClick={onClose} className="w-full sm:w-auto">
              Close
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
