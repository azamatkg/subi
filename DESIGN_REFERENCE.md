# ASUBK Financial Management System - Design Reference

> **Purpose**: This document serves as a comprehensive design reference for building a similar-looking Next.js project based on the ASUBK Financial Management System. The reference captures visual design, colors, layout patterns, and UI components while being domain-agnostic.

## Table of Contents

1. [Color System](#color-system)
2. [Typography & Spacing](#typography--spacing)
3. [Component Library](#component-library)
4. [Layout Patterns](#layout-patterns)
5. [Interactive Elements](#interactive-elements)
6. [Dashboard Design](#dashboard-design)
7. [Navigation Patterns](#navigation-patterns)
8. [Forms & Status Indicators](#forms--status-indicators)
9. [Next.js Implementation Guide](#nextjs-implementation-guide)

---

## Color System

### Primary Color Palette

The system uses a professional blue-based color scheme with comprehensive light/dark theme support.

#### Primary Colors
```css
/* Light Theme */
--color-primary: hsl(217 91% 60%);           /* Professional blue */
--color-primary-foreground: hsl(0 0% 100%);
--color-primary-50: hsl(217 100% 97%);
--color-primary-100: hsl(217 100% 92%);
--color-primary-500: hsl(217 91% 60%);
--color-primary-600: hsl(217 91% 50%);
--color-primary-900: hsl(217 91% 30%);

/* Dark Theme */
--color-primary: hsl(217 91% 65%);
--color-primary-50: hsl(217 91% 10%);
--color-primary-100: hsl(217 91% 15%);
--color-primary-500: hsl(217 91% 65%);
--color-primary-600: hsl(217 91% 75%);
--color-primary-900: hsl(217 91% 90%);
```

#### Background & Surface Colors
```css
/* Light Theme */
--color-background: hsl(0 0% 100%);
--color-foreground: hsl(220 15% 15%);
--color-card: hsl(0 0% 100%);
--color-card-foreground: hsl(220 15% 15%);
--color-muted: hsl(215 20% 96%);
--color-muted-foreground: hsl(215 10% 40%);

/* Dark Theme */
--color-background: hsl(220 15% 10%);
--color-foreground: hsl(210 20% 95%);
--color-card: hsl(220 15% 12%);
--color-card-foreground: hsl(210 20% 95%);
--color-muted: hsl(220 15% 15%);
--color-muted-foreground: hsl(215 10% 65%);
```

#### Status Colors (Semantic Palette)

**Success (Green)**
```css
--color-success: hsl(150 70% 45%);         /* Light */
--color-success: hsl(150 70% 52%);         /* Dark */
--color-success-50: hsl(150 100% 96%);     /* Light backgrounds */
--color-success-100: hsl(150 95% 90%);
--color-success-500: hsl(150 70% 45%);     /* Main color */
--color-success-900: hsl(150 75% 20%);
```

**Warning (Orange)**
```css
--color-warning: hsl(30 90% 55%);          /* Light */
--color-warning: hsl(30 90% 62%);          /* Dark */
--color-warning-50: hsl(30 100% 96%);
--color-warning-500: hsl(30 90% 55%);
--color-warning-900: hsl(30 92% 25%);
```

**Destructive (Red)**
```css
--color-destructive: hsl(350 80% 55%);     /* Light */
--color-destructive: hsl(350 80% 62%);     /* Dark */
--color-destructive-50: hsl(350 100% 97%);
--color-destructive-500: hsl(350 80% 55%);
--color-destructive-900: hsl(350 85% 25%);
```

**Info (Blue)**
```css
--color-info: hsl(210 90% 60%);            /* Light */
--color-info: hsl(210 90% 67%);            /* Dark */
--color-info-50: hsl(210 100% 97%);
--color-info-500: hsl(210 90% 60%);
--color-info-900: hsl(210 92% 28%);
```

#### Borders & Inputs
```css
--color-border: hsl(215 20% 88%);          /* Light */
--color-border: hsl(220 15% 22%);          /* Dark */
--color-input: hsl(215 20% 88%);           /* Light */
--color-input: hsl(220 15% 22%);           /* Dark */
--color-ring: hsl(217 91% 60%);            /* Focus ring */
```

### Header Design

The header uses a dark theme regardless of the app's theme setting:

```css
/* Header-specific colors */
.header {
  background-color: hsl(220 15% 10%);       /* Dark gray-900 */
  border-color: hsl(220 15% 20%);           /* Dark border */
  color: hsl(0 0% 100%);                    /* White text */
}

.header-button {
  color: hsl(210 20% 80%);                  /* Light gray text */
  background-color: transparent;
  border-color: hsl(220 15% 30%);
}

.header-button:hover {
  background-color: hsl(220 15% 25%);       /* Darker on hover */
  color: hsl(0 0% 100%);
}
```

---

## Typography & Spacing

### Font System
- **Primary Font**: System fonts for optimal performance
- **Font Feature Settings**: `'rlig' 1, 'calt' 1` for enhanced typography

### Spacing Scale
```css
--radius: 0.5rem;           /* Default border radius */
--radius-lg: 0.75rem;       /* Large border radius */
--radius-xl: 1rem;          /* Extra large border radius */
```

### Text Hierarchy
```css
/* Headers */
.text-3xl { font-size: 1.875rem; line-height: 2.25rem; }  /* Dashboard stats */
.text-2xl { font-size: 1.5rem; line-height: 2rem; }       /* Card titles */
.text-xl { font-size: 1.25rem; line-height: 1.75rem; }    /* Page titles */

/* Body Text */
.text-base { font-size: 1rem; line-height: 1.5rem; }      /* Default */
.text-sm { font-size: 0.875rem; line-height: 1.25rem; }   /* Labels */
.text-xs { font-size: 0.75rem; line-height: 1rem; }       /* Captions */

/* Weights */
.font-semibold { font-weight: 600; }
.font-medium { font-weight: 500; }
.font-bold { font-weight: 700; }
```

---

## Component Library

### Button Variants

Based on `class-variance-authority` with comprehensive styling:

```typescript
const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground hover:bg-primary/90",
        destructive: "bg-destructive text-destructive-foreground hover:bg-destructive/90",
        outline: "border border-input bg-background hover:bg-accent hover:text-accent-foreground",
        secondary: "bg-secondary text-secondary-foreground hover:bg-secondary/80",
        ghost: "hover:bg-accent hover:text-accent-foreground",
        link: "text-primary underline-offset-4 hover:underline",
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-9 rounded-md px-3",
        lg: "h-11 rounded-md px-8",
        icon: "h-10 w-10",
      },
    },
  }
);
```

### Card Components

```typescript
// Base Card Structure
const Card = {
  base: "rounded-lg border bg-card text-card-foreground shadow-sm",
  header: "flex flex-col space-y-1.5 p-6",
  title: "text-2xl font-semibold leading-none tracking-tight",
  description: "text-sm text-muted-foreground",
  content: "p-6 pt-0",
  footer: "flex items-center p-6 pt-0",
};

// Enhanced Dashboard Card with Gradient Effects
const StatCard = {
  base: "group relative overflow-hidden transition-all duration-300 hover:shadow-lg hover:shadow-primary/5 hover:-translate-y-1 border-0 shadow-md bg-gradient-to-br",
  colorVariants: {
    blue: "from-blue-500/10 to-blue-600/5 border-blue-200/20 text-blue-700 dark:text-blue-300",
    emerald: "from-emerald-500/10 to-emerald-600/5 border-emerald-200/20 text-emerald-700 dark:text-emerald-300",
    amber: "from-amber-500/10 to-amber-600/5 border-amber-200/20 text-amber-700 dark:text-amber-300",
    purple: "from-purple-500/10 to-purple-600/5 border-purple-200/20 text-purple-700 dark:text-purple-300",
  },
  hoverEffect: "absolute inset-0 bg-gradient-to-r from-white/0 via-white/5 to-white/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700",
};
```

### Avatar Component

```typescript
const Avatar = {
  base: "h-9 w-9",
  fallback: "bg-blue-900/50 text-blue-400 font-medium",
  image: "rounded-full",
};
```

---

## Layout Patterns

### Main Layout Structure

```typescript
// App Layout
<div className="min-h-screen bg-background">
  <Header /> {/* Sticky header with dark theme */}
  <div className="flex">
    <Sidebar /> {/* Collapsible sidebar */}
    <main className="flex-1">
      <div className="space-y-8 p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto">
        {/* Page content */}
      </div>
    </main>
  </div>
</div>
```

### Grid Systems

```css
/* Dashboard Stats Grid */
.stats-grid {
  display: grid;
  grid-template-columns: repeat(1, 1fr);
  gap: 1rem;
}

@media (min-width: 640px) {
  .stats-grid {
    grid-template-columns: repeat(2, 1fr);
    gap: 1.5rem;
  }
}

@media (min-width: 1024px) {
  .stats-grid {
    grid-template-columns: repeat(4, 1fr);
  }
}

/* Dashboard Charts Grid */
.charts-grid {
  display: grid;
  grid-template-columns: repeat(1, 1fr);
  gap: 1.5rem;
}

@media (min-width: 1024px) {
  .charts-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (min-width: 1280px) {
  .charts-grid {
    grid-template-columns: repeat(3, 1fr);
  }
}
```

---

## Interactive Elements

### Hover Effects

```css
/* Card Hover */
.card-hover {
  transition: all 0.3s ease;
}
.card-hover:hover {
  transform: translateY(-4px);
  box-shadow: 0 20px 25px -5px rgb(0 0 0 / 0.1), 0 10px 10px -5px rgb(0 0 0 / 0.04);
}

/* Button Hover */
.button-hover {
  transition: all 0.2s ease;
}

/* Icon Rotation on Hover */
.icon-hover {
  transition: transform 0.3s ease;
}
.icon-hover:hover {
  transform: scale(1.1) rotate(3deg);
}
```

### Focus States

```css
/* Focus Ring */
*:focus-visible {
  outline: 2px solid var(--color-ring);
  outline-offset: 2px;
}

/* Interactive Element Focus */
.focus-element {
  focus-visible:outline-none
  focus-visible:ring-2
  focus-visible:ring-ring
  focus-visible:ring-offset-2
}
```

### Loading States

```css
/* Spin Animation */
.animate-spin {
  animation: spin 1s linear infinite;
}

/* Pulse Animation */
.animate-pulse {
  animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
}

/* Ping Animation for Notifications */
.animate-ping {
  animation: ping 1s cubic-bezier(0, 0, 0.2, 1) infinite;
}
```

---

## Dashboard Design

### Header Section

```typescript
const DashboardHeader = {
  container: "space-y-4",
  topRow: "flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4",
  welcome: "space-y-2",
  welcomeText: "text-muted-foreground text-base sm:text-lg leading-relaxed",
  userName: "font-semibold text-foreground",
  actions: "flex items-center gap-3",
  timestamp: "hidden sm:flex items-center gap-2 text-sm text-muted-foreground",
  refreshButton: "group",
};
```

### Statistics Cards

```typescript
const StatsCard = {
  value: "text-3xl font-bold tracking-tight text-foreground",
  title: "text-sm font-semibold text-muted-foreground group-hover:text-foreground transition-colors",
  trend: {
    positive: "text-emerald-700 bg-emerald-100 dark:text-emerald-300 dark:bg-emerald-900/30",
    negative: "text-red-700 bg-red-100 dark:text-red-300 dark:bg-red-900/30",
    neutral: "text-muted-foreground bg-muted/50",
  },
  description: "text-xs text-muted-foreground leading-relaxed",
  icon: "p-2 rounded-xl transition-transform duration-300 group-hover:scale-110 group-hover:rotate-3",
};
```

---

## Navigation Patterns

### Sidebar Design

```typescript
const Sidebar = {
  base: "fixed left-0 top-0 z-40 h-screen transition-transform duration-300 ease-in-out",
  open: "translate-x-0",
  closed: "-translate-x-full lg:translate-x-0 lg:w-16",
  desktop: {
    open: "lg:w-64",
    closed: "lg:w-16",
  },
  mobile: "w-64 lg:translate-x-0",
  background: "bg-sidebar border-r border-sidebar-border",

  content: {
    base: "flex h-full flex-col",
    header: "flex items-center justify-between p-4 border-b border-sidebar-border",
    navigation: "flex-1 overflow-y-auto p-4 space-y-2",
    footer: "border-t border-sidebar-border p-4",
  },

  item: {
    base: "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
    active: "bg-sidebar-accent text-sidebar-accent-foreground",
    inactive: "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
    icon: "h-4 w-4 shrink-0",
  },
};
```

### Header Navigation

```typescript
const Header = {
  container: "sticky top-0 z-50 w-full border-b bg-gray-900 border-gray-800",
  content: "flex h-16 items-center justify-between px-2",

  left: "flex items-center",
  center: "absolute left-1/2 transform -translate-x-1/2",
  right: "flex items-center",

  title: "text-xl font-semibold text-white truncate max-w-md sm:max-w-lg md:max-w-xl lg:max-w-2xl text-center",

  mobileToggle: "lg:hidden text-gray-200 hover:bg-gray-800 hover:text-white h-8 w-8 p-0 rounded-full border border-gray-700 shadow-sm",

  notification: {
    button: "relative h-9 w-9 text-gray-200 hover:bg-gray-800 hover:text-white",
    badge: "absolute top-0 right-0 flex h-2 w-2",
    ping: "animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-500 opacity-75",
    dot: "relative inline-flex rounded-full h-2 w-2 bg-blue-500",
  },

  userMenu: {
    trigger: "relative h-9 w-9 rounded-full",
    content: "w-56 bg-gray-800 border-gray-700",
    item: "text-gray-200 focus:bg-gray-700 focus:text-white",
    separator: "bg-gray-700",
  },
};
```

---

## Forms & Status Indicators

### Status Badge System

```typescript
const StatusBadge = {
  base: "inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium",
  variants: {
    approved: "text-success-700 bg-success-50 border border-success-200 dark:text-success-300 dark:bg-success-900/30",
    pending: "text-warning-700 bg-warning-50 border border-warning-200 dark:text-warning-300 dark:bg-warning-900/30",
    rejected: "text-destructive-700 bg-destructive-50 border border-destructive-200 dark:text-destructive-300 dark:bg-destructive-900/30",
    draft: "text-neutral-700 bg-neutral-50 border border-neutral-200 dark:text-neutral-300 dark:bg-neutral-900/30",
    submitted: "text-info-700 bg-info-50 border border-info-200 dark:text-info-300 dark:bg-info-900/30",
  },
};
```

### Form Elements

```typescript
const FormElements = {
  input: "flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",

  label: "text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70",

  select: "flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",

  textarea: "flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
};
```

---

## Next.js Implementation Guide

### Recommended Packages

```json
{
  "dependencies": {
    "next": "^14.0.0",
    "react": "^18.0.0",
    "react-dom": "^18.0.0",
    "tailwindcss": "^3.4.0",
    "@radix-ui/react-avatar": "^1.0.0",
    "@radix-ui/react-dropdown-menu": "^2.0.0",
    "@radix-ui/react-tabs": "^1.0.0",
    "@radix-ui/react-dialog": "^1.0.0",
    "@radix-ui/react-select": "^2.0.0",
    "class-variance-authority": "^0.7.0",
    "clsx": "^2.0.0",
    "tailwind-merge": "^2.0.0",
    "lucide-react": "^0.400.0",
    "next-themes": "^0.3.0"
  }
}
```

### Tailwind Configuration

```javascript
// tailwind.config.js
/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: ["class"],
  content: [
    './pages/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './app/**/*.{ts,tsx}',
    './src/**/*.{ts,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        background: 'var(--color-background)',
        foreground: 'var(--color-foreground)',
        primary: {
          DEFAULT: 'var(--color-primary)',
          foreground: 'var(--color-primary-foreground)',
          50: 'var(--color-primary-50)',
          100: 'var(--color-primary-100)',
          500: 'var(--color-primary-500)',
          600: 'var(--color-primary-600)',
          900: 'var(--color-primary-900)',
        },
        // ... extend with all color tokens from the CSS variables
      },
      borderRadius: {
        lg: 'var(--radius)',
        md: 'calc(var(--radius) - 2px)',
        sm: 'calc(var(--radius) - 4px)',
      },
    },
  },
  plugins: [],
}
```

### Global CSS Setup

```css
/* globals.css */
@tailwind base;
@tailwind components;
@tailwind utilities;

/* Copy all CSS variables from src/index.css */
@theme {
  /* Light theme colors */
  --color-background: hsl(0 0% 100%);
  --color-foreground: hsl(220 15% 15%);
  /* ... all other color variables ... */
}

/* Dark theme */
.dark {
  /* Dark theme colors */
  --color-background: hsl(220 15% 10%);
  --color-foreground: hsl(210 20% 95%);
  /* ... all other dark color variables ... */
}

/* Auto dark mode */
@media (prefers-color-scheme: dark) {
  :root:not([data-theme="light"]) {
    /* Dark theme variables */
  }
}

/* Enhanced body with smooth transitions */
body {
  background-color: var(--color-background);
  color: var(--color-foreground);
  transition: background-color 0.3s ease, color 0.3s ease;
}

/* Focus styles */
*:focus-visible {
  outline: 2px solid var(--color-ring);
  outline-offset: 2px;
}

/* Smooth transitions */
button, input, select, textarea, [role="button"] {
  transition: all 0.2s ease;
}
```

### Project Structure

```
src/
├── app/                    # Next.js App Router
│   ├── layout.tsx         # Root layout with sidebar
│   ├── page.tsx           # Dashboard page
│   └── (routes)/          # Route groups
├── components/
│   ├── ui/                # Reusable UI components
│   │   ├── button.tsx
│   │   ├── card.tsx
│   │   ├── avatar.tsx
│   │   └── ...
│   ├── layout/            # Layout components
│   │   ├── header.tsx
│   │   ├── sidebar.tsx
│   │   └── ...
│   └── dashboard/         # Dashboard-specific components
├── lib/
│   ├── utils.ts           # Utility functions (cn, etc.)
│   └── button-variants.ts # CVA button variants
├── hooks/                 # Custom React hooks
└── constants/             # Constants and configuration
```

### Key Implementation Tips

1. **Color System**: Use CSS variables for easy theme switching
2. **Component Variants**: Leverage `class-variance-authority` for consistent component APIs
3. **Responsive Design**: Mobile-first approach with Tailwind breakpoints
4. **Accessibility**: Include focus states, ARIA labels, and semantic markup
5. **Dark Mode**: Use `next-themes` for system/manual theme switching
6. **Animation**: Subtle transitions and hover effects for polished UX

This design reference provides everything needed to recreate the professional, clean aesthetic of the ASUBK system in any Next.js project, regardless of the business domain.