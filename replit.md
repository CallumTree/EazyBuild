# Overview

LandSnap is a lean web-first MVP designed for UK property developers working on small-scale residential projects (2-15 units). The application enables users to quickly assess land development feasibility by creating GPS-based site surveys, generating unit layouts, performing financial analysis, and producing professional offer pack PDFs. The app is designed as a Progressive Web App (PWA) for mobile-first usage, allowing developers to work directly on-site using their phones or tablets.

# User Preferences

Preferred communication style: Simple, everyday language.

# System Architecture

## Frontend Architecture
The application is built as a React Single Page Application (SPA) using Vite as the build tool and bundler. The architecture follows a component-based design with TypeScript for type safety. The app uses React Router for client-side navigation between different project phases (Survey, Layout, Finance, Offer). The UI is styled with Tailwind CSS using a dark theme optimized for mobile usage. The application is structured around a tab-based interface that guides users through the development assessment workflow.

## State Management
Global state is managed using Zustand with persistence middleware to automatically save data to localStorage. The store architecture centers around projects as the primary entity, with each project containing boundary coordinates, obstacles, financial parameters, and comparable sales data. Type safety is enforced using Zod schemas for data validation, ensuring consistency across the application lifecycle.

## Mapping and Geospatial Features
Interactive mapping is implemented using Leaflet for map rendering and user interaction. Turf.js provides geospatial calculation capabilities for area computation, buffer zones around obstacles, and layout estimation algorithms. The GPS walking feature captures user location to automatically generate site boundaries, while manual editing allows for boundary refinement and obstacle placement.

## Financial Modeling
The financial analysis system uses a simple heuristic approach to estimate development feasibility. Key calculations include Gross Development Value (GDV), build costs, professional fees, contingency allowances, and profit margins to derive Residual Land Value (RLV). The system includes a manual comparables feature that allows users to input recent property sales data to validate GDV assumptions without requiring external API integrations.

## PDF Generation and Export
Document generation combines html2canvas for map capture and pdfmake for PDF assembly. The export functionality creates professional offer pack documents that include site maps, financial summaries, and market evidence from comparable sales analysis. This addresses the need for lender-ready documentation that can be generated on-site.

## Progressive Web App (PWA) Features
The application is configured as a PWA using vite-plugin-pwa, enabling offline functionality and mobile app-like installation. The PWA configuration includes service worker registration, manifest file setup, and caching strategies to ensure the app works reliably in field conditions where internet connectivity may be limited.

## Data Persistence Strategy
Local data persistence uses browser localStorage as the primary storage mechanism, with automatic saving and loading of project data. This approach eliminates the need for user accounts or server infrastructure while ensuring data persistence across browser sessions. The system includes JSON import/export functionality for data backup and sharing between devices.

# External Dependencies

## Core Libraries
- **React 18.2.0** - Primary UI framework for component-based interface development
- **Vite 5.0.0** - Modern build tool providing fast development server and optimized production builds
- **TypeScript 5.2.2** - Static type checking for improved code reliability and developer experience
- **React Router DOM 7.8.2** - Client-side routing for navigation between project phases

## State Management and Validation
- **Zustand 5.0.8** - Lightweight state management with built-in persistence capabilities
- **Zod 4.0.17** - Schema validation library for runtime type checking and data integrity

## Mapping and Geospatial
- **Leaflet 1.9.4** - Open-source mapping library for interactive map rendering
- **@turf/turf 7.2.0** - Geospatial analysis library for area calculations and geometric operations
- **@types/leaflet 1.9.20** - TypeScript definitions for Leaflet integration

## Styling and UI
- **Tailwind CSS 4.1.13** - Utility-first CSS framework with custom color palette and component styles
- **Lucide React 0.542.0** - Icon library providing consistent iconography throughout the application
- **PostCSS 8.5.6** and **Autoprefixer 10.4.21** - CSS processing and vendor prefix automation

## Document Generation
- **pdfmake 0.2.20** - Client-side PDF generation library for offer pack creation
- **html2canvas 1.4.1** - Screen capture library for embedding map images in PDFs
- **@types/pdfmake 0.2.11** - TypeScript definitions for PDF generation

## Progressive Web App
- **vite-plugin-pwa 1.0.3** - Vite plugin for PWA functionality including service workers and manifest generation

## Development Tools
- **@vitejs/plugin-react 4.2.0** - Vite plugin for React development with Fast Refresh support
- **@types/react 18.2.37** and **@types/react-dom 18.2.15** - TypeScript definitions for React development