import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ShieldCheck, AlertTriangle, CheckCircle, Clock, FileText, Calendar, Download, RefreshCw } from "lucide-react";
import { toast } from "sonner";
import { motion } from "framer-motion";

interface Document {
  id: number;
  charity_id: number;
  charity_name: string;
  document_type: string;
  file_path: string;
  expiry_date: string;
  status: 'valid' | 'expiring' | 'expired';
  days_until_expiry: number;
}

export default function Compliance() {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("all");

  useEffect(() => {
    fetchDocuments();
  }, []);

  const fetchDocuments = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('auth_token') || sessionStorage.getItem('auth_token');
      
      // Fetch expiring documents
      const expiringResponse = await fetch(`${import.meta.env.VITE_API_URL}/admin/documents/expiring`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      // Fetch expired documents
      const expiredResponse = await fetch(`${import.meta.env.VITE_API_URL}/admin/documents/expired`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (expiringResponse.ok && expiredResponse.ok) {
        const expiringData = await expiringResponse.json();
        const expiredData = await expiredResponse.json();
        
        const allDocs = [
          ...(Array.isArray(expiringData) ? expiringData : expiringData.data || []),
          ...(Array.isArray(expiredData) ? expiredData : expiredData.data || [])
        ];
        
        setDocuments(allDocs);
      }
    } catch (error) {
      console.error('Failed to fetch documents:', error);
      toast.error('Failed to load compliance documents');
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'valid':
        return <Badge className="bg-green-500"><CheckCircle className="h-3 w-3 mr-1" />Valid</Badge>;
      case 'expiring':
        return <Badge className="bg-yellow-500"><Clock className="h-3 w-3 mr-1" />Expiring Soon</Badge>;
      case 'expired':
        return <Badge variant="destructive"><AlertTriangle className="h-3 w-3 mr-1" />Expired</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  const filteredDocuments = documents.filter(doc => {
    if (activeTab === "all") return true;
    return doc.status === activeTab;
  });

  const stats = {
    total: documents.length,
    valid: documents.filter(d => d.status === 'valid').length,
    expiring: documents.filter(d => d.status === 'expiring').length,
    expired: documents.filter(d => d.status === 'expired').length,
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-muted-foreground">Loading compliance data...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold tracking-tight bg-gradient-to-r from-orange-600 to-orange-400 bg-clip-text text-transparent">
            Compliance Management
          </h1>
          <p className="text-muted-foreground mt-2">
            Monitor charity document compliance and expiry dates
          </p>
        </div>
        <div className="flex gap-2">
          <Button onClick={fetchDocuments} variant="outline" size="sm">
            <RefreshCw className="mr-2 h-4 w-4" />
            Refresh
          </Button>
          <Button variant="default" size="sm">
            <Download className="mr-2 h-4 w-4" />
            Export Report
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card className="border-l-4 border-l-blue-500 hover:shadow-lg transition-shadow bg-gradient-to-br from-blue-50 to-white dark:from-blue-950/30 dark:to-background">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">Total Documents</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div className="text-3xl font-bold">{stats.total}</div>
                <FileText className="h-8 w-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card className="border-l-4 border-l-green-500 hover:shadow-lg transition-shadow bg-gradient-to-br from-green-50 to-white dark:from-green-950/30 dark:to-background">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">Valid</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div className="text-3xl font-bold text-green-600">{stats.valid}</div>
                <CheckCircle className="h-8 w-8 text-green-500" />
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Card className="border-l-4 border-l-yellow-500 hover:shadow-lg transition-shadow bg-gradient-to-br from-yellow-50 to-white dark:from-yellow-950/30 dark:to-background">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">Expiring Soon</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div className="text-3xl font-bold text-yellow-600">{stats.expiring}</div>
                <Clock className="h-8 w-8 text-yellow-500" />
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <Card className="border-l-4 border-l-red-500 hover:shadow-lg transition-shadow bg-gradient-to-br from-red-50 to-white dark:from-red-950/30 dark:to-background">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">Expired</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div className="text-3xl font-bold text-red-600">{stats.expired}</div>
                <AlertTriangle className="h-8 w-8 text-red-500" />
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Documents List */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ShieldCheck className="h-5 w-5" />
            Document Compliance Status
          </CardTitle>
          <CardDescription>Review and monitor charity compliance documents</CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="all">All ({stats.total})</TabsTrigger>
              <TabsTrigger value="valid">Valid ({stats.valid})</TabsTrigger>
              <TabsTrigger value="expiring">Expiring ({stats.expiring})</TabsTrigger>
              <TabsTrigger value="expired">Expired ({stats.expired})</TabsTrigger>
            </TabsList>

            <TabsContent value={activeTab} className="mt-6">
              <div className="space-y-4">
                {filteredDocuments.length === 0 ? (
                  <div className="text-center py-12 text-muted-foreground">
                    <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>No documents found in this category</p>
                  </div>
                ) : (
                  filteredDocuments.map((doc) => (
                    <motion.div
                      key={doc.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      className="flex items-center justify-between p-4 border rounded-lg hover:shadow-md transition-all hover:border-primary/50 bg-card"
                    >
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h4 className="font-semibold">{doc.charity_name}</h4>
                          {getStatusBadge(doc.status)}
                        </div>
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <FileText className="h-4 w-4" />
                            {doc.document_type}
                          </span>
                          <span className="flex items-center gap-1">
                            <Calendar className="h-4 w-4" />
                            Expires: {new Date(doc.expiry_date).toLocaleDateString()}
                          </span>
                          {doc.days_until_expiry !== undefined && (
                            <span className={`font-medium ${
                              doc.days_until_expiry < 0 ? 'text-red-600' :
                              doc.days_until_expiry < 30 ? 'text-yellow-600' : 'text-green-600'
                            }`}>
                              {doc.days_until_expiry < 0 
                                ? `${Math.abs(doc.days_until_expiry)} days overdue`
                                : `${doc.days_until_expiry} days remaining`
                              }
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm">
                          View Document
                        </Button>
                        {doc.status === 'expired' && (
                          <Button variant="default" size="sm">
                            Request Update
                          </Button>
                        )}
                      </div>
                    </motion.div>
                  ))
                )}
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
