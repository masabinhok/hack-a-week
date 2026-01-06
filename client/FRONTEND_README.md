# Setu - Nepal Government Services Guide - Frontend

A , production-ready Next.js 15+ frontend application for navigating Nepal government services.

## 🚀 Tech Stack

- **Framework:** Next.js 15.1.3 with App Router
- **Language:** TypeScript 5.7.2 (strict mode)
- **Styling:** Tailwind CSS 4 with custom Nepal-themed design system
- **UI Components:** Radix UI primitives
- **Animations:** Framer Motion
- **Icons:** Lucide React
- **Fonts:** Inter (sans-serif) & Merriweather (serif)

## 📁 Project Structure

```
client/
├── app/                      # Next.js App Router pages
│   ├── page.tsx             # Homepage
│   ├── layout.tsx           # Root layout with Header/Footer
│   ├── loading.tsx          # Global loading state
│   ├── error.tsx            # Global error boundary
│   ├── not-found.tsx        # 404 page
│   ├── categories/          # Category listing & detail pages
│   ├── services/            # Service listing & detail pages
│   ├── offices/             # Office finder & detail pages
│   ├── search/              # Search results page
│   ├── about/               # About page
│   └── faq/                 # FAQ page
├── components/
│   ├── ui/                  # Reusable UI components
│   │   ├── button.tsx
│   │   ├── card.tsx
│   │   ├── badge.tsx
│   │   ├── input.tsx
│   │   ├── select.tsx
│   │   ├── accordion.tsx
│   │   ├── tabs.tsx
│   │   ├── skeleton.tsx
│   │   ├── separator.tsx
│   │   ├── dialog.tsx
│   │   └── toast.tsx
│   ├── shared/              # Shared functional components
│   │   ├── LocationSelector.tsx
│   │   ├── BreadcrumbTrail.tsx
│   │   ├── SearchBar.tsx
│   │   ├── PriorityBadge.tsx
│   │   ├── OfficeTypeBadge.tsx
│   │   └── CategoryIcon.tsx
│   ├── home/                # Homepage sections
│   │   ├── Hero.tsx
│   │   ├── CategoryGrid.tsx
│   │   ├── PopularServices.tsx
│   │   ├── HowItWorks.tsx
│   │   └── Stats.tsx
│   ├── services/            # Service page components
│   │   ├── StepTimeline.tsx
│   │   └── ServiceSidebar.tsx
│   ├── Header.tsx           # Site header with navigation
│   └── Footer.tsx           # Site footer
├── lib/
│   ├── types.ts             # TypeScript type definitions
│   ├── api.ts               # API client functions
│   ├── utils.ts             # Utility functions
│   └── constants.ts         # Site configuration & constants
└── public/                  # Static assets
```

## 🎨 Design System

### Colors

The design system uses Nepal flag colors:

| Color | CSS Variable | Hex |
|-------|-------------|-----|
| Nepal Crimson | `--primary-crimson` | #DC143C |
| Nepal Blue | `--primary-blue` | #003893 |

### Typography

- **Headings:** Merriweather (serif) for a formal, trustworthy feel
- **Body:** Inter (sans-serif) for readability
- **Nepali Text:** System fonts with `.nepali-text` class

### Spacing & Layout

- Container max-width: 1280px
- Consistent padding: 1rem (mobile) / 2rem (desktop)
- Section spacing: 4rem / 6rem (mobile/desktop)

## 📱 Pages

### Homepage (`/`)
- Hero section with search
- Category grid
- Popular services
- How it works
- Platform statistics

### Categories (`/categories`)
- Grid of all service categories
- Click to see services in each category

### Category Detail (`/categories/[slug]`)
- List of services in the category
- Sub-services displayed inline

### Services (`/services`)
- All services grouped by category
- Search and filter options

### Service Detail (`/services/[slug]`)
- Step-by-step procedure timeline
- Required documents
- Fees breakdown
- Time estimates
- Responsible authorities
- Related offices sidebar

### Offices (`/offices`)
- Location-based filtering
- Search by office name
- Filter by office type

### Office Detail (`/offices/[id]`)
- Full address with location breakdown
- Contact information
- Working hours
- Services available
- Get directions link

### Search (`/search`)
- Full-text search
- Results with service previews
- Popular search suggestions

### About (`/about`)
- Mission statement
- Team information
- Core values

### FAQ (`/faq`)
- Categorized questions
- Accordion-style answers

## 🔌 API Integration

The frontend connects to a NestJS backend API. Configure the API URL in `.env.local`:

```env
NEXT_PUBLIC_API_URL=http://localhost:8080/api/v1
```

### Available API Functions

```typescript
// Locations
getProvinces()
getDistrictsByProvince(provinceId)
getMunicipalitiesByDistrict(districtId)
getWardsByMunicipality(municipalityId)

// Categories
getCategories()
getCategoryBySlug(slug)
getServicesByCategory(slug)

// Services
getRootServices()
getServiceBySlug(slug)
getServiceGuide(slug)  // Includes steps, documents, fees
searchServices(query)

// Offices
getOffices(params?)
getOfficeById(id)
getOfficesForService(serviceSlug)
```

## 🚀 Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn
- Backend API running on `localhost:8080/api/v1`

### Installation

```bash
# Navigate to client directory
cd client

# Install dependencies
npm install

# Copy environment file
cp .env.example .env.local

# Start development server
npm run dev
```

### Build for Production

```bash
npm run build
npm start
```

## 📋 Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `NEXT_PUBLIC_API_URL` | Backend API base URL | `http://localhost:3000/api/v1` |
| `NEXT_PUBLIC_SITE_URL` | Public site URL | `http://localhost:3001` |
| `NEXT_PUBLIC_GA_ID` | Google Analytics ID | - |

## 🧩 Component Usage

### Button

```tsx
import { Button } from "@/components/ui/button";

<Button variant="default" size="lg">Primary</Button>
<Button variant="outline">Outline</Button>
<Button variant="ghost">Ghost</Button>
```

### Card

```tsx
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

<Card>
  <CardHeader>
    <CardTitle>Title</CardTitle>
  </CardHeader>
  <CardContent>Content</CardContent>
</Card>
```

### Location Selector

```tsx
import { LocationSelector } from "@/components/shared";

<LocationSelector
  provinces={provinces}
  onSelectionChange={(selection) => console.log(selection)}
/>
```

### Step Timeline

```tsx
import { StepTimeline } from "@/components/services";

<StepTimeline steps={service.steps} />
```

## 🎯 Performance

- Server-side rendering for SEO
- Image optimization with Next.js Image
- Font optimization with next/font
- Code splitting by route
- Lazy loading for components

## ♿ Accessibility

- WCAG 2.1 Level AA compliance
- Semantic HTML structure
- ARIA labels where needed
- Keyboard navigation support
- Focus visible states
- Color contrast ratios

## 📄 License

MIT License - See LICENSE file for details.

## 👥 Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Open a Pull Request

---

Built with ❤️ for Nepal 🇳🇵
