import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Sidebar } from "@/components/layout/sidebar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell
} from "recharts";
import { 
  Download, 
  TrendingUp, 
  TrendingDown, 
  FileText, 
  Shield, 
  AlertTriangle,
  CheckCircle,
  Clock
} from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { AnimatedBackground } from "@/components/ui/animated-background";
import { GlassCard } from "@/components/ui/glass-card";

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];

export default function Reports() {
  const { user } = useAuth();
  const [reportType, setReportType] = useState("overview");
  const [timeRange, setTimeRange] = useState("30d");

  // Mock data for comprehensive reporting
  const mockReportsData = {
    overview: {
      totalIncidents: 23,
      resolvedIncidents: 18,
      openIncidents: 5,
      criticalVulnerabilities: 3,
      complianceScore: 85,
      lastAssessment: "2024-01-15"
    },
    riskTrends: [
      { month: "Oct", overall: 72, physical: 80, data: 75, access: 68, network: 65 },
      { month: "Nov", overall: 76, physical: 82, data: 78, access: 72, network: 68 },
      { month: "Dec", overall: 78, physical: 85, data: 80, access: 75, network: 72 },
      { month: "Jan", overall: 73, physical: 83, data: 77, access: 70, network: 66 }
    ],
    incidentsByType: [
      { name: "Phishing", value: 12, color: "#FF8042" },
      { name: "Malware", value: 8, color: "#FFBB28" },
      { name: "Data Breach", value: 2, color: "#FF0000" },
      { name: "Unauthorized Access", value: 1, color: "#00C49F" }
    ],
    complianceBreakdown: [
      { category: "Data Protection", completed: 85, total: 100 },
      { category: "Access Control", completed: 92, total: 100 },
      { category: "Network Security", completed: 78, total: 100 },
      { category: "Physical Security", completed: 88, total: 100 },
      { category: "Incident Response", completed: 95, total: 100 }
    ],
    auditTrail: [
      {
        id: 1,
        timestamp: "2024-01-20 14:30:00",
        user: "Admin User",
        action: "Updated POPIA compliance item",
        resource: "Data Protection Policy",
        severity: "medium"
      },
      {
        id: 2,
        timestamp: "2024-01-20 13:15:00",
        user: "Sarah Johnson",
        action: "Uploaded encrypted file",
        resource: "Financial_Report_Q4.pdf",
        severity: "low"
      },
      {
        id: 3,
        timestamp: "2024-01-20 11:45:00",
        user: "Mike Chen",
        action: "Failed login attempt",
        resource: "User Authentication",
        severity: "high"
      },
      {
        id: 4,
        timestamp: "2024-01-20 10:20:00",
        user: "Emma Davis",
        action: "Completed risk assessment",
        resource: "Quarterly Security Review",
        severity: "medium"
      }
    ]
  };

  const getSeverityBadge = (severity: string) => {
    const variants = {
      low: "bg-green-50 text-green-700",
      medium: "bg-yellow-50 text-yellow-700", 
      high: "bg-red-50 text-red-700"
    };
    return (
      <Badge className={variants[severity as keyof typeof variants]}>
        {severity.toUpperCase()}
      </Badge>
    );
  };

  const generateReport = () => {
    // Mock report generation
    const reportData = {
      type: reportType,
      timeRange,
      generatedAt: new Date().toISOString(),
      data: mockReportsData
    };
    
    const blob = new Blob([JSON.stringify(reportData, null, 2)], {
      type: 'application/json'
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `shielddesk-report-${reportType}-${Date.now()}.json`;
    a.click();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-red-950">
      <AnimatedBackground />
      <div className="flex">
        <Sidebar />
        <main className="flex-1 min-h-screen overflow-y-auto bg-gradient-to-br from-black via-gray-900 to-red-950">
        {/* Header */}
        <header className="bg-white shadow-sm border-b border-gray-200">
          <div className="px-6 py-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">Security Reports</h2>
                <p className="text-gray-600 mt-1">Comprehensive security analytics and compliance reporting</p>
              </div>
              <div className="flex items-center space-x-4">
                <Select value={timeRange} onValueChange={setTimeRange}>
                  <SelectTrigger className="w-40">
                    <SelectValue placeholder="Time Range" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="7d">Last 7 days</SelectItem>
                    <SelectItem value="30d">Last 30 days</SelectItem>
                    <SelectItem value="90d">Last 90 days</SelectItem>
                    <SelectItem value="1y">Last year</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={reportType} onValueChange={setReportType}>
                  <SelectTrigger className="w-48">
                    <SelectValue placeholder="Report Type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="overview">Security Overview</SelectItem>
                    <SelectItem value="compliance">Compliance Report</SelectItem>
                    <SelectItem value="incidents">Incident Analysis</SelectItem>
                    <SelectItem value="audit">Audit Trail</SelectItem>
                  </SelectContent>
                </Select>
                <Button onClick={generateReport} className="bg-primary text-primary-foreground">
                  <Download className="w-4 h-4 mr-2" />
                  Export Report
                </Button>
              </div>
            </div>
          </div>
        </header>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Key Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center">
                  <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center">
                    <Shield className="w-5 h-5 text-blue-600" />
                  </div>
                  <div className="ml-3">
                    <p className="text-sm text-gray-600">Compliance Score</p>
                    <p className="text-xl font-semibold text-gray-900">{mockReportsData.overview.complianceScore}%</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center">
                  <div className="w-10 h-10 bg-green-50 rounded-lg flex items-center justify-center">
                    <CheckCircle className="w-5 h-5 text-green-600" />
                  </div>
                  <div className="ml-3">
                    <p className="text-sm text-gray-600">Resolved Issues</p>
                    <p className="text-xl font-semibold text-gray-900">{mockReportsData.overview.resolvedIncidents}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center">
                  <div className="w-10 h-10 bg-yellow-50 rounded-lg flex items-center justify-center">
                    <Clock className="w-5 h-5 text-yellow-600" />
                  </div>
                  <div className="ml-3">
                    <p className="text-sm text-gray-600">Open Issues</p>
                    <p className="text-xl font-semibold text-gray-900">{mockReportsData.overview.openIncidents}</p>
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
                    <p className="text-sm text-gray-600">Critical Vulns</p>
                    <p className="text-xl font-semibold text-gray-900">{mockReportsData.overview.criticalVulnerabilities}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center">
                  <div className="w-10 h-10 bg-purple-50 rounded-lg flex items-center justify-center">
                    <FileText className="w-5 h-5 text-purple-600" />
                  </div>
                  <div className="ml-3">
                    <p className="text-sm text-gray-600">Total Incidents</p>
                    <p className="text-xl font-semibold text-gray-900">{mockReportsData.overview.totalIncidents}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Charts Section */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Risk Trends */}
            <Card>
              <CardHeader>
                <CardTitle>Risk Score Trends</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={mockReportsData.riskTrends}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip />
                    <Line type="monotone" dataKey="overall" stroke="#8884d8" strokeWidth={2} />
                    <Line type="monotone" dataKey="physical" stroke="#82ca9d" />
                    <Line type="monotone" dataKey="data" stroke="#ffc658" />
                    <Line type="monotone" dataKey="access" stroke="#ff7300" />
                    <Line type="monotone" dataKey="network" stroke="#8dd1e1" />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Incident Types */}
            <Card>
              <CardHeader>
                <CardTitle>Incidents by Type</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={mockReportsData.incidentsByType}
                      cx="50%"
                      cy="50%"
                      outerRadius={100}
                      fill="#8884d8"
                      dataKey="value"
                      label={({ name, value }) => `${name}: ${value}`}
                    >
                      {mockReportsData.incidentsByType.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          {/* Compliance Breakdown */}
          <Card>
            <CardHeader>
              <CardTitle>Compliance Breakdown by Category</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={mockReportsData.complianceBreakdown}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="category" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="completed" fill="#4ade80" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Audit Trail */}
          <Card>
            <CardHeader>
              <CardTitle>Recent Security Events</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Timestamp</TableHead>
                      <TableHead>User</TableHead>
                      <TableHead>Action</TableHead>
                      <TableHead>Resource</TableHead>
                      <TableHead>Severity</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {mockReportsData.auditTrail.map((event) => (
                      <TableRow key={event.id}>
                        <TableCell className="font-mono text-sm">
                          {new Date(event.timestamp).toLocaleString()}
                        </TableCell>
                        <TableCell>{event.user}</TableCell>
                        <TableCell>{event.action}</TableCell>
                        <TableCell className="max-w-xs truncate">{event.resource}</TableCell>
                        <TableCell>{getSeverityBadge(event.severity)}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}