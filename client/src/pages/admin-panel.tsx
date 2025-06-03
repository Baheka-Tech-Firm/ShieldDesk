import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Sidebar } from "@/components/layout/sidebar";
import { AnimatedBackground } from "@/components/ui/animated-background";
import { GlassCard } from "@/components/ui/glass-card";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { 
  Building2, 
  Users, 
  Shield, 
  AlertTriangle,
  TrendingUp,
  TrendingDown,
  Download,
  Eye,
  Edit,
  Trash2,
  Plus,
  Search,
  Filter,
  MoreHorizontal,
  Globe,
  Mail,
  Phone
} from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

const organizationSchema = z.object({
  name: z.string().min(1, "Organization name is required"),
  industry: z.string().optional(),
  size: z.string().optional(),
  country: z.string().optional(),
  address: z.string().optional(),
  phone: z.string().optional(),
  website: z.string().optional(),
  billingEmail: z.string().email("Valid email required").optional(),
  subscriptionTier: z.string().min(1, "Subscription tier is required"),
});

interface Organization {
  id: string;
  name: string;
  industry?: string;
  size?: string;
  country?: string;
  address?: string;
  phone?: string;
  website?: string;
  overallRiskScore: number;
  lastAssessmentDate?: string;
  complianceStatus: string;
  subscriptionTier: string;
  subscriptionStatus: string;
  billingEmail?: string;
  createdAt: string;
  updatedAt: string;
  userCount?: number;
  fileCount?: number;
  incidentCount?: number;
}

