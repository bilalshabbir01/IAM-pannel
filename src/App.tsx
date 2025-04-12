// src/App.tsx
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { RootState } from './store';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Users from './pages/Users';
import Groups from './pages/Groups';
import Roles from './pages/Roles';
import Modules from './pages/Modules';
import Permissions from './pages/Permissions';
import { ReactNode } from 'react';

interface ProtectedRouteProps {
  children: ReactNode;
}

// Protected route component to check authentication
const ProtectedRoute = ({ children }: ProtectedRouteProps) => {
  const { user } = useSelector((state: RootState) => state.auth);
  
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  
  return <>{children}</>;
};

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        
        <Route path="/" element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        } />
        
        <Route path="/users" element={
          <ProtectedRoute>
            <Users />
          </ProtectedRoute>
        } />
        
        <Route path="/groups" element={
          <ProtectedRoute>
            <Groups />
          </ProtectedRoute>
        } />
        
        <Route path="/roles" element={
          <ProtectedRoute>
            <Roles />
          </ProtectedRoute>
        } />
        
        <Route path="/modules" element={
          <ProtectedRoute>
            <Modules />
          </ProtectedRoute>
        } />
        
        <Route path="/permissions" element={
          <ProtectedRoute>
            <Permissions />
          </ProtectedRoute>
        } />
      </Routes>
    </Router>
  );
}

export default App;