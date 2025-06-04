# ShieldDesk

<div align="center">
  <img src="./generated-icon.png" alt="ShieldDesk Logo" width="120" height="120">
  <h3>Enterprise Cybersecurity Compliance Platform</h3>
  <p>Intelligent security management through advanced vulnerability tracking and proactive threat intelligence</p>
</div>

## 🚀 Overview

ShieldDesk is a comprehensive cybersecurity compliance and file management platform designed for enterprise environments. It provides secure document management, compliance tracking, vulnerability scanning, and real-time security monitoring with a modern, high-performance interface.

### Key Features

- **🔒 Secure File Vault** - Enterprise-grade document management with role-based access controls
- **📊 Compliance Dashboard** - POPIA compliance tracking with automated checklist management
- **🛡️ Vulnerability Scanner** - Real-time security assessment and threat detection
- **📈 Security Monitoring** - Continuous monitoring with advanced analytics and reporting
- **👥 User Management** - Multi-tenant architecture with granular permissions
- **🎯 Admin Panel** - Comprehensive client and organization management
- **⚡ Performance Optimized** - Advanced caching, lazy loading, and service worker implementation

## 🏗️ Architecture

### Frontend Stack
- **React 18** with TypeScript
- **Tailwind CSS** with custom cybersecurity theme
- **Three.js** for advanced 3D backgrounds
- **Recharts** for data visualization
- **TanStack Query** for state management and caching
- **Wouter** for routing
- **Radix UI** components with shadcn/ui

### Backend Stack
- **Node.js/Express** with TypeScript
- **PHP/Laravel** backend services
- **PostgreSQL** database
- **Drizzle ORM** for database operations
- **Vite** development server

### Performance Features
- Service Worker for offline support
- Advanced caching strategies (memory, API, static)
- Virtual scrolling for large datasets
- Lazy loading for images and components
- Debounced search with 300ms delay
- Compression middleware
- Rate limiting

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ and npm
- PHP 8.2+
- PostgreSQL database
- Git

### Installation

1. **Clone the repository**
```bash
git clone <repository-url>
cd shielddesk
```

2. **Install dependencies**
```bash
npm install
```

3. **Environment Setup**
```bash
cp .env.example .env
```

4. **Database Setup**
```bash
# Set your DATABASE_URL in .env
npm run db:push
```

5. **Start Development Server**
```bash
npm run dev
```

The application will be available at `http://localhost:5000`

## 🔧 Development

### Project Structure

```
shielddesk/
├── client/                    # React frontend
│   ├── src/
│   │   ├── components/        # Reusable UI components
│   │   ├── pages/            # Page components
│   │   ├── hooks/            # Custom React hooks
│   │   ├── lib/              # Utilities and configurations
│   │   └── styles/           # CSS and SCSS files
│   └── public/               # Static assets
├── server/                   # Backend services
│   ├── api/                  # API endpoints
│   ├── middleware/           # Express middleware
│   └── cache.js             # Caching system
├── laravel-backend/          # PHP Laravel services
├── shared/                   # Shared types and schemas
└── public/                   # Public assets and service worker
```

### Available Scripts

```bash
# Development
npm run dev              # Start development server
npm run build           # Build for production
npm run start           # Start production server

# Database
npm run db:push         # Push schema changes to database

# Testing
npm run test            # Run test suite
npm run test:e2e        # Run end-to-end tests

# Code Quality
npm run check           # TypeScript type checking
npm run lint            # Run ESLint
npm run format          # Format code with Prettier
```

### Key Development Files

- `vite.config.ts` - Vite configuration with optimization settings
- `tailwind.config.ts` - Tailwind CSS configuration
- `client/src/lib/queryClient.ts` - TanStack Query configuration
- `client/src/lib/performance.ts` - Performance optimization utilities
- `server/cache.js` - Advanced caching implementation
- `shared/schema.ts` - Database schema definitions

## 🎨 UI/UX Features

### Design System
- **Color Scheme**: Strictly red and black with white text
- **Theme**: High-tech cybersecurity aesthetic
- **Components**: Glass morphism cards with cyber borders
- **Animations**: GSAP-powered smooth transitions
- **Responsive**: Mobile-first design approach

### Interactive Elements
- Drag-and-drop file upload
- Real-time search and filtering
- Virtual scrolling for performance
- Lazy-loaded images and components
- Interactive 3D backgrounds

## 📊 Performance Optimizations

### Caching Strategy
- **Memory Cache**: In-memory storage for frequently accessed data
- **API Cache**: Intelligent API response caching with TTL
- **Service Worker**: Offline support and background caching
- **Query Cache**: Optimized TanStack Query configuration

### Loading Optimizations
- Code splitting with dynamic imports
- Lazy loading for heavy components
- Image optimization with progressive loading
- Bundle optimization with manual chunks

