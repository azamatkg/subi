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
- `cd subi-frontend && npm run test` - Run unit tests in watch mode
- `cd subi-frontend && npm run test:run` - Run unit tests once
- `cd subi-frontend && npm run test:ui` - Run unit tests with UI
- `cd subi-frontend && npm run test:coverage` - Run unit tests with coverage

**E2E Testing:**
- `npm run test:e2e` - Run all Playwright E2E tests
- `npm run test:e2e:ui` - Run E2E tests with Playwright UI mode
- `npm run test:e2e:debug` - Debug E2E tests step by step
- `npm run test:e2e:headed` - Run E2E tests with visible browser
- `npm run test:e2e:chromium` - Run E2E tests only in Chromium
- `npm run test:e2e:firefox` - Run E2E tests only in Firefox
- `npm run test:e2e:webkit` - Run E2E tests only in WebKit
- `npm run test:e2e:mobile` - Run E2E tests on mobile viewports

## Architecture Overview

### Technology Stack
- **Frontend:** React 18+ with TypeScript, Vite build tool
- **UI Framework:** shadcn/ui with Tailwind CSS v4
- **State Management:** Redux Toolkit with RTK Query
- **Forms:** React Hook Form with Zod validation  
- **Routing:** React Router v6 with role-based protection
- **Internationalization:** react-i18next (KG/RU/EN)
- **Charts:** Recharts for analytics dashboards
- **Unit Testing:** Vitest + React Testing Library + jsdom
- **E2E Testing:** Playwright with multi-browser support

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
├── tests/
│   └── e2e/            # End-to-end tests with Playwright
│       ├── pages/      # Page Object Model classes
│       ├── fixtures/   # Test fixtures and authentication
│       └── utils/      # Test utilities and data generators
```

### Key Configuration Files
- `vite.config.ts` - Vite configuration with path aliases and test setup
- `tailwind.config.js` - Tailwind CSS v4 configuration
- `components.json` - shadcn/ui component configuration
- `tsconfig.json` - TypeScript project references configuration
- `playwright.config.ts` - Playwright E2E testing configuration

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

### Unit & Integration Testing
- Unit tests for utilities, hooks, and business logic
- Component tests with React Testing Library
- Integration tests for complex workflows
- Test setup configured in `src/test/setup.ts`

### End-to-End Testing
- Playwright E2E tests covering critical user journeys
- Multi-browser testing (Chromium, Firefox, WebKit)
- Mobile device testing support
- Role-based authentication testing for all 6 user roles
- Application lifecycle workflow testing (12-status transitions)
- Multilingual testing (KG/RU/EN language switching)
- Page Object Model pattern for maintainable test code
- Test fixtures for consistent authentication and data setup
- Screenshot and video capture on test failures

## Important Notes
- This is a financial system - always validate user permissions before showing sensitive data
- All forms must validate both client and server-side
- Status workflows are critical - ensure proper state transitions
- Document handling requires careful permission checking
- Multilingual enum support is essential for status displays
- http://localhost:8080/swagger-ui/index.html this is swagger url

## Code Quality & Formatting
- **Prettier Config:** Single quotes, 2-space indentation, 80-character print width
- **ESLint Config:** TypeScript ESLint with React hooks and React refresh plugins
- **Import Aliases:** Use `@/` prefix for all internal imports (configured in vite.config.ts)

## Additional Development Notes
- **Test Environment:** Vitest with jsdom environment and custom setup in `src/test/setup.ts`
- **TypeScript Config:** Project references setup with separate app and node configurations
- **shadcn/ui:** Component library configured with slate base color and CSS variables