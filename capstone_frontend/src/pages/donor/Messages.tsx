import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { MessageSquare, Send, ArrowLeft } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import api from "@/lib/axios";
import { useAuth } from "@/context/AuthContext";

interface Conversation {
  partner: {
    id: number;
    name: string;
    email: string;
    profile_image: string | null;
    role: string;
  };
  last_message_at: string;
  unread_count: number;
}

interface Message {
  id: number;
  sender_id: number;
  receiver_id: number;
  content: string;
  is_read: boolean;
  created_at: string;
  sender: {
    id: number;
    name: string;
    profile_image: string | null;
  };
}

export default function Messages() {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const { user } = useAuth();

  useEffect(() => {
    fetchConversations();
  }, []);

  const fetchConversations = async () => {
    try {
      const response = await api.get("/messages/conversations");
      setConversations(response.data);
    } catch (error) {
      console.error("Failed to fetch conversations", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchMessages = async (partnerId: number) => {
    try {
      const response = await api.get(`/messages/conversation/${partnerId}`);
      setMessages(response.data.messages);
      const partner = conversations.find(c => c.partner.id === partnerId);
      if (partner) {
        setSelectedConversation(partner);
        // Reset unread count
        setConversations(conversations.map(c => 
          c.partner.id === partnerId ? { ...c, unread_count: 0 } : c
        ));
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load messages",
        variant: "destructive",
      });
    }
  };

  const handleSendMessage = async () => {
    if (!selectedConversation || !newMessage.trim()) return;

    try {
      await api.post("/messages", {
        receiver_id: selectedConversation.partner.id,
        content: newMessage,
      });
      setNewMessage("");
      fetchMessages(selectedConversation.partner.id);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to send message",
        variant: "destructive",
      });
    }
  };

  if (selectedConversation) {
    return (
      <div className="container max-w-6xl mx-auto p-6">
        <Card className="h-[calc(100vh-120px)]">
          <div className="border-b p-4 flex items-center gap-3">
            <Button variant="ghost" size="icon" onClick={() => setSelectedConversation(null)}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                {selectedConversation.partner.profile_image ? (
                  <img 
                    src={selectedConversation.partner.profile_image} 
                    alt={selectedConversation.partner.name}
                    className="h-full w-full rounded-full object-cover"
                  />
                ) : (
                  <MessageSquare className="h-5 w-5 text-primary" />
                )}
              </div>
              <div>
                <h3 className="font-semibold">{selectedConversation.partner.name}</h3>
                <p className="text-xs text-muted-foreground capitalize">{selectedConversation.partner.role}</p>
              </div>
            </div>
          </div>
          <CardContent className="p-0">
            <div className="h-[calc(100vh-280px)] overflow-y-auto p-4 space-y-4">
              {messages.map((msg) => {
                const isSender = msg.sender_id === user?.id;
                return (
                  <div key={msg.id} className={`flex ${isSender ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-[70%] ${isSender ? 'bg-primary text-primary-foreground' : 'bg-muted'} rounded-lg p-3`}>
                      <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                      <p className={`text-xs mt-1 ${isSender ? 'text-primary-foreground/70' : 'text-muted-foreground'}`}>
                        {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
            <div className="border-t p-4 flex gap-2">
              <Input
                placeholder="Type a message..."
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
              />
              <Button onClick={handleSendMessage} disabled={!newMessage.trim()}>
                <Send className="h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container max-w-6xl mx-auto p-6">
      <div className="mb-6">
        <div className="flex items-center gap-3 mb-2">
          <div className="h-12 w-12 rounded-full bg-purple-100 flex items-center justify-center">
            <MessageSquare className="h-6 w-6 text-purple-600" />
          </div>
          <div>
            <h1 className="text-3xl font-bold">Messages</h1>
            <p className="text-muted-foreground">Chat with charities and donors</p>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      ) : conversations.length === 0 ? (
        <Card>
          <CardContent className="pt-6">
            <div className="text-center py-12">
              <MessageSquare className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">No Conversations</h3>
              <p className="text-muted-foreground">Start a conversation with a charity</p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-2">
          {conversations.map((conv) => (
            <Card 
              key={conv.partner.id} 
              className="cursor-pointer hover:shadow-md transition"
              onClick={() => fetchMessages(conv.partner.id)}
            >
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                      {conv.partner.profile_image ? (
                        <img 
                          src={conv.partner.profile_image} 
                          alt={conv.partner.name}
                          className="h-full w-full rounded-full object-cover"
                        />
                      ) : (
                        <MessageSquare className="h-6 w-6 text-primary" />
                      )}
                    </div>
                    <div>
                      <h3 className="font-semibold">{conv.partner.name}</h3>
                      <p className="text-sm text-muted-foreground capitalize">{conv.partner.role}</p>
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    <p className="text-xs text-muted-foreground">
                      {new Date(conv.last_message_at).toLocaleDateString()}
                    </p>
                    {conv.unread_count > 0 && (
                      <Badge className="bg-red-500">{conv.unread_count}</Badge>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
