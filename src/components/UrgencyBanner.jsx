import React from 'react';
import { AlertTriangle, Zap, X } from 'lucide-react';

const UrgencyBanner = ({ alert, onDonate }) => {
  if (!alert) return null;

  return (
    <div className="relative bg-red-700 text-white overflow-hidden shrink-0">

      {/* Shimmer — défini inline pour éviter la config Tailwind */}
      <style>{`
        @keyframes shimmer {
          0%   { background-position: 200% center; }
          100% { background-position: -200% center; }
        }
        .banner-shimmer {
          background: linear-gradient(
            90deg,
            transparent 0%,
            rgba(255,255,255,0.08) 40%,
            rgba(255,255,255,0.15) 50%,
            rgba(255,255,255,0.08) 60%,
            transparent 100%
          );
          background-size: 200% 100%;
          animation: shimmer 3s linear infinite;
        }
        @keyframes pulse-dot {
          0%, 100% { opacity: 1; box-shadow: 0 0 0 0 rgba(255,255,255,0.4); }
          50%       { opacity: 0.6; box-shadow: 0 0 0 6px rgba(255,255,255,0); }
        }
        .live-pulse {
          animation: pulse-dot 1.4s ease-in-out infinite;
        }
      `}</style>

      {/* Fond shimmer */}
      <div className="banner-shimmer absolute inset-0 pointer-events-none" />

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex items-center gap-4">

        {/* Dot live */}
        <span className="live-pulse shrink-0 w-2.5 h-2.5 rounded-full bg-white hidden sm:block" />

        {/* Icône */}
        <div className="shrink-0 bg-white/20 backdrop-blur-sm p-1.5 rounded-lg border border-white/20">
          <AlertTriangle size={16} strokeWidth={2.5} />
        </div>

        {/* Texte */}
        <div className="flex-1 min-w-0">
          <p className="text-[9px] font-black uppercase tracking-[0.2em] text-red-200 leading-none mb-0.5">
            Alerte sanitaire critique · CNHU-HKM
          </p>
          <p className="text-xs sm:text-sm font-bold leading-tight truncate">
            Besoin urgent de{' '}
            <span className="underline decoration-2 underline-offset-2 font-black">
              {alert.needed_pockets} poches {alert.blood_group}
            </span>
            {alert.location && (
              <span className="font-normal opacity-80"> — {alert.location}</span>
            )}
          </p>
        </div>

        {/* CTA */}
        <button
          onClick={onDonate}
          className="shrink-0 bg-white text-red-700 px-4 sm:px-5 py-2 rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-red-50 transition-colors flex items-center gap-1.5 shadow-lg"
        >
          <span className="hidden sm:inline">Donner maintenant</span>
          <span className="sm:hidden">Donner</span>
          <Zap size={12} fill="currentColor" />
        </button>

      </div>
    </div>
  );
};

export default UrgencyBanner;