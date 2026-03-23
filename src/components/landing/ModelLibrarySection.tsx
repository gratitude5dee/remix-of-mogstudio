import { motion } from 'framer-motion';

const providers = [
  { name: 'Google', models: ['Gemini 2.5 Flash', 'Imagen 3', 'Veo 2'], gradient: 'from-blue-500/20 to-cyan-500/10' },
  { name: 'OpenAI', models: ['GPT-5', 'GPT-4o Mini', 'GPT Image', 'Sora'], gradient: 'from-emerald-500/20 to-green-500/10' },
  { name: 'Runway', models: ['Gen-4 Turbo', 'Runway 4.5', 'Gen-3 Alpha'], gradient: 'from-purple-500/20 to-violet-500/10' },
  { name: 'Black Forest Labs', models: ['FLUX.1 Pro', 'FLUX.1 Dev', 'FLUX.1 Schnell'], gradient: 'from-orange-500/20 to-red-500/10' },
  { name: 'Luma AI', models: ['Dream Machine', 'Photon', 'Ray 2'], gradient: 'from-pink-500/20 to-rose-500/10' },
  { name: 'Stability AI', models: ['SD3.5 Turbo', 'Stable Video', 'SDXL'], gradient: 'from-amber-500/20 to-yellow-500/10' },
  { name: 'Hailuo AI', models: ['MiniMax Video', 'Seedance 2', 'Seedream 2'], gradient: 'from-teal-500/20 to-cyan-500/10' },
  { name: 'WAN', models: ['WAN 2.6', 'Nanobanana 2', 'WAN-X'], gradient: 'from-indigo-500/20 to-blue-500/10' },
];

export function ModelLibrarySection() {
  return (
    <section className="py-32 px-4 relative">
      <div className="container mx-auto max-w-7xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white mb-6">
            One subscription to{' '}
            <em style={{ fontFamily: 'Georgia, serif', fontStyle: 'italic' }} className="bg-clip-text text-transparent bg-gradient-to-r from-orange-300 to-amber-200">
              rule them all.
            </em>
          </h2>
          <p className="text-lg text-white/50 max-w-2xl mx-auto">
            One plan. 50+ models. Stay on the creative edge without chasing licenses.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {providers.map((provider, i) => (
            <motion.div
              key={provider.name}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.05 }}
              className="group p-6 rounded-2xl bg-white/[0.03] border border-white/[0.06] hover:border-white/[0.15] hover:-translate-y-1 hover:shadow-xl transition-all duration-300 relative overflow-hidden"
            >
              <div className={`absolute inset-0 bg-gradient-to-br ${provider.gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-500`} />
              <div className="relative z-10">
                <h3 className="text-base font-semibold text-white mb-3">{provider.name}</h3>
                <div className="flex flex-col gap-1.5">
                  {provider.models.map((model) => (
                    <span key={model} className="text-xs text-white/40 font-mono">{model}</span>
                  ))}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

export default ModelLibrarySection;
