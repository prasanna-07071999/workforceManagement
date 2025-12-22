### Workforce Management & Analytics Platform

WorkPulse is a full-stack workforce management system designed for organizations to manage employees, teams, and operational insights with role-based access for Admins and Employees.

---

### Key Features

### Admin (HR) Capabilities
- Create and manage organisation
- Add / update / delete employees
- Create teams and assign employees
- View organisation-wide statistics
- Audit logs for system actions

### 👨‍💻 Employee Capabilities
- Secure login
- View assigned teams
- Access personal work information (future scope)

---

## 🛠 Tech Stack

### Frontend
- React.js
- Bootstrap 5
- React Router
- JWT Authentication

### Backend
- Node.js
- Express.js
- MongoDB (Mongoose)
- JWT (Authentication)
- Role-based Authorization
- REST APIs

### Deployment
- Frontend: Render
- Backend: Render
- Database: MongoDB Atlas

---
## Project Structure

HRMS_APP/
├── backend/
│ ├── index.js
│ ├── .env.development
│ ├── .env.production
│
├── frontend/
│ ├── src/
│ ├── public/
│ ├── package.json


---

## Environment Variables

### Backend (`.env.production`)

NODE_ENV=production
PORT=5000
MONGO_URI=your_mongodb_atlas_url
JWT_SECRET=your_secret_key
CLIENT_ORIGIN_PROD=https://your-frontend-url.onrender.com


### Frontend (`.env`)

REACT_APP_BASE_URL=https://your-backend-url.onrender.com


---

##  Running Locally

### Backend
```bash
cd backend
npm install
node index.js

Frontend
cd frontend
npm install
npm start

```
## Authentication Flow

Admin registers organisation

Admin login generates JWT

JWT is stored in localStorage

All protected routes require Authorization header

### Future Enhancements

Attendance tracking

Work hour analytics

Employee self dashboard

Leave management

Job recruitment module

## Author

Prasanna Kumar
Full Stack Developer