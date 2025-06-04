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
  Smartphone
} from "lucide-react";
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, ArcElement, RadialLinearScale } from 'chart.js';
import { Line, Doughnut, Radar } from 'react-chartjs-2';
import Plot from 'react-plotly.js';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, ArcElement, RadialLinearScale);

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

export default function EnhancedDashboard() {
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
      title: 'Overall Risk Score',
      value: dashboardData?.riskScore || 72,
      change: '-5% from last week',
      trend: 'down',
      severity: 'medium',
      icon: Shield
    },
    {
      id: 'active-threats',
      title: 'Active Threats',
      value: dashboardData?.activeThreats || 23,
      change: '+3 in last 24h',
      trend: 'up',
      severity: 'high',
      icon: AlertTriangle
    },
    {
      id: 'assets-monitored',
      title: 'Assets Monitored',
      value: dashboardData?.assetsMonitored || 1247,
      change: '+12 this month',
      trend: 'up',
      severity: 'info',
      icon: Activity
    },
    {
      id: 'compliance-score',
      title: 'Compliance Score',
      value: `${dashboardData?.complianceScore || 94}%`,
      change: '+2% this quarter',
      trend: 'up',
      severity: 'info',
      icon: TrendingUp
    }
  ];

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'text-red-400 bg-red-950/50 border-red-500/30';
      case 'high': return 'text-orange-400 bg-orange-950/50 border-orange-500/30';
      case 'medium': return 'text-yellow-400 bg-yellow-950/50 border-yellow-500/30';
      case 'low': return 'text-blue-400 bg-blue-950/50 border-blue-500/30';
      default: return 'text-gray-400 bg-gray-950/50 border-gray-500/30';
    }
  };

  const threatTrendData = {
    labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
    datasets: [
      {
        label: 'Critical Threats',
        data: dashboardData?.weeklyThreats?.critical || [2, 1, 3, 2, 4, 1, 2],
        borderColor: 'rgb(239, 68, 68)',
        backgroundColor: 'rgba(239, 68, 68, 0.1)',
        tension: 0.4,
        fill: true
      },
      {
        label: 'High Threats',
        data: dashboardData?.weeklyThreats?.high || [5, 7, 4, 8, 6, 9, 5],
        borderColor: 'rgb(245, 158, 11)',
        backgroundColor: 'rgba(245, 158, 11, 0.1)',
        tension: 0.4,
        fill: true
      }
    ]
  };

  const assetDistributionData = {
    labels: ['Web Applications', 'Databases', 'Network Devices', 'Endpoints', 'Cloud Services', 'Mobile Devices'],
    datasets: [
      {
        data: dashboardData?.assetDistribution || [324, 189, 156, 298, 87, 193],
        backgroundColor: [
          'rgba(239, 68, 68, 0.8)',
          'rgba(245, 158, 11, 0.8)',
          'rgba(34, 197, 94, 0.8)',
          'rgba(59, 130, 246, 0.8)',
          'rgba(168, 85, 247, 0.8)',
          'rgba(236, 72, 153, 0.8)'
        ],
        borderColor: [
          'rgb(239, 68, 68)',
          'rgb(245, 158, 11)',
          'rgb(34, 197, 94)',
          'rgb(59, 130, 246)',
          'rgb(168, 85, 247)',
          'rgb(236, 72, 153)'
        ],
        borderWidth: 2
      }
    ]
  };

  const systemHealthData = {
    labels: ['CPU', 'Memory', 'Storage', 'Network', 'Security', 'Database'],
    datasets: [
      {
        label: 'System Health',
        data: [
          dashboardData?.systemHealth?.cpu || 85,
          dashboardData?.systemHealth?.memory || 72,
          dashboardData?.systemHealth?.storage || 65,
          dashboardData?.systemHealth?.network || 91,
          dashboardData?.systemHealth?.security || 96,
          dashboardData?.systemHealth?.database || 88
        ],
        backgroundColor: 'rgba(34, 197, 94, 0.2)',
        borderColor: 'rgb(34, 197, 94)',
        pointBackgroundColor: 'rgb(34, 197, 94)',
        pointBorderColor: '#000',
        pointHoverBackgroundColor: '#000',
        pointHoverBorderColor: 'rgb(34, 197, 94)'
      }
    ]
  };

  const vulnerabilityHeatmapData = [{
    z: dashboardData?.vulnerabilityMatrix || [
      [12, 8, 15, 6, 9, 4],
      [8, 12, 6, 14, 7, 3],
      [15, 6, 18, 4, 11, 2],
      [6, 14, 4, 16, 3, 8],
      [9, 7, 11, 3, 13, 1]
    ],
    x: ['Web Apps', 'APIs', 'Databases', 'Networks', 'Systems', 'Mobile'],
    y: ['Critical', 'High', 'Medium', 'Low', 'Info'],
    type: 'heatmap',
    colorscale: [
      [0, 'rgb(34, 197, 94)'],
      [0.25, 'rgb(251, 191, 36)'],
      [0.5, 'rgb(245, 158, 11)'],
      [0.75, 'rgb(239, 68, 68)'],
      [1, 'rgb(185, 28, 28)']
    ],
    showscale: true,
    hoverongaps: false
  }];

  if (dashboardLoading || threatsLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 flex">
        <Sidebar />
        <div className="flex-1 flex items-center justify-center">
          <div className="flex items-center space-x-3 text-red-400">
            <RefreshCw className="w-6 h-6 animate-spin" />
            <span className="text-lg">Loading security dashboard...</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900">
      <Sidebar />
      
      <main className="ml-72 p-8">
        {/* Header Section */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-4xl font-bold text-white mb-2">Security Dashboard</h1>
              <p className="text-gray-400 text-lg">Real-time threat intelligence and security monitoring</p>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2 bg-gray-800/50 rounded-lg px-4 py-2 border border-gray-700">
                <Clock className="w-4 h-4 text-gray-400" />
                <select 
                  value={timeRange} 
                  onChange={(e) => setTimeRange(e.target.value)}
                  className="bg-transparent text-white text-sm focus:outline-none"
                >
                  <option value="1d">Last 24 Hours</option>
                  <option value="7d">Last 7 Days</option>
                  <option value="30d">Last 30 Days</option>
                  <option value="90d">Last 90 Days</option>
                </select>
              </div>
              
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => setAutoRefresh(!autoRefresh)}
                className={`border-gray-600 ${autoRefresh ? 'bg-red-600 text-white' : 'text-gray-300'}`}
              >
                <RefreshCw className={`w-4 h-4 mr-2 ${autoRefresh ? 'animate-spin' : ''}`} />
                Auto Refresh
              </Button>
              
              <Button variant="outline" size="sm" className="border-gray-600 text-gray-300">
                <Download className="w-4 h-4 mr-2" />
                Export
              </Button>
            </div>
          </div>

          {/* Key Metrics Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 mb-8">
            {keyMetrics.map((metric) => {
              const Icon = metric.icon;
              return (
                <Card key={metric.id} className="bg-gray-800/50 border-gray-700 backdrop-blur-sm hover:bg-gray-800/70 transition-all duration-300">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div className={`p-3 rounded-lg ${getSeverityColor(metric.severity)}`}>
                        <Icon className="w-6 h-6" />
                      </div>
                      <Badge variant="outline" className={getSeverityColor(metric.severity)}>
                        {metric.trend === 'up' ? '↗' : metric.trend === 'down' ? '↘' : '→'}
                      </Badge>
                    </div>
                    
                    <div className="space-y-2">
                      <h3 className="text-sm font-medium text-gray-400">{metric.title}</h3>
                      <div className="text-3xl font-bold text-white">{metric.value}</div>
                      <p className="text-xs text-gray-500">{metric.change}</p>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>

        {/* Main Dashboard Tabs */}
        <Tabs value={activeView} onValueChange={setActiveView} className="space-y-6">
          <TabsList className="bg-gray-800/50 border border-gray-700 p-1">
            <TabsTrigger value="overview" className="data-[state=active]:bg-red-600 data-[state=active]:text-white">
              <BarChart3 className="w-4 h-4 mr-2" />
              Overview
            </TabsTrigger>
            <TabsTrigger value="threats" className="data-[state=active]:bg-red-600 data-[state=active]:text-white">
              <AlertTriangle className="w-4 h-4 mr-2" />
              Threat Analysis
            </TabsTrigger>
            <TabsTrigger value="assets" className="data-[state=active]:bg-red-600 data-[state=active]:text-white">
              <Server className="w-4 h-4 mr-2" />
              Asset Health
            </TabsTrigger>
            <TabsTrigger value="compliance" className="data-[state=active]:bg-red-600 data-[state=active]:text-white">
              <FileText className="w-4 h-4 mr-2" />
              Compliance
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
              {/* Threat Trends Chart */}
              <Card className="bg-gray-800/50 border-gray-700 backdrop-blur-sm">
                <CardHeader className="pb-4">
                  <CardTitle className="text-white flex items-center">
                    <TrendingUp className="w-5 h-5 mr-2 text-red-400" />
                    Threat Trends
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-80">
                    <Line 
                      data={threatTrendData}
                      options={{
                        responsive: true,
                        maintainAspectRatio: false,
                        plugins: {
                          legend: {
                            labels: {
                              color: 'white'
                            }
                          }
                        },
                        scales: {
                          x: {
                            ticks: { color: 'rgb(156, 163, 175)' },
                            grid: { color: 'rgba(75, 85, 99, 0.3)' }
                          },
                          y: {
                            ticks: { color: 'rgb(156, 163, 175)' },
                            grid: { color: 'rgba(75, 85, 99, 0.3)' }
                          }
                        }
                      }}
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Asset Distribution */}
              <Card className="bg-gray-800/50 border-gray-700 backdrop-blur-sm">
                <CardHeader className="pb-4">
                  <CardTitle className="text-white flex items-center">
                    <Activity className="w-5 h-5 mr-2 text-red-400" />
                    Asset Distribution
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-80 flex items-center justify-center">
                    <Doughnut 
                      data={assetDistributionData}
                      options={{
                        responsive: true,
                        maintainAspectRatio: false,
                        plugins: {
                          legend: {
                            position: 'bottom',
                            labels: {
                              color: 'white',
                              padding: 20,
                              usePointStyle: true
                            }
                          }
                        }
                      }}
                    />
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Vulnerability Heatmap */}
            <Card className="bg-gray-800/50 border-gray-700 backdrop-blur-sm">
              <CardHeader className="pb-4">
                <CardTitle className="text-white flex items-center">
                  <Eye className="w-5 h-5 mr-2 text-red-400" />
                  Asset Vulnerability Matrix
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-96">
                  <Plot
                    data={vulnerabilityHeatmapData}
                    layout={{
                      title: {
                        text: '',
                        font: { color: 'white' }
                      },
                      xaxis: {
                        title: 'Asset Categories',
                        titlefont: { color: 'white' },
                        tickfont: { color: 'rgb(156, 163, 175)' }
                      },
                      yaxis: {
                        title: 'Severity Level',
                        titlefont: { color: 'white' },
                        tickfont: { color: 'rgb(156, 163, 175)' }
                      },
                      paper_bgcolor: 'transparent',
                      plot_bgcolor: 'transparent',
                      font: { color: 'white' }
                    }}
                    style={{ width: '100%', height: '100%' }}
                    config={{ displayModeBar: false }}
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="threats" className="space-y-6">
            <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
              {/* Recent Threats */}
              <div className="xl:col-span-2">
                <Card className="bg-gray-800/50 border-gray-700 backdrop-blur-sm">
                  <CardHeader className="pb-4">
                    <CardTitle className="text-white flex items-center">
                      <AlertTriangle className="w-5 h-5 mr-2 text-red-400" />
                      Recent Threat Events
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4 max-h-96 overflow-y-auto">
                      {(threatsData || []).slice(0, 10).map((threat: ThreatEvent) => (
                        <div key={threat.id} className="flex items-center justify-between p-4 bg-gray-900/50 rounded-lg border border-gray-700">
                          <div className="flex-1">
                            <div className="flex items-center space-x-3 mb-2">
                              <Badge className={getSeverityColor(threat.severity)}>
                                {threat.severity.toUpperCase()}
                              </Badge>
                              <span className="text-white font-medium">{threat.type}</span>
                            </div>
                            <p className="text-gray-400 text-sm mb-1">{threat.description}</p>
                            <p className="text-gray-500 text-xs">
                              Source: {threat.source} • {new Date(threat.timestamp).toLocaleString()}
                            </p>
                          </div>
                          <Badge variant="outline" className={
                            threat.status === 'active' ? 'text-red-400 border-red-400' :
                            threat.status === 'investigating' ? 'text-yellow-400 border-yellow-400' :
                            'text-green-400 border-green-400'
                          }>
                            {threat.status}
                          </Badge>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* System Health Radar */}
              <Card className="bg-gray-800/50 border-gray-700 backdrop-blur-sm">
                <CardHeader className="pb-4">
                  <CardTitle className="text-white flex items-center">
                    <Activity className="w-5 h-5 mr-2 text-red-400" />
                    System Health
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-80">
                    <Radar 
                      data={systemHealthData}
                      options={{
                        responsive: true,
                        maintainAspectRatio: false,
                        plugins: {
                          legend: {
                            display: false
                          }
                        },
                        scales: {
                          r: {
                            angleLines: {
                              color: 'rgba(75, 85, 99, 0.3)'
                            },
                            grid: {
                              color: 'rgba(75, 85, 99, 0.3)'
                            },
                            pointLabels: {
                              color: 'rgb(156, 163, 175)',
                              font: {
                                size: 11
                              }
                            },
                            ticks: {
                              color: 'rgb(156, 163, 175)',
                              backdropColor: 'transparent'
                            }
                          }
                        }
                      }}
                    />
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="assets" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
              {[
                { icon: Globe, title: 'Web Applications', count: 324, status: 'healthy' },
                { icon: Database, title: 'Databases', count: 189, status: 'warning' },
                { icon: Wifi, title: 'Network Devices', count: 156, status: 'healthy' },
                { icon: Smartphone, title: 'Mobile Devices', count: 193, status: 'critical' }
              ].map((asset, index) => {
                const Icon = asset.icon;
                return (
                  <Card key={index} className="bg-gray-800/50 border-gray-700 backdrop-blur-sm">
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between mb-4">
                        <Icon className="w-8 h-8 text-red-400" />
                        <Badge variant={asset.status === 'healthy' ? 'default' : asset.status === 'warning' ? 'secondary' : 'destructive'}>
                          {asset.status}
                        </Badge>
                      </div>
                      <h3 className="text-white font-medium mb-2">{asset.title}</h3>
                      <div className="text-2xl font-bold text-white">{asset.count}</div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </TabsContent>

          <TabsContent value="compliance" className="space-y-6">
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
              <Card className="bg-gray-800/50 border-gray-700 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="text-white">Compliance Framework Status</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {[
                    { framework: 'POPIA', score: 94, color: 'text-green-400' },
                    { framework: 'ISO 27001', score: 87, color: 'text-yellow-400' },
                    { framework: 'NIST', score: 92, color: 'text-green-400' },
                    { framework: 'SOC 2', score: 89, color: 'text-yellow-400' }
                  ].map((item, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <span className="text-white font-medium">{item.framework}</span>
                      <div className="flex items-center space-x-3">
                        <Progress value={item.score} className="w-32" />
                        <span className={`font-bold ${item.color}`}>{item.score}%</span>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>

              <Card className="bg-gray-800/50 border-gray-700 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="text-white">Recent Compliance Activities</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {[
                      'Annual POPIA compliance review completed',
                      'Security awareness training updated',
                      'Data retention policies reviewed',
                      'Incident response plan tested'
                    ].map((activity, index) => (
                      <div key={index} className="flex items-center space-x-3 p-3 bg-gray-900/50 rounded-lg">
                        <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                        <span className="text-gray-300">{activity}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}