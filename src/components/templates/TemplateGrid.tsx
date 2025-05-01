import { templates, Template } from "../../types/templates";
import TemplateCard from "./TemplateCard";

interface TemplateGridProps {
  onSelect: (template: Template) => void;
  selectedTemplate?: Template;
  availableTemplates: Template[];
  showPremiumIndicator?: boolean;
}

export default function TemplateGrid({
  onSelect,
  selectedTemplate,
  availableTemplates,
  showPremiumIndicator = false,
}: TemplateGridProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
      {templates.map((template) => {
        const isAvailable = availableTemplates.some(
          (t) => t.id === template.id
        );
        const isSelected = selectedTemplate?.id === template.id;

        return (
          <TemplateCard
            key={template.id}
            template={template}
            onSelect={onSelect}
            isSelected={isSelected}
            isPremium={!isAvailable}
            showPremiumIndicator={showPremiumIndicator && !isAvailable}
          />
        );
      })}
    </div>
  );
}
