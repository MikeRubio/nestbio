import { useState, useEffect } from "react";
import { Plus, Trash2, ExternalLink, AlertCircle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useLinkStore, Link } from "../../stores/linkStore";
import Button from "../../components/common/Button";
import { supabase } from "../../lib/supabaseClient";

export default function LinksPage() {
  const { links, fetchLinks, createLink, updateLink, deleteLink, isLoading } =
    useLinkStore();
  const [newLink, setNewLink] = useState({
    title: "",
    url: "",
    is_active: true,
    link_type: "custom" as Link["link_type"],
    is_adult_content: false,
    share_count: 0,
  });
  const [editingLink, setEditingLink] = useState<Link | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);

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
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
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
      user_id: user?.id ?? "",
      icon: "link",
      order: links.length,
    };

    await createLink(linkData);
    setNewLink({
      title: "",
      url: "",
      is_active: true,
      link_type: "custom" as Link["link_type"],
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
      <header className="mb-8 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold mb-2">Manage Links</h1>
          <p className="text-gray-600 dark:text-gray-400">
            Create and organize the links for your profile.
          </p>
        </div>

        <Button
          onClick={() => setShowForm(!showForm)}
          leftIcon={<Plus size={18} />}
          variant="primary"
        >
          Add New Link
        </Button>
      </header>

      <AnimatePresence>
        {showForm && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden mb-8"
          >
            {/* Form Fields */}
            <div>
              <label htmlFor="link_type">Link Type</label>
              <select
                id="link_type"
                value={newLink.link_type}
                onChange={(e) =>
                  setNewLink({
                    ...newLink,
                    link_type: e.target.value as Link["link_type"],
                  })
                }
              >
                <option value="custom">Custom</option>
                <option value="x">X (Twitter)</option>
                <option value="instagram">Instagram</option>
                <option value="facebook">Facebook</option>
                <option value="youtube">YouTube</option>
                <option value="linkedin">LinkedIn</option>
                <option value="github">GitHub</option>
                <option value="tiktok">TikTok</option>
              </select>
            </div>

            <div className="flex items-center">
              <input
                type="checkbox"
                id="is_adult_content"
                checked={newLink.is_adult_content}
                onChange={(e) =>
                  setNewLink({ ...newLink, is_adult_content: e.target.checked })
                }
              />
              <label htmlFor="is_adult_content">Adult Content</label>
            </div>
            <div className="card p-6">
              <h2 className="text-lg font-medium mb-4">Add New Link</h2>

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
                  <label
                    htmlFor="title"
                    className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                  >
                    Title
                  </label>
                  <input
                    id="title"
                    type="text"
                    value={newLink.title}
                    onChange={(e) => {
                      if (!newLink) return;
                      setNewLink({ ...newLink, title: e.target.value });
                    }}
                    placeholder="e.g. My Website"
                    className="input"
                  />
                </div>

                <div>
                  <label
                    htmlFor="url"
                    className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                  >
                    URL
                  </label>
                  <input
                    id="url"
                    type="text"
                    value={newLink.url}
                    onChange={(e) => {
                      if (!newLink) return;
                      setNewLink({ ...newLink, url: e.target.value });
                    }}
                    placeholder="https://example.com"
                    className="input"
                  />
                </div>

                <div className="flex items-center">
                  <input
                    id="is_active"
                    type="checkbox"
                    checked={newLink.is_active}
                    onChange={(e) => {
                      if (!newLink) return;

                      setNewLink({ ...newLink, is_active: e.target.checked });
                    }}
                    className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                  />
                  <label
                    htmlFor="is_active"
                    className="ml-2 block text-sm text-gray-700 dark:text-gray-300"
                  >
                    Active
                  </label>
                </div>

                <div className="flex justify-end gap-3 mt-6">
                  <Button variant="outline" onClick={() => setShowForm(false)}>
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

      <div className="card">
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-lg font-medium">Your Links</h2>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
            Drag and drop to reorder your links.
          </p>
        </div>

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
                <div
                  key={link.id}
                  className="relative bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden"
                >
                  {editingLink?.id === link.id ? (
                    <div className="p-4">
                      <div className="space-y-4">
                        <div>
                          <label
                            htmlFor={`edit-title-${link.id}`}
                            className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                          >
                            Title
                          </label>
                          <input
                            id={`edit-title-${link.id}`}
                            type="text"
                            value={editingLink.title}
                            onChange={(e) => {
                              if (!editingLink) return;
                              setEditingLink({
                                ...editingLink,
                                title: e.target.value,
                              });
                            }}
                            className="input"
                          />
                        </div>

                        <div>
                          <label
                            htmlFor={`edit-url-${link.id}`}
                            className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                          >
                            URL
                          </label>
                          <input
                            id={`edit-url-${link.id}`}
                            type="text"
                            value={editingLink.url}
                            onChange={(e) => {
                              if (!editingLink) return;
                              setEditingLink({
                                ...editingLink,
                                title: e.target.value,
                              });
                            }}
                            className="input"
                          />
                        </div>

                        <div className="flex items-center">
                          <input
                            id={`edit-active-${link.id}`}
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
                          <label
                            htmlFor={`edit-active-${link.id}`}
                            className="ml-2 block text-sm text-gray-700 dark:text-gray-300"
                          >
                            Active
                          </label>
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            Link Type
                          </label>
                          <select
                            value={newLink.link_type}
                            onChange={(e) =>
                              setNewLink({
                                ...newLink,
                                link_type: e.target.value as Link["link_type"], // Cast to the correct type
                              })
                            }
                            className="input"
                          >
                            <option value="custom">Custom</option>
                            <option value="x">X (Twitter)</option>
                            <option value="instagram">Instagram</option>
                            <option value="facebook">Facebook</option>
                            <option value="youtube">YouTube</option>
                            <option value="linkedin">LinkedIn</option>
                            <option value="github">GitHub</option>
                            <option value="tiktok">TikTok</option>
                          </select>
                        </div>

                        <div className="flex items-center">
                          <input
                            id="is_adult_content"
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
                          <label
                            htmlFor="is_adult_content"
                            className="ml-2 block text-sm text-gray-700 dark:text-gray-300"
                          >
                            Adult Contentsss
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

                        <div className="flex justify-end gap-3 mt-4">
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
                            Save
                          </Button>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <div className="flex items-center">
                        <div className="bg-gray-100 dark:bg-gray-700 rounded-full p-2 mr-3">
                          <span className="text-gray-500 dark:text-gray-400">
                            ≡
                          </span>
                        </div>
                        <div>
                          <h3 className="font-medium">{link.title}</h3>
                          <p className="text-sm text-gray-500 dark:text-gray-400"></p>
                          <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
                            <a
                              href={link.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="hover:text-primary-600 dark:hover:text-primary-400 flex items-center"
                              onClick={(e) => e.stopPropagation()}
                            >
                              <span className="truncate max-w-[200px] sm:max-w-[300px]">
                                {link.url}
                              </span>
                              <ExternalLink
                                size={14}
                                className="ml-1 flex-shrink-0"
                              />
                            </a>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center justify-end space-x-2">
                        <div className="flex items-center">
                          <input
                            id={`toggle-${link.id}`}
                            type="checkbox"
                            checked={link.is_active}
                            onChange={(e) =>
                              handleUpdateLink(link.id, {
                                is_active: e.target.checked,
                              })
                            }
                            className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                          />
                          <label
                            htmlFor={`toggle-${link.id}`}
                            className="ml-2 text-sm text-gray-700 dark:text-gray-300"
                          >
                            Active
                          </label>
                        </div>

                        <div className="flex items-center">
                          <input
                            id={`toggle-isadult-${link.id}`}
                            type="checkbox"
                            checked={link.is_adult_content}
                            onChange={(e) =>
                              handleUpdateLink(link.id, {
                                is_adult_content: e.target.checked,
                              })
                            }
                            className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                          />
                          <label
                            htmlFor={`toggle-isadult-${link.id}`}
                            className="ml-2 text-sm text-gray-700 dark:text-gray-300"
                          >
                            Adult Content
                          </label>
                        </div>
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
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <div className="inline-block p-3 rounded-full bg-gray-100 dark:bg-gray-800 mb-4">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="text-gray-500"
                >
                  <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
                  <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
                </svg>
              </div>
              <h3 className="text-lg font-medium mb-2">No links yet</h3>
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                Start adding links to build your profile.
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
  );
}
