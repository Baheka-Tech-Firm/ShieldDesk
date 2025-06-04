import React, { useState, useRef, useEffect } from 'react';
import { useQuery } from "@tanstack/react-query";
import { getAuthToken } from "@/lib/auth";
import { Sidebar } from "@/components/layout/sidebar";
import { ThreeBackground } from "@/components/ui/three-background";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Responsive, WidthProvider } from 'react-grid-layout';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement, PointElement, LineElement, RadialLinearScale } from 'chart.js';
import { Bar, Doughnut, Line, Radar, PolarArea, Pie } from 'react-chartjs-2';
import Plot from 'react-plotly.js';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import { useAuth } from "@/hooks/use-auth";
import { gsap } from "gsap";
import {
  Bell, Shield, Users, AlertTriangle, Activity, Zap, Database, Lock,
  TrendingUp, TrendingDown, Eye, Settings, Download, RefreshCw,
  Grid3X3, Move, Maximize2, BarChart3, PieChart, LineChart,
  Gauge, Map, Target, Clock, Bug, CheckCircle, Server, Network,
  FileText, Cpu, HardDrive, Wifi, Globe, Search, Filter
} from "lucide-react";

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  PointElement,
  LineElement,
  RadialLinearScale
);

const ResponsiveGridLayout = WidthProvider(Responsive);

interface DashboardWidget {
  id: string;
  type: 'metric' | 'chart' | 'heatmap' | 'timeline' | 'activity' | 'alerts';
  title: string;
  data: any;
}

