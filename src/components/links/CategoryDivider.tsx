import { useState } from "react";
import { Plus } from "lucide-react";

interface CategoryDividerProps {
  onAdd?: () => void;
  title?: string;
  isEditing?: boolean;
}

export default function CategoryDivider({
  onAdd,
  title = "Category",
  isEditing = false,
}: CategoryDividerProps) {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div
      className="relative flex items-center my-4"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="flex-grow border-t border-gray-200 dark:border-gray-700" />
      <span className="mx-4 text-sm font-medium text-gray-500 dark:text-gray-400">
        {title}
      </span>
      <div className="flex-grow border-t border-gray-200 dark:border-gray-700" />

      {isEditing && (
        <button
          onClick={onAdd}
          className={`absolute right-0 top-1/2 -translate-y-1/2 p-1 rounded-full transition-opacity ${
            isHovered ? "opacity-100" : "opacity-0"
          } bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700`}
        >
          <Plus size={14} />
        </button>
      )}
    </div>
  );
}
