import React from 'react';

interface Logo {
  id: string;
  name: string;
  scale?: number;
}

const logos: Logo[] = [
  { id: '1', name: '5DEE Studios', scale: 1 },
  { id: '2', name: 'Anthropic', scale: 1 },
  { id: '3', name: 'Thirdweb', scale: 1.1 },
  { id: '4', name: 'ElevenLabs', scale: 1 },
  { id: '5', name: 'Story Protocol', scale: 1 },
  { id: '6', name: 'Human.tech', scale: 1 },
];

const ScrollingPartners: React.FC = () => {
  return (
    <section className="py-16 md:py-20 overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <p className="text-center text-white/30 text-xs uppercase tracking-[0.3em] font-medium mb-10">
          Built With
        </p>
      </div>
      <div className="relative w-full">
        {/* Fade edges */}
        <div className="absolute left-0 top-0 bottom-0 w-32 z-10 bg-gradient-to-r from-black to-transparent pointer-events-none" />
        <div className="absolute right-0 top-0 bottom-0 w-32 z-10 bg-gradient-to-l from-black to-transparent pointer-events-none" />

        <div className="flex animate-marquee" style={{ '--duration': '25s' } as React.CSSProperties}>
          {[...Array(3)].map((_, setIndex) => (
            <div key={setIndex} className="flex items-center shrink-0">
              {logos.map((logo) => (
                <span
                  key={`${setIndex}-${logo.id}`}
                  className="mx-10 md:mx-14 text-white/40 font-semibold text-lg md:text-xl tracking-tight hover:text-white/70 transition-colors whitespace-nowrap"
                  style={{ transform: `scale(${logo.scale || 1})` }}
                >
                  {logo.name}
                </span>
              ))}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default ScrollingPartners;
