import { SOCIAL_MEDIA_LINKS, LinkType } from "../../types/links";
import {
  Twitter,
  Instagram,
  Facebook,
  Youtube,
  Linkedin,
  Github,
  Music2,
} from "lucide-react";

interface SocialMediaSelectorProps {
  value: string;
  type: LinkType;
  onTypeChange: (type: LinkType) => void;
  onValueChange: (value: string) => void;
}

const ICONS = {
  twitter: Twitter,
  instagram: Instagram,
  facebook: Facebook,
  youtube: Youtube,
  linkedin: Linkedin,
  github: Github,
  tiktok: Music2,
};

export default function SocialMediaSelector({
  value,
  type,
  onTypeChange,
  onValueChange,
}: SocialMediaSelectorProps) {
  const handleValueChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    // Remove the base URL if pasted
    const platform =
      SOCIAL_MEDIA_LINKS[type as keyof typeof SOCIAL_MEDIA_LINKS];
    if (platform && newValue.startsWith(platform.baseUrl)) {
      onValueChange(newValue.slice(platform.baseUrl.length));
    } else {
      onValueChange(newValue);
    }
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
        {Object.entries(SOCIAL_MEDIA_LINKS).map(([key, platform]) => {
          const Icon = ICONS[key as keyof typeof ICONS];
          return (
            <button
              key={key}
              onClick={() => onTypeChange(key as LinkType)}
              className={`p-3 rounded-lg flex items-center justify-center gap-2 transition-colors ${
                type === key
                  ? "bg-primary-50 text-primary-600 dark:bg-primary-900/30 dark:text-primary-400"
                  : "bg-gray-50 text-gray-600 hover:bg-gray-100 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-gray-700"
              }`}
            >
              <Icon size={18} />
              <span className="text-sm font-medium">{platform.name}</span>
            </button>
          );
        })}
      </div>

      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-500 dark:text-gray-400">
          {SOCIAL_MEDIA_LINKS[type as keyof typeof SOCIAL_MEDIA_LINKS]?.baseUrl}
        </div>
        <input
          type="text"
          value={value}
          onChange={handleValueChange}
          placeholder={
            SOCIAL_MEDIA_LINKS[type as keyof typeof SOCIAL_MEDIA_LINKS]
              ?.placeholder
          }
          className="input pl-[140px]"
        />
      </div>
    </div>
  );
}
