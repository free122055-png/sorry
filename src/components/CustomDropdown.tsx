import React, { useState, useRef, useEffect } from "react";
import { ChevronDown, Check } from "lucide-react";

export interface DropdownOption {
  id: string;
  nameBn: string;
}

interface CustomDropdownProps {
  options: DropdownOption[];
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
}

export const CustomDropdown: React.FC<CustomDropdownProps> = ({
  options,
  value,
  onChange,
  placeholder = "নির্বাচন করুন",
  className = "",
  disabled = false
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const selectedOption = options.find((opt) => opt.id === value);

  return (
    <div ref={dropdownRef} className={`relative w-full ${className}`}>
      <button
        type="button"
        disabled={disabled}
        onClick={() => setIsOpen(!isOpen)}
        className="w-full bg-white border border-gray-200 rounded-xl px-3.5 py-3 text-xs sm:text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#5842dc]/40 focus:border-[#5842dc] flex items-center justify-between cursor-pointer transition-all min-h-[44px] disabled:bg-gray-50 disabled:cursor-not-allowed disabled:text-gray-400"
      >
        <span className={selectedOption ? "text-gray-900 font-bold" : "text-gray-400"}>
          {selectedOption ? selectedOption.nameBn : placeholder}
        </span>
        <ChevronDown className={`w-4 h-4 text-gray-500 transition-transform ${isOpen ? "rotate-180" : ""}`} />
      </button>

      {isOpen && (
        <div className="absolute z-50 left-0 right-0 mt-1 bg-white border border-gray-200 rounded-2xl shadow-lg max-h-60 overflow-y-auto py-1.5 animate-in fade-in slide-in-from-top-1 duration-100">
          {options.length === 0 ? (
            <div className="px-4 py-2 text-xs text-gray-400 text-center">কোনো অপশন পাওয়া যায়নি</div>
          ) : (
            options.map((option) => {
              const isSelected = option.id === value;
              return (
                <button
                  key={option.id}
                  type="button"
                  onClick={() => {
                    onChange(option.id);
                    setIsOpen(false);
                  }}
                  className={`w-full text-left px-4 py-2.5 text-xs sm:text-sm flex items-center justify-between transition-colors hover:bg-gray-50 cursor-pointer ${
                    isSelected ? "bg-[#5842dc]/5 text-[#5842dc] font-black" : "text-gray-800 font-medium"
                  }`}
                >
                  <span>{option.nameBn}</span>
                  {isSelected && <Check className="w-4 h-4 text-[#5842dc] shrink-0" />}
                </button>
              );
            })
          )}
        </div>
      )}
    </div>
  );
};
