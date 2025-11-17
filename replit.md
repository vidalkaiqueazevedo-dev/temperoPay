# Sistema de Gestão Financeira para Restaurante

## Overview

A comprehensive financial management system designed specifically for restaurants, built with a modern TypeScript stack. The application enables restaurant owners to track sales, manage customer credit accounts ("fiados"), monitor expenses across multiple categories, maintain supplier relationships, and generate financial reports. The system provides real-time analytics including total sales, received payments, pending amounts, and expense breakdowns by category.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture

**Framework & Build System:**
- React 18 with TypeScript for type-safe UI development
- Vite as the build tool and development server for fast HMR and optimized production builds
- Wouter for lightweight client-side routing (alternative to React Router)

**UI Component System:**
- Shadcn/ui component library (New York style preset) built on Radix UI primitives
- Tailwind CSS for utility-first styling with custom design tokens
- Material Design principles guiding the overall design approach
- Roboto font family for UI elements, Roboto Mono for monetary values

**State Management & Data Fetching:**
- TanStack Query (React Query) v5 for server state management, caching, and automatic refetching
- React Hook Form with Zod resolvers for form validation and management
- Custom query client configured with specific retry and refetch policies

**Key Design Decisions:**
- Component-based architecture with reusable UI primitives (buttons, cards, dialogs, tables)
- Theme system supporting light/dark modes with CSS custom properties
- Responsive layout using Tailwind's responsive utilities and mobile-first approach
- Accessibility-first approach using Radix UI primitives with ARIA support

### Backend Architecture

**Server Framework:**
- Express.js for HTTP server and RESTful API endpoints
- TypeScript for type safety across the entire backend
- Custom middleware for request logging and JSON parsing with raw body preservation

**API Design:**
- RESTful endpoints organized by resource (customers, suppliers, sales, expenses)
- JSON request/response format
- Zod schema validation for all incoming data
- Structured error handling with appropriate HTTP status codes

**Development Environment:**
- Vite middleware integration for seamless dev experience
- Hot module replacement in development
- Replit-specific plugins for error overlays and dev tooling

**Key Design Decisions:**
- Middleware pattern for cross-cutting concerns (logging, body parsing)
- Repository pattern abstraction through IStorage interface for data access
- In-memory storage implementation (MemStorage) as the current data layer
- Separation of route handlers and business logic

### Data Storage Solutions

**Current Implementation:**
- In-memory storage using Map data structures for all entities
- IStorage interface defining the contract for all data operations
- UUID-based identifiers for all entities

**Database Schema Design (PostgreSQL via Drizzle ORM):**
- **Customers Table:** ID, name, phone, total debt, created timestamp
- **Suppliers Table:** ID, name, phone, category, created timestamp
- **Sales Table:** ID, customer reference, customer name, description, amount, payment status (enum: pago/fiado/parcial), paid amount, created timestamp
- **Expenses Table:** ID, supplier reference, supplier name, category (enum: ingredientes/fornecedores/agua_luz_gas/salarios/aluguel/manutencao/outros), description, amount, created timestamp

**Database Configuration:**
- Drizzle ORM with PostgreSQL dialect for type-safe database operations
- Neon serverless database driver for serverless-compatible database connections
- Schema-first approach with TypeScript type inference from database schema
- Migration system using Drizzle Kit

**Key Design Decisions:**
- Denormalized customer names in sales for query performance and data integrity
- Enum types for payment status and expense categories to ensure data consistency
- Decimal precision (10,2) for all monetary values to prevent floating-point errors
- Default values and timestamps for audit trails

### Authentication and Authorization

**Current State:**
- No authentication system implemented
- Session management infrastructure present (connect-pg-simple for session storage)
- Application assumes trusted single-user or internal network deployment

**Future Considerations:**
- Session-based authentication foundation already in dependencies
- PostgreSQL session store ready for multi-user scenarios

### External Dependencies

**Database:**
- Neon Serverless PostgreSQL (@neondatabase/serverless)
- Drizzle ORM for type-safe database queries and migrations
- Connect-pg-simple for PostgreSQL-backed session storage

**UI Component Libraries:**
- Radix UI suite (accordion, alert-dialog, avatar, checkbox, dialog, dropdown-menu, hover-card, label, popover, progress, radio-group, scroll-area, select, separator, slider, switch, tabs, toast, tooltip, navigation-menu, context-menu, collapsible, aspect-ratio, menubar, toggle, toggle-group)
- Recharts for data visualization (bar charts, pie charts)
- Embla Carousel for carousel functionality
- CMDK for command palette interface
- React Day Picker for calendar/date selection
- Vaul for drawer components

**Form & Validation:**
- React Hook Form for form state management
- Zod for runtime type validation
- @hookform/resolvers for Zod integration with React Hook Form
- Drizzle-Zod for generating Zod schemas from Drizzle database schema

**Utilities:**
- date-fns for date manipulation and formatting
- class-variance-authority (CVA) for component variant management
- clsx and tailwind-merge for conditional className composition
- Lucide React for icon system

**Development Tools:**
- Replit-specific plugins (vite-plugin-runtime-error-modal, vite-plugin-cartographer, vite-plugin-dev-banner)
- TSX for TypeScript execution in Node.js
- ESBuild for production bundling

**Key Integration Points:**
- Google Fonts CDN for Roboto font family loading
- Environment variable-based configuration (DATABASE_URL)
- Vite proxy for API requests during development