interface SecurityMetric {
  id: string;
  name: string;
  value: number;
  target: number;
  trend: 'up' | 'down' | 'stable';
  severity: 'critical' | 'high' | 'medium' | 'low' | 'info';
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

export default function Dashboard() {
  const { user } = useAuth();
  const dashboardRef = useRef<HTMLDivElement>(null);
  const [dashboardMode, setDashboardMode] = useState('overview');
  const [layouts, setLayouts] = useState({});
  const [isCustomizing, setIsCustomizing] = useState(false);

  const { data: dashboardData, isLoading } = useQuery({
    queryKey: ['/api/dashboard'],
    queryFn: async () => {
      const token = getAuthToken();
      const response = await fetch('/api/dashboard', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      if (!response.ok) throw new Error('Failed to fetch dashboard data');
      return response.json();
    },
    enabled: !!user,
  });

  // Real-time security metrics from API data
  const securityMetrics: SecurityMetric[] = [
    {
      id: 'overall-score',
      name: 'Overall Security Score',
      value: dashboardData?.securityScore || 85,
      target: 90,
      trend: 'up',
      severity: 'medium'
    },
    {
      id: 'vulnerabilities',
      name: 'Active Vulnerabilities',
      value: dashboardData?.vulnerabilities || 12,
      target: 5,
      trend: 'down',
      severity: 'high'
    },
    {
      id: 'compliance',
      name: 'Compliance Status',
      value: dashboardData?.complianceScore || 78,
      target: 95,
      trend: 'up',
      severity: 'medium'
    },
    {
      id: 'threats',
      name: 'Threat Level',
      value: dashboardData?.threatLevel || 3,
      target: 1,
      trend: 'stable',
      severity: 'critical'
    }
  ];

  // Threat activity timeline from API data
  const threatEvents: ThreatEvent[] = dashboardData?.recentThreats || [
    {
      id: '1',
      type: 'Malware Detection',
      severity: 'high',
      timestamp: '2025-06-04T08:45:00Z',
      description: 'Suspicious file detected in uploads directory',
      source: 'File Scanner',
      status: 'investigating'
    },
    {
      id: '2',
      type: 'Failed Login Attempts',
      severity: 'medium',
      timestamp: '2025-06-04T08:30:00Z',
      description: 'Multiple failed login attempts from IP 192.168.1.100',
      source: 'Auth Monitor',
      status: 'active'
    },
    {
      id: '3',
      type: 'Data Breach Attempt',
      severity: 'critical',
      timestamp: '2025-06-04T07:15:00Z',
      description: 'Unauthorized database access attempt blocked',
      source: 'Database Monitor',
      status: 'resolved'
    }
  ];

  // Chart configurations using real data
  const securityScoreData = {
    labels: ['Security Score', 'Compliance', 'Vulnerabilities', 'Threats'],
    datasets: [
      {
        data: [
          dashboardData?.securityScore || 85,
          dashboardData?.complianceScore || 78,
          100 - (dashboardData?.vulnerabilities || 12) * 5, // Inverted for visualization
          100 - (dashboardData?.threatLevel || 3) * 20 // Inverted for visualization
        ],
        backgroundColor: [
          'rgba(34, 197, 94, 0.8)',
          'rgba(251, 191, 36, 0.8)',
          'rgba(245, 158, 11, 0.8)',
          'rgba(239, 68, 68, 0.8)'
        ],
        borderColor: [
          'rgb(34, 197, 94)',
          'rgb(251, 191, 36)',
          'rgb(245, 158, 11)',
          'rgb(239, 68, 68)'
        ],
        borderWidth: 2
      }
    ]
  };

  const threatTrendData = {
    labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
    datasets: [
      {
        label: 'Critical Threats',
        data: dashboardData?.weeklyThreats?.critical || [2, 1, 3, 0, 1, 0, 1],
        borderColor: 'rgb(239, 68, 68)',
        backgroundColor: 'rgba(239, 68, 68, 0.2)',
        tension: 0.4
      },
      {
        label: 'High Threats',
        data: dashboardData?.weeklyThreats?.high || [5, 3, 7, 2, 4, 1, 3],
        borderColor: 'rgb(245, 158, 11)',
        backgroundColor: 'rgba(245, 158, 11, 0.2)',
        tension: 0.4
      },
      {
        label: 'Medium Threats',
        data: dashboardData?.weeklyThreats?.medium || [8, 6, 10, 5, 7, 3, 6],
        borderColor: 'rgb(251, 191, 36)',
        backgroundColor: 'rgba(251, 191, 36, 0.2)',
        tension: 0.4
      }
    ]
  };

  const systemHealthData = {
    labels: ['CPU Usage', 'Memory', 'Disk Space', 'Network', 'Security Services', 'Database'],
    datasets: [
      {
        label: 'System Health',
        data: [
          dashboardData?.systemHealth?.cpu || 65,
          dashboardData?.systemHealth?.memory || 72,
          dashboardData?.systemHealth?.disk || 55,
          dashboardData?.systemHealth?.network || 88,
          dashboardData?.systemHealth?.security || 95,
          dashboardData?.systemHealth?.database || 82
        ],
        backgroundColor: 'rgba(34, 197, 94, 0.2)',
        borderColor: 'rgba(34, 197, 94, 1)',
        pointBackgroundColor: 'rgba(34, 197, 94, 1)',
        pointBorderColor: '#fff',
        pointHoverBackgroundColor: '#fff',
        pointHoverBorderColor: 'rgba(34, 197, 94, 1)'
      }
    ]
  };

  // Asset vulnerability heatmap using real data
  const vulnerabilityHeatmapData = [{
    z: dashboardData?.vulnerabilityMatrix || [
      [9, 8, 7, 6, 5, 4],
      [8, 7, 6, 5, 4, 3],
      [7, 6, 5, 4, 3, 2],
      [6, 5, 4, 3, 2, 1],
      [5, 4, 3, 2, 1, 0]
    ],
    x: ['Web Apps', 'APIs', 'Databases', 'Networks', 'Systems', 'Mobile'],
    y: ['Critical', 'High', 'Medium', 'Low', 'Info'],
    type: 'heatmap',
    colorscale: [
      [0, 'rgb(34, 197, 94)'],
      [0.2, 'rgb(251, 191, 36)'],
      [0.4, 'rgb(245, 158, 11)'],
      [0.6, 'rgb(239, 68, 68)'],
      [0.8, 'rgb(185, 28, 28)'],
      [1, 'rgb(127, 29, 29)']
    ]
  }];

  // Compliance progress data
  const complianceData = {
    labels: ['POPIA', 'ISO 27001', 'GDPR', 'SOC 2', 'PCI DSS'],
    datasets: [
      {
        data: dashboardData?.complianceBreakdown || [78, 85, 72, 90, 68],
        backgroundColor: [
          'rgba(239, 68, 68, 0.8)',
          'rgba(245, 158, 11, 0.8)',
          'rgba(251, 191, 36, 0.8)',
          'rgba(34, 197, 94, 0.8)',
          'rgba(239, 68, 68, 0.8)'
        ],
        borderColor: [
          'rgb(239, 68, 68)',
          'rgb(245, 158, 11)',
          'rgb(251, 191, 36)',
          'rgb(34, 197, 94)',
          'rgb(239, 68, 68)'
        ],
        borderWidth: 2
      }
    ]
  };

  // Real-time metrics timeline
  const metricsTimelineData = [{
    x: dashboardData?.metricsTimeline?.timestamps || ['09:00', '10:00', '11:00', '12:00', '13:00', '14:00'],
    y: dashboardData?.metricsTimeline?.securityScore || [82, 85, 84, 87, 85, 88],
    mode: 'lines+markers',
    type: 'scatter',
    name: 'Security Score',
    line: { color: 'rgb(34, 197, 94)' },
    marker: { size: 8, color: 'rgb(34, 197, 94)' }
  }, {
    x: dashboardData?.metricsTimeline?.timestamps || ['09:00', '10:00', '11:00', '12:00', '13:00', '14:00'],
    y: dashboardData?.metricsTimeline?.threats || [15, 12, 18, 8, 14, 10],
    mode: 'lines+markers',
    type: 'scatter',
    name: 'Active Threats',
    yaxis: 'y2',
    line: { color: 'rgb(239, 68, 68)' },
    marker: { size: 8, color: 'rgb(239, 68, 68)' }
  }];

  const defaultLayout = [
    { i: 'overview-metrics', x: 0, y: 0, w: 12, h: 2 },
    { i: 'security-score', x: 0, y: 2, w: 4, h: 4 },
    { i: 'threat-trends', x: 4, y: 2, w: 8, h: 4 },
    { i: 'vulnerability-heatmap', x: 0, y: 6, w: 6, h: 4 },
    { i: 'system-health', x: 6, y: 6, w: 6, h: 4 },
    { i: 'compliance-status', x: 0, y: 10, w: 4, h: 4 },
    { i: 'recent-threats', x: 4, y: 10, w: 8, h: 4 },
    { i: 'metrics-timeline', x: 0, y: 14, w: 12, h: 4 }
  ];

  const onLayoutChange = (layout: any, layouts: any) => {
    setLayouts(layouts);
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'text-red-500 bg-red-500/10 border-red-500/30';
      case 'high': return 'text-orange-500 bg-orange-500/10 border-orange-500/30';
      case 'medium': return 'text-yellow-500 bg-yellow-500/10 border-yellow-500/30';
      case 'low': return 'text-green-500 bg-green-500/10 border-green-500/30';
      default: return 'text-gray-500 bg-gray-500/10 border-gray-500/30';
    }
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'up': return <TrendingUp className="w-4 h-4 text-green-500" />;
      case 'down': return <TrendingDown className="w-4 h-4 text-red-500" />;
      default: return <Activity className="w-4 h-4 text-gray-500" />;
    }
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        labels: {
          color: '#ffffff'
        }
      }
    },
    scales: {
      x: {
        ticks: { color: '#ffffff' },
        grid: { color: 'rgba(255, 255, 255, 0.1)' }
      },
      y: {
        ticks: { color: '#ffffff' },
        grid: { color: 'rgba(255, 255, 255, 0.1)' }
      }
    }
  };

  const radarOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        labels: { color: '#ffffff' }
      }
    },
    scales: {
      r: {
        angleLines: { color: 'rgba(255, 255, 255, 0.1)' },
        grid: { color: 'rgba(255, 255, 255, 0.1)' },
        pointLabels: { color: '#ffffff' },
        ticks: { color: '#ffffff', backdropColor: 'rgba(0, 0, 0, 0.5)' }
      }
    }
  };

  useEffect(() => {
    if (!dashboardRef.current || isLoading) return;

    gsap.fromTo(dashboardRef.current, 
      { opacity: 0, scale: 0.95 },
      { opacity: 1, scale: 1, duration: 1, ease: "power3.out" }
    );
  }, [isLoading]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-black flex items-center justify-center">
        <div className="text-white text-xl">Loading Security Dashboard...</div>
      </div>
    );
  }

  if (dashboardMode === 'interactive') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-black">
        <ThreeBackground />
        <div className="flex h-screen relative z-10">
          <Sidebar />
          <main className="flex-1 overflow-auto">
            <div className="p-6" ref={dashboardRef}>
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h1 className="text-4xl font-bold text-white mb-2">Interactive Security Dashboard</h1>
                  <p className="text-white/60">Drag and drop widgets to customize your security monitoring experience</p>
                </div>
                <div className="flex space-x-4">
                  <Button 
                    onClick={() => setDashboardMode('overview')}
                    variant="outline"
                    className="border-red-500/30 text-white hover:bg-red-500/10"
                  >
                    <Eye className="w-4 h-4 mr-2" />
                    Standard View
                  </Button>
                  <Button 
                    onClick={() => setIsCustomizing(!isCustomizing)}
                    className="bg-red-600 hover:bg-red-700 text-white"
                  >
                    <Settings className="w-4 h-4 mr-2" />
                    {isCustomizing ? 'Lock Layout' : 'Customize'}
                  </Button>
                </div>
              </div>

              <ResponsiveGridLayout
                className="layout"
                layouts={layouts}
                onLayoutChange={onLayoutChange}
                breakpoints={{ lg: 1200, md: 996, sm: 768, xs: 480, xxs: 0 }}
                cols={{ lg: 12, md: 10, sm: 6, xs: 4, xxs: 2 }}
                rowHeight={60}
                isDraggable={isCustomizing}
                isResizable={isCustomizing}
                margin={[16, 16]}
              >
                {/* Overview Metrics */}
                <div key="overview-metrics">
                  <Card className="bg-black/20 border-red-500/30 h-full">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-white flex items-center gap-2">
                        <Gauge className="w-5 h-5 text-red-400" />
                        Security Overview
                        {isCustomizing && <Move className="w-4 h-4 ml-auto opacity-50" />}
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-4 gap-4">
                        {securityMetrics.map((metric) => (
                          <div key={metric.id} className="text-center">
                            <div className="flex items-center justify-center gap-2 mb-1">
                              <p className={`text-2xl font-bold ${getSeverityColor(metric.severity).split(' ')[0]}`}>
                                {metric.value}
                              </p>
                              {getTrendIcon(metric.trend)}
                            </div>
                            <p className="text-xs text-white/60">{metric.name}</p>
                            <div className="w-full bg-gray-700 rounded-full h-1 mt-1">
                              <div 
                                className={`h-1 rounded-full ${metric.value >= metric.target ? 'bg-green-500' : 'bg-red-500'}`}
                                style={{ width: `${Math.min((metric.value / metric.target) * 100, 100)}%` }}
                              />
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Security Score Chart */}
                <div key="security-score">
                  <Card className="bg-black/20 border-red-500/30 h-full">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-white flex items-center gap-2">
                        <PieChart className="w-5 h-5 text-red-400" />
                        Security Metrics
                        {isCustomizing && <Move className="w-4 h-4 ml-auto opacity-50" />}
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="h-full">
                      <div className="h-48">
                        <Doughnut data={securityScoreData} options={chartOptions} />
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Threat Trends */}
                <div key="threat-trends">
                  <Card className="bg-black/20 border-red-500/30 h-full">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-white flex items-center gap-2">
                        <LineChart className="w-5 h-5 text-red-400" />
                        Weekly Threat Trends
                        {isCustomizing && <Move className="w-4 h-4 ml-auto opacity-50" />}
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="h-full">
                      <div className="h-48">
                        <Line data={threatTrendData} options={chartOptions} />
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Vulnerability Heatmap */}
                <div key="vulnerability-heatmap">
                  <Card className="bg-black/20 border-red-500/30 h-full">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-white flex items-center gap-2">
                        <Map className="w-5 h-5 text-red-400" />
                        Vulnerability Heatmap
                        {isCustomizing && <Move className="w-4 h-4 ml-auto opacity-50" />}
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="h-full">
                      <div className="h-48">
                        <Plot
                          data={vulnerabilityHeatmapData}
                          layout={{
                            autosize: true,
                            margin: { l: 50, r: 10, b: 50, t: 10 },
                            paper_bgcolor: 'transparent',
                            plot_bgcolor: 'transparent',
                            font: { color: '#ffffff' },
                            xaxis: { color: '#ffffff' },
                            yaxis: { color: '#ffffff' }
                          }}
                          config={{ displayModeBar: false }}
                          style={{ width: '100%', height: '100%' }}
                        />
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* System Health Radar */}
                <div key="system-health">
                  <Card className="bg-black/20 border-red-500/30 h-full">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-white flex items-center gap-2">
                        <Target className="w-5 h-5 text-red-400" />
                        System Health
                        {isCustomizing && <Move className="w-4 h-4 ml-auto opacity-50" />}
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="h-full">
                      <div className="h-48">
                        <Radar data={systemHealthData} options={radarOptions} />
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Compliance Status */}
                <div key="compliance-status">
                  <Card className="bg-black/20 border-red-500/30 h-full">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-white flex items-center gap-2">
                        <Shield className="w-5 h-5 text-red-400" />
                        Compliance Status
                        {isCustomizing && <Move className="w-4 h-4 ml-auto opacity-50" />}
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="h-full">
                      <div className="h-48">
                        <Bar data={complianceData} options={chartOptions} />
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Recent Threats */}
                <div key="recent-threats">
                  <Card className="bg-black/20 border-red-500/30 h-full">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-white flex items-center gap-2">
                        <AlertTriangle className="w-5 h-5 text-red-400" />
                        Recent Threats
                        {isCustomizing && <Move className="w-4 h-4 ml-auto opacity-50" />}
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3 overflow-auto">
                      {threatEvents.map((event) => (
                        <div key={event.id} className="flex items-center justify-between p-3 bg-black/20 rounded-lg">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <Badge className={getSeverityColor(event.severity)}>
                                {event.severity}
                              </Badge>
                              <span className="text-sm font-medium text-white">{event.type}</span>
                            </div>
                            <p className="text-xs text-white/60">{event.description}</p>
                            <p className="text-xs text-white/40">{new Date(event.timestamp).toLocaleString()}</p>
                          </div>
                          <Badge className={
                            event.status === 'resolved' ? 'bg-green-500/20 text-green-300' :
                            event.status === 'investigating' ? 'bg-yellow-500/20 text-yellow-300' :
                            'bg-red-500/20 text-red-300'
                          }>
                            {event.status}
                          </Badge>
                        </div>
                      ))}
                    </CardContent>
                  </Card>
                </div>

                {/* Metrics Timeline */}
                <div key="metrics-timeline">
                  <Card className="bg-black/20 border-red-500/30 h-full">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-white flex items-center gap-2">
                        <Clock className="w-5 h-5 text-red-400" />
                        Real-time Metrics
                        {isCustomizing && <Move className="w-4 h-4 ml-auto opacity-50" />}
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="h-full">
                      <div className="h-48">
                        <Plot
                          data={metricsTimelineData}
                          layout={{
                            autosize: true,
                            margin: { l: 50, r: 50, b: 50, t: 10 },
                            paper_bgcolor: 'transparent',
                            plot_bgcolor: 'transparent',
                            font: { color: '#ffffff' },
                            xaxis: { 
                              title: 'Time',
                              color: '#ffffff',
                              gridcolor: 'rgba(255, 255, 255, 0.1)'
                            },
                            yaxis: { 
                              title: 'Security Score',
                              color: '#ffffff',
                              gridcolor: 'rgba(255, 255, 255, 0.1)'
                            },
                            yaxis2: {
                              title: 'Active Threats',
                              overlaying: 'y',
                              side: 'right',
                              color: '#ffffff'
                            }
                          }}
                          config={{ displayModeBar: false }}
                          style={{ width: '100%', height: '100%' }}
                        />
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </ResponsiveGridLayout>
            </div>
          </main>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-black">
      <ThreeBackground />
      <div className="flex h-screen relative z-10">
        <Sidebar />
        <main className="flex-1 overflow-auto">
          <div className="p-8" ref={dashboardRef}>
            <div className="flex items-center justify-between mb-8">
              <div>
                <h1 className="text-4xl font-bold text-white mb-2">Security Command Center</h1>
                <p className="text-white/60">Comprehensive cybersecurity monitoring and threat intelligence</p>
              </div>
              <div className="flex space-x-4">
                <Button 
                  onClick={() => setDashboardMode('interactive')}
                  variant="outline"
                  className="border-red-500/30 text-white hover:bg-red-500/10"
                >
                  <Grid3X3 className="w-4 h-4 mr-2" />
                  Interactive Dashboard
                </Button>
                <Button className="bg-red-600 hover:bg-red-700 text-white">
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Refresh Data
                </Button>
              </div>
            </div>

            {/* Quick Metrics Overview */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              {securityMetrics.map((metric) => (
                <Card key={metric.id} className={`${getSeverityColor(metric.severity)}`}>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm opacity-80">{metric.name}</p>
                        <div className="flex items-center gap-2">
                          <p className="text-2xl font-bold">{metric.value}</p>
                          {getTrendIcon(metric.trend)}
                        </div>
                        <p className="text-xs opacity-60">Target: {metric.target}</p>
                      </div>
                      <div className="w-12 h-12 rounded-lg flex items-center justify-center bg-white/10">
                        {metric.id === 'overall-score' && <Shield className="w-6 h-6" />}
                        {metric.id === 'vulnerabilities' && <Bug className="w-6 h-6" />}
                        {metric.id === 'compliance' && <CheckCircle className="w-6 h-6" />}
                        {metric.id === 'threats' && <AlertTriangle className="w-6 h-6" />}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Main Charts and Visualizations */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
              <Card className="bg-black/20 border-red-500/30">
                <CardHeader>
                  <CardTitle className="text-white">Security Score Breakdown</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-64">
                    <Doughnut data={securityScoreData} options={chartOptions} />
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-black/20 border-red-500/30">
                <CardHeader>
                  <CardTitle className="text-white">Threat Activity Trends</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-64">
                    <Line data={threatTrendData} options={chartOptions} />
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Advanced Analytics */}
            <Tabs defaultValue="heatmap" className="space-y-6">
              <TabsList className="bg-black/40 border border-red-500/20">
                <TabsTrigger value="heatmap" className="text-white data-[state=active]:bg-red-600">Vulnerability Heatmap</TabsTrigger>
                <TabsTrigger value="compliance" className="text-white data-[state=active]:bg-red-600">Compliance</TabsTrigger>
                <TabsTrigger value="system" className="text-white data-[state=active]:bg-red-600">System Health</TabsTrigger>
                <TabsTrigger value="threats" className="text-white data-[state=active]:bg-red-600">Threat Intelligence</TabsTrigger>
              </TabsList>

              <TabsContent value="heatmap" className="space-y-6">
                <Card className="bg-black/20 border-red-500/30">
                  <CardHeader>
                    <CardTitle className="text-white">Asset Vulnerability Matrix</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="h-80">
                      <Plot
                        data={vulnerabilityHeatmapData}
                        layout={{
                          autosize: true,
                          margin: { l: 80, r: 40, b: 80, t: 40 },
                          paper_bgcolor: 'transparent',
                          plot_bgcolor: 'transparent',
                          font: { color: '#ffffff' },
                          xaxis: { title: 'Asset Categories', color: '#ffffff' },
                          yaxis: { title: 'Severity Levels', color: '#ffffff' }
                        }}
                        config={{ displayModeBar: false }}
                        style={{ width: '100%', height: '100%' }}
                      />
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="compliance" className="space-y-6">
                <Card className="bg-black/20 border-red-500/30">
                  <CardHeader>
                    <CardTitle className="text-white">Compliance Framework Status</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="h-80">
                      <Bar data={complianceData} options={chartOptions} />
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="system" className="space-y-6">
                <Card className="bg-black/20 border-red-500/30">
                  <CardHeader>
                    <CardTitle className="text-white">System Health Monitoring</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="h-80">
                      <Radar data={systemHealthData} options={radarOptions} />
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="threats" className="space-y-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <Card className="bg-black/20 border-red-500/30">
                    <CardHeader>
                      <CardTitle className="text-white">Real-time Threat Feed</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3 max-h-80 overflow-auto">
                      {threatEvents.map((event) => (
                        <div key={event.id} className="p-4 bg-black/20 rounded-lg border border-red-500/20">
                          <div className="flex items-center justify-between mb-2">
                            <Badge className={getSeverityColor(event.severity)}>
                              {event.severity.toUpperCase()}
                            </Badge>
                            <span className="text-xs text-white/60">{new Date(event.timestamp).toLocaleString()}</span>
                          </div>
                          <h3 className="text-white font-semibold mb-1">{event.type}</h3>
                          <p className="text-sm text-white/80 mb-2">{event.description}</p>
                          <div className="flex items-center justify-between">
                            <span className="text-xs text-white/60">Source: {event.source}</span>
                            <Badge className={
                              event.status === 'resolved' ? 'bg-green-500/20 text-green-300' :
                              event.status === 'investigating' ? 'bg-yellow-500/20 text-yellow-300' :
                              'bg-red-500/20 text-red-300'
                            }>
                              {event.status}
                            </Badge>
                          </div>
                        </div>
                      ))}
                    </CardContent>
                  </Card>

                  <Card className="bg-black/20 border-red-500/30">
                    <CardHeader>
                      <CardTitle className="text-white">Security Metrics Timeline</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="h-80">
                        <Plot
                          data={metricsTimelineData}
                          layout={{
                            autosize: true,
                            margin: { l: 50, r: 50, b: 50, t: 20 },
                            paper_bgcolor: 'transparent',
                            plot_bgcolor: 'transparent',
                            font: { color: '#ffffff' },
                            xaxis: { 
                              title: 'Time',
                              color: '#ffffff',
                              gridcolor: 'rgba(255, 255, 255, 0.1)'
                            },
                            yaxis: { 
                              title: 'Security Score',
                              color: '#ffffff',
                              gridcolor: 'rgba(255, 255, 255, 0.1)'
                            },
                            yaxis2: {
                              title: 'Active Threats',
                              overlaying: 'y',
                              side: 'right',
                              color: '#ffffff'
                            }
                          }}
                          config={{ displayModeBar: false }}
                          style={{ width: '100%', height: '100%' }}
                        />
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