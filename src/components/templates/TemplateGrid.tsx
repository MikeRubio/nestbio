import { useState } from "react";
import { templates, Template } from "../../types/templates";
import TemplateCard from "./TemplateCard";

interface TemplateGridProps {
  onSelect: (template: Template) => void;
  selectedTemplate?: Template;
}

export default function TemplateGrid({
  onSelect,
  selectedTemplate,
}: TemplateGridProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
      {templates.map((template) => (
        <TemplateCard
          key={template.id}
          template={template}
          onSelect={onSelect}
          isSelected={selectedTemplate?.id === template.id}
        />
      ))}
    </div>
  );
}
