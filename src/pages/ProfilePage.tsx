import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { ExternalLink, ArrowRight } from "lucide-react";
import { motion } from "framer-motion";
import { supabase } from "../lib/supabaseClient";
import { UserProfile } from "../stores/userStore";
import { Link as LinkType } from "../stores/linkStore";
import { templates } from "../types/templates";
import Logo from "../components/common/Logo";
import Button from "../components/common/Button";
import ConfirmModal from "../components/common/ConfirmModal"; // ✅ Make sure this file exists

export default function ProfilePage() {
  const { username } = useParams<{ username: string }>();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [links, setLinks] = useState<LinkType[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [showModal, setShowModal] = useState(false);
  const [pendingLink, setPendingLink] = useState<LinkType | null>(null);

  const template =
    templates.find((t) => t.id === profile?.template_id) || templates[5];

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setIsLoading(true);
        setError(null);

        if (!username) {
          setError("Username not provided");
          return;
        }

        const { data: profileData, error: profileError } = await supabase
          .from("profiles")
          .select("*")
          .eq("username", username)
          .single();

        if (profileError) throw profileError;

        if (!profileData) {
          setError("Profile not found");
          return;
        }

        setProfile(profileData);

        const { data: linksData, error: linksError } = await supabase
          .from("links")
          .select("*")
          .eq("user_id", profileData.id)
          .eq("is_active", true)
          .order("order", { ascending: true });

        if (linksError) throw linksError;

        setLinks(linksData || []);
      } catch (err) {
        console.error("Error fetching profile:", err);
        setError("Failed to load profile");
      } finally {
        setIsLoading(false);
      }
    };

    fetchProfile();
  }, [username]);

  const trackClick = async (linkId: string) => {
    try {
      await supabase.from("link_clicks").insert([
        {
          link_id: linkId,
          user_agent: navigator.userAgent,
          referrer: document.referrer,
        },
      ]);
    } catch (error) {
      console.error("Error tracking click:", error);
    }
  };

  const handleAdultLinkConfirm = () => {
    if (pendingLink) {
      window.open(pendingLink.url, "_blank");
      trackClick(pendingLink.id);
    }
    setShowModal(false);
    setPendingLink(null);
  };

  const handleAdultLinkCancel = () => {
    setShowModal(false);
    setPendingLink(null);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="animate-pulse text-gray-500 dark:text-gray-400">
          Loading profile...
        </div>
      </div>
    );
  }

  if (error || !profile) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 dark:bg-gray-900 p-4 text-center">
        <Logo size="lg" />
        <h1 className="text-2xl font-bold mt-8 mb-2">Profile Not Found</h1>
        <p className="text-gray-600 dark:text-gray-400 mb-8">
          The profile you're looking for doesn't exist or has been removed.
        </p>
        <Link to="/">
          <Button variant="primary" rightIcon={<ArrowRight size={16} />}>
            Create Your Own Nestbio
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className={`min-h-screen flex flex-col ${template.colors.background}`}>
      <main className="flex-1 flex flex-col items-center max-w-md mx-auto w-full px-4 py-8 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className={`text-center mb-8 ${template.colors.cardBg} p-8 rounded-2xl backdrop-blur-sm`}
        >
          {profile.profile_image_url ? (
            <img
              src={profile.profile_image_url}
              alt={profile.username}
              className={`w-24 h-24 rounded-full border-4 border-white/20 object-cover mx-auto mb-4 ${
                template.styles?.imageFilter || ""
              }`}
            />
          ) : (
            <div className="w-24 h-24 rounded-full bg-white/20 flex items-center justify-center text-white text-2xl font-bold mb-4 mx-auto">
              {profile.username.charAt(0).toUpperCase()}
            </div>
          )}
          <h1
            className={`text-2xl font-bold mb-2 ${template.colors.text} ${template.fonts.heading}`}
          >
            {profile.title}
          </h1>
          {profile.bio && (
            <p
              className={`${template.colors.text} opacity-90 ${template.fonts.body}`}
            >
              {profile.bio}
            </p>
          )}
        </motion.div>

        <div className="w-full space-y-4">
          {links.length > 0 ? (
            links.map((link, index) => (
              <motion.div
                key={link.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.1 }}
                className="relative group"
              >
                {!link.is_adult_content ? (
                  <a
                    href={link.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={() => trackClick(link.id)}
                    className={`block w-full p-4 ${
                      template.styles?.buttonRadius || "rounded-xl"
                    } ${template.colors.buttonBg} ${
                      template.styles?.buttonShadow || ""
                    } transition-all duration-200 group-hover:scale-[1.02] ${
                      template.colors.buttonText
                    } ${template.fonts.body}`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-medium">{link.title}</span>
                      <ExternalLink size={16} className="opacity-50" />
                    </div>
                  </a>
                ) : (
                  <div
                    onClick={() => {
                      setPendingLink(link);
                      setShowModal(true);
                    }}
                    className={`block w-full p-4 cursor-pointer ${
                      template.styles?.buttonRadius || "rounded-xl"
                    } ${template.colors.buttonBg} backdrop-blur-sm ${
                      template.colors.buttonText
                    } ${template.fonts.body}`}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <span className="font-medium">{link.title}</span>
                        <span className="ml-2 text-sm opacity-75">(18+)</span>
                      </div>
                      <ExternalLink size={16} className="opacity-50" />
                    </div>
                  </div>
                )}
              </motion.div>
            ))
          ) : (
            <div className="text-center py-8">
              <p className={`${template.colors.text} opacity-75`}>
                No links available yet.
              </p>
            </div>
          )}
        </div>
      </main>

      <footer
        className={`py-6 text-center text-sm flex flex-col gap-4 ${template.colors.text} opacity-75`}
      >
        <Link to="/">
          <Button
            variant="outline"
            size="md"
            className={`block p-4 ${
              template.styles?.buttonRadius || "rounded-xl"
            } ${template.colors.buttonBg} ${
              template.styles?.buttonShadow || ""
            } transition-all duration-200 group-hover:scale-[1.02] ${
              template.colors.buttonText
            } ${template.fonts.body}`}
          >
            Create Your Own
          </Button>
        </Link>
        <span>
          Powered by <span className={template.fonts.heading}>Nestbio</span>
        </span>
      </footer>

      <ConfirmModal
        isOpen={showModal}
        onCancel={handleAdultLinkCancel}
        onConfirm={handleAdultLinkConfirm}
        title="Are you 18 or older?"
        description="This link contains adult content. Do you wish to continue?"
      />
    </div>
  );
}
