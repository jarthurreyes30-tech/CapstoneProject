import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AlertTriangle, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { reportsService } from "@/services/reports";

interface ReportDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  targetType: "user" | "charity" | "campaign" | "donation";
  targetId: number;
  targetName: string;
}

const REPORT_TYPES = [
  { value: "fraud", label: "Fraud or Scam" },
  { value: "misleading_information", label: "Misleading Information" },
  { value: "abuse", label: "Abuse or Harassment" },
  { value: "spam", label: "Spam" },
  { value: "fake_donation", label: "Fake Donation" },
  { value: "misuse_of_funds", label: "Misuse of Funds" },
  { value: "inappropriate_content", label: "Inappropriate Content" },
  { value: "other", label: "Other" },
];

const SEVERITY_LEVELS = [
  { value: "low", label: "Low - Minor issue" },
  { value: "medium", label: "Medium - Serious concern" },
  { value: "high", label: "High - Urgent violation" },
];

export function ReportDialog({ open, onOpenChange, targetType, targetId, targetName }: ReportDialogProps) {
  const [reportType, setReportType] = useState("");
  const [severity, setSeverity] = useState("medium");
  const [details, setDetails] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!reportType) {
      toast.error("Please select a report type");
      return;
    }
    if (details.length < 10) {
      toast.error("Please provide at least 10 characters of details");
      return;
    }

    try {
      setSubmitting(true);
      await reportsService.submitReportJSON({
        target_type: targetType,
        target_id: targetId,
        report_type: reportType,
        severity,
        details,
      });
      
      toast.success("Report submitted successfully. Our team will review it shortly.");
      onOpenChange(false);
      
      // Reset form
      setReportType("");
      setSeverity("medium");
      setDetails("");
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to submit report");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-orange-500" />
            Report {targetType.charAt(0).toUpperCase() + targetType.slice(1)}
          </DialogTitle>
          <DialogDescription>
            Report suspicious or problematic behavior regarding <span className="font-semibold">{targetName}</span>. 
            All reports are reviewed by our team.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="report-type">Report Type *</Label>
            <Select value={reportType} onValueChange={setReportType}>
              <SelectTrigger id="report-type">
                <SelectValue placeholder="Select report type" />
              </SelectTrigger>
              <SelectContent>
                {REPORT_TYPES.map((type) => (
                  <SelectItem key={type.value} value={type.value}>
                    {type.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="severity">Severity *</Label>
            <Select value={severity} onValueChange={setSeverity}>
              <SelectTrigger id="severity">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {SEVERITY_LEVELS.map((level) => (
                  <SelectItem key={level.value} value={level.value}>
                    {level.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="details">Details *</Label>
            <Textarea
              id="details"
              placeholder="Please provide detailed information about the issue..."
              value={details}
              onChange={(e) => setDetails(e.target.value)}
              rows={5}
              maxLength={1000}
            />
            <p className="text-xs text-muted-foreground">
              {details.length}/1000 characters (minimum 10)
            </p>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={submitting}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={submitting}>
            {submitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Submit Report
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
