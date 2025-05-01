import { useState } from "react";
import { motion } from "framer-motion";
import { Palette, Image as ImageIcon, Layout, User, Crown } from "lucide-react";
import { useUserStore } from "../../stores/userStore";
import { Template, templates } from "../../types/templates";
import { ProfileSettings, THEME_COLORS } from "../../types/profile";
import { SUBSCRIPTION_PLANS } from "../../types/subscription";
import Button from "../../components/common/Button";
import TemplateGrid from "../../components/templates/TemplateGrid";
import ProfileImageUpload from "../../components/profile/ProfileImageUpload";
import { Link } from "react-router-dom";

export default function AppearancePage() {
  const { profile, updateProfile, isLoading } = useUserStore();
  const [selectedTemplate, setSelectedTemplate] = useState<Template>(
    () => templates.find((t) => t.id === profile?.template_id) || templates[0]
  );
  const [activeTab, setActiveTab] = useState<"template" | "profile">("profile");

  const [settings, setSettings] = useState<ProfileSettings>({
    fullName: profile?.full_name || "",
    username: profile?.username || "",
    birthday: profile?.birthday || "",
    gender: profile?.gender || "prefer_not_to_say",
    location: profile?.location || "",
    showViewCount: profile?.show_view_count ?? true,
    showLatestPosts: profile?.show_latest_posts ?? true,
    containsSensitiveContent: profile?.contains_sensitive_content ?? false,
    themeColor: profile?.theme_color || THEME_COLORS[4].id, // Default to green
    backgroundColor: profile?.background_color ?? undefined,
  });

  const availableTemplates = profile?.is_premium
    ? templates
    : templates.filter((t) =>
        SUBSCRIPTION_PLANS.free.limits.templates.includes(t.id as any)
      );

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
        full_name: settings.fullName,
        username: settings.username,
        birthday: settings.birthday || null,
        gender: settings.gender,
        location: settings.location,
        show_view_count: settings.showViewCount,
        show_latest_posts: settings.showLatestPosts,
        contains_sensitive_content: settings.containsSensitiveContent,
        theme_color: settings.themeColor,
        background_color: settings.backgroundColor,
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

      {!profile?.is_premium && (
        <div className="mb-8 p-4 bg-primary-50 dark:bg-primary-900/20 rounded-lg border border-primary-200 dark:border-primary-800">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-full bg-primary-100 dark:bg-primary-900">
                <Crown
                  size={20}
                  className="text-primary-600 dark:text-primary-400"
                />
              </div>
              <div>
                <h3 className="font-medium text-primary-700 dark:text-primary-300">
                  Unlock All Templates
                </h3>
                <p className="text-sm text-primary-600 dark:text-primary-400">
                  Upgrade to Premium to access all premium templates and
                  customization options
                </p>
              </div>
            </div>
            <Link to="/dashboard/subscription">
              <Button variant="primary">Upgrade Now</Button>
            </Link>
          </div>
        </div>
      )}

      <div className="flex gap-4 mb-8">
        <button
          onClick={() => setActiveTab("template")}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
            activeTab === "template"
              ? "bg-theme text-white"
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
              ? "bg-theme text-white"
              : "text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800"
          }`}
        >
          <User size={20} />
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
                availableTemplates={availableTemplates}
                showPremiumIndicator={!profile?.is_premium}
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
                  Full Name
                </label>
                <input
                  type="text"
                  className="input"
                  value={settings.fullName}
                  onChange={(e) =>
                    setSettings({ ...settings, fullName: e.target.value })
                  }
                  placeholder="Your full name"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Username
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-500 dark:text-gray-400">
                    nestbio.com/
                  </div>
                  <input
                    type="text"
                    className="input pl-[7.5rem]"
                    value={settings.username}
                    onChange={(e) =>
                      setSettings({
                        ...settings,
                        username: e.target.value.toLowerCase(),
                      })
                    }
                    placeholder="username"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Birthday
                </label>
                <input
                  type="date"
                  className="input"
                  value={settings.birthday}
                  onChange={(e) =>
                    setSettings({ ...settings, birthday: e.target.value })
                  }
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Gender
                </label>
                <select
                  className="input"
                  value={settings.gender}
                  onChange={(e) =>
                    setSettings({ ...settings, gender: e.target.value as any })
                  }
                >
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="other">Other</option>
                  <option value="prefer_not_to_say">Prefer not to say</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Location
                </label>
                <input
                  type="text"
                  className="input"
                  value={settings.location}
                  onChange={(e) =>
                    setSettings({ ...settings, location: e.target.value })
                  }
                  placeholder="City, Country"
                />
              </div>

              <div className="space-y-4">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={settings.showViewCount}
                    onChange={(e) =>
                      setSettings({
                        ...settings,
                        showViewCount: e.target.checked,
                      })
                    }
                    className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                  />
                  <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">
                    Show view count on your profile
                  </span>
                </label>

                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={settings.showLatestPosts}
                    onChange={(e) =>
                      setSettings({
                        ...settings,
                        showLatestPosts: e.target.checked,
                      })
                    }
                    className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                  />
                  <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">
                    Show your latest posts on your page
                  </span>
                </label>

                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={settings.containsSensitiveContent}
                    onChange={(e) =>
                      setSettings({
                        ...settings,
                        containsSensitiveContent: e.target.checked,
                      })
                    }
                    className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                  />
                  <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">
                    My profile contains sensitive content
                  </span>
                </label>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Theme Color
                </label>
                <div className="flex flex-wrap gap-3">
                  {THEME_COLORS.map((color) => (
                    <button
                      key={color.id}
                      onClick={() =>
                        setSettings({ ...settings, themeColor: color.id })
                      }
                      className={`w-10 h-10 rounded-full transition-transform ${
                        settings.themeColor === color.id
                          ? "ring-2 ring-offset-2 ring-theme scale-110"
                          : "hover:scale-110"
                      }`}
                      style={{ backgroundColor: color.color }}
                      aria-label={`Select ${color.id} theme color`}
                    />
                  ))}
                </div>
              </div>

              <div className="flex justify-end">
                <Button
                  variant="primary"
                  color={"bg-theme"}
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
