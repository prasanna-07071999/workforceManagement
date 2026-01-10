import 'bootstrap/dist/css/bootstrap.min.css';
import "bootstrap-icons/font/bootstrap-icons.css";
import { BrowserRouter, Route, Switch, Redirect } from "react-router-dom";
import React from 'react';

import { AuthProvider } from "./context/AuthContext";
import { getAuthState } from './utils/auth';

import Login from "./pages/Login";
import RegisterOrg from "./pages/RegisterOrg";
import Dashboard from './pages/Dashboard';
import Employees from "./pages/Employees";
import Teams from "./pages/Teams";
import TeamAssignment from './pages/TeamAssignment';
import LogsPage from './pages/LogsPage';
import Recruitment from './pages/Recruitment';
import Leaves from './pages/Leave';
import Projects from './pages/Projects';
import Attendance from './pages/Attendance';
import DailyUpdates from './pages/DailyUpdates';
import Holidays from './pages/Holidays';
import ChangePassword from './pages/ChangePassword';
import Layout from './components/Layout/Layout';

import './App.css';

/* ================= PROTECTED ROUTE ================= */
const ProtectedRoute = ({ component: Component, ...rest }) => {
  return (
    <Route
      {...rest}
      render={(props) => {
        const auth = getAuthState();

        if (!auth) {
          return <Redirect to="/login" />;
        }

        if (auth.mustChangePassword) {
          return <Redirect to="/change-password" />;
        }

        return (
          <Layout>
            <Component {...props} />
          </Layout>
        );
      }}
    />
  );
};

/* ================= AUTH ROUTE ================= */
const AuthRoute = ({ component: Component, ...rest }) => {
  const auth = getAuthState();

  return (
    <Route
      {...rest}
      render={(props) =>
        auth ? <Redirect to="/dashboard" /> : <Component {...props} />
      }
    />
  );
};

const App = () => {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Switch>

          {/* Public */}
          <AuthRoute exact path="/" component={Login} />
          <AuthRoute exact path="/login" component={Login} />
          <AuthRoute exact path="/register" component={RegisterOrg} />

          {/* Change Password (NO SIDEBAR / NO NAVBAR) */}
          <Route
            exact
            path="/change-password"
            render={(props) => {
              const auth = getAuthState();

              if (!auth) return <Redirect to="/login" />;
              if (!auth.mustChangePassword) return <Redirect to="/dashboard" />;

              return <ChangePassword {...props} />;
            }}
          />

          {/* Protected */}
          <ProtectedRoute exact path="/dashboard" component={Dashboard} />
          <ProtectedRoute exact path="/employees" component={Employees} />
          <ProtectedRoute exact path="/teams" component={Teams} />
          <ProtectedRoute exact path="/teams/:teamId/assign" component={TeamAssignment} />
          <ProtectedRoute exact path="/attendance" component={Attendance} />
          <ProtectedRoute exact path="/leaves" component={Leaves} />
          <ProtectedRoute exact path="/projects" component={Projects} />
          <ProtectedRoute exact path="/recruitment" component={Recruitment} />
          <ProtectedRoute exact path="/daily-updates" component={DailyUpdates} />
          <ProtectedRoute exact path="/holidays" component={Holidays} />
          <ProtectedRoute exact path="/logs" component={LogsPage} />

          <Route path="*">
            <Redirect to="/login" />
          </Route>
        </Switch>
      </BrowserRouter>
    </AuthProvider>
  );
};

export default App;