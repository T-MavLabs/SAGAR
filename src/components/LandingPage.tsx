import React, { useEffect, useRef } from 'react';
import WorldMap from './ui/world-map';

const LandingPage: React.FC<{ onEnter: () => void }>= ({ onEnter }) => {
  const titleRef = useRef<HTMLHeadingElement>(null);
  const subtitleRef = useRef<HTMLParagraphElement>(null);
  const ctaRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const title = titleRef.current;
    const subtitle = subtitleRef.current;
    const cta = ctaRef.current;

    if (!title || !subtitle || !cta) return;

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
  }, []);

  return (
    <div className="min-h-screen bg-marine-blue text-white overflow-hidden relative">
      <div className="absolute inset-0 opacity-70">
        <div className="h-full w-full">
          <WorldMap />
        </div>
      </div>
      <div className="relative z-10 max-w-5xl mx-auto px-6 py-24 text-center">
        <h1 ref={titleRef} className="text-5xl md:text-6xl font-extrabold tracking-tight" style={{ transform: 'translateY(20px)', opacity: 0 }}>
          SAGAR
        </h1>
        <p ref={subtitleRef} className="mt-4 text-lg text-gray-300" style={{ transform: 'translateY(20px)', opacity: 0 }}>
          Spatio-temporal Analytics Gateway for Aquatic Resources
        </p>
        <div className="mt-10 flex justify-center gap-4">
          <button
            ref={ctaRef}
            onClick={onEnter}
            className="px-6 py-3 bg-marine-cyan text-marine-blue font-semibold rounded-lg hover:shadow-lg hover:shadow-marine-cyan/25 transition-all"
            style={{ transform: 'scale(0.9)', opacity: 0 }}
          >
            Enter Dashboard
          </button>
        </div>
      </div>
    </div>
  );
};

export default LandingPage;


