import { useState } from "react";
import { Mail, Send, CheckCircle2, XCircle, Loader2, Info, Server } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useToast } from "@/hooks/use-toast";

const TestEmail = () => {
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<"idle" | "success" | "error">("idle");
  const [message, setMessage] = useState("");
  const [connectionStatus, setConnectionStatus] = useState<"idle" | "testing" | "success" | "error">("idle");
  const { toast } = useToast();

  // Test SMTP connection
  const testConnection = async () => {
    setConnectionStatus("testing");
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/email/test-connection`);
      const data = await response.json();
      
      if (data.success) {
        setConnectionStatus("success");
        toast({
          title: "✅ SMTP Connection Successful",
          description: `Connected to ${data.host}:${data.port}`,
        });
      } else {
        setConnectionStatus("error");
        toast({
          variant: "destructive",
          title: "❌ Connection Failed",
          description: data.error || "Could not connect to SMTP server",
        });
      }
    } catch (error) {
      setConnectionStatus("error");
      toast({
        variant: "destructive",
        title: "❌ Connection Error",
        description: "Failed to test SMTP connection",
      });
    }
  };

  // Send test email
  const sendTestEmail = async () => {
    if (!email) {
      toast({
        variant: "destructive",
        title: "Validation Error",
        description: "Please enter an email address",
      });
      return;
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      toast({
        variant: "destructive",
        title: "Invalid Email",
        description: "Please enter a valid email address",
      });
      return;
    }

    setLoading(true);
    setStatus("idle");
    setMessage("");

    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/test-email`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: email,
          name: name || "Test User",
        }),
      });

      const data = await response.json();

      if (data.success) {
        setStatus("success");
        setMessage(data.message);
        toast({
          title: "✅ Email Sent!",
          description: `Test email sent successfully to ${email}`,
        });
      } else {
        setStatus("error");
        setMessage(data.message || data.error || "Failed to send email");
        toast({
          variant: "destructive",
          title: "❌ Failed to Send",
          description: data.message || "Could not send test email",
        });
      }
    } catch (error) {
      setStatus("error");
      setMessage("Network error: Could not reach the server");
      toast({
        variant: "destructive",
        title: "❌ Network Error",
        description: "Failed to connect to backend server",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <Mail className="h-8 w-8 text-primary" />
          <h1 className="text-3xl font-bold">Email System Testing</h1>
        </div>
        <p className="text-muted-foreground">
          Test your SMTP configuration and send test emails to verify the email system is working correctly.
        </p>
      </div>

      {/* Connection Test Card */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Server className="h-5 w-5" />
            SMTP Connection Test
          </CardTitle>
          <CardDescription>
            Verify that your server can connect to the SMTP mail server
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4">
            <Button
              onClick={testConnection}
              disabled={connectionStatus === "testing"}
              variant="outline"
            >
              {connectionStatus === "testing" && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              {connectionStatus === "testing" ? "Testing..." : "Test Connection"}
            </Button>

            {connectionStatus === "success" && (
              <div className="flex items-center gap-2 text-green-600">
                <CheckCircle2 className="h-5 w-5" />
                <span className="font-medium">Connected Successfully</span>
              </div>
            )}

            {connectionStatus === "error" && (
              <div className="flex items-center gap-2 text-red-600">
                <XCircle className="h-5 w-5" />
                <span className="font-medium">Connection Failed</span>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Test Email Card */}
      <Card>
        <CardHeader>
          <CardTitle>Send Test Email</CardTitle>
          <CardDescription>
            Enter an email address to receive a test email and verify the email system is working
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Info Alert */}
          <Alert>
            <Info className="h-4 w-4" />
            <AlertDescription>
              The test email will be sent to the address you provide. Check your inbox (and spam folder) after sending.
            </AlertDescription>
          </Alert>

          {/* Email Input */}
          <div className="space-y-2">
            <label htmlFor="email" className="text-sm font-medium">
              Email Address *
            </label>
            <Input
              id="email"
              type="email"
              placeholder="test@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={loading}
            />
          </div>

          {/* Name Input */}
          <div className="space-y-2">
            <label htmlFor="name" className="text-sm font-medium">
              Recipient Name (Optional)
            </label>
            <Input
              id="name"
              type="text"
              placeholder="Test User"
              value={name}
              onChange={(e) => setName(e.target.value)}
              disabled={loading}
            />
          </div>

          {/* Send Button */}
          <Button
            onClick={sendTestEmail}
            disabled={loading || !email}
            className="w-full"
            size="lg"
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Sending Email...
              </>
            ) : (
              <>
                <Send className="mr-2 h-4 w-4" />
                Send Test Email
              </>
            )}
          </Button>

          {/* Status Messages */}
          {status === "success" && (
            <Alert className="bg-green-50 border-green-200">
              <CheckCircle2 className="h-4 w-4 text-green-600" />
              <AlertDescription className="text-green-800">
                <strong>Success!</strong> {message}
                <br />
                <span className="text-sm">Check your inbox at <strong>{email}</strong></span>
              </AlertDescription>
            </Alert>
          )}

          {status === "error" && (
            <Alert variant="destructive">
              <XCircle className="h-4 w-4" />
              <AlertDescription>
                <strong>Error:</strong> {message}
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      {/* Setup Instructions */}
      <Card className="mt-6">
        <CardHeader>
          <CardTitle className="text-lg">Setup Instructions</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm">
          <div>
            <strong>1. Configure SMTP in .env file:</strong>
            <pre className="mt-2 p-3 bg-muted rounded-md overflow-x-auto">
{`MAIL_MAILER=smtp
MAIL_HOST=smtp.gmail.com
MAIL_PORT=587
MAIL_USERNAME=your-email@gmail.com
MAIL_PASSWORD=your-app-password
MAIL_ENCRYPTION=tls
MAIL_FROM_ADDRESS="no-reply@charityconnect.com"
MAIL_FROM_NAME="CharityConnect"`}
            </pre>
          </div>

          <div>
            <strong>2. Get Gmail App Password:</strong>
            <ul className="list-disc list-inside mt-2 space-y-1 text-muted-foreground">
              <li>Visit: https://myaccount.google.com/apppasswords</li>
              <li>Enable 2-Step Verification if needed</li>
              <li>Generate a new app password for "Mail"</li>
              <li>Copy the 16-character password</li>
            </ul>
          </div>

          <div>
            <strong>3. Restart Backend Server:</strong>
            <p className="text-muted-foreground mt-1">
              After updating .env, restart the Laravel server for changes to take effect.
            </p>
          </div>

          <Alert>
            <Info className="h-4 w-4" />
            <AlertDescription>
              <strong>Need help?</strong> Check the{" "}
              <code className="text-xs bg-muted px-1 py-0.5 rounded">EMAIL_SETUP_GUIDE.md</code>{" "}
              file in the project root for detailed instructions.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    </div>
  );
};

export default TestEmail;
