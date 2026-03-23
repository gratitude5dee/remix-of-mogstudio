import React from 'react';

interface Logo {
  id: string;
  name: string;
  scale?: number;
}

const logos: Logo[] = [
  { id: '1', name: '5DEE Studios', scale: 1 },
  { id: '2', name: 'Anthropic', scale: 1 },
  { id: '3', name: 'Sora', scale: 1.1 },
  { id: '4', name: 'ElevenLabs', scale: 1 },
  { id: '5', name: 'Story Protocol', scale: 1 },
  { id: '6', name: 'Human.tech', scale: 1 },
  { id: '7', name: 'Veo 3.1', scale: 1 },
  { id: '8', name: 'Nanobanana 2', scale: 1 },
  { id: '9', name: 'Seedream 2', scale: 1 },
  { id: '10', name: 'Seedance 2', scale: 1 },
  { id: '11', name: 'WAN 2.6', scale: 1 },
  { id: '12', name: 'Runway 4.5', scale: 1 },
];

const ScrollingPartners: React.FC = () => {
  return (
    <section className="py-16 md:py-20 overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <p className="text-center text-white/30 text-xs uppercase tracking-[0.3em] font-medium mb-10">
          Built With
        </p>
      </div>
      <div className="relative w-full partners-fade-mask">
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
