import React, { useState, useRef, useEffect } from 'react';
import { useQuery } from "@tanstack/react-query";
import { getAuthToken } from "@/lib/auth";
import { Sidebar } from "@/components/layout/sidebar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
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
  Cpu
} from "lucide-react";

interface DashboardMetric {
  id: string;
  title: string;
  value: string | number;
  change: string;
  trend: 'up' | 'down' | 'stable';
  severity: 'critical' | 'high' | 'medium' | 'low' | 'info';
  icon: React.ElementType;
}

interface ThreatEvent {
  id: string;
  type: string;
  severity: 'critical' | 'high' | 'medium' | 'low';
  timestamp: string;
  description: string;
  source: string;
  status: 'active' | 'investigating' | 'resolved';
}

export default function ProfessionalDashboard() {
  const [activeView, setActiveView] = useState('overview');
  const [timeRange, setTimeRange] = useState('7d');
  const [autoRefresh, setAutoRefresh] = useState(true);

  const { data: dashboardData, isLoading: dashboardLoading } = useQuery({
    queryKey: ['/api/dashboard', timeRange],
    queryFn: () => fetch(`/api/dashboard?range=${timeRange}`, {
      headers: { Authorization: `Bearer ${getAuthToken()}` }
    }).then(res => res.json()),
    refetchInterval: autoRefresh ? 30000 : false
  });

  const { data: threatsData, isLoading: threatsLoading } = useQuery({
    queryKey: ['/api/threats/recent'],
    queryFn: () => fetch('/api/threats/recent', {
      headers: { Authorization: `Bearer ${getAuthToken()}` }
    }).then(res => res.json()),
    refetchInterval: autoRefresh ? 15000 : false
  });

  const keyMetrics: DashboardMetric[] = [
    {
      id: 'risk-score',
      title: 'Security Score',
      value: dashboardData?.riskScore || 92,
      change: '+5% this week',
      trend: 'up',
      severity: 'info',
      icon: Shield
    },
    {
      id: 'active-threats',
      title: 'Active Threats',
      value: dashboardData?.activeThreats || 7,
      change: '-3 today',
      trend: 'down',
      severity: 'medium',
      icon: AlertTriangle
    },
    {
      id: 'assets-monitored',
      title: 'Protected Assets',
      value: dashboardData?.assetsMonitored || 1247,
      change: '+12 this month',
      trend: 'up',
      severity: 'info',
      icon: Target
    },
    {
      id: 'compliance-score',
      title: 'Compliance',
      value: `${dashboardData?.complianceScore || 98}%`,
      change: '+2% this quarter',
      trend: 'up',
      severity: 'info',
      icon: CheckCircle2
    }
  ];

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'text-red-300 bg-red-500/10 border-red-500/20';
      case 'high': return 'text-orange-300 bg-orange-500/10 border-orange-500/20';
      case 'medium': return 'text-yellow-300 bg-yellow-500/10 border-yellow-500/20';
      case 'low': return 'text-blue-300 bg-blue-500/10 border-blue-500/20';
      default: return 'text-gray-300 bg-gray-500/10 border-gray-500/20';
    }
  };

  const getMetricColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'from-red-600/20 to-red-800/20 border-red-500/30';
      case 'high': return 'from-orange-600/20 to-orange-800/20 border-orange-500/30';
      case 'medium': return 'from-yellow-600/20 to-yellow-800/20 border-yellow-500/30';
      case 'low': return 'from-blue-600/20 to-blue-800/20 border-blue-500/30';
      default: return 'from-cyan-600/20 to-cyan-800/20 border-cyan-500/30';
    }
  };

  if (dashboardLoading || threatsLoading) {
    return (
      <div className="min-h-screen bg-black flex">
        <Sidebar />
        <div className="flex-1 flex items-center justify-center">
          <div className="flex items-center space-x-3 text-cyan-400">
            <RefreshCw className="w-6 h-6 animate-spin" />
            <span className="text-lg font-medium">Initializing Security Operations Center...</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black relative overflow-hidden">
      {/* Animated background grid */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(0,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(0,255,255,0.03)_1px,transparent_1px)] bg-[size:50px_50px] animate-pulse"></div>
      
      {/* Subtle gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-cyan-900/5 via-black to-red-900/5"></div>
      
      <Sidebar />
      
      <main className="ml-72 p-6 relative z-10">
        {/* Header Section */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-8">
            <div>
              <div className="flex items-center space-x-3 mb-3">
                <div className="w-3 h-3 bg-cyan-400 rounded-full animate-pulse"></div>
                <h1 className="text-3xl font-bold text-white">Security Operations Center</h1>
              </div>
              <p className="text-gray-400">Real-time threat detection and security monitoring</p>
            </div>
            
            <div className="flex items-center space-x-3">
              <div className="flex items-center space-x-2 bg-gray-900/60 backdrop-blur-xl rounded-lg px-4 py-2 border border-gray-700/50">
                <Clock className="w-4 h-4 text-cyan-400" />
                <select 
                  value={timeRange} 
                  onChange={(e) => setTimeRange(e.target.value)}
                  className="bg-transparent text-white text-sm focus:outline-none cursor-pointer"
                >
                  <option value="1d" className="bg-gray-900">Last 24 Hours</option>
                  <option value="7d" className="bg-gray-900">Last 7 Days</option>
                  <option value="30d" className="bg-gray-900">Last 30 Days</option>
                </select>
              </div>
              
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => setAutoRefresh(!autoRefresh)}
                className={`border-gray-700/50 backdrop-blur-xl ${autoRefresh ? 'bg-cyan-600/20 text-cyan-300 border-cyan-500/30' : 'text-gray-300 hover:bg-gray-800/50'}`}
              >
                <RefreshCw className={`w-4 h-4 mr-2 ${autoRefresh ? 'animate-spin' : ''}`} />
                Live
              </Button>
            </div>
          </div>

          {/* Key Metrics Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 mb-8">
            {keyMetrics.map((metric) => {
              const Icon = metric.icon;
              return (
                <div key={metric.id} className={`bg-gradient-to-br ${getMetricColor(metric.severity)} backdrop-blur-xl border rounded-xl p-6 hover:scale-[1.02] transition-all duration-300 group`}>
                  <div className="flex items-center justify-between mb-4">
                    <div className="p-3 bg-gray-900/40 rounded-lg border border-gray-700/50">
                      <Icon className="w-6 h-6 text-cyan-400 group-hover:scale-110 transition-transform duration-300" />
                    </div>
                    <div className="flex items-center space-x-1">
                      <div className={`w-2 h-2 rounded-full ${
                        metric.trend === 'up' ? 'bg-green-400' : 
                        metric.trend === 'down' ? 'bg-red-400' : 'bg-gray-400'
                      } animate-pulse`}></div>
                      <span className={`text-xs font-medium ${
                        metric.trend === 'up' ? 'text-green-400' : 
                        metric.trend === 'down' ? 'text-red-400' : 'text-gray-400'
                      }`}>
                        {metric.trend === 'up' ? '↗' : metric.trend === 'down' ? '↘' : '→'}
                      </span>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <h3 className="text-sm font-medium text-gray-400">{metric.title}</h3>
                    <div className="text-2xl font-bold text-white">{metric.value}</div>
                    <p className="text-xs text-gray-500">{metric.change}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Main Dashboard Content */}
        <Tabs value={activeView} onValueChange={setActiveView} className="space-y-6">
          <TabsList className="bg-gray-900/60 backdrop-blur-xl border border-gray-700/50 p-1">
            <TabsTrigger value="overview" className="data-[state=active]:bg-cyan-600/30 data-[state=active]:text-cyan-300 data-[state=active]:border-cyan-500/30">
              <BarChart3 className="w-4 h-4 mr-2" />
              Overview
            </TabsTrigger>
            <TabsTrigger value="threats" className="data-[state=active]:bg-cyan-600/30 data-[state=active]:text-cyan-300 data-[state=active]:border-cyan-500/30">
              <AlertTriangle className="w-4 h-4 mr-2" />
              Threats
            </TabsTrigger>
            <TabsTrigger value="assets" className="data-[state=active]:bg-cyan-600/30 data-[state=active]:text-cyan-300 data-[state=active]:border-cyan-500/30">
              <Server className="w-4 h-4 mr-2" />
              Assets
            </TabsTrigger>
            <TabsTrigger value="compliance" className="data-[state=active]:bg-cyan-600/30 data-[state=active]:text-cyan-300 data-[state=active]:border-cyan-500/30">
              <FileText className="w-4 h-4 mr-2" />
              Compliance
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
              {/* Threat Timeline */}
              <div className="xl:col-span-2">
                <div className="bg-gray-900/40 backdrop-blur-xl border border-gray-700/50 rounded-xl p-6">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-lg font-semibold text-white flex items-center">
                      <Activity className="w-5 h-5 mr-2 text-cyan-400" />
                      Security Events Timeline
                    </h3>
                    <Badge className="bg-cyan-600/20 text-cyan-300 border-cyan-500/30">
                      Live Feed
                    </Badge>
                  </div>
                  
                  <div className="space-y-4 max-h-80 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-700 scrollbar-track-transparent">
                    {(threatsData || [
                      { id: '1', type: 'Intrusion Attempt', severity: 'high', timestamp: new Date().toISOString(), description: 'Suspicious login attempt from unknown IP', source: '192.168.1.100', status: 'investigating' },
                      { id: '2', type: 'Malware Detection', severity: 'critical', timestamp: new Date().toISOString(), description: 'Potential ransomware detected on endpoint', source: 'LAPTOP-001', status: 'active' },
                      { id: '3', type: 'Data Exfiltration', severity: 'medium', timestamp: new Date().toISOString(), description: 'Unusual outbound data transfer', source: 'SERVER-DB01', status: 'resolved' },
                      { id: '4', type: 'Vulnerability Scan', severity: 'low', timestamp: new Date().toISOString(), description: 'Automated security scan completed', source: 'Security Scanner', status: 'resolved' }
                    ]).slice(0, 10).map((threat: ThreatEvent) => (
                      <div key={threat.id} className="flex items-start space-x-4 p-4 bg-gray-800/30 rounded-lg border border-gray-700/30 hover:bg-gray-800/50 transition-colors duration-200">
                        <div className={`w-3 h-3 rounded-full mt-2 ${
                          threat.severity === 'critical' ? 'bg-red-500 animate-pulse' :
                          threat.severity === 'high' ? 'bg-orange-500' :
                          threat.severity === 'medium' ? 'bg-yellow-500' :
                          'bg-blue-500'
                        }`}></div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between mb-2">
                            <h4 className="text-white font-medium">{threat.type}</h4>
                            <div className="flex items-center space-x-2">
                              <Badge className={getSeverityColor(threat.severity)}>
                                {threat.severity}
                              </Badge>
                              <span className="text-xs text-gray-500">
                                {new Date(threat.timestamp).toLocaleTimeString()}
                              </span>
                            </div>
                          </div>
                          <p className="text-gray-400 text-sm mb-1">{threat.description}</p>
                          <p className="text-gray-500 text-xs">Source: {threat.source}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* System Status */}
              <div className="space-y-6">
                <div className="bg-gray-900/40 backdrop-blur-xl border border-gray-700/50 rounded-xl p-6">
                  <h3 className="text-lg font-semibold text-white flex items-center mb-6">
                    <Cpu className="w-5 h-5 mr-2 text-cyan-400" />
                    System Health
                  </h3>
                  
                  <div className="space-y-4">
                    {[
                      { name: 'Security Services', value: 98, status: 'optimal' },
                      { name: 'Network Security', value: 94, status: 'good' },
                      { name: 'Endpoint Protection', value: 89, status: 'warning' },
                      { name: 'Data Protection', value: 96, status: 'optimal' }
                    ].map((service, index) => (
                      <div key={index} className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-gray-300 text-sm">{service.name}</span>
                          <div className="flex items-center space-x-2">
                            <span className="text-white font-medium">{service.value}%</span>
                            <div className={`w-2 h-2 rounded-full ${
                              service.status === 'optimal' ? 'bg-green-400' :
                              service.status === 'good' ? 'bg-cyan-400' :
                              'bg-yellow-400'
                            } animate-pulse`}></div>
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
                    ))}
                  </div>
                </div>

                {/* Quick Actions */}
                <div className="bg-gray-900/40 backdrop-blur-xl border border-gray-700/50 rounded-xl p-6">
                  <h3 className="text-lg font-semibold text-white flex items-center mb-6">
                    <Zap className="w-5 h-5 mr-2 text-cyan-400" />
                    Quick Actions
                  </h3>
                  
                  <div className="space-y-3">
                    {[
                      { icon: Shield, label: 'Run Security Scan', color: 'text-cyan-400' },
                      { icon: Download, label: 'Export Report', color: 'text-blue-400' },
                      { icon: Settings, label: 'Update Policies', color: 'text-purple-400' },
                      { icon: RefreshCw, label: 'Sync Threat Intel', color: 'text-green-400' }
                    ].map((action, index) => {
                      const Icon = action.icon;
                      return (
                        <Button
                          key={index}
                          variant="ghost"
                          className="w-full justify-start text-gray-300 hover:bg-gray-800/50 hover:text-white transition-all duration-200"
                        >
                          <Icon className={`w-4 h-4 mr-3 ${action.color}`} />
                          {action.label}
                        </Button>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="threats" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
              {[
                { title: 'Critical Threats', count: 2, icon: XCircle, color: 'text-red-400 bg-red-500/10' },
                { title: 'Active Investigations', count: 5, icon: AlertCircle, color: 'text-yellow-400 bg-yellow-500/10' },
                { title: 'Resolved Today', count: 12, icon: CheckCircle2, color: 'text-green-400 bg-green-500/10' }
              ].map((stat, index) => {
                const Icon = stat.icon;
                return (
                  <div key={index} className="bg-gray-900/40 backdrop-blur-xl border border-gray-700/50 rounded-xl p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-gray-400 text-sm">{stat.title}</p>
                        <p className="text-2xl font-bold text-white mt-1">{stat.count}</p>
                      </div>
                      <div className={`p-3 rounded-lg ${stat.color}`}>
                        <Icon className="w-6 h-6" />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </TabsContent>

          <TabsContent value="assets" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
              {[
                { icon: Globe, title: 'Web Applications', count: 324, status: 'secured', change: '+12' },
                { icon: Database, title: 'Databases', count: 189, status: 'monitoring', change: '+3' },
                { icon: Wifi, title: 'Network Devices', count: 156, status: 'secured', change: '+8' },
                { icon: Smartphone, title: 'Endpoints', count: 847, status: 'protected', change: '+45' }
              ].map((asset, index) => {
                const Icon = asset.icon;
                return (
                  <div key={index} className="bg-gray-900/40 backdrop-blur-xl border border-gray-700/50 rounded-xl p-6 hover:scale-[1.02] transition-all duration-300">
                    <div className="flex items-center justify-between mb-4">
                      <Icon className="w-8 h-8 text-cyan-400" />
                      <Badge className="bg-green-600/20 text-green-300 border-green-500/30">
                        {asset.status}
                      </Badge>
                    </div>
                    <h3 className="text-white font-medium mb-2">{asset.title}</h3>
                    <div className="flex items-center justify-between">
                      <div className="text-2xl font-bold text-white">{asset.count}</div>
                      <span className="text-green-400 text-sm font-medium">{asset.change}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </TabsContent>

          <TabsContent value="compliance" className="space-y-6">
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
              <div className="bg-gray-900/40 backdrop-blur-xl border border-gray-700/50 rounded-xl p-6">
                <h3 className="text-lg font-semibold text-white mb-6">Compliance Frameworks</h3>
                <div className="space-y-4">
                  {[
                    { framework: 'POPIA', score: 98, color: 'text-green-400' },
                    { framework: 'ISO 27001', score: 94, color: 'text-cyan-400' },
                    { framework: 'NIST', score: 96, color: 'text-green-400' },
                    { framework: 'SOC 2', score: 92, color: 'text-cyan-400' }
                  ].map((item, index) => (
                    <div key={index} className="flex items-center justify-between p-4 bg-gray-800/30 rounded-lg">
                      <span className="text-white font-medium">{item.framework}</span>
                      <div className="flex items-center space-x-3">
                        <div className="w-32 bg-gray-700 rounded-full h-2">
                          <div 
                            className="bg-gradient-to-r from-cyan-600 to-cyan-400 h-2 rounded-full transition-all duration-1000"
                            style={{ width: `${item.score}%` }}
                          ></div>
                        </div>
                        <span className={`font-bold ${item.color}`}>{item.score}%</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}