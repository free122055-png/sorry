import React from "react";
import { useLanguage } from "../context/LanguageContext";
import { Globe } from "lucide-react";

interface LanguageToggleProps {
  darkMode?: boolean;
}

export const LanguageToggle: React.FC<LanguageToggleProps> = ({ darkMode = true }) => {
  const { language, toggleLanguage, t } = useLanguage();
  const isOn = language === "bn";

  return (
    <div className={`${darkMode ? "bg-white/10 border-white/20 text-white" : "bg-gray-100 border-gray-200 text-gray-900"} backdrop-blur-sm border rounded-2xl p-3 flex items-center justify-between shadow-xs transition-all`}>
      <div className="flex items-center space-x-2.5">
        <div className={`w-8 h-8 rounded-full ${darkMode ? "bg-emerald-700/50 text-emerald-200" : "bg-emerald-100 text-emerald-800"} flex items-center justify-center`}>
          <Globe className="w-4 h-4" />
        </div>
        <div>
          <span className="text-xs font-black block tracking-wide">{t("languageLabel")}</span>
          <span className={`text-[11px] font-semibold ${darkMode ? "text-emerald-200" : "text-emerald-700"}`}>
            {isOn ? "🇧🇩 বাংলা (Bangla)" : "🇬🇧 English"}
          </span>
        </div>
      </div>
      <button
        onClick={toggleLanguage}
        className={`relative inline-flex h-6 w-12 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
          isOn ? "bg-amber-400" : "bg-gray-400"
        }`}
        role="switch"
        aria-checked={isOn}
        aria-label="Toggle Language"
      >
        <span
          className={`pointer-events-none flex h-5 w-5 items-center justify-center rounded-full bg-white shadow-sm ring-0 transition duration-200 ease-in-out ${
            isOn ? "translate-x-6 text-[9px] font-black text-black" : "translate-x-0 text-[9px] font-black text-gray-700"
          }`}
        >
          {isOn ? "ON" : "OFF"}
        </span>
      </button>
    </div>
  );
};
