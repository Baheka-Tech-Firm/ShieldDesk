import { lazy } from 'react';
import { lazyLoadComponent } from './performance';

// Lazy load heavy components to improve initial bundle size
export const LazyDashboard = lazyLoadComponent(() => import('@/pages/dashboard'));
export const LazyEnhancedDashboard = lazyLoadComponent(() => import('@/pages/enhanced-dashboard'));
export const LazyFileVault = lazyLoadComponent(() => import('@/pages/file-vault'));
export const LazyEnhancedFileVault = lazyLoadComponent(() => import('@/pages/enhanced-file-vault'));
export const LazyVulnerabilityScanner = lazyLoadComponent(() => import('@/pages/enhanced-vulnerability-scanner'));
export const LazyCompliance = lazyLoadComponent(() => import('@/pages/compliance'));
export const LazyThreatIntelligence = lazyLoadComponent(() => import('@/pages/threat-intelligence'));
export const LazySecurityMonitoring = lazyLoadComponent(() => import('@/pages/security-monitoring'));
export const LazyIncidentResponse = lazyLoadComponent(() => import('@/pages/incident-response'));
export const LazyReports = lazyLoadComponent(() => import('@/pages/reports'));
export const LazyUserManagement = lazyLoadComponent(() => import('@/pages/user-management'));
export const LazyAdminPanel = lazyLoadComponent(() => import('@/pages/admin-panel'));

// Lazy load Three.js components for better performance
export const LazyThreeBackground = lazy(() => import('@/components/ui/three-background'));
export const LazyAnimatedBackground = lazy(() => import('@/components/ui/animated-background'));

// Lazy load chart components
export const LazyChartComponents = {
  LineChart: lazy(() => import('recharts').then(module => ({ default: module.LineChart }))),
  BarChart: lazy(() => import('recharts').then(module => ({ default: module.BarChart }))),
  PieChart: lazy(() => import('recharts').then(module => ({ default: module.PieChart }))),
  AreaChart: lazy(() => import('recharts').then(module => ({ default: module.AreaChart })))
};