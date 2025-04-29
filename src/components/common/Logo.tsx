import { Link } from "react-router-dom";
import { Link as LinkIcon } from "lucide-react";

interface LogoProps {
  variant?: "default" | "light" | "dark";
  size?: "sm" | "md" | "lg";
}

export default function Logo({ variant = "default", size = "md" }: LogoProps) {
  const sizeClasses = {
    sm: "text-lg",
    md: "text-xl",
    lg: "text-2xl",
  };

  const variantClasses = {
    default: "text-gray-900 dark:text-white",
    light: "text-white",
    dark: "text-gray-900",
  };

  const iconSizes = {
    sm: 16,
    md: 20,
    lg: 24,
  };

  return (
    <Link to="/" className="flex items-center gap-2 font-semibold">
      <span className="bg-gradient-to-r from-primary-500 to-secondary-500 p-1.5 rounded-lg text-white">
        <LinkIcon size={iconSizes[size]} strokeWidth={2.5} />
      </span>
      <span className={`${sizeClasses[size]} ${variantClasses[variant]}`}>
        NestBio
      </span>
    </Link>
  );
}
