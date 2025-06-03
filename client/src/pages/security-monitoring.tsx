import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Sidebar } from "@/components/layout/sidebar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar
} from "recharts";
import { 
  Shield, 
  AlertTriangle, 
  Activity, 
  Globe,
  Server,
  Lock,
  Zap,
  Eye,
  Bell,
  TrendingUp,
  TrendingDown,
  Wifi,
  HardDrive,
  Cpu,
  Network
} from "lucide-react";
import { useAuth } from "@/hooks/use-auth";

interface SecurityAlert {
  id: string;
  timestamp: string;
  severity: 'critical' | 'high' | 'medium' | 'low';
  type: string;
  source: string;
  target: string;
  description: string;
  status: 'active' | 'investigating' | 'resolved';
  indicators: string[];
}

interface NetworkActivity {
  timestamp: string;
  inbound_traffic: number;
  outbound_traffic: number;
  suspicious_connections: number;
  blocked_attempts: number;
}

interface SystemMetrics {
  endpoint: string;
  cpu_usage: number;
  memory_usage: number;
  disk_usage: number;
  network_activity: number;
  security_score: number;
  last_scan: string;
  threats_detected: number;
}

export default function SecurityMonitoring() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState("overview");
  const [realTimeData, setRealTimeData] = useState<NetworkActivity[]>([]);

  // Simulate real-time data updates
  useEffect(() => {
    const interval = setInterval(() => {
      const newDataPoint: NetworkActivity = {
        timestamp: new Date().toISOString(),
        inbound_traffic: Math.floor(Math.random() * 1000) + 500,
        outbound_traffic: Math.floor(Math.random() * 800) + 300,
        suspicious_connections: Math.floor(Math.random() * 10),
        blocked_attempts: Math.floor(Math.random() * 25)
      };
      
      setRealTimeData(prev => [...prev.slice(-19), newDataPoint]);
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  const securityAlerts: SecurityAlert[] = [
    {
      id: "alert-001",
      timestamp: "2024-01-20T15:45:23Z",
      severity: "critical",
      type: "Malicious IP Connection",
      source: "192.168.1.105",
      target: "185.220.101.182",
      description: "Connection attempt to known command & control server",
      status: "active",
      indicators: ["IOC-001", "IOC-007"]
    },
    {
      id: "alert-002",
      timestamp: "2024-01-20T15:32:15Z",
      severity: "high",
      type: "Unusual Data Transfer",
      source: "192.168.1.87",
      target: "external",
      description: "Large data transfer detected outside business hours",
      status: "investigating",
      indicators: ["IOC-003"]
    },
    {
      id: "alert-003",
      timestamp: "2024-01-20T15:18:09Z",
      severity: "medium",
      type: "Failed Authentication",
      source: "203.0.113.45",
      target: "ssh.company.com",
      description: "Multiple failed SSH login attempts",
      status: "resolved",
      indicators: ["IOC-012"]
    },
    {
      id: "alert-004",
      timestamp: "2024-01-20T14:55:31Z",
      severity: "high",
      type: "Suspicious Process",
      source: "192.168.1.42",
      target: "local",
      description: "Unknown process with network communication",
      status: "investigating",
      indicators: ["IOC-008", "IOC-015"]
    }
  ];

  const systemMetrics: SystemMetrics[] = [
    {
      endpoint: "WS-001-Finance",
      cpu_usage: 45,
      memory_usage: 67,
      disk_usage: 78,
      network_activity: 23,
      security_score: 85,
      last_scan: "2024-01-20T14:30:00Z",
      threats_detected: 0
    },
    {
      endpoint: "WS-002-HR",
      cpu_usage: 32,
      memory_usage: 54,
      disk_usage: 65,
      network_activity: 18,
      security_score: 92,
      last_scan: "2024-01-20T14:25:00Z",
      threats_detected: 1
    },
    {
      endpoint: "SRV-001-Web",
      cpu_usage: 78,
      memory_usage: 82,
      disk_usage: 45,
      network_activity: 95,
      security_score: 88,
      last_scan: "2024-01-20T14:35:00Z",
      threats_detected: 0
    },
    {
      endpoint: "SRV-002-DB",
      cpu_usage: 56,
      memory_usage: 71,
      disk_usage: 89,
      network_activity: 34,
      security_score: 76,
      last_scan: "2024-01-20T14:20:00Z",
      threats_detected: 2
    }
  ];

  const networkTrafficData = [
    { time: "14:00", inbound: 450, outbound: 320, threats: 2 },
    { time: "14:15", inbound: 520, outbound: 380, threats: 1 },
    { time: "14:30", inbound: 680, outbound: 420, threats: 4 },
    { time: "14:45", inbound: 750, outbound: 560, threats: 3 },
    { time: "15:00", inbound: 620, outbound: 440, threats: 1 },
    { time: "15:15", inbound: 580, outbound: 390, threats: 5 },
    { time: "15:30", inbound: 720, outbound: 480, threats: 2 },
    { time: "15:45", inbound: 810, outbound: 520, threats: 6 }
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
      active: { className: "bg-red-50 text-red-700", icon: AlertTriangle },
      investigating: { className: "bg-yellow-50 text-yellow-700", icon: Eye },
      resolved: { className: "bg-green-50 text-green-700", icon: Shield }
    };
    
    const variant = variants[status as keyof typeof variants];
    const Icon = variant?.icon || Activity;
    
    return (
      <Badge className={variant?.className}>
        <Icon className="w-3 h-3 mr-1" />
        {status.toUpperCase()}
      </Badge>
    );
  };

  const getSecurityScoreColor = (score: number) => {
    if (score >= 90) return "text-green-600";
    if (score >= 75) return "text-yellow-600";
    if (score >= 60) return "text-orange-600";
    return "text-red-600";
  };

  const securityStats = {
    totalAlerts: securityAlerts.length,
    criticalAlerts: securityAlerts.filter(a => a.severity === 'critical').length,
    activeThreats: securityAlerts.filter(a => a.status === 'active').length,
    avgSecurityScore: Math.round(systemMetrics.reduce((acc, m) => acc + m.security_score, 0) / systemMetrics.length)
  };

  return (
    <div className="min-h-screen flex bg-gray-50">
      <Sidebar />
      
      <main className="flex-1 overflow-y-auto">
        <header className="bg-white shadow-sm border-b border-gray-200">
          <div className="px-6 py-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">Security Monitoring</h2>
                <p className="text-gray-600 mt-1">Real-time security monitoring and threat detection</p>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                <span className="text-sm text-gray-600">Live Monitoring Active</span>
              </div>
            </div>
          </div>
        </header>

        <div className="p-6">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="overview">Security Overview</TabsTrigger>
              <TabsTrigger value="alerts">Active Alerts</TabsTrigger>
              <TabsTrigger value="network">Network Activity</TabsTrigger>
              <TabsTrigger value="endpoints">Endpoint Security</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-6">
              {/* Security Metrics */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center">
                      <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center">
                        <Shield className="w-5 h-5 text-blue-600" />
                      </div>
                      <div className="ml-3">
                        <p className="text-sm text-gray-600">Security Score</p>
                        <p className={`text-xl font-semibold ${getSecurityScoreColor(securityStats.avgSecurityScore)}`}>
                          {securityStats.avgSecurityScore}%
                        </p>
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
                        <p className="text-sm text-gray-600">Critical Alerts</p>
                        <p className="text-xl font-semibold text-red-600">{securityStats.criticalAlerts}</p>
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
                        <p className="text-sm text-gray-600">Active Threats</p>
                        <p className="text-xl font-semibold text-yellow-600">{securityStats.activeThreats}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center">
                      <div className="w-10 h-10 bg-green-50 rounded-lg flex items-center justify-center">
                        <Bell className="w-5 h-5 text-green-600" />
                      </div>
                      <div className="ml-3">
                        <p className="text-sm text-gray-600">Total Alerts</p>
                        <p className="text-xl font-semibold text-green-600">{securityStats.totalAlerts}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Real-time Network Traffic */}
              <Card>
                <CardHeader>
                  <CardTitle>Real-time Network Activity</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <AreaChart data={networkTrafficData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="time" />
                      <YAxis />
                      <Tooltip />
                      <Area type="monotone" dataKey="inbound" stackId="1" stroke="#3b82f6" fill="#dbeafe" />
                      <Area type="monotone" dataKey="outbound" stackId="1" stroke="#10b981" fill="#d1fae5" />
                      <Area type="monotone" dataKey="threats" stackId="2" stroke="#ef4444" fill="#fee2e2" />
                    </AreaChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              {/* Recent Critical Alerts */}
              <Card>
                <CardHeader>
                  <CardTitle>Recent Critical Alerts</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {securityAlerts
                      .filter(alert => alert.severity === 'critical' || alert.severity === 'high')
                      .slice(0, 3)
                      .map((alert) => (
                        <div key={alert.id} className="flex items-center justify-between p-4 border rounded-lg">
                          <div className="flex items-center space-x-3">
                            <div className="w-10 h-10 bg-red-50 rounded-lg flex items-center justify-center">
                              <AlertTriangle className="w-5 h-5 text-red-600" />
                            </div>
                            <div>
                              <p className="font-medium">{alert.type}</p>
                              <p className="text-sm text-gray-600">{alert.description}</p>
                              <p className="text-xs text-gray-500">{alert.source} → {alert.target}</p>
                            </div>
                          </div>
                          <div className="flex items-center space-x-3">
                            {getSeverityBadge(alert.severity)}
                            {getStatusBadge(alert.status)}
                            <span className="text-sm text-gray-500">
                              {new Date(alert.timestamp).toLocaleTimeString()}
                            </span>
                          </div>
                        </div>
                      ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="alerts" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Security Alerts</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Timestamp</TableHead>
                          <TableHead>Type</TableHead>
                          <TableHead>Severity</TableHead>
                          <TableHead>Source</TableHead>
                          <TableHead>Target</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead>Indicators</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {securityAlerts.map((alert) => (
                          <TableRow key={alert.id}>
                            <TableCell className="font-mono text-sm">
                              {new Date(alert.timestamp).toLocaleString()}
                            </TableCell>
                            <TableCell className="font-medium">{alert.type}</TableCell>
                            <TableCell>{getSeverityBadge(alert.severity)}</TableCell>
                            <TableCell className="font-mono text-sm">{alert.source}</TableCell>
                            <TableCell className="font-mono text-sm">{alert.target}</TableCell>
                            <TableCell>{getStatusBadge(alert.status)}</TableCell>
                            <TableCell>
                              <div className="flex space-x-1">
                                {alert.indicators.map((indicator, index) => (
                                  <Badge key={index} variant="secondary" className="text-xs">
                                    {indicator}
                                  </Badge>
                                ))}
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

            <TabsContent value="network" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Network Traffic Analysis</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={400}>
                    <LineChart data={networkTrafficData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="time" />
                      <YAxis />
                      <Tooltip />
                      <Line type="monotone" dataKey="inbound" stroke="#3b82f6" strokeWidth={2} />
                      <Line type="monotone" dataKey="outbound" stroke="#10b981" strokeWidth={2} />
                      <Line type="monotone" dataKey="threats" stroke="#ef4444" strokeWidth={2} />
                    </LineChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="endpoints" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Endpoint Security Status</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Endpoint</TableHead>
                          <TableHead>CPU</TableHead>
                          <TableHead>Memory</TableHead>
                          <TableHead>Disk</TableHead>
                          <TableHead>Security Score</TableHead>
                          <TableHead>Threats</TableHead>
                          <TableHead>Last Scan</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {systemMetrics.map((system) => (
                          <TableRow key={system.endpoint}>
                            <TableCell className="font-medium">{system.endpoint}</TableCell>
                            <TableCell>
                              <div className="flex items-center space-x-2">
                                <Cpu className="w-4 h-4 text-gray-400" />
                                <span>{system.cpu_usage}%</span>
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center space-x-2">
                                <HardDrive className="w-4 h-4 text-gray-400" />
                                <span>{system.memory_usage}%</span>
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center space-x-2">
                                <HardDrive className="w-4 h-4 text-gray-400" />
                                <span>{system.disk_usage}%</span>
                              </div>
                            </TableCell>
                            <TableCell>
                              <span className={`font-medium ${getSecurityScoreColor(system.security_score)}`}>
                                {system.security_score}%
                              </span>
                            </TableCell>
                            <TableCell>
                              {system.threats_detected > 0 ? (
                                <Badge variant="destructive">{system.threats_detected}</Badge>
                              ) : (
                                <Badge variant="secondary">0</Badge>
                              )}
                            </TableCell>
                            <TableCell className="text-sm text-gray-500">
                              {new Date(system.last_scan).toLocaleTimeString()}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </main>
    </div>
  );
}