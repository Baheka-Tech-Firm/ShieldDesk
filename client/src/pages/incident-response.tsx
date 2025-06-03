import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Sidebar } from "@/components/layout/sidebar";
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
  AlertTriangle, 
  Shield, 
  Clock, 
  User,
  FileText,
  CheckCircle,
  XCircle,
  Play,
  Pause,
  RotateCcw,
  MessageSquare,
  Bell,
  Target,
  Activity,
  Plus
} from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { AnimatedBackground } from "@/components/ui/animated-background";
import { GlassCard } from "@/components/ui/glass-card";

const incidentSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().min(1, "Description is required"),
  severity: z.string().min(1, "Severity is required"),
  category: z.string().min(1, "Category is required"),
  affected_systems: z.string().min(1, "Affected systems required"),
});

interface Incident {
  id: string;
  title: string;
  description: string;
  severity: 'critical' | 'high' | 'medium' | 'low';
  category: string;
  status: 'new' | 'investigating' | 'contained' | 'resolved' | 'closed';
  affected_systems: string[];
  assigned_to: string;
  created_at: string;
  updated_at: string;
  resolved_at?: string;
  timeline: IncidentEvent[];
}

interface IncidentEvent {
  id: string;
  incident_id: string;
  event_type: 'created' | 'updated' | 'assigned' | 'escalated' | 'resolved' | 'comment';
  description: string;
  user: string;
  timestamp: string;
}

interface Playbook {
  id: string;
  name: string;
  category: string;
  steps: PlaybookStep[];
  estimated_duration: number;
  severity_levels: string[];
}

interface PlaybookStep {
  id: string;
  title: string;
  description: string;
  responsible_role: string;
  estimated_time: number;
  required: boolean;
}

