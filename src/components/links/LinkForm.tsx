import { useState } from "react";
import { AlertCircle } from "lucide-react";
import { SOCIAL_MEDIA_LINKS, LinkType } from "../../types/links";
import Button from "../common/Button";
import { validateUrl } from "../../utils/linkUtils";

interface LinkFormProps {
  onSubmit: (linkData: any) => Promise<void>;
  onCancel: () => void;
  initialData?: any;
  isLoading?: boolean;
  mode?: "create" | "edit";
}

export default function LinkForm({
  onSubmit,
  onCancel,
  initialData,
  isLoading,
  mode = "create",
}: LinkFormProps) {
  const [formData, setFormData] = useState({
    title: initialData?.title || "",
    url: initialData?.url || "",
    is_active: initialData?.is_active ?? true,
    link_type: initialData?.link_type || ("custom" as LinkType),
    is_adult_content: initialData?.is_adult_content || false,
    category: initialData?.category || "Other",
  });
  const [validationError, setValidationError] = useState<string | null>(null);

  const handleSubmit = async () => {
    setValidationError(null);

    if (!formData.title.trim()) {
      setValidationError("Title is required");
      return;
    }

    if (!validateUrl(formData.url)) {
      setValidationError(
        "Please enter a valid URL (include http:// or https://)"
      );
      return;
    }

    await onSubmit(formData);
  };

  return (
    <div className="p-6">
      <h3 className="text-lg font-medium mb-4">
        {mode === "create" ? "Add New Link" : "Edit Link"}
      </h3>

      {validationError && (
        <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-lg flex items-start">
          <AlertCircle size={18} className="mr-2 mt-0.5 flex-shrink-0" />
          <p className="text-sm">{validationError}</p>
        </div>
      )}

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Link Type
          </label>
          <select
            value={formData.link_type}
            onChange={(e) =>
              setFormData({
                ...formData,
                link_type: e.target.value as LinkType,
                url:
                  e.target.value === "custom"
                    ? ""
                    : `https://${e.target.value}.com/`,
              })
            }
            className="input"
          >
            <option value="custom">Custom Link</option>
            {Object.entries(SOCIAL_MEDIA_LINKS).map(([key, { name }]) => (
              <option key={key} value={key}>
                {name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Title
          </label>
          <input
            type="text"
            value={formData.title}
            onChange={(e) =>
              setFormData({ ...formData, title: e.target.value })
            }
            placeholder="e.g. My Website"
            className="input"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            URL
          </label>
          <div className="relative">
            {/* {formData.link_type !== "custom" && (
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <span className="text-gray-500">
                  {SOCIAL_MEDIA_LINKS[formData.link_type].baseUrl}
                </span>
              </div>
            )} */}
            <input
              type="text"
              value={formData.url}
              onChange={(e) =>
                setFormData({ ...formData, url: e.target.value })
              }
              placeholder={
                formData.link_type === "custom"
                  ? "https://example.com"
                  : SOCIAL_MEDIA_LINKS[formData.link_type].placeholder
              }
              className="input"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Category
          </label>
          <select
            value={formData.category}
            onChange={(e) =>
              setFormData({ ...formData, category: e.target.value })
            }
            className="input"
          >
            <option value="Social Media">Social Media</option>
            <option value="Content">Content</option>
            <option value="Other">Other</option>
          </select>
        </div>

        <div className="flex items-center gap-4">
          <label className="flex items-center">
            <input
              type="checkbox"
              checked={formData.is_active}
              onChange={(e) =>
                setFormData({ ...formData, is_active: e.target.checked })
              }
              className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
            />
            <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">
              Active
            </span>
          </label>

          <label className="flex items-center">
            <input
              type="checkbox"
              checked={formData.is_adult_content}
              onChange={(e) =>
                setFormData({ ...formData, is_adult_content: e.target.checked })
              }
              className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
            />
            <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">
              Adult Content
            </span>
          </label>
        </div>

        <div className="flex justify-end gap-3">
          <Button variant="outline" onClick={onCancel}>
            Cancel
          </Button>
          <Button
            variant="primary"
            onClick={handleSubmit}
            isLoading={isLoading}
          >
            {mode === "create" ? "Add Link" : "Save Changes"}
          </Button>
        </div>
      </div>
    </div>
  );
}
