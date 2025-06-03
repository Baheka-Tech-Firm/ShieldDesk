# ShieldDesk: Node.js to PHP/Laravel Migration Guide

## Overview
This guide provides a complete roadmap for migrating the ShieldDesk cybersecurity compliance platform from Node.js/Express to PHP/Laravel while maintaining the React frontend.

## Current Architecture
- **Frontend**: React with TypeScript, Vite, TailwindCSS
- **Backend**: Node.js with Express, Drizzle ORM
- **Database**: PostgreSQL
- **Authentication**: Firebase (planned)

## Target Architecture
- **Frontend**: React (unchanged)
- **Backend**: PHP 8.2 with Laravel 12
- **Database**: PostgreSQL (unchanged)
- **Authentication**: Laravel Sanctum + Firebase

## Migration Steps

### 1. Backend Structure Setup

#### Models Created
```
backend/app/Models/
├── Company.php          # Company management
├── User.php            # User authentication & roles
├── RiskAssessment.php  # Security risk scoring
├── File.php            # Encrypted file storage
├── PopiaItem.php       # POPIA compliance items
├── ActivityLog.php     # Audit trail
└── Notification.php    # User notifications
```

#### Controllers Created
```
backend/app/Http/Controllers/
├── DashboardController.php    # Dashboard data aggregation
├── FileController.php         # File upload/download/delete
├── ComplianceController.php   # POPIA compliance management
├── UserController.php         # User management & invitations
└── AssessmentController.php   # Risk assessment processing
```

### 2. Database Schema

#### Companies Table
```sql
CREATE TABLE companies (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    industry VARCHAR(255),
    size VARCHAR(255),
    country VARCHAR(255),
    created_at TIMESTAMP,
    updated_at TIMESTAMP
);
```

#### Users Table
```sql
CREATE TABLE users (
    id BIGSERIAL PRIMARY KEY,
    firebase_uid VARCHAR(255) UNIQUE NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    role VARCHAR(255) NOT NULL,
    company_id BIGINT REFERENCES companies(id) ON DELETE CASCADE,
    email_verified_at TIMESTAMP,
    password VARCHAR(255),
    remember_token VARCHAR(100),
    created_at TIMESTAMP,
    updated_at TIMESTAMP
);
```

### 3. API Endpoints Mapping

#### Node.js → Laravel Route Mapping
```
GET  /api/dashboard        → DashboardController@index
GET  /api/files           → FileController@index
POST /api/files/upload    → FileController@store
DELETE /api/files/{id}    → FileController@destroy
GET  /api/popia          → ComplianceController@index
PUT  /api/popia/{id}     → ComplianceController@update
GET  /api/users          → UserController@index
POST /api/users/invite   → UserController@invite
POST /api/assessment     → AssessmentController@store
```

### 4. Laravel Configuration

#### Environment Setup
```env
DB_CONNECTION=pgsql
DB_HOST=${PGHOST}
DB_PORT=${PGPORT}
DB_DATABASE=${PGDATABASE}
DB_USERNAME=${PGUSER}
DB_PASSWORD=${PGPASSWORD}
```

#### CORS Configuration
```php
// config/cors.php
'paths' => ['api/*'],
'allowed_origins' => ['http://localhost:5000'],
'allowed_methods' => ['*'],
'allowed_headers' => ['*'],
```

### 5. Key Features Implementation

#### Role-Based Access Control
```php
// Middleware for role checking
class CheckRole {
    public function handle($request, Closure $next, ...$roles) {
        if (!auth()->user() || !in_array(auth()->user()->role, $roles)) {
            return response()->json(['error' => 'Unauthorized'], 403);
        }
        return $next($request);
    }
}
```

#### File Encryption Service
```php
// app/Services/FileEncryptionService.php
class FileEncryptionService {
    public function encrypt($file) {
        // AES-256 encryption implementation
        $key = config('app.encryption_key');
        $encrypted = openssl_encrypt($file->getContent(), 'AES-256-CBC', $key, 0, $iv);
        return ['data' => $encrypted, 'iv' => $iv];
    }
}
```

#### Risk Assessment Calculator
```php
// app/Services/RiskAssessmentService.php
class RiskAssessmentService {
    public function calculateOverallScore($scores) {
        return round(array_sum($scores) / count($scores));
    }
}
```

### 6. Migration Execution Plan

#### Phase 1: Setup (30 minutes)
1. Complete Laravel dependencies installation
2. Configure PostgreSQL connection
3. Run migrations to create tables
4. Set up authentication middleware

#### Phase 2: API Implementation (45 minutes)
1. Implement dashboard controller with data aggregation
2. Create file upload/management endpoints
3. Build compliance tracking system
4. Add user management functionality

#### Phase 3: Integration (30 minutes)
1. Update React frontend API calls to Laravel endpoints
2. Configure CORS for cross-origin requests
3. Test all existing functionality
4. Verify role-based access controls

#### Phase 4: Testing & Optimization (15 minutes)
1. Performance testing with connection pooling
2. Security validation
3. Error handling verification
4. Documentation updates

### 7. Benefits of Laravel Migration

#### Performance Improvements
- Built-in connection pooling
- Efficient ORM with lazy loading
- Query optimization tools
- Caching mechanisms

#### Security Enhancements
- Built-in CSRF protection
- SQL injection prevention
- Input validation
- Rate limiting

#### Maintenance Benefits
- Structured MVC architecture
- Built-in testing framework
- Artisan command-line tools
- Package ecosystem

### 8. Deployment Configuration

#### Production Setup
```php
// config/database.php
'pgsql' => [
    'driver' => 'pgsql',
    'host' => env('DB_HOST'),
    'port' => env('DB_PORT'),
    'database' => env('DB_DATABASE'),
    'username' => env('DB_USERNAME'),
    'password' => env('DB_PASSWORD'),
    'charset' => 'utf8',
    'prefix' => '',
    'schema' => 'public',
],
```

### 9. Monitoring & Logging
```php
// config/logging.php
'channels' => [
    'shielddesk' => [
        'driver' => 'daily',
        'path' => storage_path('logs/shielddesk.log'),
        'level' => 'info',
        'days' => 14,
    ],
],
```

## Current Status
- Laravel framework installed and configured
- Database models created with relationships
- API controllers structured for all endpoints
- Migration files prepared for database schema
- React frontend remains unchanged and compatible

## Next Steps
1. Complete Composer dependencies installation
2. Run database migrations
3. Implement authentication middleware
4. Update frontend API endpoint URLs
5. Test complete functionality
6. Deploy to production environment

This migration maintains all existing functionality while providing a more robust, scalable backend architecture using PHP/Laravel best practices.