import React from "react";
import { KeyRound, Download, FileText, ShieldCheck, Copy, ExternalLink, Archive } from "lucide-react";
import { motion } from "motion/react";

interface DownloadCenterProps {
  onDownloadKeystore: () => void;
  onCopyKeystoreBase64: () => void;
  onDownloadCert: () => void;
}

export const DownloadCenter: React.FC<DownloadCenterProps> = ({ 
  onDownloadKeystore, 
  onCopyKeystoreBase64,
  onDownloadCert 
}) => {
  return (
    <div className="w-full space-y-6">
      <div className="flex flex-col gap-1">
        <h2 className="text-2xl font-black text-gray-900 tracking-tight flex items-center gap-3">
          <Archive className="w-7 h-7 text-emerald-600" />
          সফটওয়্যার ডাউনলোড সেন্টার
        </h2>
        <p className="text-sm text-gray-500 font-medium">আপনার সফটওয়্যারের প্রয়োজনীয় সকল ফাইল ও কি-স্টোর এখান থেকে ডাউনলোড করুন।</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Release Keystore Card */}
        <motion.div 
          whileHover={{ y: -5 }}
          className="bg-white rounded-3xl border-2 border-amber-500/20 p-6 shadow-sm hover:shadow-md transition-all"
        >
          <div className="flex items-start justify-between mb-6">
            <div className="w-14 h-14 bg-amber-50 rounded-2xl flex items-center justify-center text-amber-600">
              <KeyRound className="w-8 h-8" />
            </div>
            <span className="px-3 py-1 bg-amber-100 text-amber-700 text-[10px] font-black rounded-full uppercase">
              Android Signing Key
            </span>
          </div>
          
          <h3 className="text-xl font-black text-gray-900 mb-2">release.keystore</h3>
          <p className="text-xs text-gray-500 font-medium mb-6 leading-relaxed">
            এটি আপনার অ্যাপের অরিজিনাল সাইনিং কি। কোডম্যাজিক বা অন্য কোনো প্ল্যাটফর্মে অ্যাপ বিল্ড করার জন্য এই ফাইলটি প্রয়োজন।
          </p>

          <div className="space-y-2">
            <button
              onClick={onDownloadKeystore}
              className="w-full py-3.5 bg-amber-500 hover:bg-amber-400 text-white rounded-2xl font-black text-sm shadow-lg shadow-amber-500/20 flex items-center justify-center gap-2 transition-all active:scale-95"
            >
              <Download className="w-5 h-5" />
              ডাউনলোড করুন
            </button>
            <button
              onClick={onCopyKeystoreBase64}
              className="w-full py-3.5 bg-gray-50 hover:bg-gray-100 text-gray-600 rounded-2xl font-black text-sm border border-gray-100 flex items-center justify-center gap-2 transition-all active:scale-95"
            >
              <Copy className="w-4 h-4" />
              Base64 টেক্সট কপি
            </button>
          </div>
        </motion.div>

        {/* Upload Certificate Card */}
        <motion.div 
          whileHover={{ y: -5 }}
          className="bg-white rounded-3xl border-2 border-emerald-500/20 p-6 shadow-sm hover:shadow-md transition-all"
        >
          <div className="flex items-start justify-between mb-6">
            <div className="w-14 h-14 bg-emerald-50 rounded-2xl flex items-center justify-center text-emerald-600">
              <ShieldCheck className="w-8 h-8" />
            </div>
            <span className="px-3 py-1 bg-emerald-100 text-emerald-700 text-[10px] font-black rounded-full uppercase">
              Play Store Cert
            </span>
          </div>
          
          <h3 className="text-xl font-black text-gray-900 mb-2">upload_certificate.pem</h3>
          <p className="text-xs text-gray-500 font-medium mb-6 leading-relaxed">
            গুগল প্লে কনসোলে অ্যাপ আপলোড করার সময় এই সার্টিফিকেট ফাইলটি প্রয়োজন হতে পারে।
          </p>

          <div className="space-y-2">
            <button
              onClick={onDownloadCert}
              className="w-full py-3.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-2xl font-black text-sm shadow-lg shadow-emerald-600/20 flex items-center justify-center gap-2 transition-all active:scale-95"
            >
              <Download className="w-5 h-5" />
              ডাউনলোড করুন
            </button>
            <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-xl border border-gray-100">
              <FileText className="w-4 h-4 text-gray-400" />
              <span className="text-[10px] font-bold text-gray-500">Format: PEM (Base64)</span>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Instructions Card */}
      <div className="bg-gray-900 rounded-[32px] p-8 text-white">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center">
            <FileText className="w-6 h-6 text-emerald-400" />
          </div>
          <h3 className="text-xl font-black">ব্যবহার নির্দেশিকা</h3>
        </div>
        
        <div className="space-y-4">
          <div className="flex gap-4 p-4 bg-white/5 rounded-2xl border border-white/5">
            <div className="w-6 h-6 rounded-full bg-emerald-500 flex items-center justify-center text-[10px] font-black shrink-0">1</div>
            <p className="text-sm text-gray-300 leading-relaxed">
              <strong className="text-white">Codemagic:</strong> অ্যাপ বিল্ড করার সময় <code className="text-emerald-400">release.keystore</code> ফাইলটি আপলোড করুন অথবা Base64 টেক্সটটি এনভায়রনমেন্ট ভেরিয়েবলে ব্যবহার করুন।
            </p>
          </div>
          <div className="flex gap-4 p-4 bg-white/5 rounded-2xl border border-white/5">
            <div className="w-6 h-6 rounded-full bg-emerald-500 flex items-center justify-center text-[10px] font-black shrink-0">2</div>
            <p className="text-sm text-gray-300 leading-relaxed">
              <strong className="text-white">Alias & Password:</strong> কি-স্টোর ব্যবহারের জন্য পাসওয়ার্ড এবং এলিয়াস (Alias) হিসেবে <code className="text-emerald-400">almayadin</code> ব্যবহার করুন।
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
