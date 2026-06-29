# Nagarik Chain

[![MIT License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)
[![React 18](https://img.shields.io/badge/React-18-61DAFB.svg)](https://react.dev)
[![Vite 8](https://img.shields.io/badge/Vite-8-646CFF.svg)](https://vitejs.dev)
[![Tailwind CSS v4](https://img.shields.io/badge/Tailwind%20CSS-v4-06B6D4.svg)](https://tailwindcss.com)

**One Identity. Cryptographic Trust. For 1.4 Billion.**

Nagarik Chain is a blockchain-anchored national identity and governance system. This repository contains the full-stack frontend — a React SPA serving three distinct portals: Citizen, Admin/Officer, and Verification.

## What It Is

A sovereign digital identity platform leveraging blockchain technology to provide tamper-proof identity verification, document management, and transparent governance services. The system anchors citizen identities to a permissioned ledger while providing intuitive interfaces for all stakeholders.

## Tech Stack

| Technology | Version | Purpose |
|------------|---------|---------|
| React | 18 | Component architecture, Context API state management |
| Vite | 8 | Build tool and dev server |
| Tailwind CSS | v4 | Styling and design system |
| React Router | 7 | SPA routing and lazy-loading |
| Framer Motion | 12 | Declarative animations (LazyMotion enabled) |
| Lucide React | 1 | Icon system |
| Recharts | 3 | Data visualization |
| Space Grotesk | 5 | Primary typeface |
| Inter | 5 | Secondary typeface |

## Demo Credentials

Test credentials for local development and demonstration:

| Portal | ID / Username | Password / PIN |
|--------|---------------|----------------|
| **Citizen** | `IND-9481-0032-NC` | `1234` |
| **Officer** | `GOV-4421` | `admin123` |

## Getting Started

### Prerequisites

- Node.js 24+
- npm 10+

### Installation

```bash
npm install
```

### Development

```bash
npm run dev
```
Open [http://localhost:5173](http://localhost:5173) to view the application.

### Build

```bash
npm run build
```

### Lint

```bash
npm run lint
```

## Project Structure

```
src/
├── assets/            # Static images, fonts, and SVG icons (ashoka-chakra, india-map-outline)
├── components/
│   ├── blockchain/    # HashDisplay, BlockchainHashRibbon, TransactionFeed
│   ├── identity/      # NagarikIDCard, BiometricBadge
│   ├── layout/        # Sidebar, Navbar, ProtectedRoute, AdminSidebar, CitizenLayout
│   └── ui/            # Button, Card, Modal, Toast, Input, Badge, LoadingSpinner, EmptyState
├── contexts/          # AuthContext, ThemeContext, NotificationContext
├── data/              # Mock data fixtures (citizens, documents, contracts, benefits, auditLog)
├── hooks/             # Custom hooks (useAuth, useDocuments, useBenefits, useContracts, useAIVerification)
├── pages/
│   ├── admin/         # AdminOverview, AIEnginePage, AdminContractsPage, CitizenRegistry, DocumentQueue
│   ├── citizen/       # IdentityPage, DocumentsPage, BenefitsPage, ContractsPage, AIStatusPage
│   ├── public/        # HomePage, CitizenLogin, AdminLogin, CitizenRegister, NotFoundPage
│   └── verify/        # VerifyLanding, VerifyResult
└── utils/             # formatters, hashGenerator, generateMockCitizens
```

## Design System

The UI embraces a **dark-tech-sovereignty** aesthetic:

- **Deep Navy Palette**: `#0A0F1A` base with `#001F3F` surfaces
- **Saffron Accent**: `#FF9933` for primary actions and highlights
- **Blockchain Hash Ribbon**: Animated gradient borders on identity components
- **Nagarik ID Card**: Hero component featuring holographic effects and cryptographic watermarks

## Features

- **Digital Identity Card**: On-chain anchored biometric identity display with holographic effects
- **Document Vault**: Encrypted storage with IPFS-backed retrieval and verification status
- **Benefits Tracker**: Real-time welfare scheme eligibility and disbursement status
- **Smart Contract Feed**: Live blockchain transaction monitoring and contract interactions
- **AI Verification**: Facial recognition and document authenticity checks with status dashboard
- **Admin Dashboard**: Officer tools for identity issuance, citizen registry, and audit trails
- **Verification Portal**: Public endpoint for third-party identity validation

## Accessibility

- WCAG 2.1 AA compliance
- Comprehensive ARIA labels on interactive elements
- Full keyboard navigation support
- Reduced motion preferences respected via `useReducedMotion`
- Screen reader optimized status announcements

## Hooks Reference

Key custom hooks powering the application:

| Hook | Purpose |
|------|---------|
| `useAuth` | Authentication state and session management |
| `useDocuments` | Document vault CRUD and verification status |
| `useBenefits` | Welfare scheme eligibility tracking |
| `useContracts` | Smart contract interactions and feed |
| `useAIVerification` | AI verification workflow status |
| `useAuditLog` | Audit trail access for admins |
| `useCountUp` | Animated number transitions for metrics |

See `src/hooks/` for implementation details.

## Performance

- Route-level code splitting with `React.lazy` and `Suspense`
- Manual chunking for vendor libraries (Framer Motion, Recharts)
- `LazyMotion` for deferred animation loading
- Asset optimization via Vite's built-in image pipeline

## License

MIT License — see [LICENSE](LICENSE) for details.