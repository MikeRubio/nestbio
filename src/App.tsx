import { useEffect, lazy, Suspense } from "react";
import { Routes, Route, useLocation } from "react-router-dom";
import { useThemeStore } from "./stores/themeStore";
import { useUserStore } from "./stores/userStore";

// Layout
import AppLayout from "./layouts/AppLayout";
import AuthLayout from "./layouts/AuthLayout";

// Pages - Main components loaded immediately
import LoadingPage from "./pages/LoadingPage";
import ProfilePage from "./pages/ProfilePage";
import LandingPage from "./pages/LandingPage";

// Auth Pages - Lazy loaded
const LoginPage = lazy(() => import("./pages/auth/LoginPage"));
const SignupPage = lazy(() => import("./pages/auth/SignupPage"));
const ResetPasswordPage = lazy(() => import("./pages/auth/ResetPasswordPage"));

// Dashboard Pages - Lazy loaded
const DashboardPage = lazy(() => import("./pages/dashboard/DashboardPage"));
const LinksPage = lazy(() => import("./pages/dashboard/LinksPage"));
const AppearancePage = lazy(() => import("./pages/dashboard/AppearancePage"));
const AnalyticsPage = lazy(() => import("./pages/dashboard/AnalyticsPage"));
const SettingsPage = lazy(() => import("./pages/dashboard/SettingsPage"));

function App() {
  const { isDarkMode, setDarkMode } = useThemeStore();
  const { profile } = useUserStore();
  const location = useLocation();

  // Apply dark mode class to html element
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [isDarkMode]);

  // Apply theme color
  useEffect(() => {
    if (profile?.theme_color) {
      document.documentElement.setAttribute(
        "data-theme-color",
        profile.theme_color
      );
    }
  }, [profile?.theme_color]);

  // Check system preference on mount
  useEffect(() => {
    const prefersDark = window.matchMedia(
      "(prefers-color-scheme: dark)"
    ).matches;
    setDarkMode(prefersDark);
  }, [setDarkMode]);

  // Scroll to top on page change
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location.pathname]);

  return (
    <Suspense fallback={<LoadingPage />}>
      <Routes>
        {/* Landing page */}
        <Route path="/" element={<LandingPage />} />

        {/* Public profile route */}
        <Route path="/:username" element={<ProfilePage />} />

        {/* Auth routes */}
        <Route element={<AuthLayout />}>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<SignupPage />} />
          <Route path="/reset-password" element={<ResetPasswordPage />} />
        </Route>

        {/* Dashboard routes - protected */}
        <Route path="/dashboard" element={<AppLayout />}>
          <Route index element={<DashboardPage />} />
          <Route path="links" element={<LinksPage />} />
          <Route path="appearance" element={<AppearancePage />} />
          <Route path="analytics" element={<AnalyticsPage />} />
          <Route path="settings" element={<SettingsPage />} />
        </Route>
      </Routes>
    </Suspense>
  );
}

export default App;
