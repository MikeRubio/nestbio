import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { supabase } from "../../lib/supabaseClient";
import Button from "../../components/common/Button";

export default function SignupPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [username, setUsername] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      // Check if username is available
      const { data: existingUsers, error: checkError } = await supabase
        .from("profiles")
        .select("username")
        .eq("username", username)
        .limit(1);

      if (checkError) throw checkError;

      if (existingUsers && existingUsers.length > 0) {
        setError("Username is already taken. Please choose another one.");
        setIsLoading(false);
        return;
      }

      // Create user account
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            username,
          },
        },
      });

      if (error) throw error;

      navigate("/");
    } catch (error) {
      console.error("Error signing up:", error);
      setError((error as Error).message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="card p-6 md:p-8"
    >
      <div className="text-center mb-8">
        <h1 className="text-2xl font-bold mb-2">
          Create your NestBio - Linko page
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Sign up for a free account and get started!
        </p>
      </div>

      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 p-3 rounded-lg mb-4 text-sm">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label
            htmlFor="username"
            className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
          >
            Username
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-500 dark:text-gray-400">
              nestbio.co/
            </div>
            <input
              id="username"
              type="text"
              value={username}
              onChange={(e) =>
                setUsername(
                  e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, "")
                )
              }
              placeholder="yourname"
              required
              pattern="[a-z0-9_]+"
              minLength={3}
              maxLength={30}
              className="input pl-[6.5rem]"
            />
          </div>
          <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
            Only lowercase letters, numbers, and underscores.
          </p>
        </div>

        <div className="mb-4">
          <label
            htmlFor="email"
            className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
          >
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

        <div className="mb-6">
          <label
            htmlFor="password"
            className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
          >
            Password
          </label>
          <input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            required
            minLength={6}
            className="input"
          />
          <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
            At least 6 characters required.
          </p>
        </div>

        <Button type="submit" fullWidth isLoading={isLoading}>
          Create Account
        </Button>

        <div className="mt-6 text-center text-sm text-gray-600 dark:text-gray-400">
          Already have an account?{" "}
          <Link
            to="/login"
            className="text-primary-600 dark:text-primary-400 hover:underline"
          >
            Sign in
          </Link>
        </div>
      </form>
    </motion.div>
  );
}
