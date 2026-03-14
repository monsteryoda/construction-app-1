import { Navigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';

export default function Index() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full"></div>
      </div>
    );
  }

  // Redirect to dashboard if logged in
  if (user) {
    return <Navigate to="/dashboard" replace />;
  }

  // Redirect to login if not logged in
  return <Navigate to="/login" replace />;
}