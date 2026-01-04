# Setu - Government Service Navigator

A digital platform that simplifies access to government services in Nepal by providing citizens with comprehensive, step-by-step guidance for essential processes like National ID registration, business incorporation, and citizenship certificates.

## Overview

Setu consolidates critical information including required documents, fees, timelines, office locations, and responsible authorities into an organized, searchable database. By eliminating confusion and reducing the need for multiple office visits, the platform empowers citizens to navigate bureaucratic procedures confidently and efficiently by providing exact details of the offices they need to visit.

## Technical Architecture

### Backend
- NestJS REST API
- PostgreSQL database with Prisma ORM
- Modular architecture for services, offices, and locations

### Frontend
- Next.js client application for public users
- Separate Next.js admin panel for content management
- Responsive design for mobile and desktop access

### Infrastructure
- Docker containerization for development.
## Project Structure

```
setu/
├── api/                    # NestJS Backend
│   ├── src/
│   │   ├── modules/       # API modules
│   │   └── generated/     # Prisma client
│   └── prisma/            # Schema and migrations
├── client/                # Next.js Public Frontend
└── admin/                 # Next.js Admin Panel
```

## Current Status

This is an MVP (Minimum Viable Product) developed during the Hack-a-week hackathon. The platform demonstrates core functionality for service discovery and office location guidance.

### Key Features
- Hierarchical service organization with step-by-step procedures
- Location-based office finder (province, district, municipality, ward)
- Service detail pages with required documents and fee information
- Administrative interface for content management

## Development Setup

### Prerequisites
- Node.js 18+
- Docker and Docker Compose
- PostgreSQL 16+

### Quick Start

```bash
# Clone repository
git clone https://github.com/masabinhok/hack-a-week.git
cd setu

# Start Docker containers
docker compose up -d

# Backend setup
cd api
npm install
cp .env.example .env
npx prisma migrate dev
npx prisma db seed

# Frontend setup
cd ../client
npm install
cp .env.example .env
npm run dev

# Admin panel setup
cd ../admin
npm install
cp .env.example .env
npm run dev
```

## Data Management Strategy

Government service data collection presents significant challenges. Our approach:

1. Associate an admin user with each government office in the database
2. Provide office administrators with credentials to update their information
3. Enable offices to manage service details, including nested procedural steps
4. Decentralize data maintenance to ensure accuracy and timeliness

## Future Enhancements

### Short-term Improvements
- Add kotha number (file reference number) details for each service step
- Redesign database schema to handle edge cases and complex service hierarchies
- Improve data quality validation and consistency checks

### Long-term Vision
- Integration with existing government online portals
- SMS notifications for service updates and requirements
- Multi-language support (Nepali and English)
- Mobile applications for iOS and Android
- Appointment booking system for government offices
- Document checklist generator for printable guides

## Vision Statement

This project represents the seed of an idea that could transform how Nepali citizens interact with government services. With proper mentorship from professionals experienced in e-governance, this platform has the potential to significantly reduce bureaucratic barriers and improve access to essential services across Nepal.

## Team

**Hack-a-week Hackathon Project**

- Sabin Shrestha ([@masabinhok](https://github.com/masabinhok))
- Rhythm Adhikari ([@rhythmadhikari](https://github.com/rhythmadhikari))

## License

MIT License

***

Made for Nepal