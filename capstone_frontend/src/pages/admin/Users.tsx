import { useState, useEffect } from "react";
import { Search, CheckCircle, Eye, User as UserIcon, Users as UsersIcon, Mail, Phone, MapPin, Calendar, Activity, Heart, Coins } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent } from "@/components/ui/card";
import { motion } from "framer-motion";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { adminService, User } from "@/services/admin";


export default function Users() {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterRole, setFilterRole] = useState("all");
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [viewingUser, setViewingUser] = useState<User | null>(null);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      fetchUsers();
    }, 300);

    return () => clearTimeout(delayDebounceFn);
  }, [currentPage, filterRole, searchTerm]);

  const fetchUsers = async () => {
    setIsLoading(true);
    try {
      const response = await adminService.getUsers(currentPage, {
        role: filterRole !== 'all' ? filterRole : undefined,
        search: searchTerm || undefined
      });
      setUsers(response.data);
    } catch (error: any) {
      console.error('Failed to fetch users:', error);
      toast.error('Failed to load users');
    } finally {
      setIsLoading(false);
    }
  };

  const handleViewUser = (user: User) => {
    setViewingUser(user);
    setIsViewDialogOpen(true);
  };

  const handleActivateUser = async (userId: number) => {
    try {
      await adminService.activateUser(userId);
      toast.success("User activated");
      fetchUsers(); // Refresh list
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to activate user');
    }
  };

  const handleActivateCharity = async (charityId?: number) => {
    if (!charityId) { toast.error('No charity associated'); return; }
    try {
      await adminService.activateCharity(charityId);
      toast.success('Charity activated');
      fetchUsers();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to activate charity');
    }
  };

  // Backend handles filtering, so we just use the users directly
  const filteredUsers = users;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-muted-foreground">Loading users...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h1 className="text-4xl font-bold tracking-tight text-foreground">
          Users Management
        </h1>
        <p className="text-muted-foreground mt-2 text-base">
          Manage user accounts and permissions
        </p>
      </motion.div>

      <div className="flex gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search users..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9"
          />
        </div>
        <Select value={filterRole} onValueChange={setFilterRole}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Filter by role" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Roles</SelectItem>
            <SelectItem value="admin">Admin</SelectItem>
            <SelectItem value="donor">Donor</SelectItem>
            <SelectItem value="charity_admin">Charity Admin</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* User Cards Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {filteredUsers.length === 0 ? (
          <div className="col-span-full text-center py-12 text-muted-foreground">
            <UsersIcon className="h-16 w-16 mx-auto mb-4 opacity-50" />
            <p className="text-lg">No users found</p>
          </div>
        ) : (
          filteredUsers.map((user, index) => (
            <motion.div
              key={user.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              whileHover={{ scale: 1.02 }}
              className="cursor-pointer"
              onClick={() => handleViewUser(user)}
            >
              <Card className="hover:shadow-lg transition-all duration-300 border-l-4 border-l-primary">
                <CardContent className="p-6">
                  {/* User Avatar and Basic Info */}
                  <div className="flex items-start gap-4 mb-4">
                    <Avatar className="h-16 w-16 border-2 border-primary/20">
                      <AvatarImage src={user.profile_picture || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.email}`} />
                      <AvatarFallback className="text-lg bg-primary/10 text-primary">
                        {user.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-bold text-lg truncate">{user.name}</h3>
                      <p className="text-sm text-muted-foreground truncate flex items-center gap-1">
                        <Mail className="h-3 w-3" />
                        {user.email}
                      </p>
                      <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                        <Phone className="h-3 w-3" />
                        {user.phone || 'No phone'}
                      </p>
                    </div>
                  </div>

                  {/* Badges */}
                  <div className="flex items-center gap-2 mb-4">
                    <Badge variant={user.role === "admin" ? "default" : "secondary"} className="capitalize">
                      {user.role.replace('_', ' ')}
                    </Badge>
                    <Badge variant={user.status === "active" ? "default" : "destructive"} className="capitalize">
                      {user.status}
                    </Badge>
                  </div>

                  {/* Stats */}
                  <div className="grid grid-cols-2 gap-3 mb-4">
                    <div className="p-2 bg-muted/50 rounded-lg">
                      <p className="text-xs text-muted-foreground">User ID</p>
                      <p className="font-semibold text-primary">#{user.id}</p>
                    </div>
                    <div className="p-2 bg-muted/50 rounded-lg">
                      <p className="text-xs text-muted-foreground">Joined</p>
                      <p className="font-semibold text-secondary text-xs">{new Date(user.created_at).toLocaleDateString()}</p>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-2">
                    {user.status !== 'active' && (
                      <Button
                        variant="outline"
                        size="sm"
                        className="flex-1 text-green-600 hover:text-green-700"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleActivateUser(user.id);
                        }}
                      >
                        <CheckCircle className="h-3 w-3 mr-1" />
                        Activate
                      </Button>
                    )}
                    {user.role === 'charity_admin' && user.charity_account_status === 'inactive' && (
                      <Button
                        variant="outline"
                        size="sm"
                        className="flex-1 text-green-600 hover:text-green-700"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleActivateCharity(user.charity?.id);
                        }}
                      >
                        <CheckCircle className="h-3 w-3 mr-1" />
                        Activate Charity
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))
        )}
      </div>

      {/* View User Details Dialog */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-2xl">User Profile Details</DialogTitle>
            <DialogDescription>
              Complete information and activity overview
            </DialogDescription>
          </DialogHeader>
          {viewingUser && (
            <div className="space-y-6 py-4">
              {/* Profile Header */}
              <div className="flex items-center gap-6 p-6 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-950/30 dark:to-purple-950/30 rounded-lg">
                <Avatar className="h-24 w-24 border-4 border-white shadow-lg">
                  <AvatarImage src={viewingUser.profile_picture || `https://api.dicebear.com/7.x/avataaars/svg?seed=${viewingUser.email}`} />
                  <AvatarFallback className="text-2xl">
                    {viewingUser.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <h2 className="text-3xl font-bold">{viewingUser.name}</h2>
                  <p className="text-muted-foreground flex items-center gap-2 mt-1">
                    <Mail className="h-4 w-4" />
                    {viewingUser.email}
                  </p>
                  <div className="flex items-center gap-3 mt-3">
                    <Badge variant={viewingUser.role === "admin" ? "default" : "secondary"} className="text-sm capitalize">
                      {viewingUser.role.replace('_', ' ')}
                    </Badge>
                    <Badge variant={viewingUser.status === "active" ? "default" : "destructive"} className="text-sm capitalize">
                      {viewingUser.status}
                    </Badge>
                  </div>
                </div>
              </div>

              {/* User Information Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 border rounded-lg hover:shadow-md transition-shadow bg-card">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="p-2 bg-blue-100 dark:bg-blue-900/50 rounded-full">
                      <UserIcon className="h-5 w-5 text-blue-600" />
                    </div>
                    <Label className="font-semibold text-lg">Personal Info</Label>
                  </div>
                  <div className="space-y-2 ml-11">
                    <div className="flex items-center gap-2 text-sm">
                      <Phone className="h-4 w-4 text-muted-foreground" />
                      <span>{viewingUser.phone || 'Not provided'}</span>
                    </div>
                    {viewingUser.address && (
                      <div className="flex items-start gap-2 text-sm">
                        <MapPin className="h-4 w-4 text-muted-foreground mt-0.5" />
                        <span>{viewingUser.address}</span>
                      </div>
                    )}
                    {viewingUser.donorProfile?.full_address && (
                      <div className="flex items-start gap-2 text-sm">
                        <MapPin className="h-4 w-4 text-muted-foreground mt-0.5" />
                        <span className="font-medium">Full Address: </span>
                        <span>{viewingUser.donorProfile.full_address}</span>
                      </div>
                    )}
                    {viewingUser.donorProfile?.gender && (
                      <div className="text-sm">
                        <span className="text-muted-foreground">Gender:</span>
                        <span className="ml-2 font-medium capitalize">{viewingUser.donorProfile.gender}</span>
                      </div>
                    )}
                    {viewingUser.donorProfile?.date_of_birth && (
                      <div className="text-sm">
                        <span className="text-muted-foreground">Date of Birth:</span>
                        <span className="ml-2 font-medium">{new Date(viewingUser.donorProfile.date_of_birth).toLocaleDateString()}</span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="p-4 border rounded-lg hover:shadow-md transition-shadow bg-card">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="p-2 bg-purple-100 dark:bg-purple-900/50 rounded-full">
                      <Calendar className="h-5 w-5 text-purple-600" />
                    </div>
                    <Label className="font-semibold text-lg">Account Info</Label>
                  </div>
                  <div className="space-y-2 ml-11">
                    <div className="text-sm">
                      <span className="text-muted-foreground">Registered:</span>
                      <span className="ml-2 font-medium">{new Date(viewingUser.created_at).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</span>
                    </div>
                    <div className="text-sm">
                      <span className="text-muted-foreground">Last Active:</span>
                      <span className="ml-2 font-medium">{(viewingUser as any).last_login ? new Date((viewingUser as any).last_login).toLocaleDateString() : 'N/A'}</span>
                    </div>
                  </div>
                </div>

                {viewingUser.role === 'donor' && (
                  <>
                    <div className="p-4 border rounded-lg hover:shadow-md transition-shadow bg-gradient-to-br from-green-50 to-white dark:from-green-950/30 dark:to-background">
                      <div className="flex items-center gap-3 mb-2">
                        <div className="p-2 bg-green-100 dark:bg-green-900/50 rounded-full">
                          <Heart className="h-5 w-5 text-green-600" />
                        </div>
                        <Label className="font-semibold text-lg">Donation Stats</Label>
                      </div>
                      <div className="space-y-2 ml-11">
                        <div className="text-sm">
                          <span className="text-muted-foreground">Total Donations:</span>
                          <span className="ml-2 font-bold text-green-600">{viewingUser.total_donations || 0}</span>
                        </div>
                        <div className="text-sm">
                          <span className="text-muted-foreground">Amount Donated:</span>
                          <span className="ml-2 font-bold text-green-600">₱{(viewingUser.total_amount || 0).toLocaleString()}</span>
                        </div>
                      </div>
                    </div>

                    <div className="p-4 border rounded-lg hover:shadow-md transition-shadow bg-gradient-to-br from-blue-50 to-white dark:from-blue-950/30 dark:to-background">
                      <div className="flex items-center gap-3 mb-2">
                        <div className="p-2 bg-blue-100 dark:bg-blue-900/50 rounded-full">
                          <Activity className="h-5 w-5 text-blue-600" />
                        </div>
                        <Label className="font-semibold text-lg">Activity</Label>
                      </div>
                      <div className="space-y-2 ml-11">
                        <div className="text-sm">
                          <span className="text-muted-foreground">Charities Supported:</span>
                          <span className="ml-2 font-medium">{viewingUser.charities_supported || 0}</span>
                        </div>
                        <div className="text-sm">
                          <span className="text-muted-foreground">Campaigns Backed:</span>
                          <span className="ml-2 font-medium">{viewingUser.campaigns_backed || 0}</span>
                        </div>
                      </div>
                    </div>

                    {viewingUser.donorProfile?.cause_preferences && viewingUser.donorProfile.cause_preferences.length > 0 && (
                      <div className="p-4 border rounded-lg hover:shadow-md transition-shadow bg-gradient-to-br from-orange-50 to-white dark:from-orange-950/30 dark:to-background col-span-2">
                        <div className="flex items-center gap-3 mb-2">
                          <div className="p-2 bg-orange-100 dark:bg-orange-900/50 rounded-full">
                            <Heart className="h-5 w-5 text-orange-600" />
                          </div>
                          <Label className="font-semibold text-lg">Cause Preferences</Label>
                        </div>
                        <div className="ml-11 flex flex-wrap gap-2">
                          {viewingUser.donorProfile.cause_preferences.map((cause, idx) => (
                            <Badge key={idx} variant="outline" className="bg-orange-50 dark:bg-orange-900/20">
                              {cause}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}
                  </>
                )}

                {viewingUser.role === 'charity_admin' && (
                  <div className="p-4 border rounded-lg hover:shadow-md transition-shadow bg-gradient-to-br from-purple-50 to-white dark:from-purple-950/30 dark:to-background col-span-2">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="p-2 bg-purple-100 dark:bg-purple-900/50 rounded-full">
                        <Coins className="h-5 w-5 text-purple-600" />
                      </div>
                      <Label className="font-semibold text-lg">Charity Information</Label>
                    </div>
                    <div className="ml-11 space-y-4">
                      {viewingUser.charity && (
                        <div className="flex items-center gap-4 p-3 bg-card rounded-lg border">
                          {viewingUser.charity_logo && (
                            <Avatar className="h-16 w-16 border-2">
                              <AvatarImage src={viewingUser.charity_logo.startsWith('http') ? viewingUser.charity_logo : `${import.meta.env.VITE_API_URL?.replace('/api', '')}/storage/${viewingUser.charity_logo}`} />
                              <AvatarFallback>{viewingUser.charity_name?.charAt(0) || 'C'}</AvatarFallback>
                            </Avatar>
                          )}
                          <div className="flex-1">
                            <p className="font-semibold text-base">{viewingUser.charity_name || 'N/A'}</p>
                            <Badge className="mt-1" variant={viewingUser.charity_status === 'approved' ? 'default' : viewingUser.charity_status === 'pending' ? 'secondary' : 'destructive'}>
                              {viewingUser.charity_status || 'N/A'}
                            </Badge>
                          </div>
                        </div>
                      )}
                      {!viewingUser.charity && (
                        <p className="text-sm text-muted-foreground">No charity associated with this account</p>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsViewDialogOpen(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
