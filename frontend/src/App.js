// src/App.js
import 'bootstrap/dist/css/bootstrap.min.css';
import "bootstrap-icons/font/bootstrap-icons.css";
import { BrowserRouter, Route, Switch, Redirect } from "react-router-dom";
import React from 'react';
import { AuthProvider } from "./context/AuthContext";
import Login from "./pages/Login";
import RegisterOrg from "./pages/RegisterOrg";
import Employees from "./pages/Employees";
import Teams from "./pages/Teams";
import Dashboard from './pages/Dashboard';
import TeamAssignment from './pages/TeamAssignment';
import LogsPage from './pages/LogsPage';
import Navbar from "./components/Navbar";
import './App.css';

const ProtectedRoute = ({ component: Component, ...rest }) => {
  const token = localStorage.getItem("jwt");
  return (
    <Route
      {...rest}
      render={props =>
        token ? <Component {...props} /> : <Redirect to="/login" />
      }
    />
  );
};

const App = () => {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Navbar />
          <Switch>
            <Route exact path='/login' component={Login}/>
            <Route exact path='/register' component={RegisterOrg}/>
            <ProtectedRoute exact path='/dashboard' component={Dashboard} />
            <ProtectedRoute exact path='/employees' component={Employees}/>
            <ProtectedRoute exact path='/teams' component={Teams}/>
            <ProtectedRoute exact path="/teams/:teamId/assign" component={TeamAssignment} />
            <ProtectedRoute exact path="/teams/:teamId/assign" component={TeamAssignment} />
            <ProtectedRoute exact path="/logs" component={LogsPage} />
            <Redirect to="/register" />
          </Switch>
      </BrowserRouter>
    </AuthProvider>
  );
};

export default App;