export default function IncidentResponse() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState("dashboard");
  const [selectedIncident, setSelectedIncident] = useState<Incident | null>(null);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);

  const form = useForm({
    resolver: zodResolver(incidentSchema),
    defaultValues: {
      title: "",
      description: "",
      severity: "",
      category: "",
      affected_systems: "",
    },
  });

  // Comprehensive incident response data
  const incidents: Incident[] = [
    {
      id: "INC-2024-001",
      title: "Suspected Data Breach - Customer Database",
      description: "Unauthorized access detected to customer database. Suspicious queries identified in audit logs.",
      severity: "critical",
      category: "Data Breach",
      status: "investigating",
      affected_systems: ["Customer DB", "Web Application", "API Gateway"],
      assigned_to: "Sarah Johnson",
      created_at: "2024-01-20T08:30:00Z",
      updated_at: "2024-01-20T14:45:00Z",
      timeline: [
        {
          id: "event-001",
          incident_id: "INC-2024-001",
          event_type: "created",
          description: "Incident created based on SIEM alert",
          user: "System",
          timestamp: "2024-01-20T08:30:00Z"
        },
        {
          id: "event-002",
          incident_id: "INC-2024-001",
          event_type: "assigned",
          description: "Incident assigned to Sarah Johnson",
          user: "Admin User",
          timestamp: "2024-01-20T08:35:00Z"
        },
        {
          id: "event-003",
          incident_id: "INC-2024-001",
          event_type: "escalated",
          description: "Escalated to critical due to data sensitivity",
          user: "Sarah Johnson",
          timestamp: "2024-01-20T09:15:00Z"
        }
      ]
    },
    {
      id: "INC-2024-002",
      title: "Phishing Campaign Targeting Employees",
      description: "Multiple employees reported suspicious emails. Email security gateway blocked 15 similar messages.",
      severity: "high",
      category: "Phishing",
      status: "contained",
      affected_systems: ["Email System", "User Workstations"],
      assigned_to: "Mike Chen",
      created_at: "2024-01-19T13:20:00Z",
      updated_at: "2024-01-20T10:30:00Z",
      timeline: [
        {
          id: "event-004",
          incident_id: "INC-2024-002",
          event_type: "created",
          description: "Phishing campaign detected",
          user: "Email Security System",
          timestamp: "2024-01-19T13:20:00Z"
        },
        {
          id: "event-005",
          incident_id: "INC-2024-002",
          event_type: "comment",
          description: "Blocked sender domain and updated email filters",
          user: "Mike Chen",
          timestamp: "2024-01-19T14:45:00Z"
        }
      ]
    },
    {
      id: "INC-2024-003",
      title: "DDoS Attack on Web Services",
      description: "Distributed denial of service attack causing service degradation. Traffic spike detected from multiple sources.",
      severity: "medium",
      category: "DDoS",
      status: "resolved",
      affected_systems: ["Web Servers", "Load Balancer", "CDN"],
      assigned_to: "IT Team",
      created_at: "2024-01-18T16:45:00Z",
      updated_at: "2024-01-18T22:30:00Z",
      resolved_at: "2024-01-18T22:30:00Z",
      timeline: [
        {
          id: "event-006",
          incident_id: "INC-2024-003",
          event_type: "created",
          description: "DDoS attack detected",
          user: "Network Monitoring",
          timestamp: "2024-01-18T16:45:00Z"
        },
        {
          id: "event-007",
          incident_id: "INC-2024-003",
          event_type: "resolved",
          description: "Attack mitigated using DDoS protection service",
          user: "IT Team",
          timestamp: "2024-01-18T22:30:00Z"
        }
      ]
    }
  ];

  const playbooks: Playbook[] = [
    {
      id: "playbook-001",
      name: "Data Breach Response",
      category: "Data Protection",
      estimated_duration: 240,
      severity_levels: ["critical", "high"],
      steps: [
        {
          id: "step-001",
          title: "Immediate Containment",
          description: "Isolate affected systems and prevent further data access",
          responsible_role: "IT Team",
          estimated_time: 30,
          required: true
        },
        {
          id: "step-002",
          title: "Evidence Preservation",
          description: "Preserve logs and forensic evidence",
          responsible_role: "Security Team",
          estimated_time: 45,
          required: true
        },
        {
          id: "step-003",
          title: "Impact Assessment",
          description: "Determine scope and type of data affected",
          responsible_role: "Compliance Team",
          estimated_time: 60,
          required: true
        },
        {
          id: "step-004",
          title: "Notification Preparation",
          description: "Prepare regulatory and customer notifications",
          responsible_role: "Legal Team",
          estimated_time: 90,
          required: true
        }
      ]
    },
    {
      id: "playbook-002",
      name: "Malware Incident Response",
      category: "Malware",
      estimated_duration: 120,
      severity_levels: ["critical", "high", "medium"],
      steps: [
        {
          id: "step-005",
          title: "System Isolation",
          description: "Disconnect infected systems from network",
          responsible_role: "IT Team",
          estimated_time: 15,
          required: true
        },
        {
          id: "step-006",
          title: "Malware Analysis",
          description: "Analyze malware sample and behavior",
          responsible_role: "Security Team",
          estimated_time: 45,
          required: true
        },
        {
          id: "step-007",
          title: "System Cleaning",
          description: "Remove malware and restore systems",
          responsible_role: "IT Team",
          estimated_time: 60,
          required: true
        }
      ]
    }
  ];

  const getSeverityBadge = (severity: string) => {
    const variants = {
      critical: "bg-red-100 text-red-800 border-red-200",
      high: "bg-orange-100 text-orange-800 border-orange-200",
      medium: "bg-yellow-100 text-yellow-800 border-yellow-200",
      low: "bg-blue-100 text-blue-800 border-blue-200"
    };
    
    return (
      <Badge className={variants[severity as keyof typeof variants]}>
        {severity.toUpperCase()}
      </Badge>
    );
  };

  const getStatusBadge = (status: string) => {
    const variants = {
      new: { className: "bg-purple-50 text-purple-700", icon: Bell },
      investigating: { className: "bg-blue-50 text-blue-700", icon: Activity },
      contained: { className: "bg-yellow-50 text-yellow-700", icon: Shield },
      resolved: { className: "bg-green-50 text-green-700", icon: CheckCircle },
      closed: { className: "bg-gray-50 text-gray-700", icon: XCircle }
    };
    
    const variant = variants[status as keyof typeof variants];
    const Icon = variant?.icon || Clock;
    
    return (
      <Badge className={variant?.className}>
        <Icon className="w-3 h-3 mr-1" />
        {status.toUpperCase()}
      </Badge>
    );
  };

  const createIncident = async (data: z.infer<typeof incidentSchema>) => {
    try {
      // Mock incident creation
      toast({
        title: "Incident Created",
        description: `Incident "${data.title}" has been created and assigned.`,
      });
      setIsCreateDialogOpen(false);
      form.reset();
      queryClient.invalidateQueries({ queryKey: ['/api/incidents'] });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create incident",
        variant: "destructive"
      });
    }
  };

  const incidentStats = {
    total: incidents.length,
    critical: incidents.filter(i => i.severity === 'critical').length,
    investigating: incidents.filter(i => i.status === 'investigating').length,
    avgResolutionTime: 4.2
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-red-950">
      <AnimatedBackground />
      <div className="flex">
        <Sidebar />
        <main className="flex-1 min-h-screen overflow-y-auto bg-gradient-to-br from-black via-gray-900 to-red-950">
        <GlassCard 
          variant="danger" 
          className="m-6 mb-0 glass-effect cyber-border"
          glowIntensity="medium"
        >
          <div className="px-6 py-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-white">Incident Response</h2>
                <p className="text-gray-300 mt-1">Comprehensive incident management and response coordination</p>
              </div>
              <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
                <DialogTrigger asChild>
                  <Button className="bg-primary text-primary-foreground">
                    <AlertTriangle className="w-4 h-4 mr-2" />
                    Create Incident
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-md">
                  <DialogHeader>
                    <DialogTitle>Create New Incident</DialogTitle>
                  </DialogHeader>
                  <form onSubmit={form.handleSubmit(createIncident)} className="space-y-4">
                    <div>
                      <Label htmlFor="title">Incident Title</Label>
                      <Input
                        id="title"
                        placeholder="Brief description of the incident"
                        {...form.register("title")}
                      />
                      {form.formState.errors.title && (
                        <p className="text-sm text-red-600 mt-1">
                          {form.formState.errors.title.message}
                        </p>
                      )}
                    </div>

                    <div>
                      <Label htmlFor="description">Description</Label>
                      <Textarea
                        id="description"
                        placeholder="Detailed description of the incident"
                        {...form.register("description")}
                      />
                      {form.formState.errors.description && (
                        <p className="text-sm text-red-600 mt-1">
                          {form.formState.errors.description.message}
                        </p>
                      )}
                    </div>

                    <div>
                      <Label htmlFor="severity">Severity</Label>
                      <Select onValueChange={(value) => form.setValue("severity", value)}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select severity level" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="critical">Critical</SelectItem>
                          <SelectItem value="high">High</SelectItem>
                          <SelectItem value="medium">Medium</SelectItem>
                          <SelectItem value="low">Low</SelectItem>
                        </SelectContent>
                      </Select>
                      {form.formState.errors.severity && (
                        <p className="text-sm text-red-600 mt-1">
                          {form.formState.errors.severity.message}
                        </p>
                      )}
                    </div>

                    <div>
                      <Label htmlFor="category">Category</Label>
                      <Select onValueChange={(value) => form.setValue("category", value)}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select incident category" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Data Breach">Data Breach</SelectItem>
                          <SelectItem value="Malware">Malware</SelectItem>
                          <SelectItem value="Phishing">Phishing</SelectItem>
                          <SelectItem value="DDoS">DDoS Attack</SelectItem>
                          <SelectItem value="Unauthorized Access">Unauthorized Access</SelectItem>
                          <SelectItem value="System Outage">System Outage</SelectItem>
                        </SelectContent>
                      </Select>
                      {form.formState.errors.category && (
                        <p className="text-sm text-red-600 mt-1">
                          {form.formState.errors.category.message}
                        </p>
                      )}
                    </div>

                    <div>
                      <Label htmlFor="affected_systems">Affected Systems</Label>
                      <Input
                        id="affected_systems"
                        placeholder="e.g., Web Server, Database, Email System"
                        {...form.register("affected_systems")}
                      />
                      {form.formState.errors.affected_systems && (
                        <p className="text-sm text-red-600 mt-1">
                          {form.formState.errors.affected_systems.message}
                        </p>
                      )}
                    </div>

                    <div className="flex justify-end space-x-2">
                      <Button type="button" variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                        Cancel
                      </Button>
                      <Button type="submit">
                        Create Incident
                      </Button>
                    </div>
                  </form>
                </DialogContent>
              </Dialog>
            </div>
          </div>
        </GlassCard>

        <div className="p-6">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
              <TabsTrigger value="incidents">Active Incidents</TabsTrigger>
              <TabsTrigger value="playbooks">Response Playbooks</TabsTrigger>
              <TabsTrigger value="analytics">Analytics</TabsTrigger>
            </TabsList>

            <TabsContent value="dashboard" className="space-y-6">
              {/* Incident Overview */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center">
                      <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center">
                        <AlertTriangle className="w-5 h-5 text-blue-600" />
                      </div>
                      <div className="ml-3">
                        <p className="text-sm text-gray-600">Total Incidents</p>
                        <p className="text-xl font-semibold text-blue-600">{incidentStats.total}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center">
                      <div className="w-10 h-10 bg-red-50 rounded-lg flex items-center justify-center">
                        <AlertTriangle className="w-5 h-5 text-red-600" />
                      </div>
                      <div className="ml-3">
                        <p className="text-sm text-gray-600">Critical</p>
                        <p className="text-xl font-semibold text-red-600">{incidentStats.critical}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center">
                      <div className="w-10 h-10 bg-yellow-50 rounded-lg flex items-center justify-center">
                        <Activity className="w-5 h-5 text-yellow-600" />
                      </div>
                      <div className="ml-3">
                        <p className="text-sm text-gray-600">Investigating</p>
                        <p className="text-xl font-semibold text-yellow-600">{incidentStats.investigating}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center">
                      <div className="w-10 h-10 bg-green-50 rounded-lg flex items-center justify-center">
                        <Clock className="w-5 h-5 text-green-600" />
                      </div>
                      <div className="ml-3">
                        <p className="text-sm text-gray-600">Avg Resolution</p>
                        <p className="text-xl font-semibold text-green-600">{incidentStats.avgResolutionTime}h</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Recent Incidents */}
              <Card>
                <CardHeader>
                  <CardTitle>Recent Incidents</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {incidents.slice(0, 3).map((incident) => (
                      <div key={incident.id} className="flex items-center justify-between p-4 border rounded-lg">
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 bg-red-50 rounded-lg flex items-center justify-center">
                            <AlertTriangle className="w-5 h-5 text-red-600" />
                          </div>
                          <div>
                            <p className="font-medium">{incident.title}</p>
                            <p className="text-sm text-gray-600">{incident.id} • {incident.category}</p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-3">
                          {getSeverityBadge(incident.severity)}
                          {getStatusBadge(incident.status)}
                          <span className="text-sm text-gray-500">
                            {incident.assigned_to}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="incidents" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Active Incidents</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>ID</TableHead>
                          <TableHead>Title</TableHead>
                          <TableHead>Severity</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead>Category</TableHead>
                          <TableHead>Assigned To</TableHead>
                          <TableHead>Created</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {incidents.map((incident) => (
                          <TableRow key={incident.id} className="cursor-pointer hover:bg-gray-50">
                            <TableCell className="font-mono text-sm">{incident.id}</TableCell>
                            <TableCell className="font-medium">{incident.title}</TableCell>
                            <TableCell>{getSeverityBadge(incident.severity)}</TableCell>
                            <TableCell>{getStatusBadge(incident.status)}</TableCell>
                            <TableCell>{incident.category}</TableCell>
                            <TableCell>{incident.assigned_to}</TableCell>
                            <TableCell className="text-sm text-gray-500">
                              {new Date(incident.created_at).toLocaleDateString()}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="playbooks" className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {playbooks.map((playbook) => (
                  <Card key={playbook.id}>
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <CardTitle>{playbook.name}</CardTitle>
                        <Badge variant="outline">{playbook.category}</Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div className="flex items-center justify-between text-sm">
                          <span>Estimated Duration:</span>
                          <span className="font-medium">{playbook.estimated_duration} minutes</span>
                        </div>
                        <div className="flex items-center justify-between text-sm">
                          <span>Severity Levels:</span>
                          <div className="flex space-x-1">
                            {playbook.severity_levels.map((level) => (
                              <Badge key={level} variant="secondary" className="text-xs">
                                {level}
                              </Badge>
                            ))}
                          </div>
                        </div>
                        <div className="space-y-2">
                          <p className="text-sm font-medium">Response Steps:</p>
                          <div className="space-y-1">
                            {playbook.steps.slice(0, 3).map((step, index) => (
                              <div key={step.id} className="flex items-center text-sm">
                                <span className="w-4 h-4 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-xs mr-2">
                                  {index + 1}
                                </span>
                                <span>{step.title}</span>
                              </div>
                            ))}
                            {playbook.steps.length > 3 && (
                              <p className="text-xs text-gray-500 ml-6">
                                +{playbook.steps.length - 3} more steps
                              </p>
                            )}
                          </div>
                        </div>
                        <Button variant="outline" className="w-full">
                          <Play className="w-4 h-4 mr-2" />
                          Execute Playbook
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="analytics" className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Incident Categories</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {Object.entries(
                        incidents.reduce((acc, incident) => {
                          acc[incident.category] = (acc[incident.category] || 0) + 1;
                          return acc;
                        }, {} as Record<string, number>)
                      )
                        .sort((a, b) => b[1] - a[1])
                        .map(([category, count]) => (
                          <div key={category} className="flex items-center justify-between">
                            <span>{category}</span>
                            <Badge variant="outline">{count} incidents</Badge>
                          </div>
                        ))}
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Response Team Performance</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {["Sarah Johnson", "Mike Chen", "IT Team"].map((responder) => (
                        <div key={responder} className="flex items-center justify-between">
                          <div className="flex items-center space-x-2">
                            <User className="w-4 h-4 text-gray-400" />
                            <span>{responder}</span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Badge variant="outline">
                              {incidents.filter(i => i.assigned_to === responder).length} assigned
                            </Badge>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        </div>
        </main>
      </div>
    </div>
  );
}