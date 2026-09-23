import React from "react";
import { X, Check } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

export interface OptionItem {
  label: string;
  value: string;
}

interface CustomSelectModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  options: (string | OptionItem)[];
  selectedValue: string;
  onSelect: (value: string) => void;
}

export const CustomSelectModal: React.FC<CustomSelectModalProps> = ({
  isOpen,
  onClose,
  title,
  options,
  selectedValue,
  onSelect
}) => {
  if (!isOpen) return null;

  const normalizedOptions: OptionItem[] = options.map((opt) => {
    if (typeof opt === "string") {
      return { label: opt, value: opt };
    }
    return opt;
  });

  return (
    <AnimatePresence>
      <div className="fixed inset-0 bg-black/60 backdrop-blur-xs z-[99999] flex items-end sm:items-center justify-center p-0 sm:p-4">
        {/* Backdrop click */}
        <div className="absolute inset-0" onClick={onClose} />

        {/* Modal Sheet Container - White Background & Fast Transition */}
        <motion.div
          initial={{ y: 60, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 60, opacity: 0 }}
          transition={{ duration: 0.15, ease: "easeOut" }}
          className="relative z-10 bg-white text-gray-900 w-full max-w-lg rounded-t-3xl sm:rounded-3xl shadow-2xl overflow-hidden border border-slate-100 max-h-[80vh] flex flex-col"
        >
          {/* Title Header */}
          {title && (
            <div className="px-5 py-4 border-b border-slate-100 bg-slate-50/80 flex items-center justify-between shrink-0">
              <h3 className="text-base font-black text-gray-900">{title}</h3>
              <button
                onClick={onClose}
                className="w-8 h-8 rounded-full bg-slate-200/80 hover:bg-slate-300 flex items-center justify-center text-gray-700 transition active:scale-95 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* Options List */}
          <div className="overflow-y-auto divide-y divide-slate-100 flex-1 py-1">
            {normalizedOptions.map((item) => {
              const isSelected = selectedValue === item.value;
              return (
                <button
                  key={item.value}
                  type="button"
                  onClick={() => {
                    onSelect(item.value);
                    onClose();
                  }}
                  className={`w-full px-5 py-3.5 text-left flex items-center justify-between transition-colors active:bg-emerald-100/50 cursor-pointer ${
                    isSelected ? "bg-emerald-50/80" : "hover:bg-slate-50"
                  }`}
                >
                  <span className={`text-sm sm:text-base font-bold tracking-wide ${
                    isSelected ? "text-[#053d26]" : "text-gray-800"
                  }`}>
                    {item.label}
                  </span>

                  {/* Radio Indicator */}
                  <div
                    className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${
                      isSelected
                        ? "border-[#053d26] bg-transparent"
                        : "border-slate-300 bg-transparent"
                    }`}
                  >
                    {isSelected && (
                      <div className="w-3.5 h-3.5 rounded-full bg-[#053d26] shadow-xs" />
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
