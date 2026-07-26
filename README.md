<div align="center">

# ✈️ TripSync AI
### *The Next-Generation AI-Powered Collaborative Travel & Expense Platform*

![Spring Boot](https://img.shields.io/badge/Spring_Boot-3.2.0-6DB33F?style=for-the-badge&logo=springboot&logoColor=white)
![React](https://img.shields.io/badge/React-18.2-61DAFB?style=for-the-badge&logo=react&logoColor=black)
![Vite](https://img.shields.io/badge/Vite-5.4-646CFF?style=for-the-badge&logo=vite&logoColor=white)
![Google Gemini AI](https://img.shields.io/badge/Google_Gemini_AI-2.0_Flash-8E75B2?style=for-the-badge&logo=google&logoColor=white)
![WebSocket](https://img.shields.io/badge/WebSocket-STOMP-010101?style=for-the-badge&logo=socketdotio&logoColor=white)
![Leaflet Maps](https://img.shields.io/badge/Leaflet-Maps-199900?style=for-the-badge&logo=leaflet&logoColor=white)
![License MIT](https://img.shields.io/badge/License-MIT-green.svg?style=for-the-badge)
![Build Status](https://img.shields.io/badge/Build-Passing-brightgreen?style=for-the-badge)
![PRs Welcome](https://img.shields.io/badge/PRs-Welcome-blue?style=for-the-badge)

<p align="center">
  <a href="#-key-features--upgrades">Features</a> •
  <a href="#-tech-stack">Tech Stack</a> •
  <a href="#-quick-start">Quick Start</a> •
  <a href="#-deployment">Deployment</a> •
  <a href="#-license">License</a>
</p>

---

</div>

## 📌 Project Overview

**TripSync AI** is a world-class, full-stack travel planning and expense management platform designed for modern group travelers. Powered by **Google Gemini AI**, **WebSocket STOMP**, and **Leaflet Maps**, TripSync AI simplifies trip itineraries, live group communication, multi-currency debt settlements, live destination weather forecasts, and photo sharing in an ultra-sleek glassmorphism interface.

---

## 🚀 Key Features & Major Upgrades

### 🤖 1. AI Intelligent Travel Concierge (`/planner`)
* **Google Gemini AI Engine**: Automated multi-day itinerary generation, budget estimations, and activity recommendations tailored to user interests.
* **Standalone Page & Dock Shortcut**: Access via protected route `/planner` or click the AI bot icon in the floating macOS dock.
* **Smart Fallback Engine**: Guaranteed itinerary generation even during network standby or offline modes.

### 💬 2. WhatsApp & Discord-Grade Chat Engine (`/chat`)
* **Live STOMP WebSockets**: Instant real-time message broadcasting across devices.
* **Group Channels & 1-on-1 DMs**: Seamlessly switch between `# Group Channel` and direct 1-on-1 companion chats.
* **🎙️ Voice Notes Recording**: Record and stream real audio voice notes directly inside chat.
* **📌 Top Pinned Messages Glass Banner**: Pin hotel addresses, meetup points, and emergency contacts to the top of the chat room.
* **⚡ Quoted Quick Replies**: Quote parent messages when replying.
* **📷 Photo Attachments**: Upload and share travel photos directly in chat.
* ** Read Receipts**: WhatsApp-style double green checkmarks (`✓✓ Read`) on sent messages.
* **📍 Landmark Location Pins**: Quick-share Karnataka landmarks into chat streams.
* **📲 WhatsApp-Style Invites**: Invite friends to trip chats via **Username**, **Shareable Link**, or **QR Code**.

### 💸 3. Shared Expense Ledger & Debt Settlement (`/expenses`)
* **Multi-Currency Converter**: Real-time currency switcher supporting **$ USD**, **₹ INR**, **€ EUR**, and **£ GBP**.
* **Smart Debt Minimization Algorithm**: Calculate 1-click companion settlements to balance group expenses with minimal transactions.
* **📸 Receipt Scanner Modal**: OCR-ready modal to scan paper receipts and populate expense forms automatically.
* **📊 Category Spending Breakdown**: Visual progress bars for Food 🍔, Transport 🚕, Accommodation 🏨, Activities 🎯, and Shopping 🛍️.
* **📄 CSV Expense Exporter**: Download complete financial ledgers in 1 click.

### 🗺️ 4. Interactive Maps, Weather & Exploration (`/explore` & `/trips`)
* **Leaflet Route Maps**: Interactive map visualization displaying destination pins and itinerary routes.
* **⛅ Live Destination Weather Forecast**: 3-day weather widget showing temperature, precipitation chance, UV index, and packing warnings.
* **🪟 Full-Screen Image Lightbox**: Click photos on the Explore page or Chat attachments to view in a full-screen lightbox with zoom and download controls.
* **👑 Travel Partner Roles**: Assign member permissions (**Organizer 👑**, **Member 🎒**, **Viewer 👁️**).

### 📜 5. Legal Compliance & Mandatory Security Guard (`/terms` & `/privacy`)
* **Terms of Service Page**: Complete legal agreement at `/terms`.
* **Privacy Policy Page**: Complete data protection documentation at `/privacy`.
* **Mandatory Agreement Guard**: Signup button remains disabled (`opacity: 0.5`, `cursor: not-allowed`) until **BOTH** Terms of Service and Privacy Policy checkboxes are accepted.

---

## 🛠️ Tech Stack

| Domain | Technologies Used |
| :--- | :--- |
| **Frontend** | React 18, Vite 5, Redux Toolkit, Lucide React, HTML5 Audio API |
| **Styling** | Vanilla CSS3 (Glassmorphism, Dark/Light Theme System, Custom Accents) |
| **Backend** | Java 17/24, Spring Boot 3.2, Spring Security, JWT, Spring Data JPA |
| **Real-Time** | WebSockets, STOMP Protocol, SockJS |
| **AI Integration** | Google Gemini AI 2.0 Flash REST API |
| **Mapping & Weather**| Leaflet.js, OpenStreetMap, OpenWeather API |
| **Deployment** | Vercel (Frontend), Render / Railway (Spring Boot & PostgreSQL) |

---

## ⚡ Quick Start & Installation

### Prerequisites
- **Java JDK 17+** (JDK 24 supported)
- **Node.js 18+** & `npm`
- **MySQL / PostgreSQL** (or H2 in-memory database)

### 1. Clone the Repository
```bash
git clone https://github.com/Ganesh40292/tripsync-ai.git
cd tripsync-ai
```

### 2. Run Spring Boot Backend
```bash
cd backend
mvn spring-boot:run
```
> *Backend server will start at `http://localhost:8080`*

### 3. Run React Vite Frontend
```bash
cd frontend
npm install
npm run dev
```
> *Frontend dev server will open at `http://localhost:5173`*

---

## ☁️ Production Deployment

Pre-configured deployment files are included in the repository:

- 🔺 **Vercel (Frontend)**: Uses [`frontend/vercel.json`](file:///c:/Users/Asus/OneDrive/Videos/TripSync-AI/frontend/vercel.json) for 100% SPA route rewrites.
- 🟣 **Render (Backend)**: Uses [`render.yaml`](file:///c:/Users/Asus/OneDrive/Videos/TripSync-AI/render.yaml) for 1-click Web Service + PostgreSQL provisioning.
- 🚂 **Railway (Backend)**: Uses [`Dockerfile`](file:///c:/Users/Asus/OneDrive/Videos/TripSync-AI/Dockerfile) and [`railway.json`](file:///c:/Users/Asus/OneDrive/Videos/TripSync-AI/railway.json).

---

## 📄 License

Distributed under the **MIT License**. See `LICENSE` for more information.

---

<div align="center">

### Designed & Developed with ❤️ by [Ganesh40292](https://github.com/Ganesh40292)
*© 2026 TripSync AI. All Rights Reserved.*

</div>
