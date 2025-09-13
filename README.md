# SafeNav: A Safety-first Navigation System for Women using Street View and Crime data

## Overview
SafeNav is a **smart, web-based route recommender** designed to **enhance women's safety during urban travel**. By integrating real-time crime data, AI-powered risk prediction, and street view analysis, the system suggests safer routes that prioritize well-lit and low-risk areas.**This project is a part of our Mini Project (CSP67)**.

## Key Features
- **Safe Route Recommendations**: Routes optimized for safety, not just distance or time
- **Street Lighting Detection**: Analysis of Google Street View images to identify well-lit paths
- **Real-time Risk Alerts**: Immediate notifications when entering high-risk areas
- **Emergency Contact Integration**: Automatic alerts to trusted contacts in dangerous situations
- **Incident Reporting**: Community-driven safety insights and feedback collection
- **Predictive Crime Analytics**: Machine learning models to forecast potential risk zones

## Technology Stack
- React (v19.1.0) for the frontend user interface
- Material UI (v7.0.2) for consistent, responsive design
- FastAPI for backend services (not yet configured)
- Google Maps and Street View APIs for navigation and imagery
- MongoDB for data storage (planned)

## Getting Started

### Prerequisites
- Node.js (latest LTS version)
- npm (comes with Node.js)
- Internet connection for API access

### Installation
1. Clone the repository:
   ```
   git clone [your-repository-url]
   cd safenav/frontend
   ```

2. Install dependencies:
   ```
   npm install
   ```

3. Start the development server:
   ```
   npm start
   ```

4. Open [http://localhost:3000](http://localhost:3000) in your browser

## Project Structure
```
frontend/
├── public/        # Static files
├── src/
│   ├── components/  # Reusable UI components
│   │   ├── AuthGuard.js
│   │   ├── InfoCard.js
│   │   ├── MapView.js
│   │   ├── Navbar.js
│   │   ├── RouteForm.js
│   │   ├── Sidebar.js
│   │   ├── SummaryCard.js
│   │   └── WelcomeBanner.js
│   ├── context/    # React context providers
│   ├── images/     # Image assets
│   ├── layouts/    # Page layouts
│   ├── pages/      # Application pages
│   ├── App.js      # Root component
│   └── theme.js    # Theme configuration
```

----

### ------------This repository is my copy of SafeNav project------------------
