# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is the ASUBK Financial Management System - a comprehensive enterprise React frontend application built with TypeScript, integrating with a Spring Boot 3.2 backend. The system manages credit applications, programs, and complex financial workflows with multi-role authorization and multilingual support (KG/RU/EN).

## Common Development Commands

**Development:**
- `cd subi-frontend && npm run dev` - Start development server
- `cd subi-frontend && npm run build` - Build for production
- `cd subi-frontend && npm run preview` - Preview production build

**Code Quality:**
- `cd subi-frontend && npm run lint` - Run ESLint
- `cd subi-frontend && npm run lint:fix` - Fix ESLint errors
- `cd subi-frontend && npm run format` - Format code with Prettier
- `cd subi-frontend && npm run format:check` - Check formatting
- `cd subi-frontend && npm run type-check` - Run TypeScript type checking

**Testing:**
- `cd subi-frontend && npm run test` - Run tests in watch mode
- `cd subi-frontend && npm run test:run` - Run tests once
- `cd subi-frontend && npm run test:ui` - Run tests with UI
- `cd subi-frontend && npm run test:coverage` - Run tests with coverage

## Architecture Overview

### Technology Stack
- **Frontend:** React 18+ with TypeScript, Vite build tool
- **UI Framework:** shadcn/ui with Tailwind CSS v4
- **State Management:** Redux Toolkit with RTK Query
- **Forms:** React Hook Form with Zod validation  
- **Routing:** React Router v6 with role-based protection
- **Internationalization:** react-i18next (KG/RU/EN)
- **Charts:** Recharts for analytics dashboards
- **Testing:** Vitest + React Testing Library + jsdom

### Project Structure
```
subi-frontend/
├── src/
│   ├── components/     # Reusable UI components (shadcn/ui based)
│   ├── pages/          # Page-level components organized by domain
│   ├── store/          # Redux store (slices + RTK Query APIs)
│   ├── services/       # API clients and business logic
│   ├── hooks/          # Custom React hooks
│   ├── types/          # TypeScript type definitions
│   ├── constants/      # Application constants
│   ├── utils/          # Utility functions
│   ├── i18n/           # Internationalization files
│   └── test/           # Test setup and utilities
```

### Key Configuration Files
- `vite.config.ts` - Vite configuration with path aliases and test setup
- `tailwind.config.js` - Tailwind CSS v4 configuration
- `components.json` - shadcn/ui component configuration
- `tsconfig.json` - TypeScript project references configuration

## Business Domain Context

### User Roles (6 total)
1. **ADMIN** - Full system access, user management
2. **CREDIT_MANAGER** - Program management, bulk operations  
3. **CREDIT_ANALYST** - Application processing, document review
4. **DECISION_MAKER** - Decision approval, credit authorization
5. **COMMISSION_MEMBER** - Commission review and evaluation
6. **USER** - Application submission and tracking

### Core Business Workflows
- **Application Lifecycle:** 12-status workflow from submission to credit issuance
- **Credit Programs:** 8-status program management lifecycle
- **Commission Reviews:** Multi-member evaluation and final result aggregation
- **Document Management:** Template-based document generation with versioning
- **Multilingual Support:** Dynamic KG/RU/EN language switching

### Key Features
- Role-based access control with protected routes
- Complex multi-step forms with conditional validation
- Real-time status updates and notifications
- Advanced search and bulk operations
- Document upload/download with drag-and-drop
- Analytics dashboards with interactive charts

## Development Guidelines

### Code Organization
- Use absolute imports with `@/` prefix (configured in vite.config.ts)
- Follow domain-driven organization in `/pages` directory
- Place reusable logic in custom hooks (`/hooks`)
- Keep business logic in services (`/services`)
- Use Redux Toolkit for global state, local state for component-specific data

### Component Patterns
- Use shadcn/ui components as base building blocks
- Implement responsive design with Tailwind CSS
- Follow React Hook Form + Zod pattern for forms
- Use React Router v6 with nested routes and outlet pattern

### API Integration
- All API calls go through RTK Query in `/store/api`
- JWT authentication with automatic token refresh
- Centralized error handling in API middleware
- Type-safe API responses with generated TypeScript types

### Internationalization
- All user-facing text must use `useTranslation` hook
- Enum translations handled via translation keys
- Currency and date formatting per locale
- Language switching affects entire application state

## Testing Strategy
- Unit tests for utilities, hooks, and business logic
- Component tests with React Testing Library
- Integration tests for complex workflows
- Test setup configured in `src/test/setup.ts`

## Important Notes
- This is a financial system - always validate user permissions before showing sensitive data
- All forms must validate both client and server-side
- Status workflows are critical - ensure proper state transitions
- Document handling requires careful permission checking
- Multilingual enum support is essential for status displays