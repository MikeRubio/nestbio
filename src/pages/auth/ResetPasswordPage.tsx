import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { supabase } from '../../lib/supabaseClient';
import Button from '../../components/common/Button';

export default function ResetPasswordPage() {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);
    
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-success`,
      });
      
      if (error) throw error;
      
      setIsSuccess(true);
    } catch (error) {
      console.error('Error resetting password:', error);
      setError((error as Error).message);
    } finally {
      setIsLoading(false);
    }
  };
  
  if (isSuccess) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="card p-6 md:p-8 text-center"
      >
        <div className="bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400 p-4 rounded-lg mb-6">
          <h2 className="text-lg font-medium mb-2">Reset link sent!</h2>
          <p className="text-sm">
            We've sent a password reset link to <strong>{email}</strong>. Please check your inbox and follow the instructions.
          </p>
        </div>
        
        <Link to="/login">
          <Button variant="outline" fullWidth>
            Back to Login
          </Button>
        </Link>
      </motion.div>
    );
  }
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="card p-6 md:p-8"
    >
      <div className="text-center mb-8">
        <h1 className="text-2xl font-bold mb-2">Reset Password</h1>
        <p className="text-gray-600 dark:text-gray-400">
          Enter your email address and we'll send you a link to reset your password.
        </p>
      </div>
      
      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 p-3 rounded-lg mb-4 text-sm">
          {error}
        </div>
      )}
      
      <form onSubmit={handleSubmit}>
        <div className="mb-6">
          <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Email
          </label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="your@email.com"
            required
            className="input"
          />
        </div>
        
        <Button
          type="submit"
          fullWidth
          isLoading={isLoading}
        >
          Send Reset Link
        </Button>
        
        <div className="mt-6 text-center text-sm text-gray-600 dark:text-gray-400">
          Remembered your password?{' '}
          <Link to="/login" className="text-primary-600 dark:text-primary-400 hover:underline">
            Sign in
          </Link>
        </div>
      </form>
    </motion.div>
  );
}