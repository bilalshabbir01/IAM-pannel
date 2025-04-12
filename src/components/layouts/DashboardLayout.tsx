// src/components/layouts/DashboardLayout.tsx
import { useEffect, ReactNode } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { logout } from '../../features/auth/authSlice';
import { AppDispatch, RootState } from '../../store';
import Sidebar from '../common/Sidebar';
import Navbar from '../common/Navbar';

interface DashboardLayoutProps {
  children: ReactNode;
}

function DashboardLayout({ children }: DashboardLayoutProps) {
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();
  const { user } = useSelector((state: RootState) => state.auth);

  useEffect(() => {
    if (!user) {
      navigate('/login');
    }
  }, [user, navigate]);

  const onLogout = () => {
    dispatch(logout());
    navigate('/login');
  };

  return (
    <div className="flex h-screen bg-gray-100">
      <Sidebar />
      
      <div className="flex flex-col flex-1 overflow-hidden">
        <Navbar user={user} onLogout={onLogout} />
        
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-100 p-6">
          {children}
        </main>
      </div>
    </div>
  );
}

export default DashboardLayout;