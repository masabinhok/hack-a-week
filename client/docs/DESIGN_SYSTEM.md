# Design System Documentation

This document outlines the design system for the Setu frontend application, including colors, typography, spacing, and component patterns.

## Overview

The Setu design system is built around Nepal's national identity, using colors from the Nepali flag while maintaining excellent accessibility and usability standards.

---

## Color Palette

### Primary Colors

These are derived from the Nepal flag:

| Name | CSS Variable | Hex | Usage |
|------|-------------|-----|-------|
| Nepal Crimson | `--primary-crimson` | `#DC143C` | Primary actions, important elements |
| Nepal Blue | `--primary-blue` | `#003893` | Secondary actions, links, headers |

### Crimson Scale

```css
--nepal-crimson-50: #FEF2F4
--nepal-crimson-100: #FCE4E8
--nepal-crimson-200: #FACDD5
--nepal-crimson-300: #F5A3B3
--nepal-crimson-400: #EE6E88
--nepal-crimson-500: #E34267
--nepal-crimson-600: #DC143C (Primary)
--nepal-crimson-700: #B91038
--nepal-crimson-800: #9A1135
--nepal-crimson-900: #841333
```

### Blue Scale

```css
--nepal-blue-50: #EFF4FF
--nepal-blue-100: #DBE5FE
--nepal-blue-200: #BFD3FE
--nepal-blue-300: #93B7FC
--nepal-blue-400: #6092F8
--nepal-blue-500: #3B6CF4
--nepal-blue-600: #2550E9
--nepal-blue-700: #1D3ED6
--nepal-blue-800: #1E35AD
--nepal-blue-900: #003893 (Primary)
```

### Semantic Colors

| Purpose | Light Mode | Variable |
|---------|------------|----------|
| Background | `#FAFAFA` | `--background` |
| Surface | `#FFFFFF` | `--surface` |
| Foreground | `#1A1A2E` | `--foreground` |
| Foreground Secondary | `#4A4A5A` | `--foreground-secondary` |
| Foreground Muted | `#6B7280` | `--foreground-muted` |
| Border | `#E5E7EB` | `--border` |
| Success | `#22C55E` | `--success` |
| Warning | `#F59E0B` | `--warning` |
| Error | `#EF4444` | `--error` |

---

## Typography

### Font Families

```css
--font-sans: 'Inter', system-ui, sans-serif;
--font-serif: 'Merriweather', Georgia, serif;
```

- **Inter:** Used for body text, UI elements, and general content
- **Merriweather:** Used for headings to convey trust and formality

### Font Sizes

| Class | Size | Line Height | Usage |
|-------|------|-------------|-------|
| `text-xs` | 12px | 16px | Labels, captions |
| `text-sm` | 14px | 20px | Secondary text |
| `text-base` | 16px | 24px | Body text |
| `text-lg` | 18px | 28px | Emphasis |
| `text-xl` | 20px | 28px | Card titles |
| `text-2xl` | 24px | 32px | Section titles |
| `text-3xl` | 30px | 36px | Page titles |
| `text-4xl` | 36px | 40px | Hero headings |

### Nepali Text

Use the `.nepali-text` class for Nepali content:

```css
.nepali-text {
  font-family: 'Noto Sans Devanagari', 'Mukta', system-ui, sans-serif;
}
```

---

## Spacing

### Base Unit

The spacing system uses a 4px base unit:

| Name | Value | Usage |
|------|-------|-------|
| `0` | 0px | Reset |
| `1` | 4px | Tight spacing |
| `2` | 8px | Inline spacing |
| `3` | 12px | Component padding |
| `4` | 16px | Section spacing |
| `6` | 24px | Group spacing |
| `8` | 32px | Section gaps |
| `12` | 48px | Large gaps |
| `16` | 64px | Section padding |
| `24` | 96px | Page sections |

### Container

```css
.container-custom {
  max-width: 1280px;
  margin: 0 auto;
  padding: 0 1rem;
}

@media (min-width: 768px) {
  .container-custom {
    padding: 0 2rem;
  }
}
```

---

## Border Radius

