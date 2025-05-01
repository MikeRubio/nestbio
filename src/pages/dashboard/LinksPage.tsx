import { useState, useEffect } from "react";
import { Plus, Globe, AlertCircle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useLinkStore, Link as LinkStoreType } from "../../stores/linkStore";
import { useUserStore } from "../../stores/userStore";
import Button from "../../components/common/Button";
import LinkForm from "../../components/links/LinkForm";
import LinkCard from "../../components/links/LinkCard";
import AdultContentModal from "../../components/modals/AdultContentModal";
import { SUBSCRIPTION_PLANS } from "../../types/subscription";
import { Link } from "react-router-dom";

export default function LinksPage() {
  const { links, fetchLinks, createLink, updateLink, deleteLink, isLoading } =
    useLinkStore();
  const { profile } = useUserStore();
  const [editingLink, setEditingLink] = useState<LinkStoreType | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [selectedLink, setSelectedLink] = useState<LinkStoreType | null>(null);
  const [showAdultModal, setShowAdultModal] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchLinks();
  }, [fetchLinks]);

  const handleAddLink = async (linkData: any) => {
    if (
      !profile?.is_premium &&
      links.length >= SUBSCRIPTION_PLANS.free.limits.links
    ) {
      setError(
        "You have reached the maximum number of links for the free plan. Upgrade to Premium for unlimited links."
      );
      return;
    }

    const newLink = {
      ...linkData,
      user_id: profile?.id,
      icon: "link",
      order: links.length,
    };

    await createLink(newLink);
    setShowForm(false);
    setError(null);
  };

  const handleUpdateLink = async (
    id: string,
    changes: Partial<LinkStoreType>
  ) => {
    await updateLink(id, changes);
    setEditingLink(null);
  };

  const handleDelete = async (id: string) => {
    if (confirm("Are you sure you want to delete this link?")) {
      await deleteLink(id);
    }
  };

  const handleLinkClick = (link: LinkStoreType) => {
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

  return (
    <div className="max-w-4xl mx-auto">
      <header className="mb-8">
        <h1 className="text-2xl font-bold mb-2">Manage Links</h1>
        <p className="text-gray-600 dark:text-gray-400">
          Create and organize the links for your profile
        </p>
        {!profile?.is_premium && (
          <div className="mt-4 p-4 bg-primary-50 dark:bg-primary-900/20 rounded-lg border border-primary-200 dark:border-primary-800">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-primary-700 dark:text-primary-300">
                  {links.length} of {SUBSCRIPTION_PLANS.free.limits.links} links
                  used
                </p>
                <p className="text-sm text-primary-600 dark:text-primary-400">
                  Upgrade to Premium for unlimited links
                </p>
              </div>
              <Link to="/dashboard/subscription">
                <Button variant="primary" size="sm">
                  Upgrade Now
                </Button>
              </Link>
            </div>
          </div>
        )}
      </header>

      <div className="card">
        <div className="p-6 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
          <h2 className="text-lg font-medium">Your Links</h2>
          <Button
            onClick={() => setShowForm(!showForm)}
            leftIcon={<Plus size={18} />}
            variant="primary"
            size="sm"
            disabled={
              !profile?.is_premium &&
              links.length >= SUBSCRIPTION_PLANS.free.limits.links
            }
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
                onCancel={() => {
                  setShowForm(false);
                  setError(null);
                }}
                isLoading={isLoading}
              />
              {error && (
                <div className="px-6 pb-4">
                  <div className="flex items-start gap-2 text-sm text-red-600 dark:text-red-400">
                    <AlertCircle size={16} className="mt-0.5 flex-shrink-0" />
                    <p>{error}</p>
                  </div>
                </div>
              )}
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
                    <LinkForm
                      mode="edit"
                      initialData={editingLink}
                      onSubmit={(changes) => handleUpdateLink(link.id, changes)}
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
