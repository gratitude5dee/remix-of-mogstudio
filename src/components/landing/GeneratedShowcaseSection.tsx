import { motion } from 'framer-motion';

const showcaseItems = [
  { title: 'Cybersecurity Dashboard UI', gradient: 'from-cyan-600/40 via-blue-900/60 to-slate-900/80', tag: 'Enterprise Security' },
  { title: 'SaaS Product Launch', gradient: 'from-violet-600/40 via-purple-900/60 to-slate-900/80', tag: 'Go-to-Market' },
  { title: 'Film Key Art', gradient: 'from-orange-600/40 via-red-900/60 to-slate-900/80', tag: 'Entertainment' },
  { title: 'Brand Identity System', gradient: 'from-emerald-600/40 via-teal-900/60 to-slate-900/80', tag: 'Branding' },
  { title: 'Motion Graphics', gradient: 'from-pink-600/40 via-rose-900/60 to-slate-900/80', tag: 'Animation' },
  { title: '3D Product Visualization', gradient: 'from-amber-600/40 via-yellow-900/60 to-slate-900/80', tag: 'E-Commerce' },
];

export function GeneratedShowcaseSection() {
  return (
    <section className="py-32 px-4 relative">
      <div className="container mx-auto max-w-7xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl sm:text-5xl font-bold text-white mb-6">
            Create at the{' '}
            <em style={{ fontFamily: 'Georgia, serif', fontStyle: 'italic' }} className="bg-clip-text text-transparent bg-gradient-to-r from-white/80 to-white/40">
              speed of thought.
            </em>
          </h2>
          <p className="text-lg text-white/50 max-w-2xl mx-auto">
            Speak your ideas into existence with a high degree of creative control.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {showcaseItems.map((item, i) => (
            <motion.div
              key={item.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.08 }}
              className="group relative aspect-[4/3] rounded-2xl overflow-hidden cursor-pointer border border-white/[0.06] hover:border-white/[0.15] transition-all duration-300"
            >
              <div className={`absolute inset-0 bg-gradient-to-br ${item.gradient}`} />
              {/* Grid texture */}
              <div
                className="absolute inset-0 opacity-20"
                style={{
                  backgroundImage: 'radial-gradient(rgba(255,255,255,0.15) 1px, transparent 1px)',
                  backgroundSize: '16px 16px',
                }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
              <div className="absolute bottom-0 left-0 right-0 p-6">
                <span className="inline-block px-2.5 py-1 rounded-md text-[10px] font-mono uppercase tracking-wider bg-white/10 text-white/60 mb-3">
                  {item.tag}
                </span>
                <h3 className="text-lg font-semibold text-white">{item.title}</h3>
                <p className="text-xs text-white/30 mt-1 font-mono">Generated with WZRD</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

export default GeneratedShowcaseSection;
