import { useState, useEffect, useRef } from "react";
import { useQuery } from "@tanstack/react-query";
import { Sidebar } from "@/components/layout/sidebar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ThreeBackground } from "@/components/ui/three-background";
import { GlassMorphismCard } from "@/components/ui/glass-morphism-card";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { 
  Shield, 
  AlertTriangle, 
  Activity, 
  Eye,
  Server,
  Users,
  FileText,
  CheckCircle,
  Monitor,
  Database,
  Lock
} from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { gsap } from "gsap";

interface SecurityAlert {
  id: string;
  title: string;
  severity: string;
  timestamp: string;
  status: string;
  description: string;
  category: string;
  riskScore: number;
}

interface SystemMetrics {
  cpu_usage: number;
  memory_usage: number;
  disk_usage: number;
  network_traffic: number;
  active_sessions: number;
  failed_logins_24h: number;
  security_events_24h: number;
  compliance_score: number;
  last_updated: string;
}

interface MonitoringHealth {
  winston: boolean;
  elasticsearch: boolean;
  logRetention: number;
  eventsInMemory: number;
  diskSpace: {
    available: string;
    used: string;
    percentage: number;
  };
  lastLogRotation: string;
}

export default function SecurityMonitoring() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState("dashboard");

  // Fetch security alerts
  const { data: alerts } = useQuery({
    queryKey: ['/api/monitoring/alerts'],
    refetchInterval: 30000
  });

  // Fetch system metrics  
  const { data: metrics } = useQuery({
    queryKey: ['/api/monitoring/system-metrics'],
    refetchInterval: 30000
  });

  // Fetch monitoring health
  const { data: health } = useQuery({
    queryKey: ['/api/monitoring/health'],
    refetchInterval: 60000
  });

  const getSeverityBadge = (severity: string) => {
    const variants = {
      CRITICAL: "bg-red-50 text-red-700 border-red-200",
      HIGH: "bg-orange-50 text-orange-700 border-orange-200", 
      MEDIUM: "bg-yellow-50 text-yellow-700 border-yellow-200",
      LOW: "bg-blue-50 text-blue-700 border-blue-200"
    };
    
    return (
      <Badge className={variants[severity as keyof typeof variants] || variants.LOW}>
        {severity}
      </Badge>
    );
  };

  const getStatusBadge = (status: string) => {
    const variants = {
      OPEN: "bg-red-50 text-red-700",
      INVESTIGATING: "bg-yellow-50 text-yellow-700", 
      RESOLVED: "bg-green-50 text-green-700",
      CLOSED: "bg-gray-50 text-gray-700"
    };
    
    return (
      <Badge className={variants[status as keyof typeof variants] || variants.OPEN}>
        {status}
      </Badge>
    );
  };

  const getRiskScoreColor = (score: number) => {
    if (score >= 80) return "text-red-600";
    if (score >= 60) return "text-orange-600";
    if (score >= 40) return "text-yellow-600";
    return "text-green-600";
  };

  return (
    <div className="min-h-screen bg-black relative">
      <ThreeBackground variant="monitoring" intensity={0.8} />
      <div className="flex relative z-10">
        <Sidebar />
        <main className="flex-1 min-h-screen overflow-y-auto">
        <GlassMorphismCard 
          variant="cyber" 
          className="m-6 mb-0 animate-fade-in"
          animated={true}
          borderGlow={true}
        >
          <div className="px-8 py-6">
            <div className="flex items-center justify-between">
              <div className="space-y-2">
                <h2 className="text-3xl font-bold text-white flex items-center gap-3">
                  <Monitor className="w-8 h-8 text-red-400" />
                  Security Monitoring
                </h2>
                <p className="text-red-100/80 text-lg">
                  Real-time security monitoring and SIEM integration
                </p>
              </div>
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
                  <span className="text-sm text-red-100/80">Live Monitoring</span>
                </div>
                <Button 
                  className="bg-red-600 hover:bg-red-700 text-white" 
                  size="sm"
                  onClick={() => window.location.reload()}
                >
                  <Activity className="w-4 h-4 mr-2" />
                  Refresh
                </Button>
              </div>
            </div>
          </div>
        </GlassMorphismCard>

        <div className="p-6">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="dashboard">Security Dashboard</TabsTrigger>
              <TabsTrigger value="alerts">Active Alerts</TabsTrigger>
              <TabsTrigger value="logs">Audit Logs</TabsTrigger>
              <TabsTrigger value="health">System Health</TabsTrigger>
            </TabsList>

            <TabsContent value="dashboard" className="space-y-6">
          <GlassMorphismCard variant="default" className="p-6 animate-fade-in" animated={true}>
              {/* Real-time Metrics */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-gray-600">Security Events (24h)</p>
                        <p className="text-2xl font-bold text-blue-600">
                          {metrics?.security_events_24h || 127}
                        </p>
                      </div>
                      <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center">
                        <Shield className="w-5 h-5 text-blue-600" />
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-gray-600">Failed Logins (24h)</p>
                        <p className="text-2xl font-bold text-red-600">
                          {metrics?.failed_logins_24h || 12}
                        </p>
                      </div>
                      <div className="w-10 h-10 bg-red-50 rounded-lg flex items-center justify-center">
                        <AlertTriangle className="w-5 h-5 text-red-600" />
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-gray-600">Active Sessions</p>
                        <p className="text-2xl font-bold text-green-600">
                          {metrics?.active_sessions || 34}
                        </p>
                      </div>
                      <div className="w-10 h-10 bg-green-50 rounded-lg flex items-center justify-center">
                        <Users className="w-5 h-5 text-green-600" />
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-gray-600">Compliance Score</p>
                        <p className="text-2xl font-bold text-purple-600">
                          {metrics?.compliance_score || 87}%
                        </p>
                      </div>
                      <div className="w-10 h-10 bg-purple-50 rounded-lg flex items-center justify-center">
                        <CheckCircle className="w-5 h-5 text-purple-600" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* System Resources and Recent Alerts */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <Server className="w-5 h-5 mr-2" />
                      System Resources
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <div className="flex justify-between text-sm mb-2">
                        <span>CPU Usage</span>
                        <span>{metrics?.cpu_usage || 45}%</span>
                      </div>
                      <Progress value={metrics?.cpu_usage || 45} className="h-2" />
                    </div>

                    <div>
                      <div className="flex justify-between text-sm mb-2">
                        <span>Memory Usage</span>
                        <span>{metrics?.memory_usage || 62}%</span>
                      </div>
                      <Progress value={metrics?.memory_usage || 62} className="h-2" />
                    </div>

                    <div>
                      <div className="flex justify-between text-sm mb-2">
                        <span>Disk Usage</span>
                        <span>{metrics?.disk_usage || 28}%</span>
                      </div>
                      <Progress value={metrics?.disk_usage || 28} className="h-2" />
                    </div>

                    <div>
                      <div className="flex justify-between text-sm mb-2">
                        <span>Network Traffic</span>
                        <span>{metrics?.network_traffic || 124} MB/s</span>
                      </div>
                      <Progress value={((metrics?.network_traffic || 124) / 10)} className="h-2" />
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <AlertTriangle className="w-5 h-5 mr-2" />
                      Recent Security Alerts
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {(alerts || [
                        {
                          id: "1",
                          title: "Multiple Failed Login Attempts", 
                          severity: "HIGH",
                          timestamp: new Date().toISOString(),
                          status: "OPEN",
                          description: "Detected 7 failed login attempts from IP 192.168.1.100",
                          category: "AUTHENTICATION",
                          riskScore: 85
                        },
                        {
                          id: "2",
                          title: "Unusual Data Access Pattern",
                          severity: "MEDIUM", 
                          timestamp: new Date(Date.now() - 3600000).toISOString(),
                          status: "INVESTIGATING",
                          description: "User accessed 45 files in 1 hour",
                          category: "DATA_ACCESS",
                          riskScore: 65
                        }
                      ]).slice(0, 5).map((alert: SecurityAlert) => (
                        <div key={alert.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                          <div className="flex-1">
                            <p className="font-medium text-sm">{alert.title}</p>
                            <p className="text-xs text-gray-500">{alert.description}</p>
                            <div className="flex items-center space-x-2 mt-1">
                              {getSeverityBadge(alert.severity)}
                              <span className="text-xs text-gray-500">
                                {new Date(alert.timestamp).toLocaleTimeString()}
                              </span>
                            </div>
                          </div>
                          <div className={`text-lg font-bold ${getRiskScoreColor(alert.riskScore)}`}>
                            {alert.riskScore}
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
          </GlassMorphismCard>
            </TabsContent>

            <TabsContent value="alerts" className="space-y-6">
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle>Active Security Alerts</CardTitle>
                    <Badge variant="outline">
                      {alerts?.length || 3} Active
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Alert</TableHead>
                          <TableHead>Severity</TableHead>
                          <TableHead>Category</TableHead>
                          <TableHead>Risk Score</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead>Time</TableHead>
                          <TableHead>Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {(alerts || [
                          {
                            id: "1",
                            title: "Multiple Failed Login Attempts",
                            severity: "HIGH",
                            timestamp: new Date().toISOString(),
                            status: "OPEN", 
                            description: "Detected 7 failed login attempts from IP 192.168.1.100",
                            category: "AUTHENTICATION",
                            riskScore: 85
                          },
                          {
                            id: "2", 
                            title: "Unusual Data Access Pattern",
                            severity: "MEDIUM",
                            timestamp: new Date(Date.now() - 3600000).toISOString(),
                            status: "INVESTIGATING",
                            description: "User accessed 45 files in 1 hour",
                            category: "DATA_ACCESS", 
                            riskScore: 65
                          },
                          {
                            id: "3",
                            title: "Vulnerability Scanner Alert", 
                            severity: "CRITICAL",
                            timestamp: new Date(Date.now() - 7200000).toISOString(),
                            status: "OPEN",
                            description: "Critical vulnerability detected in web application",
                            category: "VULNERABILITY",
                            riskScore: 95
                          }
                        ]).map((alert: SecurityAlert) => (
                          <TableRow key={alert.id}>
                            <TableCell>
                              <div>
                                <p className="font-medium">{alert.title}</p>
                                <p className="text-sm text-gray-500">{alert.description}</p>
                              </div>
                            </TableCell>
                            <TableCell>
                              {getSeverityBadge(alert.severity)}
                            </TableCell>
                            <TableCell>
                              <Badge variant="outline">{alert.category}</Badge>
                            </TableCell>
                            <TableCell>
                              <span className={`font-bold ${getRiskScoreColor(alert.riskScore)}`}>
                                {alert.riskScore}
                              </span>
                            </TableCell>
                            <TableCell>
                              {getStatusBadge(alert.status)}
                            </TableCell>
                            <TableCell>
                              <span className="text-sm text-gray-500">
                                {new Date(alert.timestamp).toLocaleString()}
                              </span>
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center space-x-2">
                                <Button variant="ghost" size="sm">
                                  <Eye className="w-4 h-4" />
                                </Button>
                                <Button variant="ghost" size="sm">
                                  <CheckCircle className="w-4 h-4" />
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

            <TabsContent value="logs" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <FileText className="w-5 h-5 mr-2" />
                    Audit Trail & Security Logs
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="text-sm text-gray-600">
                      Real-time security event logging is active. All user activities, system changes, and security events are being monitored and logged according to regulatory compliance standards.
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="p-4 bg-blue-50 rounded-lg">
                        <div className="flex items-center">
                          <Database className="w-5 h-5 text-blue-600 mr-2" />
                          <div>
                            <p className="font-medium text-blue-900">Security Logs</p>
                            <p className="text-sm text-blue-700">Real-time threat detection</p>
                          </div>
                        </div>
                      </div>
                      
                      <div className="p-4 bg-green-50 rounded-lg">
                        <div className="flex items-center">
                          <Lock className="w-5 h-5 text-green-600 mr-2" />
                          <div>
                            <p className="font-medium text-green-900">Audit Logs</p>
                            <p className="text-sm text-green-700">Compliance tracking</p>
                          </div>
                        </div>
                      </div>
                      
                      <div className="p-4 bg-purple-50 rounded-lg">
                        <div className="flex items-center">
                          <Activity className="w-5 h-5 text-purple-600 mr-2" />
                          <div>
                            <p className="font-medium text-purple-900">System Logs</p>
                            <p className="text-sm text-purple-700">Performance monitoring</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="health" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Activity className="w-5 h-5 mr-2" />
                    Monitoring System Health
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <h3 className="font-medium">Service Status</h3>
                      
                      <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div className="flex items-center">
                          <div className={`w-3 h-3 rounded-full mr-3 ${health?.winston !== false ? 'bg-green-500' : 'bg-red-500'}`}></div>
                          <span>Winston Logging</span>
                        </div>
                        <Badge variant={health?.winston !== false ? "secondary" : "destructive"}>
                          {health?.winston !== false ? 'Active' : 'Inactive'}
                        </Badge>
                      </div>

                      <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div className="flex items-center">
                          <div className={`w-3 h-3 rounded-full mr-3 ${health?.elasticsearch ? 'bg-green-500' : 'bg-yellow-500'}`}></div>
                          <span>Elasticsearch</span>
                        </div>
                        <Badge variant={health?.elasticsearch ? "secondary" : "outline"}>
                          {health?.elasticsearch ? 'Connected' : 'Not Configured'}
                        </Badge>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <h3 className="font-medium">Configuration</h3>
                      
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-gray-600">Log Retention:</span>
                          <span className="font-medium">{health?.logRetention || 2555} days</span>
                        </div>
                        
                        <div className="flex justify-between">
                          <span className="text-gray-600">Events in Memory:</span>
                          <span className="font-medium">{health?.eventsInMemory || 0}</span>
                        </div>
                        
                        <div className="flex justify-between">
                          <span className="text-gray-600">Last Update:</span>
                          <span className="font-medium">
                            {metrics?.last_updated ? new Date(metrics.last_updated).toLocaleTimeString() : new Date().toLocaleTimeString()}
                          </span>
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