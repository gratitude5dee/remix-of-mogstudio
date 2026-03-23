import { motion } from 'framer-motion';
import cyberImg from '@/assets/cards/cybersecurity-dashboard.jpg';
import saasImg from '@/assets/cards/saas-launch.jpg';
import filmImg from '@/assets/cards/film-key-art.jpg';
import brandImg from '@/assets/cards/brand-identity.jpg';
import motionImg from '@/assets/cards/motion-graphics.jpg';
import productImg from '@/assets/cards/3d-product-viz.jpg';

const showcaseItems = [
  { title: 'Cybersecurity Dashboard UI', image: cyberImg, tag: 'Enterprise Security' },
  { title: 'SaaS Product Launch', image: saasImg, tag: 'Go-to-Market' },
  { title: 'Film Key Art', image: filmImg, tag: 'Entertainment' },
  { title: 'Brand Identity System', image: brandImg, tag: 'Branding' },
  { title: 'Motion Graphics', image: motionImg, tag: 'Animation' },
  { title: '3D Product Visualization', image: productImg, tag: 'E-Commerce' },
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
              <img src={item.image} alt={item.title} loading="lazy" className="absolute inset-0 w-full h-full object-cover" />
              {/* Noise overlay */}
              <div className="absolute inset-0 opacity-[0.08] mix-blend-overlay pointer-events-none" style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=\'0 0 256 256\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cfilter id=\'n\'%3E%3CfeTurbulence type=\'fractalNoise\' baseFrequency=\'0.9\' numOctaves=\'4\' stitchTiles=\'stitch\'/%3E%3C/filter%3E%3Crect width=\'100%25\' height=\'100%25\' filter=\'url(%23n)\'/%3E%3C/svg%3E")' }} />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
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
