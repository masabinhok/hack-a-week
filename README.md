# Setu - Nepal Government Services Platform

> Simplifying access to government services for Nepali citizens through a comprehensive digital service directory and location-based office finder.


## 📁 Project Structure

```
setu/
├── api/                          # NestJS Backend
│   ├── src/
│   │   ├── modules/
│   │   │   ├── services/         # Service-related endpoints
│   │   │   ├── offices/          # Office-related endpoints
│   │   │   ├── locations/        # Location hierarchy endpoints
│   │   │   └── users/            # User management (future)
│   │   ├── generated/
│   │   │   └── prisma/           # Generated Prisma Client
│   │   └── main.ts
│   ├── prisma/
│   │   ├── schema.prisma         # Database schema
│   │   ├── migrations/           # Database migrations
│   │   └── seed.ts               # Seed data scripts
│   ├── Dockerfile
│   └── package.json
│
├── client/                       # Next.js Frontend
│   ├── app/
│   │   ├── (routes)/
│   │   │   ├── services/         # Service browsing pages
│   │   │   ├── service/[slug]/   # Individual service page
│   │   │   ├── guide/[id]/       # Detailed guide page
│   │   │   └── offices/          # Office finder page
│   │   ├── components/           # Reusable components
│   │   └── layout.tsx
│   ├── Dockerfile
│   └── package.json
│
├── docker-compose.yml            # Multi-container orchestration
├── .env                          # Environment variables
├── .gitignore
└── README.md
```

***

## 🗺️ Roadmap

### Phase 1: MVP - Core Functionality (Current)
- [x] Database schema design
- [x] Docker setup for development environment
- [ ] Seed hierarchical location data (provinces, districts, municipalities, wards)
- [ ] Seed sample services, sub-services, and procedural steps
- [ ] NestJS API development
  - [ ] Service browsing endpoints
  - [ ] Sub-service detail endpoints
  - [ ] Location-based office query endpoints
- [ ] Next.js frontend development
  - [ ] Service listing and navigation
  - [ ] Step-by-step guide display
  - [ ] Office finder with location selection
- [ ] Basic responsive UI/UX

### Phase 2: Enhanced Features 
- [ ] User authentication (phone/email)
- [ ] User location preferences (save home location)
- [ ] Service bookmarking system
- [ ] Search functionality (service/office search)
- [ ] Advanced filtering (by category, priority, online availability)
- [ ] Office ratings and reviews
- [ ] Multi-language support (Nepali/English toggle)

### Phase 3: Community & Admin 
- [ ] Admin panel for service management
- [ ] Office staff dashboard (update working hours, contact info)
- [ ] User feedback and review moderation
- [ ] Service update notifications
- [ ] Analytics dashboard (popular services, office traffic)
- [ ] Public API for third-party integrations

### Phase 4: Advanced Features 
- [ ] SMS notifications for service updates
- [ ] Integration with government online portals
- [ ] Document checklist generator (printable)
- [ ] Estimated wait times at offices
- [ ] Appointment booking system
- [ ] Mobile applications (iOS/Android)
- [ ] Chatbot for service recommendations

***

## Getting Started

### Prerequisites
- Node.js 18+ and npm/yarn
- Docker and Docker Compose
- PostgreSQL 16+ (via Docker)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/masabinhok/hack-a-week.git
   cd setu
   ```

2. **Set up environment variables**
   ```bash
   cp .env.example .env
   # Edit .env with your database credentials
   ```

3. **Start Docker containers**
   ```bash
   docker compose up -d
   ```

4. **Install dependencies**
   ```bash
   # Backend
   cd api
   npm install

   cp .env.example .env
   # Edit .env with your backend envs
   
   # Frontend
   cd ../client
   npm install

   cp .env.example .env
   # Edit .env with your frontend envs
   ```

5. **Run database migrations and seed**
   ```bash
   cd api
   npx prisma migrate dev --name init
   npx prisma db seed
   ```

6. **Start development servers**
   ```bash
   # Backend (runs on http://localhost:8080/api/v1)
   cd api
   npm run start:dev
   
   # Frontend (runs on http://localhost:3000)
   cd client
   npm run dev
   ```

### Docker Development Workflow

```bash
# Start all services
docker compose up -d

# View logs
docker compose logs -f

# Stop all services
docker compose down

# Reset database
docker compose down -v
npx prisma migrate reset
```

***

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🏆 Hackathon

**Setu** was created for **Hack-a-week** hackathon.

**Team:**
- [Sabin Shrestha (@masabinhok)](https://github.com/masabinhok)
- [Rhythm Adhikari](https://github.com/rhythmadhikari) <!-- Add Rhythm's GitHub if available -->

---

**Made with ❤️ for Nepal** 🇳🇵