import React from "react";
import { FrameTemplateLibraryModal } from "./pixelEditor/FrameTemplateLibraryModal";
import { TemplateItem } from "./admin/TemplateManagement";

interface TemplateLibraryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (template: TemplateItem) => void;
  initialTab?: "frames" | "templates" | "presets" | "favorites" | "recent";
}

export const TemplateLibraryModal: React.FC<TemplateLibraryModalProps> = (props) => {
  return <FrameTemplateLibraryModal {...props} />;
};
