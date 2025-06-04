<?php

// Simple PHP server for API endpoints without Laravel framework
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');

// Handle preflight OPTIONS requests
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

$uri = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);
$method = $_SERVER['REQUEST_METHOD'];

// Mock user for authentication
$mockUser = (object)[
    'company_id' => 1,
    'id' => 1,
    'name' => 'Test User',
    'email' => 'test@shielddesk.com'
];

// Route handling
switch ($uri) {
    case '/api/health':
        echo json_encode([
            'status' => 'healthy',
            'timestamp' => date('c'),
            'version' => '1.0.0',
            'service' => 'PHP Backend'
        ]);
        break;

    case '/api/vulnerabilities/stats':
        echo json_encode([
            'critical' => 3,
            'high' => 8,
            'medium' => 15,
            'low' => 22,
            'total' => 48,
            'resolved' => 156,
            'openTrend' => -12,
            'avgResolutionTime' => 4.2,
            'assetsScanned' => 15,
            'lastScanTime' => date('c')
        ]);
        break;

    case '/api/vulnerabilities/assets':
        if ($method === 'GET') {
            echo json_encode([
                [
                    'id' => '1',
                    'name' => 'Company Website',
                    'type' => 'url',
                    'target' => 'https://company.com',
                    'description' => 'Main corporate website',
                    'lastScan' => date('c'),
                    'status' => 'active',
                    'vulnerabilityCount' => 12,
                    'riskScore' => 85,
                    'tags' => ['web', 'public', 'customer-facing']
                ],
                [
                    'id' => '2',
                    'name' => 'Internal API Server',
                    'type' => 'ip',
                    'target' => '192.168.1.100',
                    'description' => 'Internal REST API server',
                    'lastScan' => date('c', strtotime('-1 hour')),
                    'status' => 'active',
                    'vulnerabilityCount' => 5,
                    'riskScore' => 65,
                    'tags' => ['api', 'internal', 'microservices']
                ]
            ]);
        } elseif ($method === 'POST') {
            $input = json_decode(file_get_contents('php://input'), true);
            echo json_encode([
                'id' => uniqid(),
                'name' => $input['name'] ?? 'New Asset',
                'type' => $input['type'] ?? 'url',
                'target' => $input['target'] ?? 'https://example.com',
                'description' => $input['description'] ?? '',
                'lastScan' => null,
                'status' => 'active',
                'vulnerabilityCount' => 0,
                'riskScore' => 0,
                'tags' => $input['tags'] ?? []
            ]);
        }
        break;

    case '/api/vulnerabilities':
        echo json_encode([
            [
                'id' => '1',
                'title' => 'SQL Injection in Authentication',
                'severity' => 'critical',
                'assetId' => '1',
                'assetName' => 'Company Website',
                'cvssScore' => 9.8,
                'cveReference' => 'CVE-2024-1234',
                'exploitability' => 'high',
                'status' => 'open',
                'discovered' => date('c'),
                'description' => 'SQL injection vulnerability in login endpoint',
                'remediation' => 'Use parameterized queries and input validation',
                'affectedComponent' => '/api/auth/login',
                'assignedTo' => 'Security Team',
                'impact' => [
                    'availability' => 'high',
                    'confidentiality' => 'high',
                    'integrity' => 'high'
                ]
            ]
        ]);
        break;

    case '/api/vulnerabilities/scans':
        echo json_encode([
            [
                'id' => 'scan-1',
                'name' => 'Weekly Security Scan',
                'status' => 'completed',
                'progress' => 100,
                'startTime' => date('c', strtotime('-2 hours')),
                'endTime' => date('c', strtotime('-1 hour')),
                'assetsScanned' => 15,
                'vulnerabilitiesFound' => 12,
                'scanType' => 'Standard'
            ]
        ]);
        break;

    case '/api/vault/files':
        echo json_encode([]);
        break;

    case '/api/vault/folders':
        echo json_encode([]);
        break;

    case '/api/vault/stats':
        echo json_encode([
            'totalFiles' => 0,
            'totalSize' => 0,
            'storageUsed' => 0,
            'storageLimit' => 1000000000
        ]);
        break;

    case '/api/vault/settings':
        echo json_encode([
            'enableVirusScanning' => true,
            'enableVersionControl' => true,
            'watermarkDownloads' => false,
            'requireMFA' => false
        ]);
        break;

    case '/api/monitoring/health':
        echo json_encode([
            'laravel' => true,
            'database' => true,
            'cache' => true,
            'queue' => true,
            'last_updated' => date('c')
        ]);
        break;

    case '/api/monitoring/system-metrics':
        echo json_encode([
            'cpu_usage' => rand(10, 90),
            'memory_usage' => rand(30, 80),
            'disk_usage' => rand(40, 75),
            'network_traffic' => rand(100, 1000)
        ]);
        break;

    case '/api/monitoring/alerts':
        echo json_encode([]);
        break;

    case '/api/popia':
        echo json_encode([]);
        break;

    default:
        // Handle vulnerability updates with dynamic IDs
        if (preg_match('/^\/api\/vulnerabilities\/(\d+)$/', $uri, $matches) && $method === 'PUT') {
            $input = json_decode(file_get_contents('php://input'), true);
            echo json_encode([
                'id' => $matches[1],
                'status' => $input['status'] ?? 'open',
                'updatedAt' => date('c')
            ]);
        } elseif ($uri === '/api/vulnerabilities/scan' && $method === 'POST') {
            $input = json_decode(file_get_contents('php://input'), true);
            echo json_encode([
                'id' => uniqid(),
                'name' => ucfirst($input['scanType'] ?? 'Standard') . ' Security Scan',
                'status' => 'running',
                'progress' => 0,
                'startTime' => date('c'),
                'assetsScanned' => count($input['assetIds'] ?? []),
                'vulnerabilitiesFound' => 0,
                'scanType' => $input['scanType'] ?? 'standard'
            ]);
        } else {
            http_response_code(404);
            echo json_encode(['error' => 'Endpoint not found']);
        }
        break;
}