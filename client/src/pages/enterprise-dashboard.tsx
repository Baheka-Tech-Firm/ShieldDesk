import React, { useState, useEffect } from 'react';
import { useQuery } from "@tanstack/react-query";
import { getAuthToken } from "@/lib/auth";
import { Sidebar } from "@/components/layout/sidebar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Shield, 
  AlertTriangle, 
  Activity, 
  TrendingUp, 
  Eye, 
  Lock, 
  Users, 
  FileText,
  BarChart3,
  Settings,
  RefreshCw,
  Download,
  Filter,
  Calendar,
  Clock,
  Globe,
  Server,
  Database,
  Wifi,
  Smartphone,
  Zap,
  Target,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Cpu,
  Network,
  Cloud,
  HardDrive,
  Terminal,
  Bug,
  ShieldCheck,
  ShieldAlert,
  Scan,
  Search,
  Bell,
  ArrowUp,
  ArrowDown,
  Minus
} from "lucide-react";
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, ArcElement, RadialLinearScale, Filler } from 'chart.js';
import { Line, Doughnut, Radar } from 'react-chartjs-2';
import Plot from 'react-plotly.js';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, ArcElement, RadialLinearScale, Filler);

interface ThreatData {
  id: string;
  type: string;
  severity: 'critical' | 'high' | 'medium' | 'low';
  timestamp: string;
  description: string;
  source: string;
  status: 'active' | 'investigating' | 'resolved';
  impact: string;
  location: string;
}

interface AssetData {
  id: string;
  name: string;
  type: 'server' | 'workstation' | 'mobile' | 'iot' | 'network';
  status: 'secure' | 'vulnerable' | 'compromised' | 'offline';
  riskScore: number;
  lastScan: string;
  vulnerabilities: number;
}

interface ComplianceFramework {
  name: string;
  score: number;
  status: 'compliant' | 'partial' | 'non-compliant';
  requirements: number;
  completed: number;
  lastAudit: string;
}

