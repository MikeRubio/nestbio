import { useState, useEffect } from "react";
import { Plus, Globe } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useLinkStore, Link } from "../../stores/linkStore";
import { useUserStore } from "../../stores/userStore";
import { templates } from "../../types/templates";
import Button from "../../components/common/Button";
import LinkForm from "../../components/links/LinkForm";
import LinkCard from "../../components/links/LinkCard";
import CategoryDivider from "../../components/links/CategoryDivider";
import AdultContentModal from "../../components/modals/AdultContentModal";
import {
  groupLinksByCategory,
  getDefaultCategories,
} from "../../utils/linkUtils";
import { supabase } from "../../lib/supabaseClient";

export default function LinksPage() {
  const { links, fetchLinks, createLink, updateLink, deleteLink, isLoading } =
    useLinkStore();
  const { profile } = useUserStore();
  const [editingLink, setEditingLink] = useState<Link | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [selectedLink, setSelectedLink] = useState<Link | null>(null);
  const [showAdultModal, setShowAdultModal] = useState(false);
  const [categories, setCategories] = useState<string[]>(
    getDefaultCategories()
  );

  const template =
    templates.find((t) => t.id === profile?.template_id) || templates[5];

  useEffect(() => {
    fetchLinks();
  }, [fetchLinks]);

  const handleAddLink = async (linkData: any) => {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    const newLink = {
      ...linkData,
      user_id: user?.id ?? "", // Will be replaced by RLS
      icon: "link",
      order: links.length,
    };

    await createLink(newLink);
    setShowForm(false);
  };

  const handleUpdateLink = async (id: string, changes: Partial<Link>) => {
    await updateLink(id, changes);
    setEditingLink(null);
  };

  const handleDelete = async (id: string) => {
    if (confirm("Are you sure you want to delete this link?")) {
      await deleteLink(id);
    }
  };

  const handleLinkClick = (link: Link) => {
    if (link.is_adult_content) {
      setSelectedLink(link);
      setShowAdultModal(true);
    } else {
      window.open(link.url, "_blank");
    }
  };

  const handleAdultConfirm = () => {
    if (selectedLink) {
      window.open(selectedLink.url, "_blank");
      setShowAdultModal(false);
      setSelectedLink(null);
    }
  };

  const addCategory = () => {
    const name = prompt("Enter category name:");
    if (name) {
      setCategories([...categories, name]);
    }
  };

  const linksByCategory = groupLinksByCategory(links);

  return (
    <div className="max-w-4xl mx-auto">
      <header className="mb-8">
        <h1 className={`text-2xl ${template.fonts.heading} mb-2`}>
          Manage Links
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Create and organize the links for your profile
        </p>
      </header>

      <div className="card">
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
              <LinkForm
                onSubmit={handleAddLink}
                onCancel={() => setShowForm(false)}
                isLoading={isLoading}
              />
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
              {categories.map((category) => (
                <div key={category}>
                  <CategoryDivider
                    title={category}
                    isEditing={true}
                    onAdd={addCategory}
                  />
                  {linksByCategory[category]?.map((link) => (
                    <motion.div
                      key={link.id}
                      layout
                      className="relative bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden group"
                    >
                      {editingLink?.id === link.id ? (
                        <LinkForm
                          mode="edit"
                          initialData={editingLink}
                          onSubmit={(changes) =>
                            handleUpdateLink(link.id, changes)
                          }
                          onCancel={() => setEditingLink(null)}
                          isLoading={isLoading}
                        />
                      ) : (
                        <LinkCard
                          link={link}
                          onEdit={setEditingLink}
                          onDelete={handleDelete}
                          onLinkClick={handleLinkClick}
                        />
                      )}
                    </motion.div>
                  ))}
                </div>
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

      <AdultContentModal
        isOpen={showAdultModal}
        onClose={() => {
          setShowAdultModal(false);
          setSelectedLink(null);
        }}
        onConfirm={handleAdultConfirm}
        title={selectedLink?.title || ""}
      />
    </div>
  );
}
