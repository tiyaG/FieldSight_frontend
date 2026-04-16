# FieldSight 🚀
**Advanced Agricultural Autonomy Group • SJSU Theta Tau • Class of 2026**

FieldSight is a full-stack AI-driven agricultural monitoring platform. We develop autonomous rovers designed to navigate crop beds and identify plant diseases at an early stage using computer vision and integrated hardware systems.

## 🖥️ Platform Overview

### 1. Landing Page: "The New Era of Digital Agriculture"
The entry point of the application features a high-impact hero section focused on precision agriculture.
* **Navigation:** Direct access to Home, About Us, and our Product vision.
* **Secure Access:** A dedicated "Client Login" portal for farmers to manage their fleets.

### 2. Mission Control (Dashboard)
The core engine of the frontend where users manage active rover operations.
* **Live Mapping:** Integrated Mapbox GL satellite interface for drawing mission paths and real-time tracking.
* **Sticky WebSocket Integration:** Custom logic tied to `currentSessionId` to maintain stable data streams during rover uploads.
* **Real-time Diagnostics:** Live monitoring of battery levels, speed, and hardware status.

### 3. Engineering Log (About Us)
A deep dive into the engineering teams and project documentation.
* **Specialized Teams:** Detailed breakdowns for the Software, Mechanical, Electrical, and Micro-controller teams.
* **Project Artifacts:** A scrollable, high-fidelity gallery documenting our system builds.

## 🛠️ Tech Stack
* **Framework:** React + Vite
* **Mapping:** Mapbox GL JS
* **Icons:** Lucide React
* **Styling:** Tailwind-adjacent Custom CSS (Sage & Earth Theme)
* **Communication:** WebSockets (Telemetry & Scans) + REST API

## 📁 Project Structure
Based on our latest repository update:

```text
FEILDSIGHT/
├── public/                 # Static Assets & Team Documentation
│   ├── IMG_2990.JPG        # Main Team Photo
│   ├── IMG_3210.JPG        # Hardware Artifacts
│   └── favicon.svg         # Site Branding
├── src/                    # Application Source
│   ├── api/                # Global API configuration
│   ├── Auth/               # Auth.jsx, Login.jsx, Signup.jsx
│   ├── landing/            # LandingPage.jsx & Sub-components
│   │   ├── components/     # Header, Footer, StatCard
│   │   └── images/         # Purpose and Solution assets
│   ├── AboutUs.jsx         # Engineering gallery & Team profiles
│   ├── Dashboard.jsx       # Mission Control & Map interface
│   ├── App.jsx             # Main Router & State logic
│   └── main.jsx            # Entry point
├── .env                    # Environment keys (Mapbox/API)
└── api_contract.md         # Backend communication specs


- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Oxc](https://oxc.rs)
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/)

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the ESLint configuration

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and [`typescript-eslint`](https://typescript-eslint.io) in your project.
