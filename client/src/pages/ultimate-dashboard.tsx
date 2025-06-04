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
  Minus,
  PlayCircle,
  PauseCircle,
  RotateCcw,
  TrendingDown,
  Layers,
  MonitorSpeaker,
  Crosshair
} from "lucide-react";
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, ArcElement, RadialLinearScale, Filler } from 'chart.js';
import { Line, Doughnut, Radar, Bar } from 'react-chartjs-2';
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
  attackVector: string;
  mitreTactic: string;
}

interface AssetData {
  id: string;
  name: string;
  type: 'server' | 'workstation' | 'mobile' | 'iot' | 'network';
  status: 'secure' | 'vulnerable' | 'compromised' | 'offline';
  riskScore: number;
  lastScan: string;
  vulnerabilities: number;
  os: string;
  ipAddress: string;
  location: string;
}

interface SecurityMetric {
  id: string;
  name: string;
  value: number;
  previousValue: number;
  target: number;
  unit: string;
  trend: 'up' | 'down' | 'stable';
  status: 'excellent' | 'good' | 'warning' | 'critical';
  icon: React.ElementType;
  color: string;
}

export default function UltimateDashboard() {
  const [activeTab, setActiveTab] = useState('overview');
  const [timeRange, setTimeRange] = useState('24h');
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [liveMetrics, setLiveMetrics] = useState({});
  const [scanningActive, setScanningActive] = useState(false);

  // Simulate real-time updates
  useEffect(() => {
    if (autoRefresh) {
      const interval = setInterval(() => {
        setLiveMetrics(prev => ({
          ...prev,
          timestamp: new Date().toISOString(),
          securityScore: Math.floor(Math.random() * 5) + 85,
          activeThreats: Math.floor(Math.random() * 3) + 2,
          networkTraffic: Math.floor(Math.random() * 500) + 2000,
          cpuUsage: Math.floor(Math.random() * 20) + 40,
          memoryUsage: Math.floor(Math.random() * 15) + 60,
          bandwidthUsage: Math.floor(Math.random() * 30) + 50
        }));
      }, 3000);
      return () => clearInterval(interval);
    }
  }, [autoRefresh]);

  // Advanced security metrics
  const securityMetrics: SecurityMetric[] = [
    {
      id: 'security-score',
      name: 'Security Posture',
      value: liveMetrics.securityScore || 87,
      previousValue: 85,
      target: 95,
      unit: '/100',
      trend: 'up',
      status: 'good',
      icon: Shield,
      color: 'text-cyan-400'
    },
    {
      id: 'threat-level',
      name: 'Threat Level',
      value: liveMetrics.activeThreats || 3,
      previousValue: 5,
      target: 0,
      unit: ' threats',
      trend: 'down',
      status: 'warning',
      icon: AlertTriangle,
      color: 'text-orange-400'
    },
    {
      id: 'assets-protected',
      name: 'Assets Protected',
      value: 1247,
      previousValue: 1235,
      target: 1300,
      unit: ' assets',
      trend: 'up',
      status: 'excellent',
      icon: Target,
      color: 'text-green-400'
    },
    {
      id: 'compliance-score',
      name: 'Compliance Score',
      value: 94,
      previousValue: 92,
      target: 98,
      unit: '%',
      trend: 'up',
      status: 'good',
      icon: CheckCircle2,
      color: 'text-blue-400'
    },
    {
      id: 'incident-response',
      name: 'MTTR',
      value: 12,
      previousValue: 18,
      target: 10,
      unit: ' min',
      trend: 'down',
      status: 'good',
      icon: Activity,
      color: 'text-purple-400'
    },
    {
      id: 'vulnerability-score',
      name: 'Vuln. Remediation',
      value: 89,
      previousValue: 84,
      target: 95,
      unit: '%',
      trend: 'up',
      status: 'good',
      icon: Bug,
      color: 'text-indigo-400'
    },
    {
      id: 'network-security',
      name: 'Network Security',
      value: 98,
      previousValue: 97,
      target: 99,
      unit: '%',
      trend: 'up',
      status: 'excellent',
      icon: Network,
      color: 'text-teal-400'
    },
    {
      id: 'data-protection',
      name: 'Data Protection',
      value: 96,
      previousValue: 95,
      target: 99,
      unit: '%',
      trend: 'up',
      status: 'excellent',
      icon: Lock,
      color: 'text-emerald-400'
    }
  ];

  // Advanced threat intelligence data
  const threatIntelligence: ThreatData[] = [
    {
      id: '1',
      type: 'Advanced Persistent Threat (APT)',
      severity: 'critical',
      timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
      description: 'Multi-stage attack campaign targeting financial infrastructure with custom malware',
      source: 'External IP: 185.220.101.42 (TOR Exit Node)',
      status: 'investigating',
      impact: 'Potential data exfiltration and lateral movement',
      location: 'DMZ Network Segment',
      attackVector: 'Spear Phishing → Privilege Escalation → Data Exfiltration',
      mitreTactic: 'TA0001 - Initial Access, TA0004 - Privilege Escalation'
    },
    {
      id: '2',
      type: 'Ransomware Deployment',
      severity: 'critical',
      timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
      description: 'LockBit 3.0 ransomware variant detected with advanced evasion techniques',
      source: 'Workstation: WS-FINANCE-07 (172.16.45.23)',
      status: 'active',
      impact: 'System encryption in progress, isolated from network',
      location: 'Finance Department - Floor 3',
      attackVector: 'RDP Brute Force → Credential Theft → Lateral Movement',
      mitreTactic: 'TA0008 - Lateral Movement, TA0040 - Impact'
    },
    {
      id: '3',
      type: 'Data Exfiltration Campaign',
      severity: 'high',
      timestamp: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
      description: 'Abnormal data transfer patterns indicating potential intellectual property theft',
      source: 'Database Server: DB-PROD-01 (10.0.1.15)',
      status: 'investigating',
      impact: 'Customer PII and financial records potentially compromised',
      location: 'Primary Data Center - Rack 7',
      attackVector: 'SQL Injection → Database Access → Data Mining',
      mitreTactic: 'TA0009 - Collection, TA0010 - Exfiltration'
    },
    {
      id: '4',
      type: 'Supply Chain Attack',
      severity: 'high',
      timestamp: new Date(Date.now() - 8 * 60 * 60 * 1000).toISOString(),
      description: 'Compromised third-party software component detected in production environment',
      source: 'Application Server: APP-WEB-03 (10.0.2.8)',
      status: 'resolved',
      impact: 'Backdoor access prevented, systems patched',
      location: 'Web Application Tier',
      attackVector: 'Supply Chain Compromise → Code Injection → Persistence',
      mitreTactic: 'TA0001 - Initial Access, TA0003 - Persistence'
    },
    {
      id: '5',
      type: 'Insider Threat Activity',
      severity: 'medium',
      timestamp: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(),
      description: 'Suspicious file access patterns from privileged user account outside normal hours',
      source: 'User Account: admin_jsmith (Employee ID: 4729)',
      status: 'investigating',
      impact: 'Potential unauthorized access to sensitive documents',
      location: 'Executive File Server',
      attackVector: 'Credential Abuse → Data Access → Policy Violation',
      mitreTactic: 'TA0009 - Collection'
    }
  ];

  // Enhanced asset inventory
  const assetInventory: AssetData[] = [
    {
      id: '1',
      name: 'Production Web Cluster',
      type: 'server',
      status: 'secure',
      riskScore: 15,
      lastScan: '2 hours ago',
      vulnerabilities: 0,
      os: 'Ubuntu 22.04 LTS',
      ipAddress: '10.0.1.10-12',
      location: 'Data Center A - Rack 3'
    },
    {
      id: '2',
      name: 'Financial Database Cluster',
      type: 'server',
      status: 'vulnerable',
      riskScore: 65,
      lastScan: '1 hour ago',
      vulnerabilities: 3,
      os: 'Windows Server 2022',
      ipAddress: '10.0.1.15-17',
      location: 'Data Center A - Rack 7'
    },
    {
      id: '3',
      name: 'Executive Workstations',
      type: 'workstation',
      status: 'secure',
      riskScore: 25,
      lastScan: '4 hours ago',
      vulnerabilities: 1,
      os: 'Windows 11 Enterprise',
      ipAddress: '172.16.10.0/24',
      location: 'Executive Floor - C-Suite'
    },
    {
      id: '4',
      name: 'Mobile Device Fleet',
      type: 'mobile',
      status: 'secure',
      riskScore: 30,
      lastScan: '6 hours ago',
      vulnerabilities: 2,
      os: 'iOS 17.x / Android 14',
      ipAddress: 'DHCP Pool',
      location: 'Enterprise Mobile Network'
    },
    {
      id: '5',
      name: 'IoT Sensor Network',
      type: 'iot',
      status: 'vulnerable',
      riskScore: 70,
      lastScan: '12 hours ago',
      vulnerabilities: 5,
      os: 'Various Embedded OS',
      ipAddress: '192.168.100.0/24',
      location: 'Building Automation Systems'
    },
    {
      id: '6',
      name: 'Core Network Infrastructure',
      type: 'network',
      status: 'secure',
      riskScore: 20,
      lastScan: '3 hours ago',
      vulnerabilities: 0,
      os: 'Cisco IOS XE 17.x',
      ipAddress: '10.0.0.0/16',
      location: 'Network Operations Center'
    }
  ];

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'up': return <ArrowUp className="w-3 h-3 text-green-400" />;
      case 'down': return <ArrowDown className="w-3 h-3 text-red-400" />;
      default: return <Minus className="w-3 h-3 text-gray-400" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'excellent': return 'text-green-400';
      case 'good': return 'text-cyan-400';
      case 'warning': return 'text-yellow-400';
      case 'critical': return 'text-red-400';
      default: return 'text-gray-400';
    }
  };

  const getSeverityBadge = (severity: string) => {
    const baseClass = "px-2 py-1 rounded-full text-xs font-bold uppercase tracking-wider";
    switch (severity) {
      case 'critical':
        return `${baseClass} bg-red-500/20 text-red-300 animate-pulse`;
      case 'high':
        return `${baseClass} bg-orange-500/20 text-orange-300`;
      case 'medium':
        return `${baseClass} bg-yellow-500/20 text-yellow-300`;
      case 'low':
        return `${baseClass} bg-blue-500/20 text-blue-300`;
      default:
        return `${baseClass} bg-gray-500/20 text-gray-300`;
    }
  };

  const getAssetStatusBadge = (status: string) => {
    const baseClass = "px-3 py-1 rounded-lg text-xs font-semibold uppercase tracking-wide";
    switch (status) {
      case 'secure':
        return `${baseClass} bg-green-500/20 text-green-300`;
      case 'vulnerable':
        return `${baseClass} bg-orange-500/20 text-orange-300`;
      case 'compromised':
        return `${baseClass} bg-red-500/20 text-red-300 animate-pulse`;
      case 'offline':
        return `${baseClass} bg-gray-500/20 text-gray-300`;
      default:
        return `${baseClass} bg-gray-500/20 text-gray-300`;
    }
  };

  return (
    <div className="min-h-screen bg-black relative overflow-hidden">
      {/* Advanced Background Effects */}
      <div className="cyber-grid absolute inset-0"></div>
      <div className="absolute inset-0 bg-gradient-to-br from-cyan-900/5 via-black to-red-900/5"></div>
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-cyan-400 to-transparent opacity-30"></div>
      
      <Sidebar />
      
      <main className="ml-72 p-8 relative z-10">
        {/* Enhanced Header with Live Status */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-3">
                <div className="relative">
                  <div className="w-4 h-4 bg-cyan-400 rounded-full animate-pulse"></div>
                  <div className="absolute inset-0 w-4 h-4 bg-cyan-400 rounded-full animate-ping opacity-30"></div>
                </div>
                <h1 className="text-5xl font-black text-transparent bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-600 bg-clip-text">
                  ShieldDesk SOC
                </h1>
                <div className="flex items-center space-x-2">
                  <Badge className="bg-green-600/20 text-green-300 border-green-500/30 animate-pulse">
                    OPERATIONAL
                  </Badge>
                  <Badge className="bg-cyan-600/20 text-cyan-300 border-cyan-500/30">
                    REAL-TIME
                  </Badge>
                </div>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              {/* Time Range Selector */}
              <div className="glassmorphism rounded-lg px-4 py-2">
                <div className="flex items-center space-x-2">
                  <Clock className="w-4 h-4 text-cyan-400" />
                  <select 
                    value={timeRange} 
                    onChange={(e) => setTimeRange(e.target.value)}
                    className="bg-transparent text-white text-sm focus:outline-none cursor-pointer"
                  >
                    <option value="1h" className="bg-gray-900">Last Hour</option>
                    <option value="24h" className="bg-gray-900">24 Hours</option>
                    <option value="7d" className="bg-gray-900">7 Days</option>
                    <option value="30d" className="bg-gray-900">30 Days</option>
                  </select>
                </div>
              </div>
              
              {/* Auto-refresh Toggle */}
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => setAutoRefresh(!autoRefresh)}
                className={`glassmorphism ${autoRefresh ? 'bg-cyan-600/20 text-cyan-300 border-cyan-500/30' : 'text-gray-300 hover:bg-gray-800/50'}`}
              >
                {autoRefresh ? <PauseCircle className="w-4 h-4 mr-2" /> : <PlayCircle className="w-4 h-4 mr-2" />}
                {autoRefresh ? 'Live' : 'Paused'}
              </Button>
              
              {/* Security Scan Button */}
              <Button 
                onClick={() => setScanningActive(!scanningActive)}
                className={`cyber-button danger px-6 py-2 ${scanningActive ? 'animate-pulse' : ''}`}
              >
                <Scan className={`w-4 h-4 mr-2 ${scanningActive ? 'animate-spin' : ''}`} />
                {scanningActive ? 'Scanning...' : 'Security Scan'}
              </Button>
              
              {/* Export Button */}
              <Button variant="outline" className="glassmorphism text-gray-300 hover:bg-gray-800/50 px-6 py-2">
                <Download className="w-4 h-4 mr-2" />
                Export
              </Button>
            </div>
          </div>

          {/* Real-time Security Metrics Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 xl:grid-cols-8 gap-4 mb-8">
            {securityMetrics.map((metric) => {
              const Icon = metric.icon;
              const change = metric.value - metric.previousValue;
              const changePercent = ((change / metric.previousValue) * 100).toFixed(1);
              
              return (
                <div key={metric.id} className="cyber-metric glassmorphism rounded-xl p-4 hover:scale-105 transition-all duration-300">
                  <div className="flex items-center justify-between mb-3">
                    <div className={`p-2 rounded-lg bg-gray-900/40`}>
                      <Icon className={`w-5 h-5 ${metric.color}`} />
                    </div>
                    <div className="flex items-center space-x-1">
                      {getTrendIcon(metric.trend)}
                      <span className={`text-xs font-bold ${
                        metric.trend === 'up' && metric.target > metric.value ? 'text-green-400' :
                        metric.trend === 'down' && metric.target < metric.value ? 'text-green-400' :
                        metric.trend === 'up' ? 'text-red-400' :
                        metric.trend === 'down' ? 'text-green-400' :
                        'text-gray-400'
                      }`}>
                        {change > 0 ? '+' : ''}{change}{metric.unit}
                      </span>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <div className={`metric-value ${getStatusColor(metric.status)}`}>
                      {metric.value}{metric.unit}
                    </div>
                    <div className="text-xs text-gray-400 font-medium">{metric.name}</div>
                    <div className="w-full bg-gray-800 rounded-full h-1.5">
                      <div 
                        className={`h-1.5 rounded-full transition-all duration-1000 ${
                          metric.status === 'excellent' ? 'bg-gradient-to-r from-green-600 to-green-400' :
                          metric.status === 'good' ? 'bg-gradient-to-r from-cyan-600 to-cyan-400' :
                          metric.status === 'warning' ? 'bg-gradient-to-r from-yellow-600 to-yellow-400' :
                          'bg-gradient-to-r from-red-600 to-red-400'
                        }`}
                        style={{ width: `${(metric.value / metric.target) * 100}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Advanced Tabbed Interface */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="glassmorphism p-1.5 rounded-xl">
            <TabsTrigger 
              value="overview" 
              className="data-[state=active]:bg-cyan-600/30 data-[state=active]:text-cyan-300 data-[state=active]:shadow-lg data-[state=active]:shadow-cyan-500/25 rounded-lg px-6 py-3 transition-all duration-300"
            >
              <Crosshair className="w-4 h-4 mr-2" />
              Threat Intelligence
            </TabsTrigger>
            <TabsTrigger 
              value="assets" 
              className="data-[state=active]:bg-cyan-600/30 data-[state=active]:text-cyan-300 data-[state=active]:shadow-lg data-[state=active]:shadow-cyan-500/25 rounded-lg px-6 py-3 transition-all duration-300"
            >
              <Layers className="w-4 h-4 mr-2" />
              Asset Security
            </TabsTrigger>
            <TabsTrigger 
              value="compliance" 
              className="data-[state=active]:bg-cyan-600/30 data-[state=active]:text-cyan-300 data-[state=active]:shadow-lg data-[state=active]:shadow-cyan-500/25 rounded-lg px-6 py-3 transition-all duration-300"
            >
              <FileText className="w-4 h-4 mr-2" />
              Compliance
            </TabsTrigger>
            <TabsTrigger 
              value="analytics" 
              className="data-[state=active]:bg-cyan-600/30 data-[state=active]:text-cyan-300 data-[state=active]:shadow-lg data-[state=active]:shadow-cyan-500/25 rounded-lg px-6 py-3 transition-all duration-300"
            >
              <BarChart3 className="w-4 h-4 mr-2" />
              Analytics
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
              {/* Advanced Threat Intelligence Feed */}
              <div className="xl:col-span-2">
                <div className="cyber-card glassmorphism rounded-xl p-6">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-xl font-bold text-white flex items-center">
                      <AlertTriangle className="w-6 h-6 mr-3 text-red-400" />
                      Advanced Threat Intelligence
                    </h3>
                    <div className="flex items-center space-x-3">
                      <Badge className="bg-red-600/20 text-red-300 border-red-500/30 animate-pulse">
                        {threatIntelligence.filter(t => t.status === 'active').length} Active
                      </Badge>
                      <Badge className="bg-yellow-600/20 text-yellow-300 border-yellow-500/30">
                        {threatIntelligence.filter(t => t.status === 'investigating').length} Investigating
                      </Badge>
                      <Button size="sm" variant="outline" className="text-cyan-400 border-cyan-500/30 hover:bg-cyan-600/20">
                        <Eye className="w-4 h-4 mr-2" />
                        View All
                      </Button>
                    </div>
                  </div>
                  
                  <div className="space-y-4 max-h-96 overflow-y-auto">
                    {threatIntelligence.map((threat) => (
                      <div key={threat.id} className="p-5 bg-gray-800/40 rounded-xl hover:bg-gray-800/60 transition-all duration-300">
                        <div className="flex items-start justify-between mb-4">
                          <div className="flex items-center space-x-4">
                            <div className={`threat-indicator ${threat.severity} w-4 h-4 rounded-full`}></div>
                            <div>
                              <h4 className="text-white font-semibold text-lg">{threat.type}</h4>
                              <p className="text-gray-300 text-sm mt-1">{threat.description}</p>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className={getSeverityBadge(threat.severity)}>
                              {threat.severity}
                            </div>
                            <div className="text-xs text-gray-500 mt-2">
                              {new Date(threat.timestamp).toLocaleString()}
                            </div>
                          </div>
                        </div>
                        
                        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
                          <div>
                            <span className="text-gray-500 font-medium">Source:</span>
                            <p className="text-gray-300 mt-1 font-mono text-xs">{threat.source}</p>
                          </div>
                          <div>
                            <span className="text-gray-500 font-medium">Location:</span>
                            <p className="text-gray-300 mt-1">{threat.location}</p>
                          </div>
                          <div>
                            <span className="text-gray-500 font-medium">Attack Vector:</span>
                            <p className="text-gray-300 mt-1">{threat.attackVector}</p>
                          </div>
                          <div>
                            <span className="text-gray-500 font-medium">MITRE TTPs:</span>
                            <p className="text-gray-300 mt-1 font-mono text-xs">{threat.mitreTactic}</p>
                          </div>
                        </div>
                        
                        <div className="mt-4 p-3 bg-gray-900/40 rounded-lg">
                          <span className="text-gray-500 font-medium">Impact Assessment:</span>
                          <p className="text-gray-300 mt-1">{threat.impact}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Enhanced System Monitoring */}
              <div className="space-y-6">
                <div className="cyber-card glassmorphism rounded-xl p-6">
                  <h3 className="text-lg font-semibold text-white flex items-center mb-6">
                    <MonitorSpeaker className="w-5 h-5 mr-2 text-cyan-400" />
                    System Health Monitor
                  </h3>
                  
                  <div className="space-y-4">
                    {[
                      { name: 'Firewall Protection', value: 100, status: 'excellent', icon: ShieldCheck },
                      { name: 'Intrusion Detection', value: 98, status: 'excellent', icon: Eye },
                      { name: 'Endpoint Security', value: 94, status: 'good', icon: Smartphone },
                      { name: 'Network Monitoring', value: 97, status: 'excellent', icon: Network },
                      { name: 'Data Encryption', value: 100, status: 'excellent', icon: Lock },
                      { name: 'Backup Systems', value: 89, status: 'warning', icon: HardDrive },
                      { name: 'SIEM Analytics', value: 96, status: 'excellent', icon: BarChart3 },
                      { name: 'Threat Hunting', value: 92, status: 'good', icon: Search }
                    ].map((service, index) => {
                      const Icon = service.icon;
                      return (
                        <div key={index} className="space-y-3">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-3">
                              <Icon className="w-4 h-4 text-cyan-400" />
                              <span className="text-gray-300 text-sm font-medium">{service.name}</span>
                            </div>
                            <div className="flex items-center space-x-2">
                              <span className={`text-sm font-bold ${getStatusColor(service.status)}`}>
                                {service.value}%
                              </span>
                              <div className={`w-2 h-2 rounded-full ${
                                service.status === 'excellent' ? 'bg-green-400 animate-pulse' :
                                service.status === 'good' ? 'bg-cyan-400' :
                                'bg-yellow-400 animate-pulse'
                              }`}></div>
                            </div>
                          </div>
                          <div className="progress-bar">
                            <div 
                              className={`progress-fill ${
                                service.status === 'excellent' ? 'success' :
                                service.status === 'good' ? 'info' :
                                'warning'
                              }`}
                              style={{ width: `${service.value}%` }}
                            ></div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="assets" className="space-y-6">
            <div className="grid grid-cols-1 gap-6">
              <div className="cyber-card glassmorphism rounded-xl p-6">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl font-bold text-white flex items-center">
                    <Server className="w-6 h-6 mr-3 text-cyan-400" />
                    Enterprise Asset Inventory
                  </h3>
                  <div className="flex items-center space-x-3">
                    <Button size="sm" variant="outline" className="text-cyan-400 border-cyan-500/30">
                      <Search className="w-4 h-4 mr-2" />
                      Deep Scan
                    </Button>
                    <Button size="sm" variant="outline" className="text-green-400 border-green-500/30">
                      <Download className="w-4 h-4 mr-2" />
                      Export
                    </Button>
                  </div>
                </div>
                
                <div className="space-y-4">
                  {assetInventory.map((asset) => (
                    <div key={asset.id} className="p-5 bg-gray-800/40 rounded-xl hover:bg-gray-800/60 transition-all duration-300">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                          <div className={`p-3 rounded-lg ${
                            asset.type === 'server' ? 'bg-blue-500/20' :
                            asset.type === 'workstation' ? 'bg-purple-500/20' :
                            asset.type === 'mobile' ? 'bg-green-500/20' :
                            asset.type === 'iot' ? 'bg-orange-500/20' :
                            'bg-cyan-500/20'
                          }`}>
                            {asset.type === 'server' && <Server className="w-6 h-6 text-blue-400" />}
                            {asset.type === 'workstation' && <Cpu className="w-6 h-6 text-purple-400" />}
                            {asset.type === 'mobile' && <Smartphone className="w-6 h-6 text-green-400" />}
                            {asset.type === 'iot' && <Wifi className="w-6 h-6 text-orange-400" />}
                            {asset.type === 'network' && <Network className="w-6 h-6 text-cyan-400" />}
                          </div>
                          <div>
                            <h4 className="text-white font-semibold text-lg">{asset.name}</h4>
                            <div className="flex items-center space-x-4 mt-2 text-sm text-gray-400">
                              <span>OS: {asset.os}</span>
                              <span>•</span>
                              <span>IP: {asset.ipAddress}</span>
                              <span>•</span>
                              <span>Location: {asset.location}</span>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center space-x-6">
                          <div className="text-right">
                            <div className={getAssetStatusBadge(asset.status)}>
                              {asset.status}
                            </div>
                            <div className="text-xs text-gray-500 mt-2">
                              Scanned: {asset.lastScan}
                            </div>
                          </div>
                          <div className="text-right">
                            <div className={`text-lg font-bold ${
                              asset.riskScore < 30 ? 'text-green-400' :
                              asset.riskScore < 60 ? 'text-yellow-400' : 'text-red-400'
                            }`}>
                              {asset.riskScore}%
                            </div>
                            <div className="text-xs text-gray-500">Risk Score</div>
                          </div>
                          <div className="text-right">
                            <div className={`text-lg font-bold ${
                              asset.vulnerabilities === 0 ? 'text-green-400' :
                              asset.vulnerabilities < 3 ? 'text-yellow-400' : 'text-red-400'
                            }`}>
                              {asset.vulnerabilities}
                            </div>
                            <div className="text-xs text-gray-500">Vulnerabilities</div>
                          </div>
                          <div className="w-20 h-2 bg-gray-800 rounded-full">
                            <div 
                              className={`h-2 rounded-full transition-all duration-1000 ${
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
          </TabsContent>

          <TabsContent value="compliance" className="space-y-6">
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
              {[
                { name: 'POPIA', score: 94, status: 'compliant', requirements: 88, completed: 83, lastAudit: '2024-05-15', description: 'Protection of Personal Information Act compliance for South African data protection' },
                { name: 'ISO 27001', score: 91, status: 'compliant', requirements: 114, completed: 104, lastAudit: '2024-04-20', description: 'International standard for information security management systems' },
                { name: 'NIST Cybersecurity Framework', score: 89, status: 'compliant', requirements: 98, completed: 87, lastAudit: '2024-05-01', description: 'US National Institute of Standards and Technology cybersecurity framework' },
                { name: 'SOC 2 Type II', score: 96, status: 'compliant', requirements: 64, completed: 61, lastAudit: '2024-03-30', description: 'Service Organization Control 2 Type II compliance for security controls' }
              ].map((framework, index) => (
                <div key={index} className="cyber-card glassmorphism rounded-xl p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-xl font-bold text-white">{framework.name}</h3>
                    <Badge className={`${
                      framework.status === 'compliant' 
                        ? 'bg-green-600/20 text-green-300 border-green-500/30' 
                        : 'bg-yellow-600/20 text-yellow-300 border-yellow-500/30'
                    } px-3 py-1`}>
                      {framework.status.toUpperCase()}
                    </Badge>
                  </div>
                  
                  <p className="text-gray-400 text-sm mb-6">{framework.description}</p>
                  
                  <div className="space-y-6">
                    <div className="flex items-center justify-between">
                      <span className="text-gray-400 font-medium">Compliance Score</span>
                      <span className={`text-3xl font-black ${
                        framework.score >= 90 ? 'text-green-400' :
                        framework.score >= 70 ? 'text-yellow-400' : 'text-red-400'
                      }`}>
                        {framework.score}%
                      </span>
                    </div>
                    
                    <div className="progress-bar h-3">
                      <div 
                        className={`progress-fill h-3 ${
                          framework.score >= 90 ? 'success' :
                          framework.score >= 70 ? 'warning' : 'danger'
                        }`}
                        style={{ width: `${framework.score}%` }}
                      ></div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-6 text-sm">
                      <div>
                        <span className="text-gray-500 font-medium">Requirements Met</span>
                        <p className="text-white font-bold text-lg mt-1">
                          {framework.completed}/{framework.requirements}
                        </p>
                      </div>
                      <div>
                        <span className="text-gray-500 font-medium">Last Audit</span>
                        <p className="text-white font-bold text-lg mt-1">{framework.lastAudit}</p>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="analytics" className="space-y-6">
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
              <div className="cyber-card glassmorphism rounded-xl p-6">
                <h3 className="text-lg font-semibold text-white mb-6 flex items-center">
                  <TrendingUp className="w-5 h-5 mr-2 text-cyan-400" />
                  Security Trends Analysis
                </h3>
                <div className="h-80">
                  <Plot
                    data={[
                      {
                        x: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
                        y: [23, 45, 12, 67, 89, 34, 56],
                        type: 'scatter',
                        mode: 'lines+markers',
                        marker: { color: '#06b6d4', size: 8 },
                        line: { color: '#06b6d4', width: 3 },
                        name: 'Threats Detected'
                      },
                      {
                        x: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
                        y: [20, 42, 10, 65, 85, 30, 52],
                        type: 'scatter',
                        mode: 'lines+markers',
                        marker: { color: '#22c55e', size: 8 },
                        line: { color: '#22c55e', width: 3 },
                        name: 'Threats Mitigated'
                      }
                    ]}
                    layout={{
                      paper_bgcolor: 'transparent',
                      plot_bgcolor: 'transparent',
                      font: { color: '#ffffff', family: 'Inter' },
                      xaxis: { 
                        gridcolor: 'rgba(156, 163, 175, 0.1)',
                        tickfont: { color: '#9ca3af' }
                      },
                      yaxis: { 
                        gridcolor: 'rgba(156, 163, 175, 0.1)',
                        tickfont: { color: '#9ca3af' }
                      },
                      legend: { 
                        font: { color: '#ffffff' },
                        orientation: 'h',
                        y: -0.2
                      },
                      margin: { t: 20, r: 20, b: 60, l: 40 }
                    }}
                    config={{ displayModeBar: false }}
                    style={{ width: '100%', height: '100%' }}
                  />
                </div>
              </div>
              
              <div className="cyber-card glassmorphism rounded-xl p-6">
                <h3 className="text-lg font-semibold text-white mb-6 flex items-center">
                  <Target className="w-5 h-5 mr-2 text-cyan-400" />
                  Threat Vector Heatmap
                </h3>
                <div className="h-80">
                  <Plot
                    data={[
                      {
                        z: [[65, 20, 30, 50, 10], [20, 80, 60, 30, 40], [30, 60, 45, 70, 20], [15, 25, 35, 85, 55]],
                        x: ['Malware', 'Phishing', 'DDoS', 'Insider', 'APT'],
                        y: ['Network', 'Endpoint', 'Email', 'Cloud'],
                        type: 'heatmap',
                        colorscale: [
                          [0, 'rgb(0,0,0)'],
                          [0.25, 'rgb(59,130,246)'],
                          [0.5, 'rgb(6,182,212)'],
                          [0.75, 'rgb(249,115,22)'],
                          [1, 'rgb(239,68,68)']
                        ],
                        showscale: true,
                        colorbar: {
                          tickfont: { color: '#ffffff' }
                        }
                      }
                    ]}
                    layout={{
                      paper_bgcolor: 'transparent',
                      plot_bgcolor: 'transparent',
                      font: { color: '#ffffff', family: 'Inter' },
                      xaxis: { tickfont: { color: '#9ca3af' } },
                      yaxis: { tickfont: { color: '#9ca3af' } },
                      margin: { t: 20, r: 60, b: 60, l: 80 }
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