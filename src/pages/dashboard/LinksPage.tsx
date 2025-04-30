import { useState, useEffect } from "react";
import {
  Plus,
  Trash2,
  ExternalLink,
  AlertCircle,
  Globe,
  Share2,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useLinkStore, Link } from "../../stores/linkStore";
import { useUserStore } from "../../stores/userStore";
import { templates } from "../../types/templates";
import { SOCIAL_MEDIA_LINKS, LinkType } from "../../types/links";
import Button from "../../components/common/Button";
import ShareButton from "../../components/links/ShareButton";
import { supabase } from "../../lib/supabaseClient";

export default function LinksPage() {
  const { links, fetchLinks, createLink, updateLink, deleteLink, isLoading } =
    useLinkStore();
  const { profile } = useUserStore();
  const [newLink, setNewLink] = useState({
    title: "",
    url: "",
    is_active: true,
    link_type: "custom" as LinkType,
    is_adult_content: false,
    share_count: 0,
  });
  const [editingLink, setEditingLink] = useState<Link | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);

  const template =
    templates.find((t) => t.id === profile?.template_id) || templates[0];

  useEffect(() => {
    fetchLinks();
  }, [fetchLinks]);

  const handleAddLink = async () => {
    setValidationError(null);

    if (!newLink.title.trim()) {
      setValidationError("Title is required");
      return;
    }

    try {
      // Basic URL validation
      new URL(newLink.url);
    } catch (e) {
      setValidationError(
        "Please enter a valid URL (include http:// or https://)"
      );
      return;
    }
    const {
      data: { user },
    } = await supabase.auth.getUser();

    const linkData = {
      ...newLink,
      user_id: user?.id ?? "", // Will be replaced by RLS
      icon: "link",
      order: links.length,
    };

    await createLink(linkData);
    setNewLink({
      title: "",
      url: "",
      is_active: true,
      link_type: "custom",
      is_adult_content: false,
      share_count: 0,
    });
    setShowForm(false);
  };

  const handleUpdateLink = async (id: string, changes: Partial<Link>) => {
    setValidationError(null);

    if (changes.url) {
      try {
        new URL(changes.url as string);
      } catch (e) {
        setValidationError(
          "Please enter a valid URL (include http:// or https://)"
        );
        return;
      }
    }

    await updateLink(id, changes);
    setEditingLink(null);
  };

  const handleDelete = async (id: string) => {
    if (confirm("Are you sure you want to delete this link?")) {
      await deleteLink(id);
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <header className="mb-8">
        <h1
          className={`text-3xl ${template.fonts.heading} bg-gradient-to-r from-primary-600 to-secondary-600 bg-clip-text text-transparent mb-2`}
        >
          Manage Links
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Create and organize the links for your profile
        </p>
      </header>

      <div className="flex flex-col md:flex-row gap-8">
        <div className="flex-1">
          <div className="card mb-8">
            <div className="p-6 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
              <h2 className="text-lg font-medium">Your Links</h2>
              <Button
                onClick={() => setShowForm(!showForm)}
                leftIcon={<Plus size={18} />}
                variant="primary"
                size="sm"
              >
                Add Link
              </Button>
            </div>

            <AnimatePresence>
              {showForm && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="overflow-hidden border-b border-gray-200 dark:border-gray-700"
                >
                  <div className="p-6">
                    <h3 className="text-lg font-medium mb-4">Add New Link</h3>

                    {validationError && (
                      <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-lg flex items-start">
                        <AlertCircle
                          size={18}
                          className="mr-2 mt-0.5 flex-shrink-0"
                        />
                        <p className="text-sm">{validationError}</p>
                      </div>
                    )}

                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                          Link Type
                        </label>
                        <select
                          value={newLink.link_type}
                          onChange={(e) =>
                            setNewLink({
                              ...newLink,
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
                          {Object.entries(SOCIAL_MEDIA_LINKS).map(
                            ([key, { name }]) => (
                              <option key={key} value={key}>
                                {name}
                              </option>
                            )
                          )}
                        </select>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                          Title
                        </label>
                        <input
                          type="text"
                          value={newLink.title}
                          onChange={(e) =>
                            setNewLink({ ...newLink, title: e.target.value })
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
                          {newLink.link_type !== "custom" && (
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                              <span className="text-gray-500">
                                {SOCIAL_MEDIA_LINKS[newLink.link_type].baseUrl}
                              </span>
                            </div>
                          )}
                          <input
                            type="text"
                            value={newLink.url}
                            onChange={(e) =>
                              setNewLink({ ...newLink, url: e.target.value })
                            }
                            placeholder={
                              newLink.link_type === "custom"
                                ? "https://example.com"
                                : SOCIAL_MEDIA_LINKS[newLink.link_type]
                                    .placeholder
                            }
                            className={
                              newLink.link_type === "custom"
                                ? "input"
                                : "input pl-32"
                            }
                          />
                        </div>
                      </div>

                      <div className="flex items-center gap-4">
                        <label className="flex items-center">
                          <input
                            type="checkbox"
                            checked={newLink.is_active}
                            onChange={(e) =>
                              setNewLink({
                                ...newLink,
                                is_active: e.target.checked,
                              })
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
                            checked={newLink.is_adult_content}
                            onChange={(e) =>
                              setNewLink({
                                ...newLink,
                                is_adult_content: e.target.checked,
                              })
                            }
                            className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                          />
                          <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">
                            Adult Content
                          </span>
                        </label>
                      </div>

                      <div className="flex justify-end gap-3">
                        <Button
                          variant="outline"
                          onClick={() => setShowForm(false)}
                        >
                          Cancel
                        </Button>
                        <Button
                          variant="primary"
                          onClick={handleAddLink}
                          isLoading={isLoading}
                        >
                          Add Link
                        </Button>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <div className="p-6">
              {isLoading ? (
                <div className="text-center py-10">
                  <p className="text-gray-500 dark:text-gray-400">
                    Loading links...
                  </p>
                </div>
              ) : links.length > 0 ? (
                <div className="space-y-4">
                  {links.map((link) => (
                    <motion.div
                      key={link.id}
                      layout
                      className="relative bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden group"
                    >
                      {editingLink?.id === link.id ? (
                        <div className="p-4">
                          <div className="space-y-4">
                            <div>
                              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                Link Type
                              </label>
                              <select
                                value={editingLink.link_type}
                                onChange={(e) =>
                                  setEditingLink({
                                    ...editingLink,
                                    link_type: e.target.value as LinkType,
                                  })
                                }
                                className="input"
                              >
                                <option value="custom">Custom Link</option>
                                {Object.entries(SOCIAL_MEDIA_LINKS).map(
                                  ([key, { name }]) => (
                                    <option key={key} value={key}>
                                      {name}
                                    </option>
                                  )
                                )}
                              </select>
                            </div>

                            <div>
                              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                Title
                              </label>
                              <input
                                type="text"
                                value={editingLink.title}
                                onChange={(e) =>
                                  setEditingLink({
                                    ...editingLink,
                                    title: e.target.value,
                                  })
                                }
                                className="input"
                              />
                            </div>

                            <div>
                              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                URL
                              </label>
                              <div className="relative">
                                {editingLink.link_type !== "custom" && (
                                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <span className="text-gray-500">
                                      {
                                        SOCIAL_MEDIA_LINKS[
                                          editingLink.link_type
                                        ].baseUrl
                                      }
                                    </span>
                                  </div>
                                )}
                                <input
                                  type="text"
                                  value={editingLink.url}
                                  onChange={(e) =>
                                    setEditingLink({
                                      ...editingLink,
                                      url: e.target.value,
                                    })
                                  }
                                  className={
                                    editingLink.link_type === "custom"
                                      ? "input"
                                      : "input pl-32"
                                  }
                                />
                              </div>
                            </div>

                            <div className="flex items-center gap-4">
                              <label className="flex items-center">
                                <input
                                  type="checkbox"
                                  checked={editingLink.is_active}
                                  onChange={(e) =>
                                    setEditingLink({
                                      ...editingLink,
                                      is_active: e.target.checked,
                                    })
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
                                  checked={editingLink.is_adult_content}
                                  onChange={(e) =>
                                    setEditingLink({
                                      ...editingLink,
                                      is_adult_content: e.target.checked,
                                    })
                                  }
                                  className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                                />
                                <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">
                                  Adult Content
                                </span>
                              </label>
                            </div>

                            {validationError && (
                              <div className="p-3 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-lg flex items-start">
                                <AlertCircle
                                  size={18}
                                  className="mr-2 mt-0.5 flex-shrink-0"
                                />
                                <p className="text-sm">{validationError}</p>
                              </div>
                            )}

                            <div className="flex justify-end gap-3">
                              <Button
                                variant="outline"
                                onClick={() => setEditingLink(null)}
                              >
                                Cancel
                              </Button>
                              <Button
                                variant="primary"
                                onClick={() =>
                                  handleUpdateLink(link.id, editingLink)
                                }
                                isLoading={isLoading}
                              >
                                Save Changes
                              </Button>
                            </div>
                          </div>
                        </div>
                      ) : (
                        <div className="p-4 flex items-center justify-between gap-4">
                          <div className="flex items-center min-w-0">
                            <div className="bg-gray-100 dark:bg-gray-700 rounded-full p-2 mr-3">
                              {link.link_type === "custom" ? (
                                <Globe
                                  size={20}
                                  className="text-gray-500 dark:text-gray-400"
                                />
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
                                <h3 className="font-medium truncate">
                                  {link.title}
                                </h3>
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
                                <a
                                  href={link.url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="hover:text-primary-600 dark:hover:text-primary-400 flex items-center truncate"
                                  onClick={(e) => e.stopPropagation()}
                                >
                                  <span className="truncate">{link.url}</span>
                                  <ExternalLink
                                    size={14}
                                    className="ml-1 flex-shrink-0"
                                  />
                                </a>
                              </div>
                            </div>
                          </div>

                          <div className="flex items-center gap-2">
                            <ShareButton
                              linkId={link.id}
                              url={link.url}
                              title={link.title}
                            />

                            <button
                              className="p-2 rounded-md text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                              onClick={() => setEditingLink(link)}
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
                              onClick={() => handleDelete(link.id)}
                              aria-label="Delete"
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </div>
                      )}
                    </motion.div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <div className="inline-block p-3 rounded-full bg-gray-100 dark:bg-gray-800 mb-4">
                    <Globe size={24} className="text-gray-500" />
                  </div>
                  <h3 className="text-lg font-medium mb-2">No links yet</h3>
                  <p className="text-gray-600 dark:text-gray-400 mb-6">
                    Start adding links to build your profile
                  </p>
                  <Button
                    variant="primary"
                    leftIcon={<Plus size={18} />}
                    onClick={() => setShowForm(true)}
                  >
                    Add Your First Link
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="w-full md:w-80">
          <div className="card sticky top-4">
            <div className="p-6 border-b border-gray-200 dark:border-gray-700">
              <h2 className="text-lg font-medium">Preview</h2>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                See how your links will look
              </p>
            </div>

            <div className={`p-6 ${template.colors.background} rounded-b-lg`}>
              <div className="space-y-3">
                {links
                  .filter((link) => link.is_active)
                  .map((link) => (
                    <div
                      key={link.id}
                      className={`p-3 rounded-lg ${template.colors.buttonBg} backdrop-blur-sm ${template.colors.buttonText} ${template.fonts.body}`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-medium">{link.title}</span>
                        <ExternalLink size={14} className="opacity-50" />
                      </div>
                    </div>
                  ))}

                {links.filter((link) => link.is_active).length === 0 && (
                  <p
                    className={`text-center text-sm ${template.colors.text} opacity-75`}
                  >
                    No active links to preview
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
