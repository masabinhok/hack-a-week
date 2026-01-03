# Setu API

**सेतु** - Your bridge to Nepal government services

A comprehensive REST API providing information about Nepal government services, including step-by-step procedures, required documents, fees, and office locations.

## 🎯 Overview

Setu API helps citizens navigate Nepal's government bureaucracy by providing:

- **📋 Service Guides**: Step-by-step procedures for government services
- **📄 Document Requirements**: What you need to bring
- **💰 Fee Information**: Government fees for each service
- **🏢 Office Locations**: Where to go (ward, municipality, district, province)
- **📍 Location Data**: Complete Nepal administrative hierarchy

## 🚀 Quick Start

### Prerequisites

- Node.js 22.x
- PostgreSQL 15+
- npm or pnpm

### Installation

```bash
# Clone repository
git clone <repo-url>
cd api

# Install dependencies
npm install

# Setup environment
cp .env.example .env
# Edit .env with your database credentials

# Generate Prisma client
npx prisma generate

# Run migrations
npx prisma migrate dev

# Seed database
npx prisma db seed

# Start development server
npm run start:dev
```

### API Base URL

```
http://localhost:8080/api/v1
```

## 📚 API Endpoints

### Categories

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/categories` | List all service categories |
| GET | `/categories/:slug` | Get category details |
| GET | `/categories/:slug/services` | Get services in category |

### Services

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/services` | List root services |
| GET | `/services/search?q=keyword` | Search services |
| GET | `/services/:slug` | Get service with children |
| GET | `/services/:slug/guide` | Get full service guide |
| GET | `/services/:slug/breadcrumb` | Get navigation breadcrumb |

### Offices

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/offices/types` | List office types |
| GET | `/offices/categories` | List office categories |
| GET | `/offices/search?q=keyword` | Search offices |
| GET | `/offices/by-location?locationCode=...` | Get offices by location |
| GET | `/offices/by-type?officeType=...` | Get offices by type |
| GET | `/offices/:id` | Get office details |

### Locations

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/locations/provinces` | List provinces |
| GET | `/locations/provinces/:id/districts` | Districts in province |
| GET | `/locations/districts/:id/municipalities` | Municipalities in district |
| GET | `/locations/municipalities/:id/wards` | Wards in municipality |

## 🏗️ Project Structure

```
api/
├── prisma/
│   ├── schema.prisma     # Database schema
│   ├── data/             # Seed data (JSON)
│   └── seeders/          # Seeder functions
├── src/
│   ├── categories/       # Categories module
│   ├── services/         # Services module
│   ├── offices/          # Offices module
│   ├── locations/        # Locations module
│   ├── prisma/           # Prisma module
│   └── common/           # Shared utilities
└── docs/                 # Documentation
```

## 📖 Documentation

- [API Documentation](docs/API_DOCUMENTATION.md) - Full API reference
- [Architecture](docs/ARCHITECTURE.md) - System design
- [Seeding Guide](docs/SEEDING_GUIDE.md) - Database seeding
- [Codebase Analysis](docs/CODEBASE_ANALYSIS.md) - Technical analysis

## 🗄️ Database Schema

Key entities:
- **Service**: Hierarchical services (self-referential parent-child)
- **ServiceStep**: Steps for completing a service
- **DocumentRequired**: Required documents per step
- **Fee**: Government fees
- **Office**: Government offices with jurisdiction mappings
- **Province/District/Municipality/Ward**: Nepal administrative divisions

## 📍 Location Code System

Location codes follow format: `P-DD-MMM-WWWW`

- P: Province (1-7)
- DD: District (01-77)
- MMM: Municipality (001-753)
- WWWW: Ward (0001-9999)

Example: `3-27-001-0005` = Kathmandu Metropolitan City, Ward 5

## 🛠️ Development

```bash
# Run in watch mode
npm run start:dev

# Run tests
npm run test

# Lint code
npm run lint

# Format code
npm run format

# Prisma studio (database GUI)
npx prisma studio
```

## 📊 Data Sources

Service information is compiled from official Nepal government sources:
- Nepal Law Commission
- Ministry websites
- Official government service charters

## 🤝 Contributing

1. Fork the repository
2. Create feature branch: `git checkout -b feature/new-feature`
3. Commit changes: `git commit -m 'Add new feature'`
4. Push to branch: `git push origin feature/new-feature`
5. Submit pull request

## 📄 License

[MIT](LICENSE)

## 🙏 Acknowledgments

- NestJS framework
- Prisma ORM
- Nepal government service documentation
