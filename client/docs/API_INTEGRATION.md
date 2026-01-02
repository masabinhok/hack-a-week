# API Integration Guide

This document describes how the Setu frontend integrates with the backend API.

## Overview

The frontend communicates with a NestJS backend API running at `http://localhost:8080/api/v1`. All API functions are centralized in `lib/api.ts`.

---

## Configuration

### Environment Variables

```env
# .env.local
NEXT_PUBLIC_API_URL=http://localhost:8080/api/v1
```

### Base Configuration

```typescript
// lib/api.ts
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080/api/v1";

async function fetchApi<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<ApiResponse<T>> {
  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers: {
        "Content-Type": "application/json",
        ...options.headers,
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return { data, error: null };
  } catch (error) {
    return {
      data: null,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}
```

---

## API Endpoints

### Locations

#### Get All Provinces

```typescript
async function getProvinces(): Promise<ApiResponse<Province[]>>
```

**Endpoint:** `GET /locations/provinces`

**Response:**
```json
{
  "data": [
    {
      "id": 1,
      "name": "Province 1",
      "nameNepali": "प्रदेश १",
      "code": "P1"
    }
  ]
}
```

---

#### Get Districts by Province

```typescript
async function getDistrictsByProvince(provinceId: number): Promise<ApiResponse<District[]>>
```

**Endpoint:** `GET /locations/provinces/:provinceId/districts`

**Response:**
```json
{
  "data": [
    {
      "id": 1,
      "name": "Jhapa",
      "nameNepali": "झापा",
      "provinceId": 1
    }
  ]
}
```

---

#### Get Municipalities by District

```typescript
async function getMunicipalitiesByDistrict(districtId: number): Promise<ApiResponse<Municipality[]>>
```

**Endpoint:** `GET /locations/districts/:districtId/municipalities`

---

#### Get Wards by Municipality

```typescript
async function getWardsByMunicipality(municipalityId: number): Promise<ApiResponse<Ward[]>>
```

**Endpoint:** `GET /locations/municipalities/:municipalityId/wards`

---

### Categories

#### Get All Categories

```typescript
async function getCategories(): Promise<ApiResponse<Category[]>>
```

**Endpoint:** `GET /categories`

**Response:**
```json
{
  "data": [
    {
      "id": 1,
      "name": "Citizenship",
      "nameNepali": "नागरिकता",
      "slug": "citizenship",
      "description": "...",
      "icon": "user-check",
      "_count": {
        "services": 5
      }
    }
  ]
}
```

---

#### Get Category by Slug

```typescript
async function getCategoryBySlug(slug: string): Promise<ApiResponse<Category>>
```

**Endpoint:** `GET /categories/:slug`

---

#### Get Services by Category

```typescript
async function getServicesByCategory(categorySlug: string): Promise<ApiResponse<Service[]>>
```

**Endpoint:** `GET /categories/:slug/services`

---

### Services

#### Get Root Services

```typescript
async function getRootServices(): Promise<ApiResponse<Service[]>>
```

**Endpoint:** `GET /services?root=true`

Returns services without parent (top-level services).

---

#### Get Service by Slug

```typescript
async function getServiceBySlug(slug: string): Promise<ApiResponse<Service>>
```

**Endpoint:** `GET /services/:slug`

---

#### Get Service Guide (Full Details)

```typescript
async function getServiceGuide(slug: string): Promise<ApiResponse<Service>>
```

**Endpoint:** `GET /services/:slug/guide`

Returns service with all steps, documents, fees, authorities, and time estimates.

**Response:**
```json
{
  "data": {
    "id": 1,
    "name": "Citizenship by Descent",
    "slug": "citizenship-by-descent",
    "description": "...",
    "priority": "essential",
    "isOnlineAvailable": false,
    "steps": [
      {
        "id": 1,
        "orderIndex": 1,
        "title": "Collect Application Form",
        "description": "...",
        "documents": [
          {
            "id": 1,
            "name": "Birth Certificate",
            "isOriginalRequired": true,
            "copiesRequired": 2
          }
        ],
        "fees": [
          {
            "id": 1,
            "title": "Application Fee",
            "amount": 50
          }
        ],
        "time": {
          "estimatedDuration": "1-2 days",
          "minDays": 1,
          "maxDays": 2
        },
        "authority": {
          "name": "Ward Secretary",
          "designation": "Chief Administrative Officer"
        }
      }
    ],
    "categories": [
      {
        "category": {
          "name": "Citizenship",
          "slug": "citizenship"
        }
      }
    ]
  }
}
```

---

#### Search Services

```typescript
async function searchServices(query: string): Promise<ApiResponse<Service[]>>
```

**Endpoint:** `GET /services/search?q=:query`

---

### Offices

#### Get All Offices

```typescript
async function getOffices(params?: OfficeFilters): Promise<ApiResponse<Office[]>>
```

**Endpoint:** `GET /offices`

**Query Parameters:**
- `provinceId`: Filter by province
- `districtId`: Filter by district
- `municipalityId`: Filter by municipality
- `type`: Filter by office type

---

#### Get Office by ID

```typescript
async function getOfficeById(id: string): Promise<ApiResponse<Office>>
```

