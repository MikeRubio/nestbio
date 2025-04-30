import { useEffect } from "react";
import { Navigate, Outlet, useLocation } from "react-router-dom";
import { supabase } from "../lib/supabaseClient";
import { useUserStore } from "../stores/userStore";
import Logo from "../components/common/Logo";
import ThemeToggle from "../components/common/ThemeToggle";
import LoadingPage from "../pages/LoadingPage";

export default function AuthLayout() {
  const { user, setUser, isLoading, setLoading } = useUserStore();
  const location = useLocation();
  const from = (location.state as any)?.from?.pathname || "/dashboard";

  useEffect(() => {
    setLoading(true);

    // Check for active session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user || null);
      setLoading(false);
    });

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user || null);
    });

    return () => subscription.unsubscribe();
  }, [setUser, setLoading]);

  // Show loading while checking auth
  if (isLoading) {
    return <LoadingPage />;
  }

  // Redirect to dashboard if already authenticated
  if (user) {
    return <Navigate to={from} replace />;
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-50 dark:bg-gray-900">
      <header className="px-4 py-4 flex items-center justify-between">
        <Logo />
        <ThemeToggle />
      </header>

      <main className="flex-1 flex flex-col items-center justify-center p-4">
        <div className="w-full max-w-md">
          <Outlet />
        </div>
      </main>

      <footer className="py-6 text-center text-gray-500 dark:text-gray-400 text-sm">
        &copy; {new Date().getFullYear()} Linko. All rights reserved.
      </footer>
    </div>
  );
}
