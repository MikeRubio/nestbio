import { Menu, X } from "lucide-react";
import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import ThemeToggle from "../common/ThemeToggle";
import { useUserStore } from "../../stores/userStore";
import { motion, AnimatePresence } from "framer-motion";

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const location = useLocation();
  const { profile } = useUserStore();

  const navItems = [
    { name: "Dashboard", path: "/" },
    { name: "Links", path: "links" },
    { name: "Appearance", path: "appearance" },
    { name: "Analytics", path: "analytics" },
    { name: "Settings", path: "settings" },
  ];

  const getPageTitle = () => {
    const currentItem = navItems.find(
      (item) => item.path === location.pathname
    );
    return currentItem?.name || "Dashboard";
  };

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);

  return (
    <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
      <div className="flex items-center justify-between h-16 px-4 md:px-6">
        <div className="flex items-center md:hidden">
          <button
            onClick={toggleMenu}
            className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100"
            aria-label="Toggle menu"
          >
            {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
          <h1 className="ml-4 text-lg font-medium">{getPageTitle()}</h1>
        </div>

        <div className="hidden md:block">
          <h1 className="text-xl font-medium">{getPageTitle()}</h1>
        </div>

        <div className="flex items-center space-x-4">
          {profile?.username && (
            <Link
              to={`/${profile.username}`}
              target="_blank"
              rel="noopener noreferrer"
              className="hidden sm:flex items-center text-sm font-medium hover:underline"
            >
              <span>View my page</span>
            </Link>
          )}

          <ThemeToggle />
        </div>
      </div>

      {/* Mobile menu */}
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden border-t border-gray-200 dark:border-gray-700 overflow-hidden"
          >
            <nav className="px-4 py-2 space-y-1">
              {navItems.map((item) => (
                <Link
                  key={item.name}
                  to={item.path}
                  className={`block px-4 py-2 text-sm font-medium rounded-lg ${
                    location.pathname === item.path
                      ? "bg-primary-50 text-primary-600 dark:bg-gray-700 dark:text-primary-400"
                      : "text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700"
                  }`}
                  onClick={() => setIsMenuOpen(false)}
                >
                  {item.name}
                </Link>
              ))}
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
