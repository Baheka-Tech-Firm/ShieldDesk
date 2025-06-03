import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Sidebar } from "@/components/layout/sidebar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
  AlertTriangle, 
  Shield, 
  Eye, 
  Globe,
  Server,
  Lock,
  Zap,
  TrendingUp,
  Search,
  ExternalLink,
  Clock,
  MapPin
} from "lucide-react";
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  AreaChart,
  Area
} from "recharts";
import { useAuth } from "@/hooks/use-auth";
import { AnimatedBackground } from "@/components/ui/animated-background";
import { GlassCard } from "@/components/ui/glass-card";

interface ThreatIndicator {
  id: string;
  type: 'ip' | 'domain' | 'hash' | 'url';
  value: string;
  threat_level: 'critical' | 'high' | 'medium' | 'low';
  confidence: number;
  first_seen: string;
  last_seen: string;
  threat_types: string[];
  source: string;
  description: string;
  geolocation?: {
    country: string;
    city: string;
    coordinates: [number, number];
  };
}

interface ThreatFeed {
  id: string;
  name: string;
  provider: string;
  last_updated: string;
  indicators_count: number;
  status: 'active' | 'inactive' | 'error';
  reliability: number;
}

interface SecurityEvent {
  id: string;
  timestamp: string;
  event_type: string;
  severity: 'critical' | 'high' | 'medium' | 'low';
  source_ip: string;
  target_ip: string;
  description: string;
  indicators_matched: string[];
  status: 'new' | 'investigating' | 'resolved' | 'false_positive';
}

