# HR Management System (HRMS)

A full-stack Human Resource Management System (HRMS) for organizations to manage employees, teams, assignments, and activity logs.

**Frontend:** React + Bootstrap
**Backend:** Node.js + Express + PostgreSQL
**Deployment:** Railway for both (Backend & PostgreSQL) and  Frontend

## Features

1. Register new organizations and login securely using JWT authentication.
2. Employee Management (CRUD): Add, edit, delete, and view employees.
3. Team Management (CRUD):Create, update, delete, and list teams.
4. Team Assignment: Assign or remove employees from teams.
5. System Logs: Track user activity like employee/team creation, updates, assignments, and deletions.
6. Role-Based Access Control: Only authenticated users can access the dashboard, employee, team, and logs pages.
7. Frontend UI: Modern responsive interface with Bootstrap and React.
8. Protected Routes: Only authenticated users can access secure pages; unauthenticated users are redirected to `/login` or `/register`.
9. Default Registration Page: Users see `/register` as the default page when visiting the app.
10. Real-Time Updates (Optional Future Feature): Can integrate WebSocket for real-time team/employee updates.

---

## Tech Stack

* **Frontend:** React, Bootstrap, React Router
* **Backend:** Node.js, Express
* **Database:** PostgreSQL
* **Authentication:** JWT (JSON Web Tokens)
* **Deployment:** Railway (Backend + Database), Vercel/Netlify (Frontend)

---

## Prerequisites

* Node.js >= 16.x
* npm or yarn
* PostgreSQL (local or hosted on Railway)
* Railway account for deployment

---

## Project Structure

```
backend/
  ├─ controllers/       # Business logic for users, employees, teams
  ├─ models/            # DB models (Employees, Teams, Users, Logs)
  ├─ routes/            # API routes
  ├─ seed.js            # Seed script for sample data
  ├─ server.js          # Express server entry
frontend/
  ├─ src/
      ├─ pages/         # Login, Register, Dashboard, Employees, Teams, Logs
      ├─ components/    # Shared components like header, inputs
      ├─ App.js
      ├─ index.js
      ├─ api.js         # Backend API URLs
```

---

## Setup Instructions

### 1. Clone Repository

git clone https://github.com/prasanna-07071999/hrms.git
cd hrms-project

### 2. Backend Setup

```bash
cd backend
npm install
```

#### Database Setup

1. Create a PostgreSQL database (local or Railway hosted).
2. Add environment variables (see [Env Vars]).

#### Run Migrations / Create Tables
1. If you run the code using node sec/index.js it will automatically creates tables and inserts data to tables
2. Automatically Creates sample organization, admin user, employees, teams, and logs.

### 3. Frontend Setup

```bash
cd ../frontend
npm install
```
## Running Locally

### Backend

```bash
cd backend
node src/index.js
```

* Server runs at `http://localhost:5000`

### Frontend

```bash
cd frontend
npm start
```
* Frontend runs at `http://localhost:3000`
---

## Environment Variables

**Backend (.env)**
```
PORT=5000
DB_HOST=<your-db-host>
DB_PORT=<your-db-port>
DB_USER=<your-db-user>
DB_PASSWORD=<your-db-password>
DB_NAME=<your-db-name>
JWT_SECRET=<your-secret-key>
```

## Notes
* The first user must register an organization via `/register`.
* Only authenticated users can access protected routes like `/dashboard`, `/employees`, `/teams`, `/logs`.
* Logs track actions like create/update/delete employees or teams, and team assignments.
---

