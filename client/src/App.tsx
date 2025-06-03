import { Switch, Route, Redirect } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider, useAuth } from "@/hooks/use-auth";

// Pages
import Login from "@/pages/login";
import Dashboard from "@/pages/dashboard";
import Onboarding from "@/pages/onboarding";
import FileVault from "@/pages/file-vault";
import VulnerabilityScanner from "@/pages/vulnerability-scanner";
import ThreatIntelligence from "@/pages/threat-intelligence";
import Compliance from "@/pages/compliance";
import Reports from "@/pages/reports";
import UserManagement from "@/pages/user-management";
import IncidentResponse from "@/pages/incident-response";
import AdminPanel from "@/pages/admin-panel";
import SecurityMonitoring from "@/pages/security-monitoring";
import NotFound from "@/pages/not-found";

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!user) {
    return <Redirect to="/login" />;
  }

  return <>{children}</>;
}

function Router() {
  return (
    <Switch>
      <Route path="/login" component={Login} />
      <Route path="/onboarding">
        <ProtectedRoute>
          <Onboarding />
        </ProtectedRoute>
      </Route>
      <Route path="/dashboard">
        <ProtectedRoute>
          <Dashboard />
        </ProtectedRoute>
      </Route>
      <Route path="/files">
        <ProtectedRoute>
          <FileVault />
        </ProtectedRoute>
      </Route>
      <Route path="/vulnerability-scanner">
        <ProtectedRoute>
          <VulnerabilityScanner />
        </ProtectedRoute>
      </Route>
      <Route path="/threat-intelligence">
        <ProtectedRoute>
          <ThreatIntelligence />
        </ProtectedRoute>
      </Route>
      <Route path="/compliance">
        <ProtectedRoute>
          <Compliance />
        </ProtectedRoute>
      </Route>
      <Route path="/reports">
        <ProtectedRoute>
          <Reports />
        </ProtectedRoute>
      </Route>
      <Route path="/incident-response">
        <ProtectedRoute>
          <IncidentResponse />
        </ProtectedRoute>
      </Route>
      <Route path="/users">
        <ProtectedRoute>
          <UserManagement />
        </ProtectedRoute>
      </Route>
      <Route path="/admin">
        <ProtectedRoute>
          <AdminPanel />
        </ProtectedRoute>
      </Route>
      <Route path="/">
        <Redirect to="/dashboard" />
      </Route>
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <TooltipProvider>
          <Toaster />
          <Router />
        </TooltipProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
