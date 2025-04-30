import { Globe, ExternalLink, Trash2 } from "lucide-react";
import { Link, SOCIAL_MEDIA_LINKS } from "../../types/links";
import ShareButton from "./ShareButton";

interface LinkCardProps {
  link: Link;
  onEdit: (link: Link) => void;
  onDelete: (id: string) => void;
  onLinkClick: (link: Link) => void;
}

export default function LinkCard({
  link,
  onEdit,
  onDelete,
  onLinkClick,
}: LinkCardProps) {
  return (
    <div className="p-4 flex items-center justify-between gap-4">
      <div className="flex items-center min-w-0">
        <div className="bg-gray-100 dark:bg-gray-700 rounded-full p-2 mr-3">
          {link.link_type === "custom" ? (
            <Globe size={20} className="text-gray-500 dark:text-gray-400" />
          ) : (
            <img
              src={`https://www.google.com/s2/favicons?domain=${
                SOCIAL_MEDIA_LINKS[link.link_type].baseUrl
              }&sz=32`}
              alt={link.link_type}
              className="w-5 h-5"
            />
          )}
        </div>

        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <h3 className="font-medium truncate">{link.title}</h3>
            {link.is_adult_content && (
              <span className="px-2 py-0.5 text-xs bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 rounded">
                18+
              </span>
            )}
            {!link.is_active && (
              <span className="px-2 py-0.5 text-xs bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 rounded">
                Inactive
              </span>
            )}
          </div>

          <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
            <button
              onClick={() => onLinkClick(link)}
              className="hover:text-primary-600 dark:hover:text-primary-400 flex items-center truncate"
            >
              <span className="truncate">{link.url}</span>
              <ExternalLink size={14} className="ml-1 flex-shrink-0" />
            </button>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <ShareButton linkId={link.id} url={link.url} title={link.title} />

        <button
          className="p-2 rounded-md text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
          onClick={() => onEdit(link)}
          aria-label="Edit"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z" />
            <path d="m15 5 4 4" />
          </svg>
        </button>

        <button
          className="p-2 rounded-md text-gray-500 hover:text-red-600 dark:text-gray-400 dark:hover:text-red-400 hover:bg-gray-100 dark:hover:bg-gray-700"
          onClick={() => onDelete(link.id)}
          aria-label="Delete"
        >
          <Trash2 size={16} />
        </button>
      </div>
    </div>
  );
}
