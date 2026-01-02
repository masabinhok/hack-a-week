# Components Documentation

This document provides detailed documentation for all React components in the Setu frontend.

## Table of Contents

- [UI Components](#ui-components)
- [Shared Components](#shared-components)
- [Home Page Components](#home-page-components)
- [Service Page Components](#service-page-components)
- [Layout Components](#layout-components)

---

## UI Components

Base UI components built with Radix UI primitives and styled with Tailwind CSS.

### Button

A customizable button component with multiple variants.

**Location:** `components/ui/button.tsx`

```tsx
import { Button } from "@/components/ui/button";
```

**Props:**
| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `variant` | `"default" \| "secondary" \| "outline" \| "ghost" \| "link" \| "destructive"` | `"default"` | Button style variant |
| `size` | `"sm" \| "default" \| "lg" \| "icon"` | `"default"` | Button size |
| `asChild` | `boolean` | `false` | Render as child element (for Link) |

**Example:**
```tsx
<Button variant="default" size="lg">
  Click Me
</Button>

<Button asChild variant="outline">
  <Link href="/services">View Services</Link>
</Button>
```

---

### Card

Container component for content sections.

**Location:** `components/ui/card.tsx`

```tsx
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
```

**Example:**
```tsx
<Card>
  <CardHeader>
    <CardTitle>Service Name</CardTitle>
    <CardDescription>Brief description</CardDescription>
  </CardHeader>
  <CardContent>
    Main content here
  </CardContent>
  <CardFooter>
    <Button>Apply Now</Button>
  </CardFooter>
</Card>
```

---

### Badge

Inline status indicator.

**Location:** `components/ui/badge.tsx`

```tsx
import { Badge } from "@/components/ui/badge";
```

**Props:**
| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `variant` | `"default" \| "secondary" \| "outline" \| "destructive"` | `"default"` | Badge style |

**Example:**
```tsx
<Badge>New</Badge>
<Badge variant="secondary">Popular</Badge>
<Badge variant="outline">Online Available</Badge>
```

---

### Input

Form input component.

**Location:** `components/ui/input.tsx`

```tsx
import { Input } from "@/components/ui/input";
```

**Example:**
```tsx
<Input 
  type="text" 
  placeholder="Search services..." 
  className="pl-10"
/>
```

---

### Accordion

Expandable content sections.

**Location:** `components/ui/accordion.tsx`

```tsx
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from "@/components/ui/accordion";
```

**Example:**
```tsx
<Accordion type="single" collapsible>
  <AccordionItem value="item-1">
    <AccordionTrigger>What is Setu?</AccordionTrigger>
    <AccordionContent>
      Setu is a guide to government services in Nepal.
    </AccordionContent>
  </AccordionItem>
</Accordion>
```

---

### Skeleton

Loading placeholder component.

**Location:** `components/ui/skeleton.tsx`

```tsx
import { Skeleton } from "@/components/ui/skeleton";
```

**Example:**
```tsx
<Skeleton className="h-4 w-[200px]" />
<Skeleton className="h-12 w-full rounded-xl" />
```

---

## Shared Components

Reusable functional components used across multiple pages.

### LocationSelector

Cascading dropdown for location selection (Province → District → Municipality → Ward).

**Location:** `components/shared/LocationSelector.tsx`

```tsx
import { LocationSelector } from "@/components/shared";
```

**Props:**
| Prop | Type | Required | Description |
|------|------|----------|-------------|
| `provinces` | `Province[]` | Yes | Array of provinces to display |
| `onSelectionChange` | `(selection: LocationSelection) => void` | No | Callback when selection changes |
| `defaultSelection` | `LocationSelection` | No | Initial selection values |
| `showWard` | `boolean` | No | Whether to show ward selector |
| `className` | `string` | No | Additional CSS classes |

**Example:**
```tsx
<LocationSelector
  provinces={provinces}
  onSelectionChange={(selection) => {
    console.log(selection.province, selection.district);
  }}
  showWard={true}
/>
```

---

### BreadcrumbTrail

Navigation breadcrumb component.

**Location:** `components/shared/BreadcrumbTrail.tsx`

```tsx
import { BreadcrumbTrail } from "@/components/shared";
```

**Props:**
| Prop | Type | Required | Description |
|------|------|----------|-------------|
| `items` | `Array<{ label: string; href: string }>` | Yes | Breadcrumb items |
| `className` | `string` | No | Additional CSS classes |

**Example:**
```tsx
<BreadcrumbTrail
  items={[
    { label: "Home", href: "/" },
    { label: "Services", href: "/services" },
    { label: "Citizenship", href: "/services/citizenship" },
  ]}
/>
```

---

### SearchBar

Search input with debounced suggestions.

**Location:** `components/shared/SearchBar.tsx`

```tsx
import { SearchBar } from "@/components/shared";
```

**Props:**
| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `placeholder` | `string` | `"Search services..."` | Input placeholder |
| `onSearch` | `(query: string) => void` | - | Search callback |
| `showSuggestions` | `boolean` | `true` | Show autocomplete |
| `className` | `string` | - | Additional CSS classes |

---

### PriorityBadge

Badge showing service priority level.

**Location:** `components/shared/PriorityBadge.tsx`

```tsx
import { PriorityBadge } from "@/components/shared";
```

**Props:**
| Prop | Type | Required | Description |
|------|------|----------|-------------|
| `priority` | `"essential" \| "common" \| "specialized"` | Yes | Priority level |
| `size` | `"sm" \| "default"` | No | Badge size |

**Example:**
```tsx
<PriorityBadge priority="essential" />
<PriorityBadge priority="common" size="sm" />
```

---

### OfficeTypeBadge

Badge showing office type.

**Location:** `components/shared/OfficeTypeBadge.tsx`

```tsx
import { OfficeTypeBadge } from "@/components/shared";
```

**Props:**
| Prop | Type | Required | Description |
|------|------|----------|-------------|
| `type` | `string` | Yes | Office type slug |

---

### CategoryIcon

Dynamic icon based on category slug.

**Location:** `components/shared/CategoryIcon.tsx`

```tsx
import { CategoryIcon } from "@/components/shared";
```

**Props:**
| Prop | Type | Required | Description |
|------|------|----------|-------------|
| `categorySlug` | `string` | Yes | Category slug for icon lookup |
| `className` | `string` | No | CSS classes for sizing |

**Example:**
```tsx
<CategoryIcon categorySlug="citizenship" className="w-6 h-6" />
```

---

## Home Page Components

Components specifically for the homepage.

### Hero

Hero section with search bar and call-to-action.

**Location:** `components/home/Hero.tsx`

```tsx
import { Hero } from "@/components/home";
```

No props required - self-contained component.

---

### CategoryGrid

Grid display of service categories.

**Location:** `components/home/CategoryGrid.tsx`

```tsx
import { CategoryGrid } from "@/components/home";
```

**Props:**
| Prop | Type | Required | Description |
|------|------|----------|-------------|
| `categories` | `Category[]` | Yes | Categories to display |

---

### PopularServices

Showcase of popular services.

**Location:** `components/home/PopularServices.tsx`

```tsx
import { PopularServices } from "@/components/home";
```

**Props:**
| Prop | Type | Required | Description |
|------|------|----------|-------------|
| `services` | `Service[]` | Yes | Services to display (max 6) |

---

### HowItWorks

Three-step process explanation.

**Location:** `components/home/HowItWorks.tsx`

No props required.

---

### Stats

Platform statistics with animated counters.

**Location:** `components/home/Stats.tsx`

No props required - uses intersection observer for animation trigger.

---

## Service Page Components

Components for service detail pages.

### StepTimeline

Step-by-step procedure timeline with expandable steps.

**Location:** `components/services/StepTimeline.tsx`

```tsx
import { StepTimeline } from "@/components/services";
```

**Props:**
| Prop | Type | Required | Description |
|------|------|----------|-------------|
| `steps` | `ServiceStep[]` | Yes | Steps to display |
| `className` | `string` | No | Additional CSS classes |

**Features:**
- Expandable/collapsible steps
- Documents list per step
- Fees breakdown with totals
- Time estimates
- Authority information
- Notes and warnings

---

### ServiceSidebar

Sidebar with quick info and related offices.

**Location:** `components/services/ServiceSidebar.tsx`

```tsx
import { ServiceSidebar } from "@/components/services";
```

**Props:**
| Prop | Type | Required | Description |
|------|------|----------|-------------|
| `service` | `Service` | Yes | Service data |
| `offices` | `Office[]` | No | Related offices |
| `className` | `string` | No | Additional CSS classes |

---

## Layout Components

### Header

Site header with navigation and mobile menu.

**Location:** `components/Header.tsx`

**Features:**
- Responsive navigation
- Mobile hamburger menu
- Search modal
- Language toggle (EN/NE)
- Scroll-aware styling

---

### Footer

Site footer with links and information.

**Location:** `components/Footer.tsx`

**Features:**
- Four-column layout
- Contact information
- Social links
- Government disclaimer
- Nepal blue theme

---

## Importing Components

All components can be imported from their barrel exports:

```tsx
// UI Components
import { Button, Card, Badge, Input } from "@/components/ui";

// Shared Components
import { LocationSelector, BreadcrumbTrail, SearchBar } from "@/components/shared";

// Home Components
import { Hero, CategoryGrid, PopularServices } from "@/components/home";

// Service Components
import { StepTimeline, ServiceSidebar } from "@/components/services";
```
