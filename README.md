# NordHavn Logistics Dashboard

A clean MERN-style workspace with three separate app folders:

- `frontend/` for the Next.js React UI
- `backend/` for the Express + MongoDB API
- `ml/` for the standalone delay prediction service

This structure makes the project easier to manage locally and easier to deploy as separate services.

## Quick Start

Start each service in its own terminal:

```bash
# Terminal 1
cd backend
npm install
npm run dev

# Terminal 2
cd frontend
npm install
npm run dev

# Terminal 3
cd ml
npm install
npm run dev
```

You can also use the root workspace scripts:
```bash
npm run dev:backend
npm run dev:frontend
npm run dev:ml
```

Open `http://localhost:3000`

Demo account:

```text
admin@test.com / password123
```

## Stack

Frontend:
- Next.js + React
- `.jsx` pages/components
- Zustand
- Tailwind CSS

Backend:
- Node.js + Express.js
- MongoDB + Mongoose
- JWT auth

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


## Folder Structure

```text
frontend/
  components/
    Layout.jsx
    Notification.jsx
    ShipmentForm.jsx
  hooks/
    useShipmentNotifications.js
  pages/
    _app.jsx
    index.jsx
    login.jsx
    register.jsx
    dashboard.jsx
    shipments.jsx
    manage-shipments.jsx
    shipment/[id].jsx
  store/
    authStore.js
    notificationStore.js
    shipmentStore.js
  utils/
    pdfGenerator.js

backend/
  config/
  middleware/
  models/
  routes/
  services/
    mlClient.js
  seeds/
  server.js

ml/
  src/
    predictor.js
  server.js
```

## Environment Variables

Backend `backend/.env`:

```bash
PORT=5001
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret_key
ML_SERVICE_URL=http://localhost:5002
```

Frontend `frontend/.env`:

```bash
NEXT_PUBLIC_API_URL=http://localhost:5001
```

ML `ml/.env`:

```bash
ML_PORT=5002
```

## API Endpoints

**Auth:**
- POST /api/auth/login
- POST /api/auth/register
- GET /api/auth/me
=======
Backend:
- `POST /api/auth/login`
- `GET /api/auth/me`
- `GET /api/shipments`
- `GET /api/shipments/:id`
- `POST /api/shipments`
- `PUT /api/shipments/:id`
- `DELETE /api/shipments/:id`

ML:
- `POST /predict`

## Notes

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

Built with Next.js + Express.js + MongoDB
=======
- Shipment delay prediction is owned by the `ml/` service.
- The backend enriches shipment responses with `delayPrediction`.
- The frontend consumes the final API payload and stays focused on UI.

## 🚀 Clone the repository:

   ```bash
   git clone https://github.com/codeypas/codeypasNordHavn
   ```
---

## 📫 Contact

Got feedback or want to connect?

📌 [GitHub Profile](https://github.com/codeypas)  
📧 Contact: bjbestintheworld@gmail.com  
📄 Project Brochure: https://drive.google.com/file/d/1eUnPTNYhHWyuGhOo5r6so6iFHEseLULT/view?usp=sharing

---
### 🏆 Motto  
**“Build. Learn. Repeat.”**

---

