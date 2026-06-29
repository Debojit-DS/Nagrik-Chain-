# Nagrik Chain

Blockchain-anchored digital identity and governance system for India. Built as a full-stack prototype with a React portal for citizens, officers, and verifiers, and a FastAPI backend with SQLAlchemy, JWT auth, audit trails, and mock blockchain anchoring.

## Prerequisites

- Node.js 24+
- Python 3.11+
- pip

## Quick Start

### Frontend

`ash
cd nagarik-chain
npm install
npm run dev
Opens on http://localhost:5173.

Backend
cd nagarik_chain backend
pip install -r requirements.txt
python seed.py
python main.py
API runs on http://127.0.0.1:8000. Health check at /health.

Demo Credentials
PortalIDPassword
CitizenCHIN-3a8f5bb2e97a387532d92caad5f09623e1986423a8f5bb2e97a387532d92caad1234
OfficerCHIN-OFF-0000001admin123
Project Structure
nagarik-chain/               # React + Vite + Tailwind frontend
  src/
    components/              # Shared UI + layout + blockchain primitives
    contexts/                # Auth, theme, notifications
    data/                    # Mock fallback data
    hooks/                   # useDocuments, useContracts
    pages/
      admin/                 # Officer dashboard (overview, registry, docs, contracts, AI, audit)
      citizen/               # Citizen dashboard (identity, documents, benefits, contracts, AI status)
      public/                # Login, registration
      verify/                # Public verification portal
    utils/
      adapter.js             # Backend→frontend field name mapping
      api.js                 # Axios client with JWT interceptor
    styles/
      theme.css              # Design tokens + component classes

nagarik_chain backend/       # FastAPI backend
  main.py                    # App factory, CORS, router mounts
  config.py                  # Environment + JWT settings
  database.py                # SQLAlchemy engine + session
  auth.py                    # JWT creation, biometric + officer integrity guards
  blockchain.py              # Mock Fabric anchoring
  zk.py                      # Mock zero-knowledge proof generation
  ipfs.py                    # Mock IPFS cache
  hsm.py                     # Mock HSM signature challenge
  seed.py                    # Database seeder with demo records
  modules/
    identity/                # Citizen registration, CHIN issuance, biometrics, verification
    documents/               # Issue, verify, revoke documents; chain status check
    institutions/            # Institution + professional registry, public key management
    smart_contracts/         # Deploy, trigger, mock webhook ingestion
    ai_engine/               # Identity, document, eligibility, fraud AI + SHAP explainability
    anti_corruption/         # Bribe reports, integrity scores, decoy tests, whistleblower vault
    audit/                   # Immutable action logging with blockchain anchoring
  tests/
    test_api.py              # Integration tests (pytest)
Tech Stack
LayerChoice
Frontend frameworkReact 18
BundlerVite 8
StylingTailwind CSS v4
RoutingReact Router v7
AnimationsFramer Motion
ChartsRecharts
HTTP clientAxios
Backend frameworkFastAPI
ORMSQLAlchemy 2.0
AuthJWT (python-jose) + biometric gate
ValidationPydantic v2
DatabaseSQLite (development)
Encryptioncryptography (Fernet for sealed vault)
Testingpytest
Design System
Dark-mode interface using a deep navy palette (#0A0F1C, #111D35) with saffron (#FFB347, #FF8C00) as the primary accent. Typography uses Space Grotesk for display, Inter for body, and JetBrains Mono for hashes and identifiers. Key UI primitives include the Nagarik ID Card (3D flip with animated border glow), a scrolling blockchain hash ribbon, and toast-based notifications. Accessibility: ARIA labels on interactive elements, keyboard-navigable portal cards, and prefers-reduced-motion support.

Development Notes
Frontend dev server proxies /api to the backend on port 8000.
JWT tokens are stored in localStorage and attached via axios interceptor.
Backend field names are normalized to frontend conventions through adapter.js.
Audit logs are anchored on-chain (mock) within every write operation.
Bribe report descriptions are encrypted at rest (Fernet); whistleblower vault is court-only sealed access.


## License

MIT
