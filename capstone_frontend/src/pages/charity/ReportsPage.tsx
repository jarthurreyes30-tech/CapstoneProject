import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { generateReport } from "@/services/apiCharity";
import type { ReportData, ReportParams } from "@/types/charity";
import { Download, FileText, TrendingUp, BarChart3 } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { toast } from "@/hooks/use-toast";
import api from "@/lib/axios";
import { CustomChartTooltip } from "@/components/ui/enhanced-tooltip";

/**
 * Reports & Exports Page
 * Generate custom reports and export data
 */
const ReportsPage = () => {
  const [reportData, setReportData] = useState<ReportData | null>(null);
  const [loading, setLoading] = useState(false);
  const [params, setParams] = useState<ReportParams>({
    startDate: new Date(new Date().setMonth(new Date().getMonth() - 1))
      .toISOString()
      .split("T")[0],
    endDate: new Date().toISOString().split("T")[0],
    reportType: "donations",
  });

  const handleGenerate = async () => {
    if (!params.startDate || !params.endDate || !params.reportType) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    try {
      setLoading(true);
      const data = await generateReport(params);
      setReportData(data);
      toast({ title: "Success", description: "Report generated" });
    } catch (err) {
      toast({
        title: "Error",
        description: err instanceof Error ? err.message : "Failed to generate report",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleExport = () => {
    if (reportData?.exportUrl) {
      window.open(reportData.exportUrl, "_blank");
      toast({ title: "Success", description: "Export initiated" });
    }
  };

  const [downloadingAnalytics, setDownloadingAnalytics] = useState(false);

  const handleDownloadCampaignAnalytics = async () => {
    try {
      setDownloadingAnalytics(true);
      const response = await api.get('/charity/campaign-analytics/export-pdf', {
        responseType: 'blob',
      });
      
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `campaign_analytics_${new Date().toISOString().split('T')[0]}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      
      toast({ 
        title: "✅ Success!", 
        description: "Campaign Analytics PDF generated successfully!" 
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.response?.data?.message || 'Failed to download campaign analytics',
        variant: "destructive",
      });
    } finally {
      setDownloadingAnalytics(false);
    }
  };

  return (
    <div className="p-lg space-y-lg">
      {/* Campaign Analytics Quick Action */}
      <Card className="bg-gradient-to-r from-emerald-50 to-teal-50 border-emerald-200">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2 text-emerald-700">
                <BarChart3 className="h-5 w-5" />
                Campaign Analytics Report
              </CardTitle>
              <p className="text-sm text-muted-foreground mt-1">
                Download a comprehensive PDF report of all your campaigns, performance metrics, and insights
              </p>
            </div>
            <Button
              onClick={handleDownloadCampaignAnalytics}
              disabled={downloadingAnalytics}
              className="bg-emerald-600 hover:bg-emerald-700"
            >
              {downloadingAnalytics ? (
                <>
                  <Download className="mr-2 h-4 w-4 animate-pulse" />
                  Generating...
                </>
              ) : (
                <>
                  <Download className="mr-2 h-4 w-4" />
                  Download Analytics (PDF)
                </>
              )}
            </Button>
          </div>
        </CardHeader>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Generate Report</CardTitle>
        </CardHeader>
        <CardContent className="space-y-md">
          <div className="grid grid-cols-2 gap-md">
            <div>
              <Label htmlFor="start-date">Start Date *</Label>
              <Input
                id="start-date"
                type="date"
                value={params.startDate}
                onChange={(e) =>
                  setParams({ ...params, startDate: e.target.value })
                }
                className="mt-sm"
              />
            </div>
            <div>
              <Label htmlFor="end-date">End Date *</Label>
              <Input
                id="end-date"
                type="date"
                value={params.endDate}
                onChange={(e) => setParams({ ...params, endDate: e.target.value })}
                className="mt-sm"
              />
            </div>
          </div>

          <div>
            <Label htmlFor="report-type">Report Type *</Label>
            <Select
              value={params.reportType}
              onValueChange={(value) =>
                setParams({
                  ...params,
                  reportType: value as ReportParams["reportType"],
                })
              }
            >
              <SelectTrigger id="report-type" className="mt-sm">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="donations">Donations</SelectItem>
                <SelectItem value="campaigns">Campaigns</SelectItem>
                <SelectItem value="registrations">Registrations</SelectItem>
                <SelectItem value="documents">Documents</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Button
            onClick={handleGenerate}
            disabled={loading}
            className="w-full"
          >
            <FileText className="h-4 w-4 mr-xs" />
            {loading ? "Generating..." : "Generate Report"}
          </Button>
        </CardContent>
      </Card>

      {reportData && (
        <>
          {/* Summary Cards */}
          <div className="grid gap-md md:grid-cols-3">
            {Object.entries(reportData.summary).map(([key, value]) => (
              <Card key={key}>
                <CardHeader className="pb-sm">
                  <p className="text-sm text-muted-foreground capitalize">
                    {key.replace(/_/g, " ")}
                  </p>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-sm">
                    <TrendingUp className="h-5 w-5 text-primary" />
                    <span className="text-2xl font-bold">
                      {typeof value === "number"
                        ? value.toLocaleString()
                        : value}
                    </span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Chart */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Report Visualization</CardTitle>
                <Button variant="outline" size="sm" onClick={handleExport}>
                  <Download className="h-4 w-4 mr-xs" />
                  Export CSV/XLSX
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {reportData.chartData && reportData.chartData.length > 0 ? (
                <ResponsiveContainer width="100%" height={320}>
                  <BarChart data={reportData.chartData}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                    <XAxis
                      dataKey="label"
                      className="text-xs"
                      tick={{ fill: "hsl(var(--muted-foreground))" }}
                    />
                    <YAxis
                      className="text-xs"
                      tick={{ fill: "hsl(var(--muted-foreground))" }}
                    />
                    <Tooltip
                      content={<CustomChartTooltip type="campaigns" />}
                    />
                    <Bar dataKey="value" fill="hsl(var(--primary))" />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <p className="text-center text-muted-foreground py-lg">
                  No data available for the selected period
                </p>
              )}
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
};

export default ReportsPage;
