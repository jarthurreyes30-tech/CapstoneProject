import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { LifeBuoy, Plus, MessageSquare, Clock, CheckCircle2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import api from "@/lib/axios";

interface Ticket {
  id: number;
  subject: string;
  status: string;
  priority: string;
  created_at: string;
  latest_message?: {
    message: string;
    sender: {
      name: string;
    };
    created_at: string;
  };
}

interface TicketMessage {
  id: number;
  message: string;
  is_staff: boolean;
  sender: {
    id: number;
    name: string;
  };
  created_at: string;
}

export default function Support() {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [selectedTicket, setSelectedTicket] = useState<number | null>(null);
  const [ticketMessages, setTicketMessages] = useState<TicketMessage[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const { toast } = useToast();

  // Create ticket form
  const [newTicket, setNewTicket] = useState({
    subject: "",
    message: "",
    priority: "medium",
  });

  useEffect(() => {
    fetchTickets();
  }, []);

  const fetchTickets = async () => {
    try {
      const response = await api.get("/support/tickets");
      setTickets(response.data);
    } catch (error) {
      console.error("Failed to fetch tickets", error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateTicket = async () => {
    if (!newTicket.subject || !newTicket.message) {
      toast({
        title: "Error",
        description: "Please fill in all fields",
        variant: "destructive",
      });
      return;
    }

    try {
      await api.post("/support/tickets", newTicket);
      toast({
        title: "Success",
        description: "Support ticket created successfully. You'll receive an email confirmation.",
      });
      setShowCreateDialog(false);
      setNewTicket({ subject: "", message: "", priority: "medium" });
      fetchTickets();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to create ticket",
        variant: "destructive",
      });
    }
  };

  const fetchTicketMessages = async (ticketId: number) => {
    try {
      const response = await api.get(`/support/tickets/${ticketId}`);
      setTicketMessages(response.data.messages);
      setSelectedTicket(ticketId);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load ticket messages",
        variant: "destructive",
      });
    }
  };

  const handleSendReply = async () => {
    if (!selectedTicket || !newMessage.trim()) return;

    try {
      await api.post(`/support/tickets/${selectedTicket}/messages`, {
        message: newMessage,
      });
      setNewMessage("");
      fetchTicketMessages(selectedTicket);
      toast({
        title: "Success",
        description: "Reply sent successfully",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to send reply",
        variant: "destructive",
      });
    }
  };

  const getStatusBadge = (status: string) => {
    const variants: any = {
      open: { variant: "default", label: "Open" },
      in_progress: { variant: "secondary", label: "In Progress" },
      resolved: { variant: "outline", label: "Resolved", className: "bg-green-50" },
      closed: { variant: "secondary", label: "Closed" },
    };
    const config = variants[status] || variants.open;
    return <Badge variant={config.variant} className={config.className}>{config.label}</Badge>;
  };

  const getPriorityBadge = (priority: string) => {
    const colors: any = {
      low: "bg-gray-500",
      medium: "bg-blue-500",
      high: "bg-orange-500",
      urgent: "bg-red-500",
    };
    return (
      <Badge className={colors[priority] || colors.medium}>
        {priority.charAt(0).toUpperCase() + priority.slice(1)}
      </Badge>
    );
  };

  if (selectedTicket !== null) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12 space-y-8">
        <div className="mb-4">
          <Button variant="outline" onClick={() => setSelectedTicket(null)}>
            ← Back to Tickets
          </Button>
        </div>
        <Card>
          <CardHeader>
            <CardTitle>Ticket #{selectedTicket}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4 mb-4">
              {ticketMessages.map((msg) => (
                <div
                  key={msg.id}
                  className={`p-4 rounded-lg ${
                    msg.is_staff ? "bg-blue-50 border-l-4 border-blue-500" : "bg-gray-50"
                  }`}
                >
                  <div className="flex justify-between items-start mb-2">
                    <p className="font-semibold text-sm">
                      {msg.sender.name} {msg.is_staff && <Badge className="ml-2">Staff</Badge>}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(msg.created_at).toLocaleString()}
                    </p>
                  </div>
                  <p className="text-sm whitespace-pre-wrap">{msg.message}</p>
                </div>
              ))}
            </div>
            <div className="border-t pt-4">
              <Label>Your Reply</Label>
              <Textarea
                placeholder="Type your reply..."
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                rows={4}
                className="mt-2"
              />
              <Button onClick={handleSendReply} className="mt-2" disabled={!newMessage.trim()}>
                Send Reply
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12 space-y-8">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center">
            <LifeBuoy className="h-6 w-6 text-blue-600" />
          </div>
          <div>
            <h1 className="text-3xl font-bold">Support</h1>
            <p className="text-muted-foreground">Get help from our support team</p>
          </div>
        </div>
        <Button onClick={() => setShowCreateDialog(true)}>
          <Plus className="h-4 w-4 mr-2" />
          New Ticket
        </Button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      ) : tickets.length === 0 ? (
        <Card>
          <CardContent className="pt-6">
            <div className="text-center py-12">
              <LifeBuoy className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">No Support Tickets</h3>
              <p className="text-muted-foreground mb-4">Create a ticket to get help from our team.</p>
              <Button onClick={() => setShowCreateDialog(true)}>Create Ticket</Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {tickets.map((ticket) => (
            <Card key={ticket.id} className="cursor-pointer hover:shadow-md transition" onClick={() => fetchTicketMessages(ticket.id)}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <CardTitle className="text-lg">#{ticket.id} - {ticket.subject}</CardTitle>
                      {getStatusBadge(ticket.status)}
                      {getPriorityBadge(ticket.priority)}
                    </div>
                    {ticket.latest_message && (
                      <CardDescription className="flex items-center gap-2">
                        <MessageSquare className="h-4 w-4" />
                        Last message from {ticket.latest_message.sender.name}
                      </CardDescription>
                    )}
                  </div>
                  <div className="flex items-center gap-1 text-sm text-muted-foreground">
                    <Clock className="h-4 w-4" />
                    {new Date(ticket.created_at).toLocaleDateString()}
                  </div>
                </div>
              </CardHeader>
            </Card>
          ))}
        </div>
      )}

      {/* Create Ticket Dialog */}
      <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Create Support Ticket</DialogTitle>
            <DialogDescription>Describe your issue and we'll get back to you soon</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="subject">Subject *</Label>
              <Input
                id="subject"
                placeholder="Brief description of your issue"
                value={newTicket.subject}
                onChange={(e) => setNewTicket({ ...newTicket, subject: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="priority">Priority</Label>
              <Select value={newTicket.priority} onValueChange={(value) => setNewTicket({ ...newTicket, priority: value })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">Low</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                  <SelectItem value="urgent">Urgent</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="message">Message *</Label>
              <Textarea
                id="message"
                placeholder="Provide detailed information about your issue..."
                value={newTicket.message}
                onChange={(e) => setNewTicket({ ...newTicket, message: e.target.value })}
                rows={6}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCreateDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleCreateTicket}>Create Ticket</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
