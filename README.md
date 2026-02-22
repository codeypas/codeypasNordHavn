# NordHavn Logistics Dashboard

A complete full-stack logistics management application with admin panel for managing shipments. Built with Next.js, React, Express.js, and MongoDB.

## Quick Start

```bash
# Terminal 1: Start Backend
cd backend
npm install
# Create .env file with your MongoDB URI
npm run dev

# Terminal 2: Start Frontend
cd frontend
npm install
npm run dev
```

Open http://localhost:3000

**Demo Account:** 
admin: bijay@gmail.com / password123
manager: manager@gmail.com / password123

## Project Features

- **Dashboard**: KPI cards, risk distribution charts, status overview
- **Shipments List**: Search, filter, sort shipments
- **Shipment Details**: Full tracking and compliance information
- **Admin Panel**: Add, edit, delete shipments
- **Role-Based Access**: Admin and Manager roles
- **MongoDB Integration**: Full data persistence
- **JWT Authentication**: Secure API endpoints

## Technology Stack

**Backend:**
- Node.js + Express.js
- MongoDB
- Mongoose ODM
- JWT Authentication
- bcrypt for password hashing

**Frontend:**
- Next.js + React
- Zustand for state management
- Axios for API calls
- Recharts for visualizations
- Tailwind CSS for styling

## MongoDB Setup

### Using MongoDB Atlas

1. Get connection string
2. Add to `.env` in backend folder

## Database Models

**User:**
- email, password, name, role (admin/manager)

**Shipment:**
- shipmentId, origin, destination, status
- riskScore, compliancePercentage
- departureDate, expectedArrival
- cargoType, weight, value
- currentLocation, documents, notes

## File Structure

```
frontend/
  pages/
    - login.js (authentication)
    - dashboard.js (KPI + charts)
    - shipments.js (list view)
    - manage-shipments.js (admin panel)
    - shipment/[id].js (details)
  components/
    - Layout.js (sidebar navigation)
    - ShipmentForm.js (add/edit form)
  store/
    - authStore.js (Zustand auth)
    - shipmentStore.js (Zustand shipments)

backend/
  models/
    - User.js
    - Shipment.js
  routes/
    - authRoutes.js
    - shipmentRoutes.js
  middleware/
    - auth.js
  seeds/
    - seedData.js (initial data)
  server.js (Express app)
```

## API Endpoints

**Auth:**
- POST /api/auth/login
- POST /api/auth/register
- GET /api/auth/me

**Shipments:**
- GET /api/shipments
- GET /api/shipments/:id
- POST /api/shipments (admin)
- PUT /api/shipments/:id (admin)
- DELETE /api/shipments/:id (admin)

## Environment Variables

**Backend (.env):**
```
PORT=5000
MONGODB_URI=your_mongodb_connection_string
NODE_ENV=development
JWT_SECRET=your_jwt_secret_key
```

**Frontend (.env):**
```
NEXT_PUBLIC_API_URL=http://localhost:5001
```

---
### 🌐 Connect & Contribute

📌 [GitHub Profile](https://github.com/codeypas)  
📧 Contact: bjbestintheworld@gmail.com  
🔗 [Portfolio](https://bijayadhikari28.com.np/) 
.
---

Built with Next.js + Express.js + MongoDB
