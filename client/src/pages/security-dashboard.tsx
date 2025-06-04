import React, { useState } from 'react';
import { useQuery } from "@tanstack/react-query";
import { getAuthToken } from "@/lib/auth";
import { Sidebar } from "@/components/layout/sidebar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  Shield, 
  AlertTriangle, 
  CheckCircle2, 
  FileText,
  RefreshCw,
  Download
} from "lucide-react";

export default function SecurityDashboard() {
  const [autoRefresh, setAutoRefresh] = useState(true);

  const { data: dashboardData, isLoading } = useQuery({
    queryKey: ['/api/dashboard'],
    queryFn: () => fetch('/api/dashboard', {
      headers: { Authorization: `Bearer ${getAuthToken()}` }
    }).then(res => res.json()),
    refetchInterval: autoRefresh ? 30000 : false
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-black flex">
        <Sidebar />
        <div className="flex-1 flex items-center justify-center">
          <div className="flex items-center space-x-3 text-cyan-400">
            <RefreshCw className="w-6 h-6 animate-spin" />
            <span className="text-lg font-medium">Loading Security Dashboard...</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black">
      <Sidebar />
      
      <main className="ml-72 p-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-bold text-red-400 mb-2">Security Dashboard</h1>
            <p className="text-gray-400 text-lg">Real-time cybersecurity monitoring and threat intelligence</p>
          </div>
          
          <div className="flex items-center space-x-4">
            <Button className="bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-lg font-medium">
              Run Security Scan
            </Button>
            <Button variant="outline" className="bg-gray-800 border-gray-600 text-gray-300 hover:bg-gray-700 px-6 py-3 rounded-lg font-medium">
              Generate Report
            </Button>
          </div>
        </div>

        {/* Metrics Cards */}
        <div className="grid grid-cols-4 gap-6 mb-8">
          {/* Security Score */}
          <div className="bg-gray-900/50 backdrop-blur-sm rounded-lg p-6">
            <div className="text-6xl font-bold text-red-400 mb-2">85/100</div>
            <div className="text-white font-medium mb-1">Security Score</div>
            <div className="text-green-400 text-sm">↑ 5% from last week</div>
          </div>

          {/* Active Threats */}
          <div className="bg-gray-900/50 backdrop-blur-sm rounded-lg p-6">
            <div className="text-6xl font-bold text-red-400 mb-2">3</div>
            <div className="text-white font-medium mb-1">Active Threats</div>
            <div className="text-red-400 text-sm">Requires immediate attention</div>
          </div>

          {/* POPIA Compliance */}
          <div className="bg-gray-900/50 backdrop-blur-sm rounded-lg p-6">
            <div className="text-6xl font-bold text-green-400 mb-2">92%</div>
            <div className="text-white font-medium mb-1">POPIA Compliance</div>
            <div className="text-green-400 text-sm">Fully compliant</div>
          </div>

          {/* Protected Files */}
          <div className="bg-gray-900/50 backdrop-blur-sm rounded-lg p-6">
            <div className="text-6xl font-bold text-blue-400 mb-2">1247</div>
            <div className="text-white font-medium mb-1">Protected Files</div>
            <div className="text-blue-400 text-sm">Encrypted & secure</div>
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-2 gap-8">
          {/* Recent Security Events */}
          <div className="bg-gray-900/50 backdrop-blur-sm rounded-lg p-6">
            <h2 className="text-xl font-bold text-red-400 mb-6">Recent Security Events</h2>
            
            <div className="space-y-4">
              {/* Critical vulnerability */}
              <div className="flex items-start space-x-4">
                <div className="w-3 h-3 bg-red-500 rounded-full mt-2 animate-pulse"></div>
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-white font-medium">Critical vulnerability detected</span>
                    <span className="text-gray-500 text-sm">2 hours ago</span>
                  </div>
                </div>
              </div>

              {/* Suspicious login */}
              <div className="flex items-start space-x-4">
                <div className="w-3 h-3 bg-yellow-500 rounded-full mt-2"></div>
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-white font-medium">Suspicious login attempt blocked</span>
                    <span className="text-gray-500 text-sm">4 hours ago</span>
                  </div>
                </div>
              </div>

              {/* Security scan */}
              <div className="flex items-start space-x-4">
                <div className="w-3 h-3 bg-green-500 rounded-full mt-2"></div>
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-white font-medium">Security scan completed successfully</span>
                    <span className="text-gray-500 text-sm">6 hours ago</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* System Health */}
          <div className="bg-gray-900/50 backdrop-blur-sm rounded-lg p-6">
            <h2 className="text-xl font-bold text-red-400 mb-6">System Health</h2>
            
            <div className="space-y-6">
              {/* Firewall Status */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-white font-medium">Firewall Status</span>
                  <span className="text-green-400 font-medium">Active</span>
                </div>
                <div className="w-full bg-gray-800 rounded-full h-2">
                  <div className="bg-green-400 h-2 rounded-full w-full"></div>
                </div>
              </div>

              {/* Antivirus Protection */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-white font-medium">Antivirus Protection</span>
                  <span className="text-yellow-400 font-medium">Up to date</span>
                </div>
                <div className="w-full bg-gray-800 rounded-full h-2">
                  <div className="bg-yellow-400 h-2 rounded-full w-4/5"></div>
                </div>
              </div>

              {/* Data Encryption */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-white font-medium">Data Encryption</span>
                  <span className="text-green-400 font-medium">Enabled</span>
                </div>
                <div className="w-full bg-gray-800 rounded-full h-2">
                  <div className="bg-green-400 h-2 rounded-full w-full"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}