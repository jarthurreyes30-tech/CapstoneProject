import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { FileText, Upload, Eye, Download, AlertTriangle, Calendar, CheckCircle, Clock, XCircle, RefreshCw } from "lucide-react";
import { toast } from "sonner";
import { charityService } from "@/services/charity";
import { useAuth } from "@/context/AuthContext";
import { getStorageUrl } from "@/lib/storage";

interface Document {
  id: number;
  doc_type: string;
  file_path: string;
  expires: boolean;
  expiry_date?: string;
  renewal_reminder_sent_at?: string;
  uploaded_at: string;
  is_expired?: boolean;
  is_expiring_soon?: boolean;
  days_until_expiry?: number;
  verification_status: 'pending' | 'approved' | 'rejected';
  rejection_reason?: string;
  verified_at?: string;
}

interface DocumentStatus {
  documents: Document[];
  expired_count: number;
  expiring_soon_count: number;
  total_expirable_documents: number;
}

export default function CharityDocuments() {
  const { user } = useAuth();
  const [documents, setDocuments] = useState<Document[]>([]);
  const [documentStatus, setDocumentStatus] = useState<DocumentStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [uploadType, setUploadType] = useState("");
  const [expiryDate, setExpiryDate] = useState("");
  const [hasExpiry, setHasExpiry] = useState(false);
  const [reuploadDocument, setReuploadDocument] = useState<Document | null>(null);
  const [filterStatus, setFilterStatus] = useState<string>("all");

  useEffect(() => {
    if (user?.charity?.id) {
      fetchDocuments();
      fetchDocumentStatus();
    }
  }, [user]);

  const fetchDocuments = async () => {
    try {
      if (!user?.charity?.id) {
        console.log('No charity ID found for user');
        return;
      }
      
      console.log('Fetching documents for charity ID:', user.charity.id);
      const data = await charityService.getDocuments(user.charity.id);
      console.log('Raw API response:', data);
      
      const documentsData = Array.isArray(data) ? data : [];
      console.log('Documents array:', documentsData);
      console.log('Total documents:', documentsData.length);
      console.log('Approved:', documentsData.filter(d => d.verification_status === 'approved').length);
      console.log('Pending:', documentsData.filter(d => d.verification_status === 'pending').length);
      console.log('Rejected:', documentsData.filter(d => d.verification_status === 'rejected').length);
      
      setDocuments(documentsData);
    } catch (error: any) {
      console.error("Failed to fetch documents:", error);
      console.error("Error details:", error.response?.data);
      toast.error(error.response?.data?.message || "Failed to fetch documents");
      // Keep documents as an empty array on error
      setDocuments([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchDocumentStatus = async () => {
    try {
      if (!user?.charity?.id) return;
      const data = await charityService.getDocumentStatus(user.charity.id);
      setDocumentStatus(data);
    } catch (error) {
      console.error("Failed to fetch document status:", error);
      // Provide a safe default to avoid undefined access in UI
      setDocumentStatus({
        documents: [],
        expired_count: 0,
        expiring_soon_count: 0,
        total_expirable_documents: 0,
      });
    }
  };

  const handleUpload = async () => {
    if (!uploadFile || !uploadType) {
      toast.error("Please select a file and document type");
      return;
    }

    try {
      if (!user?.charity?.id) return;
      await charityService.uploadDocument(
        user.charity.id,
        uploadFile,
        uploadType,
        hasExpiry,
        expiryDate
      );

      toast.success("Document uploaded successfully");
      setIsUploadOpen(false);
      resetUploadForm();
      fetchDocuments();
      fetchDocumentStatus();
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to upload document");
    }
  };

  const resetUploadForm = () => {
    setUploadFile(null);
    setUploadType("");
    setExpiryDate("");
    setHasExpiry(false);
    setReuploadDocument(null);
  };

  const handleReupload = (document: Document) => {
    setReuploadDocument(document);
    setUploadType(document.doc_type);
    setHasExpiry(document.expires);
    setExpiryDate(document.expiry_date || "");
    setIsUploadOpen(true);
  };

  const downloadDocument = async (document: Document) => {
    try {
      const url = getStorageUrl(document.file_path);
      if (!url) throw new Error('Invalid document path');
      const response = await fetch(url);
      if (!response.ok) throw new Error('Download failed');
      const blob = await response.blob();
      
      const downloadUrl = window.URL.createObjectURL(new Blob([blob]));
      const link = window.document.createElement('a');
      link.href = downloadUrl;
      link.setAttribute('download', `${document.doc_type}.pdf`);
      window.document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      toast.error("Failed to download document");
    }
  };

  const viewDocument = (document: Document) => {
    const url = getStorageUrl(document.file_path);
    if (url) window.open(url, '_blank');
  };

  const getDocumentBadge = (document: Document) => {
    // Show verification status first
    if (document.verification_status === 'rejected') {
      return <Badge className="bg-red-500 text-white">❌ Needs Resubmission</Badge>;
    }
    if (document.verification_status === 'pending') {
      return <Badge className="bg-yellow-500 text-white">⏳ Pending Review</Badge>;
    }
    if (document.verification_status === 'approved') {
      // Then show expiry status for approved documents
      if (document.is_expired) {
        return <Badge className="bg-red-500 text-white">❌ Expired - Resubmit</Badge>;
      }
      if (document.is_expiring_soon) {
        return <Badge className="bg-orange-500 text-white">⚠️ Expiring Soon</Badge>;
      }
      return <Badge className="bg-green-500 text-white">✅ Approved</Badge>;
    }
    return <Badge className="bg-gray-400 text-white">Unknown</Badge>;
  };

  const formatDocType = (docType: string) => {
    return docType.replace(/_/g, " ").replace(/\b\w/g, l => l.toUpperCase());
  };

  const documentTypes = [
    "certificate_of_registration",
    "tax_exemption_certificate",
    "financial_report",
    "board_resolution",
    "valid_id",
    "bank_certificate",
    "other_legal_document"
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Document Management</h1>
          <p className="text-muted-foreground">Manage your organization's legal documents</p>
        </div>
        <Dialog open={isUploadOpen} onOpenChange={(open) => {
          setIsUploadOpen(open);
          if (!open) resetUploadForm();
        }}>
          <DialogTrigger asChild>
            <Button>
              <Upload className="h-4 w-4 mr-2" />
              Upload Document
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{reuploadDocument ? 'Re-upload Document' : 'Upload New Document'}</DialogTitle>
              <DialogDescription>
                {reuploadDocument 
                  ? 'Upload a corrected version of the rejected document'
                  : 'Upload legal documents for your organization'
                }
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              {reuploadDocument && reuploadDocument.rejection_reason && (
                <Alert className="border-red-200 bg-red-50">
                  <AlertTriangle className="h-4 w-4 text-red-600" />
                  <AlertDescription className="text-red-800">
                    <strong>Rejection Reason:</strong> {reuploadDocument.rejection_reason}
                  </AlertDescription>
                </Alert>
              )}
              <div>
                <label className="text-sm font-medium">Document Type</label>
                <select 
                  className="w-full mt-1 p-2 border rounded-md"
                  value={uploadType}
                  onChange={(e) => setUploadType(e.target.value)}
                  disabled={!!reuploadDocument}
                >
                  <option value="">Select document type</option>
                  {documentTypes.map((type) => (
                    <option key={type} value={type}>
                      {formatDocType(type)}
                    </option>
                  ))}
                </select>
                {reuploadDocument && (
                  <p className="text-xs text-muted-foreground mt-1">
                    Re-uploading: {formatDocType(reuploadDocument.doc_type)}
                  </p>
                )}
              </div>
              <div>
                <label className="text-sm font-medium">Document File</label>
                <Input
                  type="file"
                  accept=".pdf,.jpg,.jpeg,.png"
                  onChange={(e) => setUploadFile(e.target.files?.[0] || null)}
                  className="mt-1"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Accepted formats: PDF, JPG, PNG (Max 10MB)
                </p>
              </div>
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="hasExpiry"
                  checked={hasExpiry}
                  onChange={(e) => setHasExpiry(e.target.checked)}
                />
                <label htmlFor="hasExpiry" className="text-sm font-medium">
                  This document has an expiry date
                </label>
              </div>
              {hasExpiry && (
                <div>
                  <label className="text-sm font-medium">Expiry Date</label>
                  <Input
                    type="date"
                    value={expiryDate}
                    onChange={(e) => setExpiryDate(e.target.value)}
                    min={new Date().toISOString().split('T')[0]}
                    className="mt-1"
                  />
                </div>
              )}
              <div className="flex gap-2 justify-end">
                <Button variant="outline" onClick={() => {
                  setIsUploadOpen(false);
                  resetUploadForm();
                }}>
                  Cancel
                </Button>
                <Button onClick={handleUpload}>
                  {reuploadDocument ? (
                    <>
                      <RefreshCw className="h-4 w-4 mr-2" />
                      Re-upload Document
                    </>
                  ) : (
                    <>
                      <Upload className="h-4 w-4 mr-2" />
                      Upload Document
                    </>
                  )}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Document Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="border-blue-200">
          <CardHeader className="pb-3">
            <CardDescription className="text-xs font-medium">Total Documents</CardDescription>
            <CardTitle className="text-3xl font-bold text-blue-600">{documents.length}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-muted-foreground">All submitted documents</p>
          </CardContent>
        </Card>

        <Card className="border-green-300 bg-green-50/50">
          <CardHeader className="pb-3">
            <CardDescription className="text-xs font-medium">✅ Approved</CardDescription>
            <CardTitle className="text-3xl font-bold text-green-600">
              {documents.filter(doc => doc.verification_status === 'approved').length}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-green-700 font-medium">Verified by admin</p>
          </CardContent>
        </Card>

        <Card className="border-yellow-300 bg-yellow-50/50">
          <CardHeader className="pb-3">
            <CardDescription className="text-xs font-medium">⏳ Pending Review</CardDescription>
            <CardTitle className="text-3xl font-bold text-yellow-600">
              {documents.filter(doc => doc.verification_status === 'pending').length}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-yellow-700 font-medium">Awaiting admin review</p>
          </CardContent>
        </Card>

        <Card className="border-red-300 bg-red-50/50">
          <CardHeader className="pb-3">
            <CardDescription className="text-xs font-medium">❌ Needs Resubmission</CardDescription>
            <CardTitle className="text-3xl font-bold text-red-600">
              {documents.filter(doc => doc.verification_status === 'rejected').length}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-red-700 font-medium">Requires resubmission</p>
          </CardContent>
        </Card>
      </div>

      {/* Document Status Alerts */}
      <div className="space-y-4">
        {/* Rejected Documents Alert */}
        {documents.filter(doc => doc.verification_status === 'rejected').length > 0 && (
          <Alert className="border-red-300 bg-red-50">
            <XCircle className="h-4 w-4 text-red-600" />
            <AlertDescription className="text-red-800">
              <strong>Action Required:</strong> You have {documents.filter(doc => doc.verification_status === 'rejected').length} rejected document(s). 
              Please review the rejection reasons and re-upload corrected versions.
            </AlertDescription>
          </Alert>
        )}
        
        {/* Pending Review Alert */}
        {documents.filter(doc => doc.verification_status === 'pending').length > 0 && (
          <Alert className="border-blue-200 bg-blue-50">
            <Clock className="h-4 w-4 text-blue-600" />
            <AlertDescription className="text-blue-800">
              <strong>Under Review:</strong> You have {documents.filter(doc => doc.verification_status === 'pending').length} document(s) 
              pending admin review.
            </AlertDescription>
          </Alert>
        )}
        
        {documentStatus && (
          <>
            {documentStatus.expired_count > 0 && (
              <Alert className="border-red-200 bg-red-50">
                <AlertTriangle className="h-4 w-4 text-red-600" />
                <AlertDescription className="text-red-800">
                  <strong>Urgent:</strong> You have {documentStatus.expired_count} expired document(s). 
                  Please renew them immediately to maintain your verification status.
                </AlertDescription>
              </Alert>
            )}
            {documentStatus.expiring_soon_count > 0 && (
              <Alert className="border-yellow-200 bg-yellow-50">
                <Clock className="h-4 w-4 text-yellow-600" />
                <AlertDescription className="text-yellow-800">
                  <strong>Reminder:</strong> You have {documentStatus.expiring_soon_count} document(s) 
                  expiring within 30 days. Please prepare renewals.
                </AlertDescription>
              </Alert>
            )}
          </>
        )}
      </div>

      {/* Filters & Search Section */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-xl">Submission History</CardTitle>
              <CardDescription>View and manage all your submitted documents</CardDescription>
            </div>
            <div className="flex gap-2">
              <select 
                className="px-3 py-2 border rounded-md text-sm"
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
              >
                <option value="all">All Documents</option>
                <option value="approved">Approved</option>
                <option value="pending">Pending Review</option>
                <option value="rejected">Needs Revision</option>
              </select>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Documents Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {documents
          .filter(doc => filterStatus === 'all' || doc.verification_status === filterStatus)
          .map((document) => (
          <Card key={document.id} className={
            document.verification_status === 'rejected' ? "border-red-300 bg-red-50/50" :
            document.verification_status === 'pending' ? "border-yellow-300 bg-yellow-50/50" :
            document.is_expired ? "border-red-200" : 
            document.is_expiring_soon ? "border-yellow-200" : ""
          }>
            <CardHeader className="pb-3">
              <div className="flex justify-between items-start">
                <div className="flex items-center gap-2 flex-1">
                  <FileText className="h-5 w-5 text-blue-600" />
                  <div className="flex-1">
                    <CardTitle className="text-base">{formatDocType(document.doc_type)}</CardTitle>
                    <CardDescription className="text-xs">
                      Uploaded {new Date(document.uploaded_at).toLocaleDateString()}
                    </CardDescription>
                    {document.verified_at && document.verification_status === 'approved' && (
                      <CardDescription className="text-xs text-green-600 font-medium">
                        ✓ Verified on {new Date(document.verified_at).toLocaleDateString()}
                      </CardDescription>
                    )}
                  </div>
                </div>
                <div className="flex flex-col gap-1 items-end">
                  {getDocumentBadge(document)}
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              {/* Verification Status Info */}
              {document.verification_status === 'rejected' && document.rejection_reason && (
                <Alert className="border-red-300 bg-red-50">
                  <AlertTriangle className="h-4 w-4 text-red-600" />
                  <AlertDescription className="text-xs text-red-900">
                    <strong className="block mb-1">❌ Rejected - Action Required</strong>
                    <span className="text-red-700">{document.rejection_reason}</span>
                  </AlertDescription>
                </Alert>
              )}
              {document.verification_status === 'pending' && (
                <Alert className="border-yellow-300 bg-yellow-50">
                  <Clock className="h-4 w-4 text-yellow-600" />
                  <AlertDescription className="text-xs text-yellow-900">
                    <strong>⏳ Awaiting Admin Review</strong>
                    <p className="text-yellow-700 mt-1">Your document is in the review queue.</p>
                  </AlertDescription>
                </Alert>
              )}
              {document.verification_status === 'approved' && (
                <Alert className="border-green-300 bg-green-50">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <AlertDescription className="text-xs text-green-900">
                    <strong>✅ Approved & Verified</strong>
                    <p className="text-green-700 mt-1">This document has been verified by admin.</p>
                  </AlertDescription>
                </Alert>
              )}
              {document.expires && document.expiry_date && (
                <div className="text-sm">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <span>Expires: {new Date(document.expiry_date).toLocaleDateString()}</span>
                  </div>
                  {document.days_until_expiry !== undefined && (
                    <p className={`text-xs mt-1 ${document.is_expired ? 'text-red-600' : document.is_expiring_soon ? 'text-yellow-600' : 'text-green-600'}`}>
                      {document.is_expired 
                        ? `Expired ${Math.abs(document.days_until_expiry)} days ago`
                        : `${document.days_until_expiry} days remaining`
                      }
                    </p>
                  )}
                </div>
              )}
              
              <div className="flex gap-2">
                {document.verification_status === 'rejected' ? (
                  <Button
                    variant="default"
                    size="sm"
                    onClick={() => handleReupload(document)}
                    className="flex-1 bg-blue-600 hover:bg-blue-700"
                  >
                    <RefreshCw className="h-3 w-3 mr-1" />
                    Re-upload
                  </Button>
                ) : (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => viewDocument(document)}
                    className="flex-1"
                  >
                    <Eye className="h-3 w-3 mr-1" />
                    View
                  </Button>
                )}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => downloadDocument(document)}
                >
                  <Download className="h-3 w-3" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Empty States */}
      {documents.length === 0 && (
        <Card>
          <CardContent className="text-center py-8">
            <FileText className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <p className="text-muted-foreground">No documents uploaded yet.</p>
            <p className="text-sm text-muted-foreground mt-2">
              Upload your legal documents to maintain verification status.
            </p>
          </CardContent>
        </Card>
      )}

      {documents.length > 0 && documents.filter(doc => filterStatus === 'all' || doc.verification_status === filterStatus).length === 0 && (
        <Card>
          <CardContent className="text-center py-8">
            <FileText className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <p className="text-muted-foreground">No documents found with status: {filterStatus}</p>
            <p className="text-sm text-muted-foreground mt-2">
              Try selecting a different filter option.
            </p>
          </CardContent>
        </Card>
      )}

      {/* Required Documents Info */}
      <Card>
        <CardHeader>
          <CardTitle>Required Documents</CardTitle>
          <CardDescription>
            These documents are typically required for charity verification
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {documentTypes.map((type) => {
              const hasDocument = documents.some(doc => doc.doc_type === type);
              return (
                <div key={type} className="flex items-center gap-2">
                  {hasDocument ? (
                    <CheckCircle className="h-4 w-4 text-green-600" />
                  ) : (
                    <Clock className="h-4 w-4 text-gray-400" />
                  )}
                  <span className={`text-sm ${hasDocument ? 'text-green-800' : 'text-muted-foreground'}`}>
                    {formatDocType(type)}
                  </span>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