export default function ThreatIntelligence() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState("dashboard");
  const [searchQuery, setSearchQuery] = useState("");

  // Comprehensive threat intelligence data
  const threatIndicators: ThreatIndicator[] = [
    {
      id: "indicator-001",
      type: "ip",
      value: "185.220.101.182",
      threat_level: "critical",
      confidence: 95,
      first_seen: "2024-01-15T08:30:00Z",
      last_seen: "2024-01-20T14:22:00Z",
      threat_types: ["malware", "botnet", "c2"],
      source: "Emerging Threats",
      description: "Known C2 server associated with TrickBot malware family",
      geolocation: {
        country: "Russia",
        city: "Moscow",
        coordinates: [55.7558, 37.6173]
      }
    },
    {
      id: "indicator-002",
      type: "domain",
      value: "malicious-phishing-site.com",
      threat_level: "high",
      confidence: 88,
      first_seen: "2024-01-18T12:15:00Z",
      last_seen: "2024-01-20T16:45:00Z",
      threat_types: ["phishing", "credential-harvesting"],
      source: "PhishTank",
      description: "Phishing site impersonating banking services",
      geolocation: {
        country: "Netherlands",
        city: "Amsterdam",
        coordinates: [52.3676, 4.9041]
      }
    },
    {
      id: "indicator-003",
      type: "hash",
      value: "a1b2c3d4e5f6789012345678901234567890abcd",
      threat_level: "medium",
      confidence: 72,
      first_seen: "2024-01-19T09:20:00Z",
      last_seen: "2024-01-20T11:30:00Z",
      threat_types: ["trojan", "information-stealer"],
      source: "VirusTotal",
      description: "Information stealing trojan targeting financial data"
    },
    {
      id: "indicator-004",
      type: "url",
      value: "http://suspicious-download.net/payload.exe",
      threat_level: "high",
      confidence: 91,
      first_seen: "2024-01-17T16:40:00Z",
      last_seen: "2024-01-20T13:15:00Z",
      threat_types: ["malware-distribution", "exploit-kit"],
      source: "URLVoid",
      description: "Malware distribution site hosting exploit kits"
    }
  ];

  const threatFeeds: ThreatFeed[] = [
    {
      id: "feed-001",
      name: "Emerging Threats",
      provider: "Proofpoint",
      last_updated: "2024-01-20T15:30:00Z",
      indicators_count: 15420,
      status: "active",
      reliability: 95
    },
    {
      id: "feed-002",
      name: "AlienVault OTX",
      provider: "AT&T Cybersecurity",
      last_updated: "2024-01-20T14:45:00Z",
      indicators_count: 8932,
      status: "active",
      reliability: 88
    },
    {
      id: "feed-003",
      name: "MISP Threat Feed",
      provider: "Community",
      last_updated: "2024-01-20T13:20:00Z",
      indicators_count: 12567,
      status: "active",
      reliability: 82
    },
    {
      id: "feed-004",
      name: "Custom IOCs",
      provider: "Internal",
      last_updated: "2024-01-20T16:00:00Z",
      indicators_count: 234,
      status: "active",
      reliability: 100
    }
  ];

  const securityEvents: SecurityEvent[] = [
    {
      id: "event-001",
      timestamp: "2024-01-20T15:45:00Z",
      event_type: "Malicious IP Communication",
      severity: "critical",
      source_ip: "192.168.1.105",
      target_ip: "185.220.101.182",
      description: "Internal host attempted connection to known C2 server",
      indicators_matched: ["185.220.101.182"],
      status: "investigating"
    },
    {
      id: "event-002",
      timestamp: "2024-01-20T14:20:00Z",
      event_type: "Phishing Domain Access",
      severity: "high",
      source_ip: "192.168.1.87",
      target_ip: "203.0.113.45",
      description: "User accessed known phishing domain",
      indicators_matched: ["malicious-phishing-site.com"],
      status: "new"
    },
    {
      id: "event-003",
      timestamp: "2024-01-20T13:10:00Z",
      event_type: "Malware Hash Detected",
      severity: "medium",
      source_ip: "192.168.1.42",
      target_ip: "198.51.100.23",
      description: "File matching known malware hash detected",
      indicators_matched: ["a1b2c3d4e5f6789012345678901234567890abcd"],
      status: "resolved"
    }
  ];

  const threatTrendData = [
    { date: "Jan 15", critical: 12, high: 28, medium: 45, low: 23 },
    { date: "Jan 16", critical: 15, high: 31, medium: 42, low: 27 },
    { date: "Jan 17", critical: 18, high: 35, medium: 48, low: 31 },
    { date: "Jan 18", critical: 22, high: 39, medium: 51, low: 29 },
    { date: "Jan 19", critical: 19, high: 33, medium: 46, low: 25 },
    { date: "Jan 20", critical: 25, high: 42, medium: 53, low: 33 }
  ];

  const getThreatLevelBadge = (level: string) => {
    const variants = {
      critical: "bg-red-100 text-red-800 border-red-200",
      high: "bg-orange-100 text-orange-800 border-orange-200",
      medium: "bg-yellow-100 text-yellow-800 border-yellow-200",
      low: "bg-blue-100 text-blue-800 border-blue-200"
    };
    
    return (
      <Badge className={variants[level as keyof typeof variants]}>
        {level.toUpperCase()}
      </Badge>
    );
  };

  const getIndicatorTypeIcon = (type: string) => {
    const icons = {
      ip: Server,
      domain: Globe,
      hash: Lock,
      url: ExternalLink
    };
    return icons[type as keyof typeof icons] || Shield;
  };

  const filteredIndicators = threatIndicators.filter(indicator =>
    indicator.value.toLowerCase().includes(searchQuery.toLowerCase()) ||
    indicator.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const threatStats = {
    totalIndicators: threatIndicators.length,
    criticalThreats: threatIndicators.filter(i => i.threat_level === 'critical').length,
    activeFeeds: threatFeeds.filter(f => f.status === 'active').length,
    newEvents: securityEvents.filter(e => e.status === 'new').length
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
                <h2 className="text-2xl font-bold text-white">Threat Intelligence</h2>
                <p className="text-gray-300 mt-1">Real-time threat monitoring and intelligence analysis</p>
              </div>
              <div className="flex items-center space-x-4">
                <div className="relative">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Search indicators..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10 w-64 bg-gray-800/50 border-red-500/30 text-white"
                  />
                </div>
              </div>
            </div>
          </div>
        </GlassCard>

        <div className="p-6">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
            <TabsList className="grid w-full grid-cols-5">
              <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
              <TabsTrigger value="indicators">Indicators</TabsTrigger>
              <TabsTrigger value="feeds">Threat Feeds</TabsTrigger>
              <TabsTrigger value="events">Security Events</TabsTrigger>
              <TabsTrigger value="analysis">Analysis</TabsTrigger>
            </TabsList>

            <TabsContent value="dashboard" className="space-y-6">
              {/* Threat Overview */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center">
                      <div className="w-10 h-10 bg-red-50 rounded-lg flex items-center justify-center">
                        <AlertTriangle className="w-5 h-5 text-red-600" />
                      </div>
                      <div className="ml-3">
                        <p className="text-sm text-gray-600">Critical Threats</p>
                        <p className="text-xl font-semibold text-red-600">{threatStats.criticalThreats}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center">
                      <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center">
                        <Shield className="w-5 h-5 text-blue-600" />
                      </div>
                      <div className="ml-3">
                        <p className="text-sm text-gray-600">Total Indicators</p>
                        <p className="text-xl font-semibold text-blue-600">{threatStats.totalIndicators}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center">
                      <div className="w-10 h-10 bg-green-50 rounded-lg flex items-center justify-center">
                        <Zap className="w-5 h-5 text-green-600" />
                      </div>
                      <div className="ml-3">
                        <p className="text-sm text-gray-600">Active Feeds</p>
                        <p className="text-xl font-semibold text-green-600">{threatStats.activeFeeds}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center">
                      <div className="w-10 h-10 bg-yellow-50 rounded-lg flex items-center justify-center">
                        <Eye className="w-5 h-5 text-yellow-600" />
                      </div>
                      <div className="ml-3">
                        <p className="text-sm text-gray-600">New Events</p>
                        <p className="text-xl font-semibold text-yellow-600">{threatStats.newEvents}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Threat Trends */}
              <Card>
                <CardHeader>
                  <CardTitle>Threat Activity Trends</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <AreaChart data={threatTrendData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="date" />
                      <YAxis />
                      <Tooltip />
                      <Area type="monotone" dataKey="critical" stackId="1" stroke="#ef4444" fill="#fee2e2" />
                      <Area type="monotone" dataKey="high" stackId="1" stroke="#f97316" fill="#fed7aa" />
                      <Area type="monotone" dataKey="medium" stackId="1" stroke="#eab308" fill="#fef3c7" />
                      <Area type="monotone" dataKey="low" stackId="1" stroke="#3b82f6" fill="#dbeafe" />
                    </AreaChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              {/* Recent Critical Indicators */}
              <Card>
                <CardHeader>
                  <CardTitle>Recent Critical Indicators</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {threatIndicators
                      .filter(i => i.threat_level === 'critical')
                      .slice(0, 3)
                      .map((indicator) => {
                        const Icon = getIndicatorTypeIcon(indicator.type);
                        return (
                          <div key={indicator.id} className="flex items-center justify-between p-4 border rounded-lg">
                            <div className="flex items-center space-x-3">
                              <div className="w-10 h-10 bg-red-50 rounded-lg flex items-center justify-center">
                                <Icon className="w-5 h-5 text-red-600" />
                              </div>
                              <div>
                                <p className="font-medium font-mono">{indicator.value}</p>
                                <p className="text-sm text-gray-600">{indicator.description}</p>
                              </div>
                            </div>
                            <div className="flex items-center space-x-3">
                              {getThreatLevelBadge(indicator.threat_level)}
                              <Badge variant="outline">
                                {indicator.confidence}% confidence
                              </Badge>
                              <span className="text-sm text-gray-500">
                                {indicator.source}
                              </span>
                            </div>
                          </div>
                        );
                      })}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="indicators" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Threat Indicators</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Type</TableHead>
                          <TableHead>Value</TableHead>
                          <TableHead>Threat Level</TableHead>
                          <TableHead>Confidence</TableHead>
                          <TableHead>Threat Types</TableHead>
                          <TableHead>Source</TableHead>
                          <TableHead>First Seen</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filteredIndicators.map((indicator) => {
                          const Icon = getIndicatorTypeIcon(indicator.type);
                          return (
                            <TableRow key={indicator.id}>
                              <TableCell>
                                <div className="flex items-center space-x-2">
                                  <Icon className="w-4 h-4" />
                                  <span className="capitalize">{indicator.type}</span>
                                </div>
                              </TableCell>
                              <TableCell className="font-mono text-sm">{indicator.value}</TableCell>
                              <TableCell>{getThreatLevelBadge(indicator.threat_level)}</TableCell>
                              <TableCell>
                                <Badge variant="outline">{indicator.confidence}%</Badge>
                              </TableCell>
                              <TableCell>
                                <div className="flex flex-wrap gap-1">
                                  {indicator.threat_types.map((type, index) => (
                                    <Badge key={index} variant="secondary" className="text-xs">
                                      {type}
                                    </Badge>
                                  ))}
                                </div>
                              </TableCell>
                              <TableCell className="text-sm">{indicator.source}</TableCell>
                              <TableCell className="text-sm text-gray-500">
                                {new Date(indicator.first_seen).toLocaleDateString()}
                              </TableCell>
                            </TableRow>
                          );
                        })}
                      </TableBody>
                    </Table>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="feeds" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Threat Intelligence Feeds</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Feed Name</TableHead>
                          <TableHead>Provider</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead>Indicators</TableHead>
                          <TableHead>Reliability</TableHead>
                          <TableHead>Last Updated</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {threatFeeds.map((feed) => (
                          <TableRow key={feed.id}>
                            <TableCell className="font-medium">{feed.name}</TableCell>
                            <TableCell>{feed.provider}</TableCell>
                            <TableCell>
                              <Badge className={
                                feed.status === 'active' ? 'bg-green-50 text-green-700' :
                                feed.status === 'inactive' ? 'bg-gray-50 text-gray-700' :
                                'bg-red-50 text-red-700'
                              }>
                                {feed.status}
                              </Badge>
                            </TableCell>
                            <TableCell>{feed.indicators_count.toLocaleString()}</TableCell>
                            <TableCell>
                              <div className="flex items-center space-x-2">
                                <div className="w-16 bg-gray-200 rounded-full h-2">
                                  <div 
                                    className="bg-blue-600 h-2 rounded-full" 
                                    style={{ width: `${feed.reliability}%` }}
                                  ></div>
                                </div>
                                <span className="text-sm">{feed.reliability}%</span>
                              </div>
                            </TableCell>
                            <TableCell className="text-sm text-gray-500">
                              {new Date(feed.last_updated).toLocaleString()}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="events" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Security Events</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Timestamp</TableHead>
                          <TableHead>Event Type</TableHead>
                          <TableHead>Severity</TableHead>
                          <TableHead>Source</TableHead>
                          <TableHead>Target</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead>Indicators</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {securityEvents.map((event) => (
                          <TableRow key={event.id}>
                            <TableCell className="font-mono text-sm">
                              {new Date(event.timestamp).toLocaleString()}
                            </TableCell>
                            <TableCell>{event.event_type}</TableCell>
                            <TableCell>{getThreatLevelBadge(event.severity)}</TableCell>
                            <TableCell className="font-mono text-sm">{event.source_ip}</TableCell>
                            <TableCell className="font-mono text-sm">{event.target_ip}</TableCell>
                            <TableCell>
                              <Badge className={
                                event.status === 'new' ? 'bg-red-50 text-red-700' :
                                event.status === 'investigating' ? 'bg-yellow-50 text-yellow-700' :
                                event.status === 'resolved' ? 'bg-green-50 text-green-700' :
                                'bg-gray-50 text-gray-700'
                              }>
                                {event.status.replace('_', ' ')}
                              </Badge>
                            </TableCell>
                            <TableCell className="text-sm">
                              {event.indicators_matched.length} matched
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="analysis" className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Geographic Distribution</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {Object.entries(
                        threatIndicators
                          .filter(i => i.geolocation)
                          .reduce((acc, indicator) => {
                            const country = indicator.geolocation!.country;
                            acc[country] = (acc[country] || 0) + 1;
                            return acc;
                          }, {} as Record<string, number>)
                      )
                        .sort((a, b) => b[1] - a[1])
                        .slice(0, 5)
                        .map(([country, count]) => (
                          <div key={country} className="flex items-center justify-between">
                            <div className="flex items-center space-x-2">
                              <MapPin className="w-4 h-4 text-gray-400" />
                              <span>{country}</span>
                            </div>
                            <Badge variant="outline">{count} indicators</Badge>
                          </div>
                        ))}
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Threat Type Distribution</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {Object.entries(
                        threatIndicators
                          .flatMap(i => i.threat_types)
                          .reduce((acc, type) => {
                            acc[type] = (acc[type] || 0) + 1;
                            return acc;
                          }, {} as Record<string, number>)
                      )
                        .sort((a, b) => b[1] - a[1])
                        .slice(0, 6)
                        .map(([type, count]) => (
                          <div key={type} className="flex items-center justify-between">
                            <span className="capitalize">{type.replace('-', ' ')}</span>
                            <Badge variant="outline">{count} indicators</Badge>
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
  );
}