import { BarChart2, Users, MousePointerClick } from 'lucide-react';
import { motion } from 'framer-motion';

export default function AnalyticsPage() {
  return (
    <div className="max-w-4xl mx-auto">
      <header className="mb-8">
        <h1 className="text-2xl font-bold mb-2">Analytics</h1>
        <p className="text-gray-600 dark:text-gray-400">
          Track your page performance and link clicks
        </p>
      </header>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="card p-6"
        >
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-medium">Total Views</h2>
            <div className="p-2 rounded-full bg-blue-50 dark:bg-blue-900/20">
              <Users size={20} className="text-blue-500 dark:text-blue-400" />
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
          transition={{ duration: 0.3, delay: 0.1 }}
          className="card p-6"
        >
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-medium">Link Clicks</h2>
            <div className="p-2 rounded-full bg-green-50 dark:bg-green-900/20">
              <MousePointerClick size={20} className="text-green-500 dark:text-green-400" />
            </div>
          </div>
          <p className="text-3xl font-bold mb-1">0</p>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Total clicks this month
          </p>
        </motion.div>
        
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.2 }}
          className="card p-6"
        >
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-medium">Click Rate</h2>
            <div className="p-2 rounded-full bg-purple-50 dark:bg-purple-900/20">
              <BarChart2 size={20} className="text-purple-500 dark:text-purple-400" />
            </div>
          </div>
          <p className="text-3xl font-bold mb-1">0%</p>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Average click-through rate
          </p>
        </motion.div>
      </div>
      
      <div className="card">
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-lg font-medium">Click History</h2>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
            Track your link performance over time
          </p>
        </div>
        
        <div className="p-6">
          <div className="text-center py-12">
            <div className="inline-block p-3 rounded-full bg-gray-100 dark:bg-gray-800 mb-4">
              <BarChart2 size={32} className="text-gray-500 dark:text-gray-400" />
            </div>
            <h3 className="text-lg font-medium mb-2">No data yet</h3>
            <p className="text-gray-600 dark:text-gray-400 max-w-md mx-auto">
              Start sharing your profile to see analytics data here
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}