### Monitoring
- Real-time performance metrics
- Cache hit/miss tracking
- Memory usage monitoring
- Network status detection

## 🔐 Security Features

### Authentication & Authorization
- Firebase Authentication integration
- Role-based access control (RBAC)
- Multi-tenant security isolation
- Session management with secure cookies

### File Security
- Encrypted file storage
- Virus scanning integration
- Access logging and audit trails
- Compliance-ready document management

### API Security
- Rate limiting middleware
- Input validation with Zod schemas
- CORS protection
- Security headers implementation

## 🗄️ Database Schema

### Core Entities
- **Users**: Authentication and profile management
- **Companies**: Multi-tenant organization structure
- **Files**: Secure document storage with metadata
- **Folders**: Hierarchical organization system
- **Compliance**: POPIA and other compliance tracking

### Migration Management
```bash
# Apply schema changes
npm run db:push

# Note: Manual SQL migrations are not recommended
# Use Drizzle schema updates instead
```

## 🔄 API Documentation

### Core Endpoints

#### Authentication
```
POST /api/auth/login        # User login
POST /api/auth/register     # User registration
POST /api/auth/logout       # User logout
GET  /api/auth/me          # Current user profile
```

#### File Vault
```
GET    /api/vault/stats     # Vault statistics
GET    /api/vault/files     # List files
POST   /api/vault/upload    # Upload files
DELETE /api/vault/files/:id # Delete file
GET    /api/vault/folders   # List folders
POST   /api/vault/folders   # Create folder
```

#### Compliance
```
GET  /api/compliance/popia     # POPIA checklist
POST /api/compliance/update    # Update compliance item
GET  /api/compliance/reports   # Generate reports
```

#### Vulnerability Scanner
```
POST /api/vulnerability/scan   # Start security scan
GET  /api/vulnerability/results # Get scan results
GET  /api/vulnerability/history # Scan history
```

## 🚀 Deployment

### Production Build
```bash
# Build the application
npm run build

# Start production server
npm run start
```

### Environment Variables

Required environment variables:

```bash
# Database
DATABASE_URL=postgresql://user:password@localhost:5432/shielddesk
PGHOST=localhost
PGPORT=5432
PGUSER=postgres
PGPASSWORD=password
PGDATABASE=shielddesk

# Application
NODE_ENV=production
PORT=5000

# Optional: Firebase Authentication
VITE_FIREBASE_API_KEY=your_api_key
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_APP_ID=your_app_id
```

### Docker Deployment (Optional)
```bash
# Build and run with Docker
docker build -t shielddesk .
docker run -p 5000:5000 shielddesk
```

## 🧪 Testing

### Unit Tests
```bash
npm run test              # Run all tests
npm run test:watch        # Watch mode
npm run test:coverage     # Coverage report
```

### E2E Tests
```bash
npm run test:e2e          # Run Playwright tests
npm run test:e2e:ui       # Interactive test runner
```

### Test Structure
- `tests/unit/` - Component and utility tests
- `tests/e2e/` - End-to-end browser tests
- `tests/setup.ts` - Test configuration

## 🤝 Contributing

### Development Workflow
1. Fork the repository
2. Create a feature branch: `git checkout -b feature/new-feature`
3. Make changes and add tests
4. Run the test suite: `npm run test`
5. Commit changes: `git commit -m "Add new feature"`
6. Push to branch: `git push origin feature/new-feature`
7. Submit a pull request

### Code Standards
- TypeScript for type safety
- ESLint and Prettier for code formatting
- Conventional commits for version control
- Component-driven development approach

## 📋 Browser Support

- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

## 🐛 Troubleshooting

### Common Issues

**Service Worker Registration Fails**
- Ensure HTTPS in production
- Check service worker file path
- Verify browser compatibility

**Database Connection Issues**
- Verify DATABASE_URL format
- Check PostgreSQL service status
- Ensure proper credentials

**Build Failures**
- Clear node_modules: `rm -rf node_modules && npm install`
- Update dependencies: `npm update`
- Check TypeScript errors: `npm run check`

**Performance Issues**
- Monitor cache statistics via Performance Monitor
- Check network tab for large assets
- Verify service worker is active

### Getting Help

1. Check the troubleshooting section above
2. Review browser console for errors
3. Check server logs for backend issues
4. Open an issue with detailed reproduction steps

## 📄 License

This project is licensed under the MIT License. See the LICENSE file for details.

## 🔗 Links

- [Documentation](./docs/)
- [API Reference](./docs/api.md)
- [Contributing Guide](./CONTRIBUTING.md)
- [Changelog](./CHANGELOG.md)

---

<div align="center">
  <p>Built with ❤️ for enterprise cybersecurity</p>
  <p>© 2024 ShieldDesk. All rights reserved.</p>
</div>
