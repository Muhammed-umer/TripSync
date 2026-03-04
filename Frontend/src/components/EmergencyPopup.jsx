import React, { useEffect } from "react";
import { AlertTriangle, X } from "lucide-react";

export default function EmergencyPopup({ isOpen, message, onClose }) {
    useEffect(() => {
        if (isOpen) {
            const timer = setTimeout(() => {
                onClose();
            }, 5000);
            return () => clearTimeout(timer);
        }
    }, [isOpen, onClose]);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 backdrop-blur-md p-4 animate-in fade-in duration-300 pointer-events-auto">
            <div className="bg-red-50 border-4 border-red-600 rounded-3xl shadow-2xl overflow-hidden max-w-md w-full animate-in zoom-in-95 duration-300">
                <div className="bg-red-600 px-6 py-4 flex justify-between items-center shadow-md">
                    <div className="flex items-center gap-3 text-white">
                        <AlertTriangle className="animate-pulse" size={28} />
                        <h2 className="font-black text-2xl tracking-widest uppercase text-white shadow-black/20 text-shadow">Emergency</h2>
                    </div>
                    <button
                        onClick={onClose}
                        className="text-white/80 hover:text-white bg-red-700 hover:bg-red-800 p-2 rounded-full transition-all"
                    >
                        <X size={20} strokeWidth={3} />
                    </button>
                </div>
                <div className="p-8 pb-10 bg-gradient-to-br from-red-50 to-white">
                    <p className="text-red-950 font-extrabold text-center text-xl leading-relaxed">
                        {message}
                    </p>
                </div>
                {/* Progress bar effect underneath */}
                <div className="h-2 w-full bg-red-200">
                    <div className="h-full bg-red-600 animate-[shrink_5s_linear_forwards]"></div>
                </div>
            </div>
            {/* Dynamic keyframe for the shrinking bar */}
            <style>{`
        @keyframes shrink {
          from { width: 100%; }
          to { width: 0%; }
        }
      `}</style>
        </div>
    );
}
