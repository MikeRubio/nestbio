import { Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';
import Logo from '../components/common/Logo';

export default function LoadingPage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 dark:bg-gray-900">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="text-center"
      >
        <div className="mb-8">
          <Logo size="lg" />
        </div>
        
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
          className="inline-flex"
        >
          <Loader2 size={36} className="text-primary-500" />
        </motion.div>
        
        <p className="mt-4 text-gray-600 dark:text-gray-400">Loading, please wait...</p>
      </motion.div>
    </div>
  );
}