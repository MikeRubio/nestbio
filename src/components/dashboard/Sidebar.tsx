import { Link, useLocation } from "react-router-dom";
import {
  Home,
  Link as LinkIcon,
  Palette,
  BarChart2,
  Settings,
  LogOut,
  ExternalLink,
  User,
  Crown,
} from "lucide-react";
import Logo from "../common/Logo";
import { useUserStore } from "../../stores/userStore";
import { motion } from "framer-motion";

export default function Sidebar() {
  const location = useLocation();
  const { profile, logout } = useUserStore();

  const navItems = [
    { name: "Dashboard", icon: <Home size={20} />, path: "/dashboard" },
    { name: "Links", icon: <LinkIcon size={20} />, path: "/dashboard/links" },
    {
      name: "Appearance",
      icon: <Palette size={20} />,
      path: "/dashboard/appearance",
    },
    {
      name: "Analytics",
      icon: <BarChart2 size={20} />,
      path: "/dashboard/analytics",
    },
    {
      name: "Settings",
      icon: <Settings size={20} />,
      path: "/dashboard/settings",
    },
    {
      name: "Premium",
      icon: <Crown size={20} />,
      path: "/dashboard/subscription",
    },
  ];

  const isActive = (path: string) => {
    return location.pathname === path;
  };

  return (
    <motion.aside
      initial={{ x: -320 }}
      animate={{ x: 0 }}
      className="hidden md:flex flex-col w-64 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700"
    >
      <div className="p-4 border-b border-gray-200 dark:border-gray-700">
        <Logo />
      </div>

      <div className="flex-1 overflow-y-auto py-4">
        <nav className="px-4 space-y-1">
          {navItems.map((item) => (
            <Link
              key={item.name}
              to={item.path}
              className={`flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-colors ${
                isActive(item.path)
                  ? "bg-theme/10 text-theme"
                  : "text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700"
              }`}
            >
              <span className="mr-3">{item.icon}</span>
              <span>{item.name}</span>

              {isActive(item.path) && (
                <motion.div
                  layoutId="indicator"
                  className="ml-auto w-1.5 h-1.5 rounded-full bg-theme"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ duration: 0.2 }}
                />
              )}
            </Link>
          ))}
        </nav>
      </div>

      <div className="p-4 border-t border-gray-200 dark:border-gray-700">
        {profile?.username && (
          <Link
            to={`/${profile.username}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center mb-4 px-4 py-2 text-sm font-medium rounded-lg border border-theme text-theme hover:bg-theme/10 transition-colors"
          >
            <span className="mr-2">View my page</span>
            <ExternalLink size={16} />
          </Link>
        )}

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="bg-gray-200 dark:bg-gray-700 p-2 rounded-full">
              <User size={18} className="text-gray-500 dark:text-gray-400" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                {profile?.username || "User"}
              </p>
            </div>
          </div>

          <button
            onClick={() => logout()}
            className="p-2 text-gray-500 hover:text-red-500 dark:text-gray-400 dark:hover:text-red-400 transition-colors"
            aria-label="Logout"
          >
            <LogOut size={18} />
          </button>
        </div>
      </div>
    </motion.aside>
  );
}
