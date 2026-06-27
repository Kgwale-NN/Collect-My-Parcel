# Collect My Parcel (CMP) — Complete Documentation

A real-time parcel delivery marketplace connecting customers who need parcel pickup & delivery with verified independent drivers.

---

## Table of Contents

1. [Overview](#overview)
2. [Architecture](#architecture)
3. [User Roles](#user-roles)
4. [Pages & Routing](#pages--routing)
5. [Data Models](#data-models)
6. [Business Logic](#business-logic)
7. [Key Features](#key-features)
8. [Component Index](#component-index)
9. [Integrations](#integrations)
10. [Setup & Configuration](#setup--configuration)

---

## Overview

**Collect My Parcel (CMP)** lets customers post parcel pickup requests (from any store, post office, or locker), and verified drivers accept those jobs and handle collection + delivery. The platform handles everything end-to-end: request submission, driver assignment, real-time GPS tracking, status updates via email, cash/card payments, driver ratings, and a full admin panel for managing drivers and parcels.

### Tech Stack
- **Frontend:** React 18 + Tailwind CSS (theme: orange/primary)
- **Backend:** Base44 (BaaS — entities, auth, email, file storage)
- **Maps:** Google Maps API (Places Autocomplete, Directions, markers)
- **State:** React Query (TanStack), React state, Base44 real-time subscriptions
- **Animations:** Framer Motion
- **Icons:** Lucide React

---

## Architecture

```
src/
├── App.jsx                    # Route definitions (React Router)
├── api/base44Client.js        # Pre-initialized Base44 SDK
├── pages/                     # Page-level components
│   ├── Landing.jsx            # Homepage (landing)
│   ├── Dashboard.jsx          # Role-based dashboard
│   ├── RequestParcel.jsx      # Customer parcel request form
│   ├── TrackParcel.jsx        # Public parcel tracking
│   ├── DriverSignup.jsx       # Driver registration
│   ├── DriverPending.jsx      # Under-review confirmation
│   ├── MyDeliveries.jsx       # Customer delivery history
│   └── AdminPanel.jsx         # Admin: drivers + parcels
├── components/
│   ├── landing/               # Landing page sections
│   │   ├── Navbar.jsx
│   │   ├── HeroSection.jsx
│   │   ├── HowItWorks.jsx
│   │   ├── StatsSection.jsx
│   │   ├── PricingSection.jsx
│   │   ├── ForDrivers.jsx
│   │   └── Footer.jsx
│   ├── dashboard/             # Dashboard components
│   │   ├── ParcelCard.jsx     # Parcel summary card
│   │   ├── ParcelDetail.jsx   # Full parcel detail dialog
│   │   ├── DriverProfileCard.jsx
│   │   ├── DriverEarnings.jsx # Payment/earnings breakdown
│   │   ├── DriverRating.jsx   # Star rating widget
│   │   └── LiveTrackingMap.jsx # Real-time GPS map
│   ├── driver/                # Driver-specific
│   │   ├── AvailabilityToggle.jsx
│   │   └── DriverLocationUpdater.jsx
│   ├── request/               # Parcel request form
│   │   ├── UberAddressInput.jsx
│   │   ├── RouteMap.jsx
│   │   ├── PriceEstimate.jsx
│   │   └── PaymentSection.jsx
│   └── admin/                 # Admin panel
│       ├── AdminDriverCard.jsx
│       └── AdminParcelRow.jsx
├── entities/
│   ├── Parcel.json            # Parcel schema (24 fields)
│   └── User.json              # User schema (custom fields)
├── hooks/
│   └── useGoogleMaps.js       # Dynamic Google Maps loader
├── lib/
│   ├── AuthContext.jsx        # Auth provider & context
│   └── query-client.js        # React Query client
└── index.css                  # Design tokens (Plus Jakarta Sans font)
```

---

## User Roles

| Role | Description | Key Permissions |
|------|-------------|-----------------|
| **customer** (default) | End user requesting parcel pickups | Create pickups, track parcels, rate drivers, view delivery history |
| **driver** | Independent courier | Toggle availability, accept jobs, update delivery status, view earnings & trip history |
| **admin** | Platform manager | Review driver applications, view all parcels, approve/reject drivers, system-wide stats |

### Driver Lifecycle
1. User signs up with role `customer` (default)
2. Navigates to `/driver-signup`, submits ID, license, vehicle info
3. Status becomes `driver_status: 'pending'`
4. Admin reviews and approves/rejects
5. Approved → can toggle online/offline and accept jobs
6. Rejected → can reapply

### User Entity Custom Fields
```
role:          customer | driver | admin (default: customer)
phone:         string
vehicle_type:  motorcycle | bicycle | car | on_foot
is_available:  boolean (default: false)
address:       string
driver_status: pending | approved | rejected
id_document_url: string (uploaded file URL)
license_url:   string (uploaded file URL)
country:       string
city:          string
total_deliveries: number (default: 0)
rating:        number (default: 5)
```

---

## Pages & Routing

All routes defined in `App.jsx` under React Router v6:

| Path | Page | Access |
|------|------|--------|
| `/` | Landing.jsx | Public |
| `/dashboard` | Dashboard.jsx | Authenticated |
| `/request` | RequestParcel.jsx | Customers only |
| `/track` | TrackParcel.jsx | Public (search by tracking #) |
| `/driver-signup` | DriverSignup.jsx | Authenticated |
| `/driver-pending` | DriverPending.jsx | Pending drivers |
| `/my-deliveries` | MyDeliveries.jsx | Customers only |
| `/admin` | AdminPanel.jsx | Admin only |
| `/terms` | Terms.jsx | Public |
| `*` | PageNotFound | Fallback |

### Page Details

#### 1. Landing Page (`/`)
Fully responsive homepage with animated sections:
- **Navbar** — sticky top bar with nav links (How it works, Pricing, For Drivers, Track, Dashboard, Request Pickup button)
- **HeroSection** — "Can't collect your parcel? We'll get it." with animated mock parcel cards, CTA buttons
- **HowItWorks** — 4-step visual guide (Post request → Driver accepts → Collected → Delivered)
- **StatsSection** — Trust stats (4.9★ avg, <5min accept time, 98% on-time, 24/7) + 3 customer testimonials
- **PricingSection** — Feature cards + transparent pricing (R90 base + R22/km) + "Ready to send?" CTA
- **ForDrivers** — Driver recruitment section with benefits
- **Footer** — Brand, nav links (Dashboard, Request, Driver, Track, Terms, Support), copyright

#### 2. Dashboard (`/dashboard`)
Role-aware hub that adapts to customer, driver, or admin:
- **Customer view:** Stats (Total/Active/Delivered), tabbed parcel list (All/Active/Delivered), "New" button → request page, links to "My Deliveries" and "Track"
- **Driver view:** DriverProfileCard (name, vehicle, rating, delivery count, online status), AvailabilityToggle, DriverEarnings (hero payment banner + trip history), job list with accept/advance actions
- **Admin view:** Link to Admin Panel
- Uses real-time subscriptions (`base44.entities.Parcel.subscribe`) for live updates
- GPS location silently broadcast for active driver jobs via `DriverLocationUpdater`

#### 3. Request Parcel (`/request`)
4-step guided form with Google Maps integration:
1. **Step 1 — Locations:** Uber-style pickup/drop-off input with Places Autocomplete + swap button
2. **Step 2 — Store:** Store name + optional tracking number
3. **Step 3 — Details:** Phone, currency selector (ZAR/USD/GBP/EUR/NGN/KES/GHS), preferred time, notes
4. **Step 4 — Payment:** Cash / Card / Wallet with card details form
- Auto price estimation using LLM distance calculation (R90 base + R22/km, adjusted per currency)
- Route preview on Google Map when both locations selected
- On submit: creates Parcel record, sends confirmation email to customer, notifies all available approved drivers

#### 4. Track Parcel (`/track`)
Public tracking page — enter tracking number or parcel ID to see:
- Status progress bar (5 steps: Requested → Assigned → Collected → In Transit → Delivered)
- Parcel details: store, addresses, preferred time, driver name, fee
- Accepts `?id=` URL parameter for deep linking

#### 5. My Deliveries (`/my-deliveries`)
Customer delivery management:
- Summary stats (Active/Delivered/Cancelled counts)
- Unrated deliveries nudge banner
- Tabbed view: Active | Delivered | Cancelled
- Each card shows store, status badge, addresses, price, payment method, driver name
- Delivered parcels show rating or "Rate driver →" prompt
- Tap to open full `ParcelDetail` dialog with live map + rating widget

#### 6. Driver Signup (`/driver-signup`)
Application form:
- Pre-filled name/email from auth
- Phone, City, Country, Vehicle Type (motorcycle/bicycle/car/on foot)
- ID document upload (image/PDF)
- Driver's license upload (optional)
- On submit: updates user role to `driver`, status to `pending`, emails admin
- Redirects to `/driver-pending`
- Shows appropriate state if already pending or approved

#### 7. Driver Pending (`/driver-pending`)
Confirmation page with "What happens next?" steps and link to dashboard.

#### 8. Admin Panel (`/admin`)
Admin-only with role guard:
- **Stats bar:** Total parcels, active jobs, delivered, pending drivers
- **Driver Applications tab:** Pending/Approved/Rejected sections
  - AdminDriverCard: driver info, documents, approve/reject/revoke buttons
  - Approval sends welcome email; rejection sends update email
- **All Parcels tab:** Full table with store, customer, driver, status, price, payment, date

#### 9. Terms (`/terms`)
Static legal page with ToS, driver terms, privacy policy, and contact email.

---

## Data Models

### Parcel Entity
| Field | Type | Description |
|-------|------|-------------|
| `store_name` * | string | Store/sender name (e.g. Takealot, Amazon) |
| `tracking_number` | string | Optional tracking/order number |
| `pickup_address` * | string | Where to collect from |
| `pickup_lat` | number | Pickup latitude |
| `pickup_lng` | number | Pickup longitude |
| `delivery_address` * | string | Where to deliver to |
| `delivery_lat` | number | Delivery latitude |
| `delivery_lng` | number | Delivery longitude |
| `customer_name` | string | Customer's full name |
| `customer_email` * | string | Customer's email (for notifications) |
| `customer_phone` | string | Customer's phone number |
| `notes` | string | Special instructions |
| `preferred_delivery_time` | string | e.g. "Today after 5pm" |
| `status` | enum | `requested` → `accepted` → `collected` → `in_transit` → `delivered` / `cancelled` |
| `driver_email` | string | Assigned driver's email |
| `driver_name` | string | Assigned driver's name |
| `driver_lat` | number | Driver live GPS latitude |
| `driver_lng` | number | Driver live GPS longitude |
| `driver_last_seen` | string | ISO timestamp of last GPS ping |
| `eta_minutes` | number | Estimated arrival time |
| `parcel_size` | enum | `small` / `medium` / `large` (default: medium) |
| `price` | number | Total delivery fee |
| `distance_km` | number | Estimated driving distance |
| `payment_method` | enum | `cash` / `card` (default: cash) |
| `payment_status` | enum | `pending` / `paid` |
| `currency` | string | Currency code (default: USD, app default: ZAR) |
| `driver_rating` | number | Customer's star rating (1-5) |
| `driver_rating_comment` | string | Optional rating comment |

*Required fields marked with *

### Parcel Status Flow
```
requested → accepted → collected → in_transit → delivered
     ↓                                              ↓
  cancelled  ←──────── (from requested/accepted)
```

---

## Business Logic

### Pricing Model
- **Base fee:** R90 (ZAR) / $5 (USD) — for first 3 km
- **Per km rate:** R22 / $1.20 per additional km
- **Currency multipliers:** ZAR ×18, USD ×1, GBP ×0.79, EUR ×0.93, NGN ×1600, KES ×130, GHS ×15
- Price shown before confirm, auto-calculated from GPS coordinates

### Driver Workflow
1. Driver toggles **Online** (sets `is_available: true`)
2. New parcel requests notify all online drivers via email
3. First driver to accept gets the job (sets `driver_email`, `driver_name`, status → `accepted`)
4. Driver marks status advances: collected → in_transit → delivered
5. At each status change, customer gets email notification
6. GPS location broadcast every ~15 seconds during active delivery
7. On delivery: driver's `total_deliveries` increments
8. Customer can rate driver (1-5 stars) with optional comment

### Customer Workflow
1. Enter pickup & delivery addresses on map
2. Provide store name, phone, preferred time
3. Get instant price estimate
4. Choose payment method (cash/card/wallet)
5. Confirm → confirmation email sent
6. Track driver in real-time on map with ETA
7. Receive status emails at each step
8. Rate driver after delivery

### Email Notifications
The system sends automated emails at these touchpoints:
- **To customer:** confirmation, driver assigned, parcel collected, in transit, delivered, cancelled
- **To drivers:** new job alert (all available drivers)
- **To admin:** new driver application
- **To driver:** approval/rejection notification

### Driver Location Tracking
- `DriverLocationUpdater` uses `navigator.geolocation.watchPosition` to broadcast GPS every ~15s
- Only active for parcels in `accepted`, `collected`, `in_transit` status
- `LiveTrackingMap` polls parcel data every 10s for updated driver position
- Shows driver→pickup route (when accepted) or driver→delivery route (when in_transit)
- Displays live ETA calculated via Google Directions API

### Rating System
- After delivery, customer sees star rating widget (1-5) + optional comment
- Rating saved on Parcel record
- Driver's overall rating updated as rolling average across all deliveries

---

## Key Features

1. **Uber-style address input** — Google Places Autocomplete with pickup/drop-off swap
2. **Instant price estimation** — LLM-powered distance calculation, multi-currency support
3. **Real-time GPS tracking** — Live driver location on map with route visualization and ETA
4. **Automated email notifications** — 6+ touchpoints from request to delivery
5. **Driver availability toggle** — Online/offline with visual status indicator
6. **Driver earnings dashboard** — Total earned, today's earnings, cash vs card breakdown, trip history
7. **Star rating system** — Customer rates driver post-delivery, rolling average maintained
8. **Admin panel** — Driver application review, document viewing, parcel oversight, system stats
9. **Multi-currency support** — ZAR, USD, GBP, EUR, NGN, KES, GHS
10. **Mobile-responsive** — All pages optimized for mobile with hamburger nav on landing
11. **Real-time subscriptions** — Dashboard auto-refreshes on any parcel change
12. **Role-based routing** — Auto-redirects based on user role (customer→dashboard, driver→dashboard, admin→admin)

---

## Component Index

### Landing Page Components
| Component | Path | Purpose |
|-----------|------|---------|
| Navbar | `components/landing/Navbar.jsx` | Sticky nav with scroll anchors, auth-aware CTA |
| HeroSection | `components/landing/HeroSection.jsx` | Main hero with animated parcel cards |
| HowItWorks | `components/landing/HowItWorks.jsx` | 4-step process visualization |
| StatsSection | `components/landing/StatsSection.jsx` | Trust stats + testimonials |
| PricingSection | `components/landing/PricingSection.jsx` | Features + transparent pricing |
| ForDrivers | `components/landing/ForDrivers.jsx` | Driver recruitment section |
| Footer | `components/landing/Footer.jsx` | Site footer with nav links |

### Dashboard Components
| Component | Path | Purpose |
|-----------|------|---------|
| ParcelCard | `components/dashboard/ParcelCard.jsx` | Parcel summary card with status/address/price |
| ParcelDetail | `components/dashboard/ParcelDetail.jsx` | Full parcel detail dialog with actions |
| DriverProfileCard | `components/dashboard/DriverProfileCard.jsx` | Driver name, vehicle, rating, deliveries, status |
| DriverEarnings | `components/dashboard/DriverEarnings.jsx` | Payment hero banner + trip history |
| DriverRating | `components/dashboard/DriverRating.jsx` | 5-star rating widget + comment |
| LiveTrackingMap | `components/dashboard/LiveTrackingMap.jsx` | Real-time GPS map with driver marker & ETA |

### Driver Components
| Component | Path | Purpose |
|-----------|------|---------|
| AvailabilityToggle | `components/driver/AvailabilityToggle.jsx` | Online/offline toggle button |
| DriverLocationUpdater | `components/driver/DriverLocationUpdater.jsx` | Silent GPS broadcaster (no UI) |

### Request Form Components
| Component | Path | Purpose |
|-----------|------|---------|
| UberAddressInput | `components/request/UberAddressInput.jsx` | Pickup/drop-off with autocomplete + swap |
| RouteMap | `components/request/RouteMap.jsx` | Google Maps route preview |
| PriceEstimate | `components/request/PriceEstimate.jsx` | Distance/time/price display |
| PaymentSection | `components/request/PaymentSection.jsx` | Cash/card/wallet selector + card form |

### Admin Components
| Component | Path | Purpose |
|-----------|------|---------|
| AdminDriverCard | `components/admin/AdminDriverCard.jsx` | Driver profile with approve/reject actions |
| AdminParcelRow | `components/admin/AdminParcelRow.jsx` | Parcel table row |

---

## Integrations

### Google Maps
- **API:** Google Maps JavaScript API (`places` library)
- **Usage:** Address autocomplete, route display, live driver tracking, ETA calculation
- **Setup:** Requires `VITE_GOOGLE_MAPS_API_KEY` environment variable
- **Files:** `hooks/useGoogleMaps.js` (dynamic loader), `UberAddressInput`, `RouteMap`, `LiveTrackingMap`

### Base44 Core Integrations
- **InvokeLLM:** Distance/duration estimation between GPS coordinates
- **SendEmail:** 6+ automated email notification types
- **UploadFile:** Driver ID documents and license uploads

---

## Setup & Configuration

### Environment Variables
```
VITE_GOOGLE_MAPS_API_KEY=your_google_maps_api_key
```

### Google Cloud Setup
1. Enable Maps JavaScript API, Places API, and Directions API
2. Create API key with HTTP referrer restriction to your domain
3. Set `VITE_GOOGLE_MAPS_API_KEY` in Base44 environment variables

### Design Tokens
The app uses CSS custom properties defined in `index.css`:
- **Font:** Plus Jakarta Sans (Google Fonts)
- **Primary color:** Orange (#f97316 / HSL 24 95% 53%)
- **Border radius:** 0.75rem
- **Dark mode:** Full dark theme support via `.dark` class

---

## Deployment Notes

- Built on Vite + React, served as static SPA
- Base44 handles auth, database, file storage, and email
- No additional backend required
- Published as web app; same codebase works for iOS/Android via Base44 mobile publishing