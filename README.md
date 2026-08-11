# Mini ERP + CRM Operations Portal

A full-stack ERP/CRM system for a wholesale/distribution company.

## Tech Stack

- Backend: Node.js, TypeScript, Express.js, MongoDB Atlas, JWT
- Frontend: React, TypeScript
- Database: MongoDB Atlas

## Features

- Authentication with role-based access (Admin, Sales, Warehouse, Accounts)
- Customer CRM with follow-up notes
- Product and Inventory management with stock movement log
- Sales Challan flow with stock deduction logic

## Project Structure

```
FundsRoom_CaseStudy/
├── backend/
│   ├── src/
│   │   ├── config/
│   │   ├── controllers/
│   │   ├── middleware/
│   │   ├── models/
│   │   ├── routes/
│   │   ├── app.ts
│   │   └── server.ts
│   ├── .env
│   └── package.json
└── frontend/
```

## Prerequisites

- Node.js v18+
- MongoDB Atlas account

## Environment Variables

Create a `.env` file inside the `backend/` folder:

```
PORT=5000
MONGODB_URI=mongodb+srv://root:<db_password>@smart-white-board.5bqfpna.mongodb.net/fundsroom?retryWrites=true&w=majority&appName=Smart-white-board
JWT_SECRET=your_jwt_secret_key
JWT_EXPIRES_IN=7d
NODE_ENV=development
```

Replace `<db_password>` with your actual MongoDB Atlas password.

## Installation

### Backend

```bash
cd backend
npm install
```

### Frontend

```bash
cd frontend
npm install
```

## Running the App

### Backend

```bash
cd backend
npm run dev
```

Backend runs on: `http://localhost:5000`

### Frontend

```bash
cd frontend
npm run dev
```

Frontend runs on: `http://localhost:5173`

## API Endpoints

### Auth
| Method | Endpoint | Access |
|--------|----------|--------|
| POST | /api/auth/login | Public |
| POST | /api/auth/register | Admin only |
| GET | /api/auth/me | Protected |

### Customers
| Method | Endpoint | Access |
|--------|----------|--------|
| GET | /api/customers | Admin, Sales, Accounts |
| POST | /api/customers | Admin, Sales |
| GET | /api/customers/:id | Admin, Sales, Accounts |
| PUT | /api/customers/:id | Admin, Sales |
| POST | /api/customers/:id/follow-up | Admin, Sales |

### Products
| Method | Endpoint | Access |
|--------|----------|--------|
| GET | /api/products | All roles |
| POST | /api/products | Admin, Warehouse |
| GET | /api/products/:id | All roles |
| PUT | /api/products/:id | Admin, Warehouse |
| GET | /api/products/low-stock | Admin, Warehouse, Sales |

### Stock
| Method | Endpoint | Access |
|--------|----------|--------|
| GET | /api/stock | Admin, Warehouse, Accounts |
| POST | /api/stock | Admin, Warehouse |

### Challans
| Method | Endpoint | Access |
|--------|----------|--------|
| GET | /api/challans | Admin, Sales, Accounts |
| POST | /api/challans | Admin, Sales |
| GET | /api/challans/:id | Admin, Sales, Accounts |
| PATCH | /api/challans/:id/status | Admin, Sales |

## Deployment

Deployment is done on AWS. Refer to server setup documentation for environment configuration.
