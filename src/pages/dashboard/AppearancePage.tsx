import { useState } from "react";
import { motion } from "framer-motion";
import { Palette, Image as ImageIcon, Layout } from "lucide-react";
import { useUserStore } from "../../stores/userStore";
import { Template, templates } from "../../types/templates";
import Button from "../../components/common/Button";
import TemplateGrid from "../../components/templates/TemplateGrid";
import ProfileImageUpload from "../../components/profile/ProfileImageUpload";

export default function AppearancePage() {
  const { profile, updateProfile, isLoading } = useUserStore();
  const [selectedTemplate, setSelectedTemplate] = useState<Template>(
    () => templates.find((t) => t.id === profile?.template_id) || templates[0]
  );
  const [activeTab, setActiveTab] = useState<"template" | "profile">(
    "template"
  );
  const [title, setTitle] = useState(profile?.title || "");
  const [bio, setBio] = useState(profile?.bio || "");

  const handleTemplateSelect = (template: Template) => {
    setSelectedTemplate(template);
  };

  const handleApplyTemplate = async () => {
    try {
      await updateProfile({
        template_id: selectedTemplate.id,
      });
    } catch (error) {
      console.error("Error applying template:", error);
    }
  };

  const handleProfileUpdate = async (imageUrl: string) => {
    try {
      await updateProfile({
        profile_image_url: imageUrl,
      });
    } catch (error) {
      console.error("Error updating profile image:", error);
    }
  };

  const handleSaveProfile = async () => {
    try {
      await updateProfile({
        title,
        bio,
      });
    } catch (error) {
      console.error("Error saving profile:", error);
    }
  };

  return (
    <div className="max-w-6xl mx-auto">
      <header className="mb-8">
        <h1 className="text-3xl font-display bg-gradient-to-r from-primary-600 to-secondary-600 bg-clip-text text-transparent mb-2">
          Customize Your Page
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Make your profile unique with our beautiful templates and
          customization options
        </p>
      </header>

      <div className="flex gap-4 mb-8">
        <button
          onClick={() => setActiveTab("template")}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
            activeTab === "template"
              ? "bg-primary-50 text-primary-600 dark:bg-primary-900/30 dark:text-primary-400"
              : "text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800"
          }`}
        >
          <Layout size={20} />
          <span>Templates</span>
        </button>

        <button
          onClick={() => setActiveTab("profile")}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
            activeTab === "profile"
              ? "bg-primary-50 text-primary-600 dark:bg-primary-900/30 dark:text-primary-400"
              : "text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800"
          }`}
        >
          <ImageIcon size={20} />
          <span>Profile</span>
        </button>
      </div>

      {activeTab === "template" ? (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
        >
          <div className="card overflow-hidden">
            <div className="p-6 border-b border-gray-200 dark:border-gray-700">
              <h2 className="text-xl font-semibold mb-1">Choose a Template</h2>
              <p className="text-gray-600 dark:text-gray-400">
                Select a template that matches your style
              </p>
            </div>

            <div className="p-6">
              <TemplateGrid
                onSelect={handleTemplateSelect}
                selectedTemplate={selectedTemplate}
              />
            </div>
          </div>

          <div className="mt-8 flex justify-end">
            <Button
              variant="primary"
              isLoading={isLoading}
              leftIcon={<Palette size={18} />}
              onClick={handleApplyTemplate}
            >
              Apply Template
            </Button>
          </div>
        </motion.div>
      ) : (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
        >
          <div className="card">
            <div className="p-6 border-b border-gray-200 dark:border-gray-700">
              <h2 className="text-xl font-semibold mb-1">Profile Settings</h2>
              <p className="text-gray-600 dark:text-gray-400">
                Customize your profile information and appearance
              </p>
            </div>

            <div className="p-6 space-y-8">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Profile Picture
                </label>
                <ProfileImageUpload
                  currentImageUrl={profile?.profile_image_url || null}
                  onUpload={handleProfileUpdate}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Page Title
                </label>
                <input
                  type="text"
                  className="input"
                  placeholder="Your page title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Bio
                </label>
                <textarea
                  className="input min-h-[100px]"
                  placeholder="Tell your visitors about yourself"
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                />
              </div>

              <div className="flex justify-end">
                <Button
                  variant="primary"
                  isLoading={isLoading}
                  onClick={handleSaveProfile}
                >
                  Save Changes
                </Button>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
}
