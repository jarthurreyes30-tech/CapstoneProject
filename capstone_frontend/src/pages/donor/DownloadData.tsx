import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Download, FileArchive, Shield, Check, Info } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import api from "@/lib/axios";

export default function DownloadData() {
  const [downloading, setDownloading] = useState(false);
  const { toast } = useToast();

  const handleDownload = async () => {
    setDownloading(true);
    try {
      const response = await api.get("/me/export", {
        responseType: "blob",
      });

      // Create a download link
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `charityhub_data_${Date.now()}.zip`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);

      toast({
        title: "Success",
        description: "Your data has been downloaded successfully",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to download data",
        variant: "destructive",
      });
    } finally {
      setDownloading(false);
    }
  };

  const dataIncluded = [
    {
      title: "Profile Information",
      description: "Your account details, email, and profile settings",
      icon: "👤",
    },
    {
      title: "Donation History",
      description: "All your one-time and recurring donations",
      icon: "💰",
    },
    {
      title: "Saved Campaigns",
      description: "Campaigns you've bookmarked for later",
      icon: "🔖",
    },
    {
      title: "Followed Charities",
      description: "List of charities you're following",
      icon: "❤️",
    },
    {
      title: "Support Tickets",
      description: "Your support conversations and tickets",
      icon: "🎫",
    },
    {
      title: "Messages",
      description: "Direct messages sent and received",
      icon: "💬",
    },
    {
      title: "Active Sessions",
      description: "Your login sessions and device information",
      icon: "🔐",
    },
    {
      title: "Security Logs",
      description: "Account security events and email changes",
      icon: "🛡️",
    },
  ];

  return (
    <div className="container max-w-4xl mx-auto p-6">
      <div className="mb-6">
        <div className="flex items-center gap-3 mb-2">
          <div className="h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center">
            <FileArchive className="h-6 w-6 text-blue-600" />
          </div>
          <div>
            <h1 className="text-3xl font-bold">Download Your Data</h1>
            <p className="text-muted-foreground">Export all your CharityHub data in one file</p>
          </div>
        </div>
      </div>

      <Alert className="mb-6">
        <Info className="h-4 w-4" />
        <AlertDescription>
          <strong>Data Portability:</strong> You have the right to download all your personal data. This export complies with data protection regulations.
        </AlertDescription>
      </Alert>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle>What's Included</CardTitle>
          <CardDescription>Your export will contain the following data in JSON format</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {dataIncluded.map((item, index) => (
              <div key={index} className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                <div className="text-2xl">{item.icon}</div>
                <div>
                  <p className="font-semibold text-sm">{item.title}</p>
                  <p className="text-xs text-muted-foreground">{item.description}</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Export Your Data</CardTitle>
          <CardDescription>Download a complete copy of your CharityHub data</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h4 className="font-semibold text-blue-900 mb-2">📦 Export Format</h4>
              <ul className="list-disc list-inside space-y-1 text-sm text-blue-800">
                <li>File format: ZIP archive</li>
                <li>Data format: JSON files (easily readable and parseable)</li>
                <li>File size: Varies based on your activity (typically &lt; 5 MB)</li>
                <li>Processing time: Usually instant, may take up to 30 seconds</li>
              </ul>
            </div>

            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <h4 className="font-semibold text-green-900 mb-2">
                <Check className="inline h-4 w-4 mr-1" />
                Privacy & Security
              </h4>
              <ul className="list-disc list-inside space-y-1 text-sm text-green-800">
                <li>Your data is generated on-demand and immediately downloaded</li>
                <li>No copies are stored on our servers after download</li>
                <li>The download is only accessible to you via your authenticated session</li>
                <li>Sensitive information like passwords are never included</li>
              </ul>
            </div>

            <div className="pt-4">
              <Button
                onClick={handleDownload}
                disabled={downloading}
                size="lg"
                className="w-full"
              >
                <Download className="h-5 w-5 mr-2" />
                {downloading ? "Preparing Download..." : "Download My Data"}
              </Button>
              <p className="text-xs text-muted-foreground text-center mt-2">
                By downloading, you acknowledge that you're responsible for keeping this data secure
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="mt-6 p-4 bg-gray-50 rounded-lg">
        <h4 className="font-semibold mb-2 flex items-center gap-2">
          <Shield className="h-4 w-4" />
          Need Help?
        </h4>
        <p className="text-sm text-muted-foreground">
          If you encounter any issues or have questions about your data export, please contact our support team at{" "}
          <a href="mailto:support@charityhub.com" className="text-primary underline">
            support@charityhub.com
          </a>
        </p>
      </div>
    </div>
  );
}