**Endpoint:** `GET /offices/:id`

**Response:**
```json
{
  "data": {
    "id": "uuid",
    "name": "Ward Office - Ward 5",
    "nameNepali": "वडा कार्यालय - वडा नं. ५",
    "address": "Main Road",
    "phone": "+977-XXX-XXXXXX",
    "email": "ward5@municipality.gov.np",
    "website": "...",
    "latitude": 27.123,
    "longitude": 85.456,
    "category": {
      "name": "Ward Office",
      "slug": "ward-office"
    },
    "location": {
      "province": { "name": "Province 1" },
      "district": { "name": "Jhapa" },
      "municipality": { "name": "Bhadrapur" },
      "ward": { "number": 5 }
    },
    "workingHours": [
      {
        "day": "Sunday",
        "openTime": "10:00",
        "closeTime": "17:00",
        "isClosed": false
      }
    ],
    "services": [
      {
        "id": 1,
        "name": "Citizenship",
        "slug": "citizenship"
      }
    ]
  }
}
```

---

#### Get Offices for Service

```typescript
async function getOfficesForService(serviceSlug: string): Promise<ApiResponse<Office[]>>
```

**Endpoint:** `GET /services/:slug/offices`

Returns offices that handle the specified service.

---

## Data Types

### Core Types

```typescript
interface Province {
  id: number;
  name: string;
  nameNepali?: string;
  code?: string;
}

interface District {
  id: number;
  name: string;
  nameNepali?: string;
  provinceId: number;
}

interface Municipality {
  id: number;
  name: string;
  nameNepali?: string;
  type: "municipality" | "rural_municipality" | "sub_metropolitan" | "metropolitan";
  districtId: number;
}

interface Ward {
  id: number;
  number: number;
  municipalityId: number;
}

interface Category {
  id: number;
  name: string;
  nameNepali?: string;
  slug: string;
  description?: string;
  icon?: string;
  _count?: {
    services: number;
  };
}

interface Service {
  id: number;
  name: string;
  nameNepali?: string;
  slug: string;
  description?: string;
  priority?: "essential" | "common" | "specialized";
  isOnlineAvailable?: boolean;
  estimatedTime?: string;
  parentId?: number;
  steps?: ServiceStep[];
  categories?: { category: Category }[];
  children?: Service[];
  _count?: {
    steps: number;
  };
}

interface ServiceStep {
  id: number;
  orderIndex: number;
  title: string;
  titleNepali?: string;
  description?: string;
  descriptionNepali?: string;
  notes?: string;
  documents?: StepDocument[];
  fees?: StepFee[];
  time?: StepTime;
  authority?: StepAuthority;
}

interface Office {
  id: string;
  name: string;
  nameNepali?: string;
  address?: string;
  addressNepali?: string;
  phone?: string;
  email?: string;
  website?: string;
  latitude?: number;
  longitude?: number;
  category?: { name: string; slug: string };
  location?: OfficeLocation;
  workingHours?: WorkingHours[];
  services?: Service[];
}
```

---

## Error Handling

All API functions return an `ApiResponse` type:

```typescript
interface ApiResponse<T> {
  data: T | null;
  error: string | null;
}
```

### Usage Pattern

```typescript
const { data, error } = await getServiceGuide(slug);

if (error) {
  // Handle error - show error message or fallback
  console.error("Failed to fetch service:", error);
  return <ErrorComponent message={error} />;
}

if (!data) {
  // Handle not found
  return notFound();
}

// Use data safely
return <ServiceDetail service={data} />;
```

### With Promise.all

```typescript
const [categoriesResponse, servicesResponse] = await Promise.all([
  getCategories().catch(() => ({ data: [], error: "Failed" })),
  getRootServices().catch(() => ({ data: [], error: "Failed" })),
]);

const categories = categoriesResponse.data || [];
const services = servicesResponse.data || [];
```

---

## Caching

Next.js automatically caches fetch requests. To control caching:

```typescript
// Force revalidation every 60 seconds
const response = await fetch(`${API_BASE_URL}/categories`, {
  next: { revalidate: 60 }
});

// Force fresh data (no cache)
const response = await fetch(`${API_BASE_URL}/search?q=${query}`, {
  cache: 'no-store'
});
```

---

## Server vs Client Components

### Server Components (Default)

Use API functions directly in Server Components:

```typescript
// app/services/page.tsx (Server Component)
export default async function ServicesPage() {
  const { data: services } = await getRootServices();
  return <ServiceList services={services} />;
}
```

### Client Components

For client-side data fetching, use React hooks:

```typescript
"use client";

import { useState, useEffect } from "react";
import { searchServices } from "@/lib/api";

export function SearchResults({ query }: { query: string }) {
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchResults() {
      setLoading(true);
      const { data } = await searchServices(query);
      setResults(data || []);
      setLoading(false);
    }
    fetchResults();
  }, [query]);

  // Render results...
}
```

---

## API Status

To check if the API is running:

```bash
curl http://localhost:8080/api/v1/health
```

Expected response:
```json
{
  "status": "ok",
  "timestamp": "2025-01-02T12:00:00.000Z"
}
```