export default function EnterpriseDashboard() {
  const [activeTab, setActiveTab] = useState('overview');
  const [timeRange, setTimeRange] = useState('24h');
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [realTimeData, setRealTimeData] = useState({});

  // Simulate real-time data updates
  useEffect(() => {
    if (autoRefresh) {
      const interval = setInterval(() => {
        setRealTimeData(prev => ({
          ...prev,
          timestamp: new Date().toISOString(),
          securityScore: Math.floor(Math.random() * 10) + 85,
          activeThreats: Math.floor(Math.random() * 5) + 2,
          networkTraffic: Math.floor(Math.random() * 1000) + 2000
        }));
      }, 5000);
      return () => clearInterval(interval);
    }
  }, [autoRefresh]);

  const { data: dashboardMetrics } = useQuery({
    queryKey: ['/api/security/metrics', timeRange],
    queryFn: () => ({
      securityScore: 87,
      activeThreats: 3,
      assetsMonitored: 1247,
      complianceScore: 94,
      incidentsResolved: 156,
      vulnerabilitiesPatched: 89,
      networkUptime: 99.7,
      dataProtected: 2.4
    }),
    refetchInterval: autoRefresh ? 30000 : false
  });

  const { data: threatIntelligence } = useQuery({
    queryKey: ['/api/threats/intelligence'],
    queryFn: () => [
      {
        id: '1',
        type: 'Advanced Persistent Threat',
        severity: 'critical',
        timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
        description: 'Sophisticated multi-stage attack detected targeting financial data',
        source: 'External IP: 45.123.67.89',
        status: 'investigating',
        impact: 'High - Potential data exfiltration',
        location: 'North America'
      },
      {
        id: '2',
        type: 'Ransomware Signature',
        severity: 'high',
        timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
        description: 'Behavioral analysis identified ransomware-like encryption patterns',
        source: 'Workstation: WS-FINANCE-07',
        status: 'active',
        impact: 'Medium - System quarantined',
        location: 'Corporate Network'
      },
      {
        id: '3',
        type: 'Data Exfiltration Attempt',
        severity: 'high',
        timestamp: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
        description: 'Unusual outbound data transfer patterns detected',
        source: 'Database Server: DB-PROD-01',
        status: 'investigating',
        impact: 'High - Customer data at risk',
        location: 'Data Center'
      },
      {
        id: '4',
        type: 'Phishing Campaign',
        severity: 'medium',
        timestamp: new Date(Date.now() - 8 * 60 * 60 * 1000).toISOString(),
        description: 'Coordinated spear-phishing emails targeting executive staff',
        source: 'Email Gateway',
        status: 'resolved',
        impact: 'Low - Emails blocked',
        location: 'Email Infrastructure'
      },
      {
        id: '5',
        type: 'Privilege Escalation',
        severity: 'medium',
        timestamp: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(),
        description: 'Unauthorized elevation of user privileges detected',
        source: 'Domain Controller: DC-01',
        status: 'resolved',
        impact: 'Medium - Access revoked',
        location: 'Active Directory'
      }
    ],
    refetchInterval: autoRefresh ? 15000 : false
  });

  const { data: assetInventory } = useQuery({
    queryKey: ['/api/assets/inventory'],
    queryFn: () => [
      { id: '1', name: 'Production Web Server', type: 'server', status: 'secure', riskScore: 15, lastScan: '2 hours ago', vulnerabilities: 0 },
      { id: '2', name: 'Database Cluster', type: 'server', status: 'vulnerable', riskScore: 65, lastScan: '1 hour ago', vulnerabilities: 3 },
      { id: '3', name: 'Executive Workstations', type: 'workstation', status: 'secure', riskScore: 25, lastScan: '4 hours ago', vulnerabilities: 1 },
      { id: '4', name: 'Mobile Device Fleet', type: 'mobile', status: 'secure', riskScore: 30, lastScan: '6 hours ago', vulnerabilities: 2 },
      { id: '5', name: 'IoT Sensors', type: 'iot', status: 'vulnerable', riskScore: 70, lastScan: '12 hours ago', vulnerabilities: 5 },
      { id: '6', name: 'Network Infrastructure', type: 'network', status: 'secure', riskScore: 20, lastScan: '3 hours ago', vulnerabilities: 0 }
    ]
  });

  const { data: complianceData } = useQuery({
    queryKey: ['/api/compliance/frameworks'],
    queryFn: () => [
      { name: 'POPIA', score: 94, status: 'compliant', requirements: 88, completed: 83, lastAudit: '2024-05-15' },
      { name: 'ISO 27001', score: 91, status: 'compliant', requirements: 114, completed: 104, lastAudit: '2024-04-20' },
      { name: 'NIST Framework', score: 89, status: 'compliant', requirements: 98, completed: 87, lastAudit: '2024-05-01' },
      { name: 'SOC 2 Type II', score: 96, status: 'compliant', requirements: 64, completed: 61, lastAudit: '2024-03-30' },
      { name: 'GDPR', score: 87, status: 'partial', requirements: 99, completed: 86, lastAudit: '2024-04-10' }
    ]
  });

  const threatTrendData = {
    labels: ['00:00', '04:00', '08:00', '12:00', '16:00', '20:00'],
    datasets: [
      {
        label: 'Critical Threats',
        data: [2, 1, 3, 2, 4, 3],
        borderColor: 'rgb(239, 68, 68)',
        backgroundColor: 'rgba(239, 68, 68, 0.1)',
        fill: true,
      },
      {
        label: 'High Threats',
        data: [5, 4, 6, 5, 7, 6],
        borderColor: 'rgb(249, 115, 22)',
        backgroundColor: 'rgba(249, 115, 22, 0.1)',
        fill: true,
      }
    ]
  };

  const assetStatusData = {
    labels: ['Secure', 'Vulnerable', 'Compromised', 'Offline'],
    datasets: [{
      data: [1156, 67, 8, 16],
      backgroundColor: [
        'rgba(34, 197, 94, 0.8)',
        'rgba(249, 115, 22, 0.8)',
        'rgba(239, 68, 68, 0.8)',
        'rgba(107, 114, 128, 0.8)'
      ],
      borderWidth: 0
    }]
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'text-red-400';
      case 'high': return 'text-orange-400';
      case 'medium': return 'text-yellow-400';
      case 'low': return 'text-blue-400';
      default: return 'text-gray-400';
    }
  };

  const getSeverityBg = (severity: string) => {
    switch (severity) {
      case 'critical': return 'bg-red-500/20 border-red-500/30';
      case 'high': return 'bg-orange-500/20 border-orange-500/30';
      case 'medium': return 'bg-yellow-500/20 border-yellow-500/30';
      case 'low': return 'bg-blue-500/20 border-blue-500/30';
      default: return 'bg-gray-500/20 border-gray-500/30';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'secure': return 'text-green-400';
      case 'vulnerable': return 'text-orange-400';
      case 'compromised': return 'text-red-400';
      case 'offline': return 'text-gray-400';
      default: return 'text-gray-400';
    }
  };

  return (
    <div className="min-h-screen bg-black">
      <Sidebar />
      
      <main className="ml-72 p-8">
        {/* Enhanced Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <div className="flex items-center space-x-3 mb-2">
                <div className="w-3 h-3 bg-cyan-400 rounded-full animate-pulse"></div>
                <h1 className="text-4xl font-bold text-red-400">Security Operations Center</h1>
                <Badge className="bg-green-600/20 text-green-300 border-green-500/30 text-xs">
                  ACTIVE
                </Badge>
              </div>
              <p className="text-gray-400 text-lg">Enterprise-grade threat detection and security orchestration</p>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2 bg-gray-900/60 backdrop-blur-xl rounded-lg px-4 py-2">
                <Clock className="w-4 h-4 text-cyan-400" />
                <select 
                  value={timeRange} 
                  onChange={(e) => setTimeRange(e.target.value)}
                  className="bg-transparent text-white text-sm focus:outline-none cursor-pointer"
                >
                  <option value="1h" className="bg-gray-900">Last Hour</option>
                  <option value="24h" className="bg-gray-900">Last 24 Hours</option>
                  <option value="7d" className="bg-gray-900">Last 7 Days</option>
                  <option value="30d" className="bg-gray-900">Last 30 Days</option>
                </select>
              </div>
              
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => setAutoRefresh(!autoRefresh)}
                className={`${autoRefresh ? 'bg-cyan-600/20 text-cyan-300 border-cyan-500/30' : 'text-gray-300 hover:bg-gray-800/50'}`}
              >
                <RefreshCw className={`w-4 h-4 mr-2 ${autoRefresh ? 'animate-spin' : ''}`} />
                Real-time
              </Button>
              
              <Button className="bg-red-600 hover:bg-red-700 text-white px-6 py-2">
                <Scan className="w-4 h-4 mr-2" />
                Run Security Scan
              </Button>
              
              <Button variant="outline" className="bg-gray-800 border-gray-600 text-gray-300 hover:bg-gray-700 px-6 py-2">
                <Download className="w-4 h-4 mr-2" />
                Export Report
              </Button>
            </div>
          </div>

          {/* Real-time Metrics Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 xl:grid-cols-8 gap-4 mb-8">
            <div className="bg-gray-900/50 backdrop-blur-sm rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <Shield className="w-5 h-5 text-cyan-400" />
                <div className="flex items-center space-x-1">
                  <ArrowUp className="w-3 h-3 text-green-400" />
                  <span className="text-xs text-green-400">+2%</span>
                </div>
              </div>
              <div className="text-2xl font-bold text-white">{realTimeData.securityScore || dashboardMetrics?.securityScore || 87}</div>
              <div className="text-xs text-gray-400">Security Score</div>
            </div>

            <div className="bg-gray-900/50 backdrop-blur-sm rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <AlertTriangle className="w-5 h-5 text-red-400" />
                <div className="flex items-center space-x-1">
                  <ArrowDown className="w-3 h-3 text-green-400" />
                  <span className="text-xs text-green-400">-1</span>
                </div>
              </div>
              <div className="text-2xl font-bold text-red-400">{realTimeData.activeThreats || dashboardMetrics?.activeThreats || 3}</div>
              <div className="text-xs text-gray-400">Active Threats</div>
            </div>

            <div className="bg-gray-900/50 backdrop-blur-sm rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <Target className="w-5 h-5 text-blue-400" />
                <div className="flex items-center space-x-1">
                  <ArrowUp className="w-3 h-3 text-green-400" />
                  <span className="text-xs text-green-400">+12</span>
                </div>
              </div>
              <div className="text-2xl font-bold text-blue-400">{dashboardMetrics?.assetsMonitored || 1247}</div>
              <div className="text-xs text-gray-400">Assets</div>
            </div>

            <div className="bg-gray-900/50 backdrop-blur-sm rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <CheckCircle2 className="w-5 h-5 text-green-400" />
                <div className="flex items-center space-x-1">
                  <ArrowUp className="w-3 h-3 text-green-400" />
                  <span className="text-xs text-green-400">+3%</span>
                </div>
              </div>
              <div className="text-2xl font-bold text-green-400">{dashboardMetrics?.complianceScore || 94}%</div>
              <div className="text-xs text-gray-400">Compliance</div>
            </div>

            <div className="bg-gray-900/50 backdrop-blur-sm rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <Activity className="w-5 h-5 text-purple-400" />
                <div className="flex items-center space-x-1">
                  <span className="text-xs text-gray-400">24h</span>
                </div>
              </div>
              <div className="text-2xl font-bold text-purple-400">{dashboardMetrics?.incidentsResolved || 156}</div>
              <div className="text-xs text-gray-400">Resolved</div>
            </div>

            <div className="bg-gray-900/50 backdrop-blur-sm rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <Bug className="w-5 h-5 text-orange-400" />
                <div className="flex items-center space-x-1">
                  <span className="text-xs text-gray-400">7d</span>
                </div>
              </div>
              <div className="text-2xl font-bold text-orange-400">{dashboardMetrics?.vulnerabilitiesPatched || 89}</div>
              <div className="text-xs text-gray-400">Patched</div>
            </div>

            <div className="bg-gray-900/50 backdrop-blur-sm rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <Network className="w-5 h-5 text-cyan-400" />
                <div className="flex items-center space-x-1">
                  <span className="text-xs text-green-400">SLA</span>
                </div>
              </div>
              <div className="text-2xl font-bold text-cyan-400">{dashboardMetrics?.networkUptime || 99.7}%</div>
              <div className="text-xs text-gray-400">Uptime</div>
            </div>

            <div className="bg-gray-900/50 backdrop-blur-sm rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <HardDrive className="w-5 h-5 text-indigo-400" />
                <div className="flex items-center space-x-1">
                  <Lock className="w-3 h-3 text-green-400" />
                </div>
              </div>
              <div className="text-2xl font-bold text-indigo-400">{dashboardMetrics?.dataProtected || 2.4}TB</div>
              <div className="text-xs text-gray-400">Protected</div>
            </div>
          </div>
        </div>

        {/* Advanced Tabbed Interface */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="bg-gray-900/60 backdrop-blur-xl p-1">
            <TabsTrigger value="overview" className="data-[state=active]:bg-cyan-600/30 data-[state=active]:text-cyan-300">
              <BarChart3 className="w-4 h-4 mr-2" />
              Threat Intelligence
            </TabsTrigger>
            <TabsTrigger value="assets" className="data-[state=active]:bg-cyan-600/30 data-[state=active]:text-cyan-300">
              <Server className="w-4 h-4 mr-2" />
              Asset Security
            </TabsTrigger>
            <TabsTrigger value="compliance" className="data-[state=active]:bg-cyan-600/30 data-[state=active]:text-cyan-300">
              <FileText className="w-4 h-4 mr-2" />
              Compliance
            </TabsTrigger>
            <TabsTrigger value="analytics" className="data-[state=active]:bg-cyan-600/30 data-[state=active]:text-cyan-300">
              <TrendingUp className="w-4 h-4 mr-2" />
              Analytics
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
              {/* Advanced Threat Intelligence */}
              <div className="xl:col-span-2">
                <div className="bg-gray-900/40 backdrop-blur-xl rounded-xl p-6">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-lg font-semibold text-white flex items-center">
                      <AlertTriangle className="w-5 h-5 mr-2 text-red-400" />
                      Active Threat Intelligence
                    </h3>
                    <div className="flex items-center space-x-2">
                      <Badge className="bg-red-600/20 text-red-300 border-red-500/30 text-xs">
                        {threatIntelligence?.filter(t => t.status === 'active').length || 0} Active
                      </Badge>
                      <Badge className="bg-yellow-600/20 text-yellow-300 border-yellow-500/30 text-xs">
                        {threatIntelligence?.filter(t => t.status === 'investigating').length || 0} Investigating
                      </Badge>
                    </div>
                  </div>
                  
                  <div className="space-y-4 max-h-96 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-700 scrollbar-track-transparent">
                    {threatIntelligence?.map((threat: ThreatData) => (
                      <div key={threat.id} className="p-4 bg-gray-800/30 rounded-lg hover:bg-gray-800/50 transition-all duration-200">
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex items-center space-x-3">
                            <div className={`w-3 h-3 rounded-full ${
                              threat.severity === 'critical' ? 'bg-red-500 animate-pulse' :
                              threat.severity === 'high' ? 'bg-orange-500' :
                              threat.severity === 'medium' ? 'bg-yellow-500' :
                              'bg-blue-500'
                            }`}></div>
                            <div>
                              <h4 className="text-white font-medium">{threat.type}</h4>
                              <p className="text-sm text-gray-400">{threat.description}</p>
                            </div>
                          </div>
                          <div className="text-right">
                            <Badge className={`${getSeverityBg(threat.severity)} text-xs mb-1`}>
                              {threat.severity.toUpperCase()}
                            </Badge>
                            <div className="text-xs text-gray-500">
                              {new Date(threat.timestamp).toLocaleTimeString()}
                            </div>
                          </div>
                        </div>
                        <div className="grid grid-cols-3 gap-4 text-xs">
                          <div>
                            <span className="text-gray-500">Source:</span>
                            <p className="text-gray-300 mt-1">{threat.source}</p>
                          </div>
                          <div>
                            <span className="text-gray-500">Impact:</span>
                            <p className="text-gray-300 mt-1">{threat.impact}</p>
                          </div>
                          <div>
                            <span className="text-gray-500">Location:</span>
                            <p className="text-gray-300 mt-1">{threat.location}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Real-time System Monitoring */}
              <div className="space-y-6">
                <div className="bg-gray-900/40 backdrop-blur-xl rounded-xl p-6">
                  <h3 className="text-lg font-semibold text-white flex items-center mb-6">
                    <Activity className="w-5 h-5 mr-2 text-cyan-400" />
                    System Health
                  </h3>
                  
                  <div className="space-y-4">
                    {[
                      { name: 'Firewall Protection', value: 100, status: 'optimal', icon: ShieldCheck },
                      { name: 'Intrusion Detection', value: 98, status: 'optimal', icon: Eye },
                      { name: 'Endpoint Security', value: 94, status: 'good', icon: Smartphone },
                      { name: 'Network Monitoring', value: 97, status: 'optimal', icon: Network },
                      { name: 'Data Encryption', value: 100, status: 'optimal', icon: Lock },
                      { name: 'Backup Systems', value: 89, status: 'warning', icon: HardDrive }
                    ].map((service, index) => {
                      const Icon = service.icon;
                      return (
                        <div key={index} className="space-y-2">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-2">
                              <Icon className="w-4 h-4 text-cyan-400" />
                              <span className="text-gray-300 text-sm">{service.name}</span>
                            </div>
                            <div className="flex items-center space-x-2">
                              <span className="text-white font-medium text-sm">{service.value}%</span>
                              <div className={`w-2 h-2 rounded-full ${
                                service.status === 'optimal' ? 'bg-green-400 animate-pulse' :
                                service.status === 'good' ? 'bg-cyan-400' :
                                'bg-yellow-400 animate-pulse'
                              }`}></div>
                            </div>
                          </div>
                          <div className="w-full bg-gray-800 rounded-full h-2">
                            <div 
                              className={`h-2 rounded-full transition-all duration-1000 ${
                                service.status === 'optimal' ? 'bg-gradient-to-r from-green-600 to-green-400' :
                                service.status === 'good' ? 'bg-gradient-to-r from-cyan-600 to-cyan-400' :
                                'bg-gradient-to-r from-yellow-600 to-yellow-400'
                              }`}
                              style={{ width: `${service.value}%` }}
                            ></div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Threat Trends Chart */}
                <div className="bg-gray-900/40 backdrop-blur-xl rounded-xl p-6">
                  <h3 className="text-lg font-semibold text-white flex items-center mb-4">
                    <TrendingUp className="w-5 h-5 mr-2 text-cyan-400" />
                    Threat Trends (24h)
                  </h3>
                  <div className="h-48">
                    <Line 
                      data={threatTrendData} 
                      options={{
                        responsive: true,
                        maintainAspectRatio: false,
                        plugins: {
                          legend: {
                            labels: { color: '#ffffff' }
                          }
                        },
                        scales: {
                          x: { 
                            ticks: { color: '#9ca3af' },
                            grid: { color: 'rgba(156, 163, 175, 0.1)' }
                          },
                          y: { 
                            ticks: { color: '#9ca3af' },
                            grid: { color: 'rgba(156, 163, 175, 0.1)' }
                          }
                        }
                      }} 
                    />
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="assets" className="space-y-6">
            <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">
              {/* Asset Status Overview */}
              <div className="xl:col-span-3">
                <div className="bg-gray-900/40 backdrop-blur-xl rounded-xl p-6">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-lg font-semibold text-white flex items-center">
                      <Server className="w-5 h-5 mr-2 text-cyan-400" />
                      Asset Security Status
                    </h3>
                    <Button size="sm" variant="outline" className="text-cyan-400 border-cyan-500/30">
                      <Search className="w-4 h-4 mr-2" />
                      Deep Scan
                    </Button>
                  </div>
                  
                  <div className="grid gap-4">
                    {assetInventory?.map((asset: AssetData) => (
                      <div key={asset.id} className="p-4 bg-gray-800/30 rounded-lg hover:bg-gray-800/50 transition-all duration-200">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-4">
                            <div className={`p-2 rounded-lg ${
                              asset.type === 'server' ? 'bg-blue-500/20' :
                              asset.type === 'workstation' ? 'bg-purple-500/20' :
                              asset.type === 'mobile' ? 'bg-green-500/20' :
                              asset.type === 'iot' ? 'bg-orange-500/20' :
                              'bg-cyan-500/20'
                            }`}>
                              {asset.type === 'server' && <Server className="w-5 h-5 text-blue-400" />}
                              {asset.type === 'workstation' && <Cpu className="w-5 h-5 text-purple-400" />}
                              {asset.type === 'mobile' && <Smartphone className="w-5 h-5 text-green-400" />}
                              {asset.type === 'iot' && <Wifi className="w-5 h-5 text-orange-400" />}
                              {asset.type === 'network' && <Network className="w-5 h-5 text-cyan-400" />}
                            </div>
                            <div>
                              <h4 className="text-white font-medium">{asset.name}</h4>
                              <p className="text-sm text-gray-400 capitalize">{asset.type} • Last scan: {asset.lastScan}</p>
                            </div>
                          </div>
                          <div className="flex items-center space-x-4">
                            <div className="text-right">
                              <div className={`text-sm font-medium ${getStatusColor(asset.status)}`}>
                                {asset.status.toUpperCase()}
                              </div>
                              <div className="text-xs text-gray-500">
                                Risk: {asset.riskScore}% • {asset.vulnerabilities} vuln
                              </div>
                            </div>
                            <div className="w-16 h-2 bg-gray-800 rounded-full">
                              <div 
                                className={`h-2 rounded-full ${
                                  asset.riskScore < 30 ? 'bg-green-500' :
                                  asset.riskScore < 60 ? 'bg-yellow-500' : 'bg-red-500'
                                }`}
                                style={{ width: `${asset.riskScore}%` }}
                              ></div>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Asset Distribution */}
              <div className="bg-gray-900/40 backdrop-blur-xl rounded-xl p-6">
                <h3 className="text-lg font-semibold text-white mb-4">Asset Distribution</h3>
                <div className="h-64">
                  <Doughnut 
                    data={assetStatusData} 
                    options={{
                      responsive: true,
                      maintainAspectRatio: false,
                      plugins: {
                        legend: {
                          position: 'bottom',
                          labels: { 
                            color: '#ffffff',
                            usePointStyle: true,
                            padding: 20
                          }
                        }
                      }
                    }} 
                  />
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="compliance" className="space-y-6">
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
              {complianceData?.map((framework: ComplianceFramework, index: number) => (
                <div key={index} className="bg-gray-900/40 backdrop-blur-xl rounded-xl p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-white">{framework.name}</h3>
                    <Badge className={`${
                      framework.status === 'compliant' ? 'bg-green-600/20 text-green-300 border-green-500/30' :
                      framework.status === 'partial' ? 'bg-yellow-600/20 text-yellow-300 border-yellow-500/30' :
                      'bg-red-600/20 text-red-300 border-red-500/30'
                    }`}>
                      {framework.status.toUpperCase()}
                    </Badge>
                  </div>
                  
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-gray-400">Compliance Score</span>
                      <span className={`text-2xl font-bold ${
                        framework.score >= 90 ? 'text-green-400' :
                        framework.score >= 70 ? 'text-yellow-400' : 'text-red-400'
                      }`}>
                        {framework.score}%
                      </span>
                    </div>
                    
                    <div className="w-full bg-gray-800 rounded-full h-3">
                      <div 
                        className={`h-3 rounded-full transition-all duration-1000 ${
                          framework.score >= 90 ? 'bg-gradient-to-r from-green-600 to-green-400' :
                          framework.score >= 70 ? 'bg-gradient-to-r from-yellow-600 to-yellow-400' :
                          'bg-gradient-to-r from-red-600 to-red-400'
                        }`}
                        style={{ width: `${framework.score}%` }}
                      ></div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-gray-500">Requirements</span>
                        <p className="text-white font-medium">{framework.completed}/{framework.requirements}</p>
                      </div>
                      <div>
                        <span className="text-gray-500">Last Audit</span>
                        <p className="text-white font-medium">{framework.lastAudit}</p>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="analytics" className="space-y-6">
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
              <div className="bg-gray-900/40 backdrop-blur-xl rounded-xl p-6">
                <h3 className="text-lg font-semibold text-white mb-4">Security Analytics Dashboard</h3>
                <div className="h-80">
                  <Plot
                    data={[
                      {
                        x: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
                        y: [23, 45, 12, 67, 89, 34, 56],
                        type: 'scatter',
                        mode: 'lines+markers',
                        marker: { color: 'cyan' },
                        name: 'Threats Detected'
                      },
                      {
                        x: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
                        y: [20, 42, 10, 65, 85, 30, 52],
                        type: 'scatter',
                        mode: 'lines+markers',
                        marker: { color: 'green' },
                        name: 'Threats Mitigated'
                      }
                    ]}
                    layout={{
                      paper_bgcolor: 'transparent',
                      plot_bgcolor: 'transparent',
                      font: { color: '#ffffff' },
                      xaxis: { gridcolor: 'rgba(156, 163, 175, 0.1)' },
                      yaxis: { gridcolor: 'rgba(156, 163, 175, 0.1)' },
                      margin: { t: 20, r: 20, b: 40, l: 40 }
                    }}
                    config={{ displayModeBar: false }}
                    style={{ width: '100%', height: '100%' }}
                  />
                </div>
              </div>
              
              <div className="bg-gray-900/40 backdrop-blur-xl rounded-xl p-6">
                <h3 className="text-lg font-semibold text-white mb-4">Threat Landscape Heatmap</h3>
                <div className="h-80">
                  <Plot
                    data={[
                      {
                        z: [[1, 20, 30, 50, 1], [20, 1, 60, 80, 30], [30, 60, 1, 50, 20]],
                        x: ['Malware', 'Phishing', 'DDoS', 'Insider', 'APT'],
                        y: ['Network', 'Endpoint', 'Email'],
                        type: 'heatmap',
                        colorscale: [
                          [0, 'rgb(0,0,0)'],
                          [0.25, 'rgb(255,0,0)'],
                          [0.5, 'rgb(255,165,0)'],
                          [0.75, 'rgb(255,255,0)'],
                          [1, 'rgb(0,255,0)']
                        ]
                      }
                    ]}
                    layout={{
                      paper_bgcolor: 'transparent',
                      plot_bgcolor: 'transparent',
                      font: { color: '#ffffff' },
                      margin: { t: 20, r: 20, b: 60, l: 80 }
                    }}
                    config={{ displayModeBar: false }}
                    style={{ width: '100%', height: '100%' }}
                  />
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}