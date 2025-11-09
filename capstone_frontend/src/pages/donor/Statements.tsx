import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { FileText, Download } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import api from "@/lib/axios";

export default function Statements() {
  const currentYear = new Date().getFullYear();
  const [selectedYear, setSelectedYear] = useState(currentYear.toString());
  const [downloading, setDownloading] = useState(false);
  const { toast } = useToast();

  const years = Array.from({ length: 10 }, (_, i) => (currentYear - i).toString());

  const handleDownload = async () => {
    setDownloading(true);
    try {
      const response = await api.get(`/me/statements?year=${selectedYear}`, {
        responseType: "blob",
      });

      // Create download link
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `donation-statement-${selectedYear}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();

      toast({
        title: "Success",
        description: `Statement for ${selectedYear} downloaded successfully`,
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to download statement",
        variant: "destructive",
      });
    } finally {
      setDownloading(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12 space-y-8">
      <div>
        <div className="flex items-center gap-3 mb-2">
          <div className="h-10 w-10 sm:h-12 sm:w-12 rounded-full bg-blue-100 flex items-center justify-center">
            <FileText className="h-5 w-5 sm:h-6 sm:w-6 text-blue-600" />
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold">Annual Donation Statements</h1>
            <p className="text-sm sm:text-base text-muted-foreground">Download your yearly donation summaries for tax purposes</p>
          </div>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Generate Donation Statement</CardTitle>
          <CardDescription>
            Download a comprehensive PDF statement of all your donations for a specific year
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <label className="text-sm font-medium">Select Year</label>
            <Select value={selectedYear} onValueChange={setSelectedYear}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {years.map((year) => (
                  <SelectItem key={year} value={year}>
                    {year}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h4 className="font-semibold text-blue-900 mb-2">What's included in your statement:</h4>
            <ul className="list-disc list-inside space-y-1 text-sm text-blue-800">
              <li>Complete list of all donations made in {selectedYear}</li>
              <li>Total donation amount and number of contributions</li>
              <li>Breakdown by charity and campaign</li>
              <li>Receipt numbers for each donation</li>
              <li>Tax-deductible information</li>
            </ul>
          </div>

          <Button onClick={handleDownload} disabled={downloading} className="w-full" size="lg">
            <Download className="h-4 w-4 mr-2" />
            {downloading ? "Generating..." : `Download ${selectedYear} Statement`}
          </Button>

          <p className="text-xs text-muted-foreground text-center">
            The statement will be downloaded as a PDF file and a copy will be sent to your email
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
