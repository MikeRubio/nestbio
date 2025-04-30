import { useState } from "react";
import { Share2, Check, Twitter, Facebook, Linkedin, Copy } from "lucide-react";
import Button from "../common/Button";
import { supabase } from "../../lib/supabaseClient";

interface ShareButtonProps {
  linkId: string;
  url: string;
  title: string;
}

export default function ShareButton({ linkId, url, title }: ShareButtonProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleShare = async (platform: string) => {
    let shareUrl = "";

    switch (platform) {
      case "twitter":
        shareUrl = `https://twitter.com/intent/tweet?url=${encodeURIComponent(
          url
        )}&text=${encodeURIComponent(title)}`;
        break;
      case "facebook":
        shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(
          url
        )}`;
        break;
      case "linkedin":
        shareUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(
          url
        )}`;
        break;
    }

    if (shareUrl) {
      window.open(shareUrl, "_blank");
    }

    // Record share
    try {
      await supabase.from("link_shares").insert({
        link_id: linkId,
        platform,
      });

      // Update share count
      await supabase.rpc("increment_share_count", { link_id: linkId });
    } catch (error) {
      console.error("Error recording share:", error);
    }

    setIsOpen(false);
  };

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);

      // Record copy as share
      await supabase.from("link_shares").insert({
        link_id: linkId,
        platform: "copy",
      });

      await supabase.rpc("increment_share_count", { link_id: linkId });
    } catch (error) {
      console.error("Error copying to clipboard:", error);
    }
  };

  return (
    <div className="relative">
      <Button
        variant="outline"
        size="sm"
        leftIcon={<Share2 size={16} />}
        onClick={() => setIsOpen(!isOpen)}
      >
        Share
      </Button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-48 rounded-lg bg-white dark:bg-gray-800 shadow-lg border border-gray-200 dark:border-gray-700 py-2">
          <button
            onClick={() => handleShare("twitter")}
            className="w-full px-4 py-2 text-left text-sm hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-2"
          >
            <Twitter size={16} />
            Twitter
          </button>
          <button
            onClick={() => handleShare("facebook")}
            className="w-full px-4 py-2 text-left text-sm hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-2"
          >
            <Facebook size={16} />
            Facebook
          </button>
          <button
            onClick={() => handleShare("linkedin")}
            className="w-full px-4 py-2 text-left text-sm hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-2"
          >
            <Linkedin size={16} />
            LinkedIn
          </button>
          <hr className="my-2 border-gray-200 dark:border-gray-700" />
          <button
            onClick={copyToClipboard}
            className="w-full px-4 py-2 text-left text-sm hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-2"
          >
            {copied ? <Check size={16} /> : <Copy size={16} />}
            {copied ? "Copied!" : "Copy Link"}
          </button>
        </div>
      )}
    </div>
  );
}
