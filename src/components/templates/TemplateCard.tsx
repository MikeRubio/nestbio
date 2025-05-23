import { motion } from "framer-motion";
import { Crown } from "lucide-react";
import { Template } from "../../types/templates";
import Button from "../common/Button";

interface TemplateCardProps {
  template: Template;
  onSelect: (template: Template) => void;
  isSelected: boolean;
  isPremium?: boolean;
  showPremiumIndicator?: boolean;
}

export default function TemplateCard({
  template,
  onSelect,
  isSelected,
  isPremium = false,
  showPremiumIndicator = false,
}: TemplateCardProps) {
  return (
    <motion.div
      whileHover={{ y: -4 }}
      className={`relative rounded-xl overflow-hidden border-2 transition-colors ${
        isSelected
          ? "border-primary-500"
          : "border-gray-200 dark:border-gray-700"
      }`}
    >
      {/* Premium Crown Icon */}
      {showPremiumIndicator && (
        <div className="absolute top-3 right-3 z-10 p-2 rounded-full bg-primary-100 dark:bg-primary-900">
          <Crown className="text-primary-600 dark:text-primary-400" size={20} />
        </div>
      )}

      <div className="aspect-[3/4] relative overflow-hidden">
        <img
          src={template.thumbnail}
          alt={template.name}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 p-4 text-white">
          <h3
            className={`text-lg font-semibold mb-1 ${template.fonts.heading}`}
          >
            {template.name}
          </h3>
          <p className={`text-sm text-white/80 ${template.fonts.body}`}>
            {template.description}
          </p>
        </div>
      </div>

      <div className="p-4 bg-white dark:bg-gray-800">
        <Button
          variant={isSelected ? "primary" : "outline"}
          fullWidth
          disabled={isPremium}
          onClick={() => onSelect(template)}
        >
          {isSelected ? "Selected" : isPremium ? "Premium" : "Use Template"}
        </Button>
      </div>
    </motion.div>
  );
}
