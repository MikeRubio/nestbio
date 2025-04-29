import { useEffect } from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { supabase } from '../lib/supabaseClient';
import { useUserStore } from '../stores/userStore';
import Sidebar from '../components/dashboard/Sidebar';
import Header from '../components/dashboard/Header';
import LoadingPage from '../pages/LoadingPage';

export default function AppLayout() {
  const { user, setUser, isLoading, setLoading, fetchProfile } = useUserStore();
  const location = useLocation();
  
  useEffect(() => {
    setLoading(true);
    
    // Check for active session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user || null);
      setLoading(false);
    });
    
    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setUser(session?.user || null);
      }
    );
    
    return () => subscription.unsubscribe();
  }, [setUser, setLoading]);
  
  // Fetch profile when user is set
  useEffect(() => {
    if (user) {
      fetchProfile();
    }
  }, [user, fetchProfile]);
  
  // Show loading while checking auth
  if (isLoading) {
    return <LoadingPage />;
  }
  
  // Redirect to login if not authenticated
  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }
  
  return (
    <div className="flex h-screen bg-gray-50 dark:bg-gray-900">
      <Sidebar />
      <div className="flex flex-col flex-1 overflow-hidden">
        <Header />
        <main className="flex-1 overflow-y-auto p-4 md:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}