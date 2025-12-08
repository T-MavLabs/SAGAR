import React, { useEffect, useRef } from 'react';
import { FiLogOut } from 'react-icons/fi';
import WorldMap from './ui/world-map';

const LandingPage: React.FC<{ onEnter: () => void; onVesselLogin: () => void; onLogout?: () => void; skipAnimations?: boolean }> = ({ onEnter, onVesselLogin, onLogout, skipAnimations = false }) => {
  const titleRef = useRef<HTMLHeadingElement>(null);
  const subtitleRef = useRef<HTMLParagraphElement>(null);
  const ctaRef = useRef<HTMLButtonElement>(null);
  const vesselLoginRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (skipAnimations) {
      // Skip animations - make everything visible immediately
      const title = titleRef.current;
      const subtitle = subtitleRef.current;
      const cta = ctaRef.current;
      const vesselLogin = vesselLoginRef.current;

      if (title) {
        title.style.transform = 'translateY(0)';
        title.style.opacity = '1';
      }
      if (subtitle) {
        subtitle.style.transform = 'translateY(0)';
        subtitle.style.opacity = '1';
      }
      if (cta) {
        cta.style.transform = 'scale(1)';
        cta.style.opacity = '1';
      }
      if (vesselLogin) {
        vesselLogin.style.transform = 'scale(1)';
        vesselLogin.style.opacity = '1';
      }
      return;
    }

    const title = titleRef.current;
    const subtitle = subtitleRef.current;
    const cta = ctaRef.current;
    const vesselLogin = vesselLoginRef.current;

    if (!title || !subtitle || !cta || !vesselLogin) return;

    title.animate([
      { transform: 'translateY(20px)', opacity: 0 },
      { transform: 'translateY(0)', opacity: 1 }
    ], { duration: 700, easing: 'ease-out', fill: 'forwards' });

    subtitle.animate([
      { transform: 'translateY(20px)', opacity: 0 },
      { transform: 'translateY(0)', opacity: 1 }
    ], { duration: 600, delay: 300, easing: 'ease-out', fill: 'forwards' });

    cta.animate([
      { transform: 'scale(0.9)', opacity: 0 },
      { transform: 'scale(1)', opacity: 1 }
    ], { duration: 500, delay: 550, easing: 'ease-out', fill: 'forwards' });

    vesselLogin.animate([
      { transform: 'scale(0.9)', opacity: 0 },
      { transform: 'scale(1)', opacity: 1 }
    ], { duration: 500, delay: 700, easing: 'ease-out', fill: 'forwards' });
  }, [skipAnimations]);

  return (
    <div className="min-h-screen bg-marine-blue text-white overflow-hidden relative">
      <div className="absolute inset-0 opacity-70">
        <div className="h-full w-full">
          <WorldMap />
        </div>
      </div>
      {/* Logout Button */}
      {onLogout && (
        <div className="absolute top-6 right-6 z-30">
          <button 
            onClick={onLogout}
            className="flex items-center space-x-2 px-4 py-2 bg-red-600/20 hover:bg-red-600/30 border border-red-500/30 rounded-lg transition-colors duration-200 text-white"
          >
            <FiLogOut className="w-4 h-4" />
            <span>Logout</span>
          </button>
        </div>
      )}
      <div className="relative z-10 max-w-5xl mx-auto px-6 py-24 text-center">
        <h1 ref={titleRef} className="text-5xl md:text-6xl font-extrabold tracking-tight" style={{ transform: 'translateY(20px)', opacity: 0 }}>
          SAGAR
        </h1>
        <p ref={subtitleRef} className="mt-4 text-lg text-gray-300" style={{ transform: 'translateY(20px)', opacity: 0 }}>
          Spatio-temporal Analytics Gateway for Aquatic Resources
        </p>
        <div className="mt-10 flex flex-col items-center gap-4">
          <button
            ref={ctaRef}
            onClick={onEnter}
            className="px-6 py-3 bg-marine-cyan text-marine-blue font-semibold rounded-lg hover:shadow-lg hover:shadow-marine-cyan/25 transition-all"
            style={{ transform: 'scale(0.9)', opacity: 0 }}
          >
            Enter Dashboard
          </button>
          <button
            ref={vesselLoginRef}
            onClick={onVesselLogin}
            className="px-6 py-3 bg-marine-teal text-white font-semibold rounded-lg hover:shadow-lg hover:shadow-marine-teal/25 transition-all"
            style={{ transform: 'scale(0.9)', opacity: 0 }}
          >
            Vessel Login
          </button>
        </div>
      </div>
    </div>
  );
};

export default LandingPage;