| Name | Value | Usage |
|------|-------|-------|
| `rounded-sm` | 4px | Small elements |
| `rounded` | 6px | Default |
| `rounded-md` | 8px | Inputs, buttons |
| `rounded-lg` | 12px | Cards |
| `rounded-xl` | 16px | Featured cards |
| `rounded-2xl` | 24px | Large elements |
| `rounded-full` | 9999px | Pills, avatars |

---

## Shadows

```css
/* Subtle shadow for elevated elements */
.shadow-sm {
  box-shadow: 0 1px 2px 0 rgb(0 0 0 / 0.05);
}

/* Default card shadow */
.shadow {
  box-shadow: 0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1);
}

/* Hover state shadow */
.shadow-md {
  box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1);
}

/* Featured element shadow */
.shadow-lg {
  box-shadow: 0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1);
}
```

---

## Animations

### Fade In

```css
@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.animate-fade-in {
  animation: fadeIn 0.5s ease-out forwards;
}
```

### Staggered Animation

Apply staggered delays for lists:

```tsx
{items.map((item, index) => (
  <div
    className="animate-fade-in opacity-0"
    style={{
      animationDelay: `${index * 50}ms`,
      animationFillMode: "forwards",
    }}
  >
    {item}
  </div>
))}
```

---

## Component Patterns

### Cards

Standard card pattern:

```tsx
<Card className="hover:shadow-lg hover:-translate-y-1 transition-all duration-300">
  <CardContent className="p-6">
    {/* Content */}
  </CardContent>
</Card>
```

### Interactive Elements

```tsx
// Links with hover color transition
<Link className="text-[var(--foreground)] hover:text-[var(--primary-crimson)] transition-colors">

// Cards with border highlight
<Card className="group-hover:border-[var(--primary-crimson)]">

// Icons with translation
<ChevronRight className="group-hover:translate-x-1 transition-transform">
```

### Gradients

Nepal-themed gradients:

```css
/* Hero background */
.bg-hero {
  background: linear-gradient(135deg, var(--primary-blue) 0%, #1E35AD 100%);
}

/* Crimson gradient */
.bg-crimson-gradient {
  background: linear-gradient(135deg, var(--nepal-crimson-50) 0%, var(--nepal-crimson-100) 100%);
}

/* Blue gradient */
.bg-blue-gradient {
  background: linear-gradient(135deg, var(--nepal-blue-50) 0%, var(--nepal-blue-100) 100%);
}
```

---

## Accessibility

### Focus States

All interactive elements must have visible focus states:

```css
:focus-visible {
  outline: 2px solid var(--primary-blue);
  outline-offset: 2px;
}
```

### Color Contrast

- Body text: Minimum 4.5:1 contrast ratio
- Large text: Minimum 3:1 contrast ratio
- UI components: Minimum 3:1 contrast ratio

### Screen Reader Support

- Use semantic HTML (`<nav>`, `<main>`, `<section>`, etc.)
- Provide `aria-labels` for icon-only buttons
- Use `sr-only` class for screen reader text

---

## Responsive Breakpoints

```css
/* Mobile first approach */
sm: 640px   /* Small devices */
md: 768px   /* Tablets */
lg: 1024px  /* Laptops */
xl: 1280px  /* Desktops */
2xl: 1536px /* Large screens */
```

### Mobile Considerations

- Touch targets minimum 44x44px
- Single column layout on mobile
- Collapsible navigation
- Bottom-sheet patterns for modals

---

## Dark Mode (Future)

CSS variables are structured to support dark mode:

```css
/* Future dark mode implementation */
.dark {
  --background: #1A1A2E;
  --surface: #252538;
  --foreground: #F8F9FA;
  --foreground-secondary: #B0B0C0;
  --border: #3D3D50;
}
```

---

## Usage Examples

### Page Section

```tsx
<section className="py-16 md:py-24 bg-[var(--surface)]">
  <div className="container-custom">
    <h2 className="text-2xl md:text-3xl font-bold text-[var(--foreground)] mb-8">
      Section Title
    </h2>
    {/* Content */}
  </div>
</section>
```

### Card Grid

```tsx
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
  {items.map((item) => (
    <Card key={item.id}>
      {/* Card content */}
    </Card>
  ))}
</div>
```

### Button Group

```tsx
<div className="flex flex-wrap gap-4">
  <Button>Primary Action</Button>
  <Button variant="outline">Secondary</Button>
</div>
```
