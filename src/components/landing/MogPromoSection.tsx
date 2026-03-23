import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';

const clientLogos = [
  'NYU', 'Pentagram', "Levi's", 'Lionsgate', 'R/GA', 'WPP', 'AKQA', 'NBCUniversal',
];

export function MogPromoSection() {
  return (
    <section className="py-24 px-4 relative overflow-hidden">
      {/* Background */}
      <div
        className="absolute inset-0 z-0"
        style={{
          background: 'radial-gradient(ellipse 60% 40% at 50% 50%, rgba(16,185,129,0.06), transparent 70%)',
        }}
      />

      <div className="container mx-auto max-w-6xl relative z-10">
        {/* Social Proof */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-20"
        >
          <p className="text-xs uppercase tracking-[0.2em] text-white/30 mb-8">
            Trusted by the world's top creative teams
          </p>
          <div className="flex flex-wrap items-center justify-center gap-x-10 gap-y-4">
            {clientLogos.map((name) => (
              <span
                key={name}
                className="text-sm sm:text-base font-medium text-white/20 hover:text-white/40 transition-colors tracking-wide"
              >
                {name}
              </span>
            ))}
          </div>
        </motion.div>

        {/* Generative Workflows */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="text-center relative"
        >
          {/* Organic blur */}
          <div className="absolute inset-0 -z-10 flex items-center justify-center">
            <div className="w-[600px] h-[300px] bg-emerald-500/[0.04] rounded-full blur-[100px]" />
          </div>

          <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6">
            Generative workflows{' '}
            <em style={{ fontFamily: 'Georgia, serif', fontStyle: 'italic' }} className="bg-clip-text text-transparent bg-gradient-to-r from-emerald-300 to-teal-200">
              that scale.
            </em>
          </h2>

          <p className="text-lg text-white/50 max-w-2xl mx-auto mb-10 leading-relaxed">
            Teams use WZRD to amplify their creative output — from ideation to distribution, all powered by 50+ AI models in one unified workspace.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              to="/login?mode=signup"
              className="inline-flex items-center gap-2 px-8 py-4 bg-emerald-500 text-black font-semibold rounded-xl hover:bg-emerald-400 hover:-translate-y-0.5 hover:shadow-[0_8px_30px_rgba(16,185,129,0.25)] transition-all duration-200 text-base"
            >
              Get started for free
              <ArrowRight className="w-4 h-4" />
            </Link>
            <a
              href="#features"
              className="inline-flex items-center gap-2 text-white/50 hover:text-white/80 font-medium transition-colors text-base"
            >
              See all workflows →
            </a>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
