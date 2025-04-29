import { useEffect } from "react";
import { Link } from "react-router-dom";
import {
  BarChart2,
  ExternalLink,
  Link as LinkIcon,
  PlusCircle,
  Users,
} from "lucide-react";
import { motion } from "framer-motion";
import { useLinkStore } from "../../stores/linkStore";
import { useUserStore } from "../../stores/userStore";
import Button from "../../components/common/Button";

export default function DashboardPage() {
  const { links, fetchLinks, isLoading } = useLinkStore();
  const { profile } = useUserStore();

  useEffect(() => {
    fetchLinks();
  }, [fetchLinks]);

  return (
    <div className="max-w-5xl mx-auto">
      <header className="mb-8">
        <h1 className="text-2xl font-bold mb-2">
          Welcome to your NestBio dashboard
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Manage all your links and customize your profile.
        </p>
      </header>

      {profile?.username && (
        <Link
          to={`/${profile.username}`}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-between p-4 mb-8 bg-primary-50 dark:bg-primary-900/20 border border-primary-200 dark:border-primary-800 rounded-lg transition-all hover:shadow-md"
        >
          <div>
            <h2 className="text-lg font-medium text-primary-700 dark:text-primary-300">
              Your NestBio page is live!
            </h2>
            <p className="text-primary-600 dark:text-primary-400">
              nestbio.co/{profile.username}
            </p>
          </div>
          <Button variant="primary" rightIcon={<ExternalLink size={16} />}>
            Visit Page
          </Button>
        </Link>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.1 }}
          className="card p-6"
        >
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-medium">Active Links</h2>
            <div className="p-2 rounded-full bg-blue-50 dark:bg-blue-900/20">
              <LinkIcon
                size={20}
                className="text-blue-500 dark:text-blue-400"
              />
            </div>
          </div>
          <p className="text-3xl font-bold mb-1">
            {isLoading ? "..." : links.filter((link) => link.is_active).length}
          </p>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            {links.length > 0 ? "Your published links" : "Add your first link"}
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.2 }}
          className="card p-6"
        >
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-medium">Total Views</h2>
            <div className="p-2 rounded-full bg-green-50 dark:bg-green-900/20">
              <Users size={20} className="text-green-500 dark:text-green-400" />
            </div>
          </div>
          <p className="text-3xl font-bold mb-1">0</p>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Profile views this month
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.3 }}
          className="card p-6"
        >
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-medium">Link Clicks</h2>
            <div className="p-2 rounded-full bg-purple-50 dark:bg-purple-900/20">
              <BarChart2
                size={20}
                className="text-purple-500 dark:text-purple-400"
              />
            </div>
          </div>
          <p className="text-3xl font-bold mb-1">0</p>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Total clicks this month
          </p>
        </motion.div>
      </div>

      <div className="card overflow-visible">
        <div className="border-b border-gray-200 dark:border-gray-700 p-4 md:p-6 flex flex-col sm:flex-row justify-between gap-4">
          <div>
            <h2 className="text-lg font-medium mb-1">Recent Links</h2>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {links.length > 0
                ? "Manage your most recent links"
                : "Add links to your profile"}
            </p>
          </div>
          <div>
            <Link to="/links">
              <Button variant="primary" leftIcon={<PlusCircle size={16} />}>
                Add New Link
              </Button>
            </Link>
          </div>
        </div>

        <div className="p-4 md:p-6">
          {isLoading ? (
            <div className="flex justify-center py-6">
              <p className="text-gray-500 dark:text-gray-400">
                Loading links...
              </p>
            </div>
          ) : links.length > 0 ? (
            <div className="grid gap-4">
              {links.slice(0, 3).map((link) => (
                <Link
                  to="/links"
                  key={link.id}
                  className="flex items-center justify-between p-4 rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                >
                  <div className="flex items-center">
                    <div className="p-2 rounded-full bg-gray-100 dark:bg-gray-700 mr-3">
                      <LinkIcon
                        size={16}
                        className="text-gray-500 dark:text-gray-400"
                      />
                    </div>
                    <div>
                      <h3 className="font-medium">{link.title}</h3>
                      <p className="text-sm text-gray-500 dark:text-gray-400 truncate max-w-[200px] sm:max-w-[400px]">
                        {link.url}
                      </p>
                    </div>
                  </div>
                  <span
                    className={`text-xs px-2 py-1 rounded ${
                      link.is_active
                        ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                        : "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400"
                    }`}
                  >
                    {link.is_active ? "Active" : "Inactive"}
                  </span>
                </Link>
              ))}

              {links.length > 3 && (
                <div className="text-center mt-2">
                  <Link
                    to="/links"
                    className="text-primary-600 dark:text-primary-400 hover:underline"
                  >
                    View all links
                  </Link>
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-12">
              <div className="inline-block p-3 rounded-full bg-gray-100 dark:bg-gray-800 mb-4">
                <LinkIcon
                  size={32}
                  className="text-gray-500 dark:text-gray-400"
                />
              </div>
              <h3 className="text-lg font-medium mb-2">No links created yet</h3>
              <p className="text-gray-600 dark:text-gray-400 mb-6 max-w-md mx-auto">
                Add your first link to start building your personalized profile.
              </p>
              <Link to="/links">
                <Button variant="primary" leftIcon={<PlusCircle size={16} />}>
                  Add Your First Link
                </Button>
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
