# Employee Management System

A full-stack Employee Management System built with **Node.js**, **Express**, **MongoDB**, **React**, **JWT Authentication**, **Socket.io**, and optional **Redis**.

## Architecture

```
MVC + Service + Repository Pattern

Request → Route → Controller → Service → Repository → MongoDB
                ↓
           Middleware (Auth, RBAC, Validation, Audit)
```

## Features

| Module | Capabilities |
|--------|-------------|
| **Authentication** | JWT access + refresh tokens, role-based login |
| **RBAC** | Admin, HR, Manager, Employee roles with granular permissions |
| **Employee Lifecycle** | Onboarding → Active → Leave → Termination with history |
| **Attendance** | Check-in/out, shift tracking, late detection, manual marking |
| **Leave Management** | Multi-level approval (Manager → HR), balance tracking |
| **Payroll** | Salary processing, bulk generation, draft → processed → paid |
| **Departments & Designations** | Org structure management |
| **Performance Reviews** | Ratings, goals, acknowledgment workflow |
| **Documents** | Multer + Cloudinary file upload with verification |
| **Notifications** | Real-time via Socket.io + email |
| **Announcements** | Targeted by role/department |
| **Audit Logs** | Action tracking with IP and metadata |
| **Dashboard Analytics** | Charts for headcount, leaves, payroll |
| **Reports** | Excel/PDF export |
| **API Docs** | Swagger UI at `/api-docs` |

## Project Structure

```
EMS/
├── backend/
│   ├── src/
│   │   ├── config/          # Database, Redis, Cloudinary, Swagger, Mailer
│   │   ├── controllers/     # HTTP request handlers
│   │   ├── docs/            # Swagger YAML
│   │   ├── middleware/      # Auth, RBAC, validation, upload, audit, rate limit
│   │   ├── models/          # Mongoose schemas (14 models)
│   │   ├── repositories/    # Data access layer
│   │   ├── routes/          # Express route definitions
│   │   ├── scripts/         # Database seed
│   │   ├── services/        # Business logic
│   │   ├── sockets/         # Socket.io handlers
│   │   ├── utils/           # JWT, email, export, pagination, logger
│   │   ├── validators/      # Joi validation schemas
│   │   ├── app.js
│   │   └── server.js
│   ├── .env.example
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── components/      # Layout, shared UI
│   │   ├── context/         # Auth context + Socket.io
│   │   ├── pages/           # Dashboard, Employees, Leaves, etc.
│   │   └── services/        # Axios API client
│   └── package.json
└── README.md
```

## Quick Start

### Prerequisites

- Node.js 18+
- MongoDB 6+
- Redis (optional, set `REDIS_ENABLED=true`)

### Backend Setup

```bash
cd backend
cp .env.example .env
# Edit .env with your MongoDB URI and JWT secrets

npm install
npm run seed    # Seed demo data
npm run dev     # Start on http://localhost:5000
```

### Frontend Setup

```bash
cd frontend
cp .env.example .env
npm install
npm run dev     # Start on http://localhost:5173
```

### Demo Accounts

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@ems.com | Admin@123456 |
| HR | hr@ems.com | Hr@123456 |
| Manager | manager@ems.com | Manager@123456 |
| Employee | employee@ems.com | Employee@123456 |

## API Documentation

Swagger UI: **http://localhost:5000/api-docs**

All endpoints are prefixed with `/api/v1`.

### Key Endpoints

```
POST   /api/v1/auth/login              Login
POST   /api/v1/auth/refresh            Refresh token
GET    /api/v1/employees               List employees (paginated)
POST   /api/v1/attendance/check-in     Check in
POST   /api/v1/leaves                  Submit leave request
PATCH  /api/v1/leaves/:id/approve      Approve/reject leave
GET    /api/v1/dashboard/analytics     Admin dashboard
GET    /api/v1/reports/employees       Export Excel/PDF
```

### Pagination & Filtering

All list endpoints support:
- `page`, `limit` — pagination
- `search` — text search
- `sortBy`, `order` — sorting (asc/desc)
- Resource-specific filters (status, department, etc.)

## Security

- **Helmet** — HTTP security headers
- **Rate limiting** — API and auth endpoints
- **Mongo sanitize** — NoSQL injection prevention
- **HPP** — HTTP parameter pollution protection
- **JWT** — Short-lived access tokens + refresh token rotation
- **RBAC** — Permission-based route authorization
- **Password hashing** — bcrypt with cost factor 12
- **Audit logging** — Sensitive operations tracked
- **Input validation** — Joi schemas on all write endpoints

## Environment Variables

See `backend/.env.example` for all configuration options including:
- MongoDB URI
- JWT secrets
- Redis URL (optional)
- SMTP for email notifications
- Cloudinary for file uploads

## License

MIT