export default function AdminPanel() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState("organizations");
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [selectedOrg, setSelectedOrg] = useState<Organization | null>(null);

  const form = useForm({
    resolver: zodResolver(organizationSchema),
    defaultValues: {
      name: "",
      industry: "",
      size: "",
      country: "",
      address: "",
      phone: "",
      website: "",
      billingEmail: "",
      subscriptionTier: "starter",
    },
  });

  // Mock organizations data - replace with real API calls
  const mockOrganizations: Organization[] = [
    {
      id: "org-001",
      name: "TechCorp Solutions",
      industry: "Technology",
      size: "medium",
      country: "South Africa",
      address: "123 Innovation Street, Cape Town",
      phone: "+27 21 123 4567",
      website: "https://techcorp.co.za",
      overallRiskScore: 73,
      lastAssessmentDate: "2024-01-15T10:00:00Z",
      complianceStatus: "compliant",
      subscriptionTier: "professional",
      subscriptionStatus: "active",
      billingEmail: "billing@techcorp.co.za",
      createdAt: "2023-08-15T09:00:00Z",
      updatedAt: "2024-01-20T14:30:00Z",
      userCount: 45,
      fileCount: 1247,
      incidentCount: 3
    },
    {
      id: "org-002",
      name: "Financial Services Ltd",
      industry: "Financial Services",
      size: "large",
      country: "South Africa",
      address: "456 Banking Ave, Johannesburg",
      phone: "+27 11 987 6543",
      website: "https://finservices.co.za",
      overallRiskScore: 89,
      lastAssessmentDate: "2024-01-18T14:00:00Z",
      complianceStatus: "compliant",
      subscriptionTier: "enterprise",
      subscriptionStatus: "active",
      billingEmail: "accounts@finservices.co.za",
      createdAt: "2023-06-10T11:00:00Z",
      updatedAt: "2024-01-19T16:45:00Z",
      userCount: 127,
      fileCount: 3456,
      incidentCount: 1
    },
    {
      id: "org-003",
      name: "Healthcare Innovations",
      industry: "Healthcare",
      size: "small",
      country: "South Africa",
      address: "789 Medical Plaza, Durban",
      phone: "+27 31 555 0123",
      website: "https://healthinnovate.co.za",
      overallRiskScore: 45,
      lastAssessmentDate: "2024-01-10T12:00:00Z",
      complianceStatus: "non_compliant",
      subscriptionTier: "starter",
      subscriptionStatus: "active",
      billingEmail: "finance@healthinnovate.co.za",
      createdAt: "2023-11-20T08:30:00Z",
      updatedAt: "2024-01-20T10:15:00Z",
      userCount: 23,
      fileCount: 567,
      incidentCount: 8
    },
    {
      id: "org-004",
      name: "Manufacturing Corp",
      industry: "Manufacturing",
      size: "large",
      country: "South Africa",
      address: "321 Industrial Rd, Port Elizabeth",
      phone: "+27 41 444 7890",
      overallRiskScore: 67,
      lastAssessmentDate: "2024-01-12T15:30:00Z",
      complianceStatus: "in_progress",
      subscriptionTier: "professional",
      subscriptionStatus: "suspended",
      billingEmail: "billing@manufacturing.co.za",
      createdAt: "2023-05-05T13:45:00Z",
      updatedAt: "2024-01-18T09:20:00Z",
      userCount: 89,
      fileCount: 2134,
      incidentCount: 5
    }
  ];

  const getRiskScoreBadge = (score: number) => {
    if (score >= 80) return <Badge className="bg-green-50 text-green-700">Low Risk ({score})</Badge>;
    if (score >= 60) return <Badge className="bg-yellow-50 text-yellow-700">Medium Risk ({score})</Badge>;
    if (score >= 40) return <Badge className="bg-orange-50 text-orange-700">High Risk ({score})</Badge>;
    return <Badge className="bg-red-50 text-red-700">Critical Risk ({score})</Badge>;
  };

  const getComplianceStatusBadge = (status: string) => {
    const variants = {
      compliant: "bg-green-50 text-green-700",
      in_progress: "bg-yellow-50 text-yellow-700",
      non_compliant: "bg-red-50 text-red-700",
      pending: "bg-gray-50 text-gray-700"
    };
    
    return (
      <Badge className={variants[status as keyof typeof variants] || variants.pending}>
        {status.replace('_', ' ').toUpperCase()}
      </Badge>
    );
  };

  const getSubscriptionBadge = (tier: string, status: string) => {
    const tierColors = {
      starter: "bg-blue-50 text-blue-700",
      professional: "bg-purple-50 text-purple-700",
      enterprise: "bg-indigo-50 text-indigo-700"
    };
    
    const statusIcon = status === "active" ? "🟢" : status === "suspended" ? "🟡" : "🔴";
    
    return (
      <Badge className={tierColors[tier as keyof typeof tierColors] || tierColors.starter}>
        {statusIcon} {tier.toUpperCase()}
      </Badge>
    );
  };

  const createOrganization = async (data: z.infer<typeof organizationSchema>) => {
    try {
      // Mock organization creation
      toast({
        title: "Organization Created",
        description: `${data.name} has been successfully created.`,
      });
      setIsCreateDialogOpen(false);
      form.reset();
      queryClient.invalidateQueries({ queryKey: ['/api/organizations'] });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create organization",
        variant: "destructive"
      });
    }
  };

  const exportReport = (orgId: string, type: string) => {
    // Mock report export
    const org = mockOrganizations.find(o => o.id === orgId);
    if (org) {
      const reportData = {
        organization: org,
        reportType: type,
        generatedAt: new Date().toISOString(),
        exportedBy: user?.name
      };
      
      const blob = new Blob([JSON.stringify(reportData, null, 2)], {
        type: 'application/json'
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${org.name}-${type}-report-${Date.now()}.json`;
      a.click();
      
      toast({
        title: "Report Exported",
        description: `${type} report for ${org.name} has been downloaded.`,
      });
    }
  };

  const filteredOrganizations = mockOrganizations.filter(org => {
    const matchesSearch = org.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         org.industry?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         org.country?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === "all" || 
                         (statusFilter === "active" && org.subscriptionStatus === "active") ||
                         (statusFilter === "suspended" && org.subscriptionStatus === "suspended") ||
                         (statusFilter === "compliant" && org.complianceStatus === "compliant") ||
                         (statusFilter === "non_compliant" && org.complianceStatus === "non_compliant");
    
    return matchesSearch && matchesStatus;
  });

  const platformStats = {
    totalOrganizations: mockOrganizations.length,
    activeSubscriptions: mockOrganizations.filter(o => o.subscriptionStatus === "active").length,
    totalUsers: mockOrganizations.reduce((sum, org) => sum + (org.userCount || 0), 0),
    averageRiskScore: Math.round(mockOrganizations.reduce((sum, org) => sum + org.overallRiskScore, 0) / mockOrganizations.length)
  };

  return (
    <div className="min-h-screen relative overflow-hidden bg-gradient-to-br from-black via-gray-900 to-red-950">
      <AnimatedBackground />
      <div className="flex">
        <Sidebar />
        <main className="flex-1 min-h-screen overflow-y-auto relative z-10">
        <GlassCard 
          variant="danger" 
          className="m-6 mb-0 glass-effect cyber-border"
          glowIntensity="medium"
          animated
        >
          <div className="px-8 py-6">
            <div className="flex items-center justify-between">
              <div className="space-y-2">
                <h2 className="text-3xl font-bold text-white flex items-center gap-3">
                  <Building2 className="w-8 h-8 text-red-400" />
                  Admin Panel
                </h2>
                <p className="text-red-100/80 text-lg">
                  Manage client organizations and platform settings
                </p>
              </div>
              <div className="flex items-center space-x-4">
                <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
                  <DialogTrigger asChild>
                    <Button className="bg-red-600 hover:bg-red-700 text-white">
                      <Plus className="w-4 h-4 mr-2" />
                      Add Organization
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-lg">
                    <DialogHeader>
                      <DialogTitle>Create New Organization</DialogTitle>
                    </DialogHeader>
                    <form onSubmit={form.handleSubmit(createOrganization)} className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="name">Organization Name *</Label>
                          <Input
                            id="name"
                            placeholder="Company Name"
                            {...form.register("name")}
                          />
                          {form.formState.errors.name && (
                            <p className="text-sm text-red-600 mt-1">
                              {form.formState.errors.name.message}
                            </p>
                          )}
                        </div>

                        <div>
                          <Label htmlFor="industry">Industry</Label>
                          <Select onValueChange={(value) => form.setValue("industry", value)}>
                            <SelectTrigger>
                              <SelectValue placeholder="Select industry" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="technology">Technology</SelectItem>
                              <SelectItem value="financial">Financial Services</SelectItem>
                              <SelectItem value="healthcare">Healthcare</SelectItem>
                              <SelectItem value="manufacturing">Manufacturing</SelectItem>
                              <SelectItem value="retail">Retail</SelectItem>
                              <SelectItem value="education">Education</SelectItem>
                              <SelectItem value="government">Government</SelectItem>
                              <SelectItem value="other">Other</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>

                        <div>
                          <Label htmlFor="size">Company Size</Label>
                          <Select onValueChange={(value) => form.setValue("size", value)}>
                            <SelectTrigger>
                              <SelectValue placeholder="Select size" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="small">Small (1-50 employees)</SelectItem>
                              <SelectItem value="medium">Medium (51-200 employees)</SelectItem>
                              <SelectItem value="large">Large (201-1000 employees)</SelectItem>
                              <SelectItem value="enterprise">Enterprise (1000+ employees)</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>

                        <div>
                          <Label htmlFor="country">Country</Label>
                          <Input
                            id="country"
                            placeholder="South Africa"
                            {...form.register("country")}
                          />
                        </div>

                        <div className="col-span-2">
                          <Label htmlFor="address">Address</Label>
                          <Textarea
                            id="address"
                            placeholder="Full business address"
                            {...form.register("address")}
                          />
                        </div>

                        <div>
                          <Label htmlFor="phone">Phone Number</Label>
                          <Input
                            id="phone"
                            placeholder="+27 XX XXX XXXX"
                            {...form.register("phone")}
                          />
                        </div>

                        <div>
                          <Label htmlFor="website">Website</Label>
                          <Input
                            id="website"
                            placeholder="https://company.com"
                            {...form.register("website")}
                          />
                        </div>

                        <div>
                          <Label htmlFor="billingEmail">Billing Email</Label>
                          <Input
                            id="billingEmail"
                            type="email"
                            placeholder="billing@company.com"
                            {...form.register("billingEmail")}
                          />
                        </div>

                        <div>
                          <Label htmlFor="subscriptionTier">Subscription Tier</Label>
                          <Select onValueChange={(value) => form.setValue("subscriptionTier", value)}>
                            <SelectTrigger>
                              <SelectValue placeholder="Select tier" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="starter">Starter</SelectItem>
                              <SelectItem value="professional">Professional</SelectItem>
                              <SelectItem value="enterprise">Enterprise</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>

                      <div className="flex justify-end space-x-2">
                        <Button type="button" variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                          Cancel
                        </Button>
                        <Button type="submit">
                          Create Organization
                        </Button>
                      </div>
                    </form>
                  </DialogContent>
                </Dialog>
              </div>
            </div>
          </div>
        </GlassCard>

        <div className="p-6">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="organizations">Organizations</TabsTrigger>
              <TabsTrigger value="analytics">Platform Analytics</TabsTrigger>
              <TabsTrigger value="reports">Reports & Exports</TabsTrigger>
              <TabsTrigger value="settings">Platform Settings</TabsTrigger>
            </TabsList>

            <TabsContent value="organizations" className="space-y-6">
              {/* Platform Overview Stats */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center">
                      <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center">
                        <Building2 className="w-5 h-5 text-blue-600" />
                      </div>
                      <div className="ml-3">
                        <p className="text-sm text-gray-600">Total Organizations</p>
                        <p className="text-xl font-semibold text-blue-600">{platformStats.totalOrganizations}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center">
                      <div className="w-10 h-10 bg-green-50 rounded-lg flex items-center justify-center">
                        <TrendingUp className="w-5 h-5 text-green-600" />
                      </div>
                      <div className="ml-3">
                        <p className="text-sm text-gray-600">Active Subscriptions</p>
                        <p className="text-xl font-semibold text-green-600">{platformStats.activeSubscriptions}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center">
                      <div className="w-10 h-10 bg-purple-50 rounded-lg flex items-center justify-center">
                        <Users className="w-5 h-5 text-purple-600" />
                      </div>
                      <div className="ml-3">
                        <p className="text-sm text-gray-600">Total Platform Users</p>
                        <p className="text-xl font-semibold text-purple-600">{platformStats.totalUsers}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center">
                      <div className="w-10 h-10 bg-yellow-50 rounded-lg flex items-center justify-center">
                        <Shield className="w-5 h-5 text-yellow-600" />
                      </div>
                      <div className="ml-3">
                        <p className="text-sm text-gray-600">Avg Risk Score</p>
                        <p className="text-xl font-semibold text-yellow-600">{platformStats.averageRiskScore}%</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Organization Management */}
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle>Client Organizations</CardTitle>
                    <div className="flex items-center space-x-4">
                      <div className="relative">
                        <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                        <Input
                          placeholder="Search organizations..."
                          value={searchTerm}
                          onChange={(e) => setSearchTerm(e.target.value)}
                          className="pl-10 w-64"
                        />
                      </div>
                      
                      <Select value={statusFilter} onValueChange={setStatusFilter}>
                        <SelectTrigger className="w-48">
                          <SelectValue placeholder="Filter by status" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All Organizations</SelectItem>
                          <SelectItem value="active">Active Subscriptions</SelectItem>
                          <SelectItem value="suspended">Suspended</SelectItem>
                          <SelectItem value="compliant">Compliant</SelectItem>
                          <SelectItem value="non_compliant">Non-Compliant</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Organization</TableHead>
                          <TableHead>Industry</TableHead>
                          <TableHead>Risk Score</TableHead>
                          <TableHead>Compliance</TableHead>
                          <TableHead>Subscription</TableHead>
                          <TableHead>Users</TableHead>
                          <TableHead>Last Assessment</TableHead>
                          <TableHead>Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filteredOrganizations.map((org) => (
                          <TableRow key={org.id}>
                            <TableCell>
                              <div>
                                <p className="font-medium text-gray-900">{org.name}</p>
                                <p className="text-sm text-gray-500">{org.country}</p>
                              </div>
                            </TableCell>
                            <TableCell>
                              <Badge variant="outline">{org.industry}</Badge>
                            </TableCell>
                            <TableCell>
                              {getRiskScoreBadge(org.overallRiskScore)}
                            </TableCell>
                            <TableCell>
                              {getComplianceStatusBadge(org.complianceStatus)}
                            </TableCell>
                            <TableCell>
                              {getSubscriptionBadge(org.subscriptionTier, org.subscriptionStatus)}
                            </TableCell>
                            <TableCell>
                              <span className="text-sm">{org.userCount || 0}</span>
                            </TableCell>
                            <TableCell>
                              <span className="text-sm text-gray-500">
                                {org.lastAssessmentDate 
                                  ? new Date(org.lastAssessmentDate).toLocaleDateString()
                                  : "Never"
                                }
                              </span>
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center space-x-2">
                                <Button 
                                  variant="ghost" 
                                  size="sm" 
                                  onClick={() => setSelectedOrg(org)}
                                  className="text-blue-600 hover:text-blue-700"
                                >
                                  <Eye className="w-4 h-4" />
                                </Button>
                                <Button 
                                  variant="ghost" 
                                  size="sm" 
                                  onClick={() => exportReport(org.id, "compliance")}
                                  className="text-green-600 hover:text-green-700"
                                >
                                  <Download className="w-4 h-4" />
                                </Button>
                                <Button 
                                  variant="ghost" 
                                  size="sm" 
                                  className="text-gray-600 hover:text-gray-700"
                                >
                                  <MoreHorizontal className="w-4 h-4" />
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="analytics" className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Subscription Distribution</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {['starter', 'professional', 'enterprise'].map((tier) => {
                        const count = mockOrganizations.filter(o => o.subscriptionTier === tier).length;
                        const percentage = (count / mockOrganizations.length) * 100;
                        return (
                          <div key={tier} className="flex items-center justify-between">
                            <span className="capitalize">{tier}</span>
                            <div className="flex items-center space-x-2">
                              <div className="w-24 bg-gray-200 rounded-full h-2">
                                <div 
                                  className="bg-blue-600 h-2 rounded-full" 
                                  style={{ width: `${percentage}%` }}
                                ></div>
                              </div>
                              <span className="text-sm text-gray-600">{count}</span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Compliance Status Overview</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {['compliant', 'in_progress', 'non_compliant'].map((status) => {
                        const count = mockOrganizations.filter(o => o.complianceStatus === status).length;
                        const percentage = (count / mockOrganizations.length) * 100;
                        return (
                          <div key={status} className="flex items-center justify-between">
                            <span className="capitalize">{status.replace('_', ' ')}</span>
                            <div className="flex items-center space-x-2">
                              <div className="w-24 bg-gray-200 rounded-full h-2">
                                <div 
                                  className="bg-green-600 h-2 rounded-full" 
                                  style={{ width: `${percentage}%` }}
                                ></div>
                              </div>
                              <span className="text-sm text-gray-600">{count}</span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="reports" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Export Reports and Audit Logs</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <Button 
                      variant="outline" 
                      className="h-24 flex flex-col items-center justify-center"
                      onClick={() => exportReport("all", "compliance-summary")}
                    >
                      <Download className="w-6 h-6 mb-2" />
                      Platform Compliance Report
                    </Button>
                    <Button 
                      variant="outline" 
                      className="h-24 flex flex-col items-center justify-center"
                      onClick={() => exportReport("all", "risk-analysis")}
                    >
                      <AlertTriangle className="w-6 h-6 mb-2" />
                      Risk Analysis Report
                    </Button>
                    <Button 
                      variant="outline" 
                      className="h-24 flex flex-col items-center justify-center"
                      onClick={() => exportReport("all", "audit-trail")}
                    >
                      <Shield className="w-6 h-6 mb-2" />
                      Audit Trail Export
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="settings" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Platform Configuration</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    <div>
                      <h3 className="text-lg font-medium mb-4">Security Settings</h3>
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-medium">Require MFA for all admin accounts</p>
                            <p className="text-sm text-gray-500">Enforce multi-factor authentication</p>
                          </div>
                          <Button variant="outline" size="sm">Configure</Button>
                        </div>
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-medium">Session timeout</p>
                            <p className="text-sm text-gray-500">Automatic logout after inactivity</p>
                          </div>
                          <Button variant="outline" size="sm">Configure</Button>
                        </div>
                      </div>
                    </div>

                    <div>
                      <h3 className="text-lg font-medium mb-4">Compliance Framework</h3>
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-medium">Default compliance framework</p>
                            <p className="text-sm text-gray-500">POPIA, ISO 27001, GDPR</p>
                          </div>
                          <Button variant="outline" size="sm">Manage</Button>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </main>
      </div>
    </div>
  );
}