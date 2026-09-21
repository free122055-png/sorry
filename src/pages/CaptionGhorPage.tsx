import React from "react";
import { useNavigate } from "react-router-dom";
import { CaptionGhorSection } from "../components/caption/CaptionGhorSection";
import { Header } from "../components/Header";
import { BottomNav } from "../components/BottomNav";

export const CaptionGhorPage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-[#f3f5f8] flex flex-col font-sans">
      <Header />
      <div className="flex-1">
        <CaptionGhorSection onBack={() => navigate(-1)} />
      </div>
      <BottomNav />
    </div>
  );
};

export default CaptionGhorPage;
