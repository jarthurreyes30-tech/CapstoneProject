import { Download, FileSpreadsheet, FileText, CheckCircle, XCircle } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { toast } from "sonner";
import api from "@/lib/axios";

interface ExportMenuProps {
  onExport: (format: 'csv' | 'excel' | 'pdf') => void;
  selectedCount: number;
  onBulkAction: (action: 'confirm' | 'reject' | 'export') => void;
  disabled?: boolean;
}

export default function ExportMenu({
  onExport,
  selectedCount,
  onBulkAction,
  disabled = false,
}: ExportMenuProps) {
  const [exporting, setExporting] = useState(false);

  const downloadAuditReport = async () => {
    try {
      setExporting(true);
      const response = await api.get('/charity/audit-report', {
        responseType: 'blob',
      });
      
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `charity_audit_report_${new Date().toISOString().split('T')[0]}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      
      toast.success('Charity audit report downloaded successfully!');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to download audit report');
    } finally {
      setExporting(false);
    }
  };

  const downloadCSV = async () => {
    try {
      setExporting(true);
      const response = await api.get('/charity/export-csv', {
        responseType: 'blob',
      });
      
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `charity_donations_${new Date().toISOString().split('T')[0]}.csv`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      
      toast.success('Donations CSV exported successfully!');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to export CSV');
    } finally {
      setExporting(false);
    }
  };

  return (
    <div className="flex gap-2">
      <Button 
        variant="default" 
        onClick={downloadAuditReport} 
        disabled={disabled || exporting}
        className="bg-emerald-600 hover:bg-emerald-700"
      >
        <Download className="mr-2 h-4 w-4" />
        {exporting ? 'Downloading...' : 'Download Audit Report'}
      </Button>
      
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="sm" disabled={disabled || exporting}>
            <Download className="mr-2 h-4 w-4" />
            Export & Actions
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-56">
          <DropdownMenuLabel>Export Options</DropdownMenuLabel>
          <DropdownMenuItem onClick={downloadCSV}>
            <FileSpreadsheet className="h-4 w-4 mr-2" />
            Export Donations CSV
          </DropdownMenuItem>

          {selectedCount > 0 && (
            <>
              <DropdownMenuSeparator />
              <DropdownMenuLabel>
                Bulk Actions ({selectedCount} selected)
              </DropdownMenuLabel>
              <DropdownMenuItem onClick={() => onBulkAction('confirm')}>
                <CheckCircle className="h-4 w-4 mr-2 text-green-600" />
                Confirm Selected
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onBulkAction('reject')}>
                <XCircle className="h-4 w-4 mr-2 text-destructive" />
                Reject Selected
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onBulkAction('export')}>
                <Download className="h-4 w-4 mr-2" />
                Export Selected
              </DropdownMenuItem>
            </>
          )}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
