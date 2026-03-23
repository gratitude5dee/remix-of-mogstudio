import { useState, useEffect, useCallback, lazy, Suspense } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import HeroSection from '@/components/landing/HeroSection';
import FeatureGrid from '@/components/landing/FeatureGrid';

// Lazy-load CinematicIntro so Three.js stays out of the initial bundle
const CinematicIntro = lazy(() => import('@/components/landing/CinematicIntro'));
import { UseCasesSection } from '@/components/landing/UseCasesSection';
import { TestimonialsSection } from '@/components/landing/TestimonialsSection';
import { NewReleasePromo } from '@/components/landing/NewReleasePromo';
import { MogPromoSection } from '@/components/landing/MogPromoSection';
import FAQAccordion from '@/components/landing/FAQAccordion';
import { PricingSectionRedesigned } from '@/components/landing/PricingSectionRedesigned';
import { StickyFooter } from '@/components/landing/StickyFooter';
import { VideoBackground } from '@/components/landing/VideoBackground';
import ScrollingPartners from '@/components/landing/ScrollingPartners';
import { useAuth } from '@/providers/AuthProvider';
import wzrdLogo from '@/assets/wzrd-logo.png';

const Landing = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [introComplete, setIntroComplete] = useState(() => {
    return sessionStorage.getItem('mog-intro-seen') === 'true';
  });

  const handleIntroComplete = useCallback(() => {
    sessionStorage.setItem('mog-intro-seen', 'true');
    setIntroComplete(true);
  }, []);

  useEffect(() => {
    const root = window.document.documentElement;
    root.classList.remove('light', 'system');
    root.classList.add('dark');
  }, []);

  // Handle scroll state for header styling
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const faqItems = [
    {
      question: 'How does MOG Studio handle collaboration?',
      answer:
        'Invite collaborators with granular permissions, leave comments on nodes, and keep every timeline change synced in realtime.',
    },
    {
      question: 'Can I bring my own assets or models?',
      answer:
        'Yes. Upload existing media, connect external sources, or plug in your preferred AI models directly in the studio.',
    },
    {
      question: 'What formats can I export?',
      answer:
        'Export ready-to-publish video in multiple resolutions, codecs, and aspect ratios tailored to every platform.',
    },
  ];

  const handleMobileNavClick = (elementId: string) => {
    setIsMobileMenuOpen(false);
    setTimeout(() => {
      const element = document.getElementById(elementId);
      if (element) {
        const headerOffset = 120;
        const elementPosition =
          element.getBoundingClientRect().top + window.pageYOffset;
        const offsetPosition = elementPosition - headerOffset;
        window.scrollTo({
          top: offsetPosition,
          behavior: 'smooth',
        });
      }
    }, 100);
  };

  const handleSmoothScroll = (elementId: string) => {
    const element = document.getElementById(elementId);
    if (element) {
      const headerOffset = 120;
      const elementPosition =
        element.getBoundingClientRect().top + window.pageYOffset;
      const offsetPosition = elementPosition - headerOffset;
      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth',
      });
    }
  };

  const handleLogout = async () => {
    const { supabase } = await import('@/integrations/supabase/client');
    await supabase.auth.signOut();
    navigate('/');
  };

  return (
    <div className="min-h-screen w-full relative">
      {/* Cinematic Intro — lazy-loaded to keep Three.js out of main bundle */}
      <AnimatePresence>
        {!introComplete && (
          <Suspense
            fallback={<div className="fixed inset-0 z-[99999] bg-black" />}
          >
            <CinematicIntro onComplete={handleIntroComplete} />
          </Suspense>
        )}
      </AnimatePresence>

      {/* Fullscreen Background Video with Dark Overlay & Fallback */}
      <VideoBackground />

      {/* Desktop Header */}
      <header
        className={`sticky top-4 z-[9999] mx-auto hidden w-full self-start rounded-full bg-black/70 md:flex backdrop-blur-xl border border-white/[0.08] shadow-2xl shadow-black/50 transition-all duration-500 ${
          isScrolled ? 'max-w-4xl px-3' : 'max-w-6xl px-6'
        } py-2.5`}
        style={{
          willChange: 'transform',
          transform: 'translateZ(0)',
          backfaceVisibility: 'hidden',
        }}
      >
        <div className="flex items-center justify-between w-full gap-4">
          {/* Logo */}
          <Link
            to="/"
            onClick={(e) => {
              if (window.location.pathname === '/') {
                e.preventDefault();
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }
            }}
            className="flex items-center justify-center gap-2 flex-shrink-0 z-50 cursor-pointer"
          >
            <img
              src={wzrdLogo}
              alt="MOG STUDIO"
              className="h-12 sm:h-15 w-auto"
            />
          </Link>

          {/* Navigation Links */}
          <nav className="hidden lg:flex flex-1 flex-row items-center justify-center gap-1 text-sm font-medium text-white/50">
            <a
              className="relative px-3 py-2 text-white/50 hover:text-white transition-colors cursor-pointer whitespace-nowrap"
              onClick={(e) => {
                e.preventDefault();
                handleSmoothScroll('features');
              }}
            >
              Features
            </a>
            <a
              href="/docs"
              className="relative px-3 py-2 text-white/50 hover:text-white transition-colors cursor-pointer whitespace-nowrap"
            >
              Documentation
            </a>
            <a
              href="/api"
              className="relative px-3 py-2 text-white/50 hover:text-white transition-colors cursor-pointer whitespace-nowrap"
            >
              API
            </a>
            <a
              className="relative px-3 py-2 text-white/50 hover:text-white transition-colors cursor-pointer whitespace-nowrap"
              onClick={(e) => {
                e.preventDefault();
                handleSmoothScroll('pricing');
              }}
            >
              Pricing
            </a>
            <a
              className="relative px-3 py-2 text-white/50 hover:text-white transition-colors cursor-pointer whitespace-nowrap"
              onClick={(e) => {
                e.preventDefault();
                handleSmoothScroll('testimonials');
              }}
            >
              Testimonials
            </a>
            <a
              className="relative px-3 py-2 text-white/50 hover:text-white transition-colors cursor-pointer whitespace-nowrap"
              onClick={(e) => {
                e.preventDefault();
                handleSmoothScroll('faq');
              }}
            >
              FAQ
            </a>
          </nav>

          {/* Action Buttons */}
          <div className="flex items-center gap-3 flex-shrink-0">
            <Link
              to="/demo"
              className="rounded-lg font-medium relative cursor-pointer hover:-translate-y-0.5 transition duration-200 inline-block text-center bg-gradient-to-b from-[#FF6B4A] to-[#e55a3a] text-white shadow-[0_0_20px_rgba(255,107,74,0.2)] hover:shadow-[0_0_30px_rgba(255,107,74,0.4)] px-4 py-1.5 text-xs sm:text-sm whitespace-nowrap"
            >
              Demo
            </Link>
            {user ? (
              <>
                <Link
                  to="/home"
                  className="font-medium transition-colors hover:text-white text-white/50 text-xs sm:text-sm cursor-pointer whitespace-nowrap"
                >
                  Dashboard
                </Link>
                <button
                  onClick={handleLogout}
                  className="rounded-lg font-bold relative cursor-pointer hover:-translate-y-0.5 transition duration-200 inline-block text-center bg-gradient-to-b from-[#FF6B4A] to-[#e55a3a] text-white shadow-[0_0_20px_rgba(255,107,74,0.2)] hover:shadow-[0_0_30px_rgba(255,107,74,0.4)] px-4 py-1.5 text-xs sm:text-sm whitespace-nowrap"
                >
                  Log Out
                </button>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  className="font-medium transition-colors hover:text-white text-white/50 text-xs sm:text-sm cursor-pointer whitespace-nowrap"
                >
                  Log In
                </Link>
                <Link
                  to="/login?mode=signup"
                  className="rounded-lg font-bold relative cursor-pointer hover:-translate-y-0.5 transition duration-200 inline-block text-center bg-gradient-to-b from-[#FF6B4A] to-[#e55a3a] text-white shadow-[0_0_20px_rgba(255,107,74,0.2)] hover:shadow-[0_0_30px_rgba(255,107,74,0.4)] px-4 py-1.5 text-xs sm:text-sm whitespace-nowrap"
                >
                  Sign Up
                </Link>
              </>
            )}
          </div>
        </div>
      </header>

      {/* Mobile Header */}
      <header className="sticky top-4 z-[9999] mx-4 flex w-auto flex-row items-center justify-between rounded-full bg-black/70 backdrop-blur-xl border border-white/[0.08] shadow-2xl shadow-black/50 md:hidden px-4 py-3">
        <Link
          to="/"
          onClick={(e) => {
            if (window.location.pathname === '/') {
              e.preventDefault();
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }
          }}
          className="flex items-center justify-center gap-2 cursor-pointer"
        >
          <img src={wzrdLogo} alt="MOG STUDIO" className="h-7 w-auto" />
        </Link>

        <button
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="flex items-center justify-center w-10 h-10 rounded-full bg-white/5 border border-white/[0.08] transition-colors hover:bg-white/10"
          aria-label="Toggle menu"
        >
          <div className="flex flex-col items-center justify-center w-5 h-5 space-y-1">
            <span
              className={`block w-4 h-0.5 bg-white transition-all duration-300 ${
                isMobileMenuOpen ? 'rotate-45 translate-y-1.5' : ''
              }`}
            ></span>
            <span
              className={`block w-4 h-0.5 bg-white transition-all duration-300 ${
                isMobileMenuOpen ? 'opacity-0' : ''
              }`}
            ></span>
            <span
              className={`block w-4 h-0.5 bg-white transition-all duration-300 ${
                isMobileMenuOpen ? '-rotate-45 -translate-y-1.5' : ''
              }`}
            ></span>
          </div>
        </button>
      </header>

      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-[9998] bg-black/60 backdrop-blur-md md:hidden">
          <div className="absolute top-20 left-4 right-4 bg-[#111111]/95 backdrop-blur-xl border border-white/[0.08] rounded-2xl shadow-2xl p-6">
            <nav className="flex flex-col space-y-3">
              <button
                onClick={() => handleMobileNavClick('features')}
                className="text-left px-4 py-3 text-lg font-medium text-white/50 hover:text-white transition-colors rounded-xl hover:bg-white/5"
              >
                Features
              </button>
              <Link
                to="/docs"
                className="text-left px-4 py-3 text-lg font-medium text-white/50 hover:text-white transition-colors rounded-xl hover:bg-white/5"
              >
                Documentation
              </Link>
              <Link
                to="/api"
                className="text-left px-4 py-3 text-lg font-medium text-white/50 hover:text-white transition-colors rounded-xl hover:bg-white/5"
              >
                API
              </Link>
              <button
                onClick={() => handleMobileNavClick('pricing')}
                className="text-left px-4 py-3 text-lg font-medium text-white/50 hover:text-white transition-colors rounded-xl hover:bg-white/5"
              >
                Pricing
              </button>
              <button
                onClick={() => handleMobileNavClick('testimonials')}
                className="text-left px-4 py-3 text-lg font-medium text-white/50 hover:text-white transition-colors rounded-xl hover:bg-white/5"
              >
                Testimonials
              </button>
              <button
                onClick={() => handleMobileNavClick('faq')}
                className="text-left px-4 py-3 text-lg font-medium text-white/50 hover:text-white transition-colors rounded-xl hover:bg-white/5"
              >
                FAQ
              </button>
              <div className="border-t border-white/[0.06] pt-4 mt-4 flex flex-col space-y-3">
                <Link
                  to="/demo"
                  className="px-4 py-3 text-lg font-bold text-center bg-gradient-to-b from-[#FF6B4A] to-[#e55a3a] text-white rounded-xl shadow-lg hover:-translate-y-0.5 transition-all duration-200"
                >
                  Demo
                </Link>
                {user ? (
                  <>
                    <Link
                      to="/home"
                      className="px-4 py-3 text-lg font-medium text-white/50 hover:text-white transition-colors rounded-xl hover:bg-white/5 cursor-pointer"
                    >
                      Dashboard
                    </Link>
                    <button
                      onClick={handleLogout}
                      className="px-4 py-3 text-lg font-bold text-center bg-gradient-to-b from-[#FF6B4A] to-[#e55a3a] text-white rounded-xl shadow-lg hover:-translate-y-0.5 transition-all duration-200"
                    >
                      Log Out
                    </button>
                  </>
                ) : (
                  <>
                    <Link
                      to="/login"
                      className="px-4 py-3 text-lg font-medium text-white/50 hover:text-white transition-colors rounded-xl hover:bg-white/5 cursor-pointer"
                    >
                      Log In
                    </Link>
                    <Link
                      to="/login?mode=signup"
                      className="px-4 py-3 text-lg font-bold text-center bg-gradient-to-b from-[#FF6B4A] to-[#e55a3a] text-white rounded-xl shadow-lg hover:-translate-y-0.5 transition-all duration-200"
                    >
                      Sign Up
                    </Link>
                  </>
                )}
              </div>
            </nav>
          </div>
        </div>
      )}

      {/* ===== PAGE CONTENT — card-based sections over video background ===== */}
      <div className="relative z-10">
        {/* Mog Platform Promo - Featured at Top */}
        <div id="mog">
          <MogPromoSection />
        </div>

        {/* Section Divider */}
        <div className="mx-auto max-w-6xl px-4">
          <div className="h-px bg-gradient-to-r from-transparent via-orange-500/20 to-transparent" />
        </div>

        {/* Hero Content */}
        <HeroSection
          headline="Turn Ideas Into Cinema-Quality Content in Minutes"
          subheadline="WZRD Studio combines AI image generation, video production, lip sync, 3D worldbuilding, and a complete timeline editor — all in one powerful creative platform."
        />

        {/* Trust Indicators Section — Card-based */}
        <section className="py-24 md:py-32 px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="container mx-auto max-w-5xl"
          >
            <div className="rounded-2xl border border-white/[0.06] bg-white/[0.02] backdrop-blur-sm p-10 md:p-12">
              <p className="text-center text-white/30 text-xs mb-8 uppercase tracking-[0.3em] font-medium">
                Powered by Industry Leaders
              </p>
              <div className="flex flex-wrap items-center justify-center gap-8 sm:gap-14">
                {[
                  'Runway 4.5',
                  'Kling 2.6',
                  "Google's Veo 3",
                  'WAN 2.6',
                  'Luma Ray 3',
                ].map((name) => (
                  <span
                    key={name}
                    className="text-white/40 font-semibold text-lg tracking-tight hover:text-white/60 transition-colors"
                  >
                    {name}
                  </span>
                ))}
              </div>
            </div>
          </motion.div>
        </section>

        {/* Section Divider */}
        <div className="mx-auto max-w-6xl px-4">
          <div className="h-px bg-gradient-to-r from-transparent via-orange-500/20 to-transparent" />
        </div>

        {/* Features Section */}
        <div id="features" className="relative">
          <FeatureGrid />
        </div>

        {/* Section Divider */}
        <div className="mx-auto max-w-6xl px-4">
          <div className="h-px bg-gradient-to-r from-transparent via-orange-500/20 to-transparent" />
        </div>

        {/* Use Cases Section */}
        <div className="relative">
          <UseCasesSection />
        </div>

        {/* Section Divider */}
        <div className="mx-auto max-w-6xl px-4">
          <div className="h-px bg-gradient-to-r from-transparent via-orange-500/20 to-transparent" />
        </div>

        {/* Testimonials Section */}
        <div id="testimonials" className="relative">
          <TestimonialsSection />
        </div>

        {/* Section Divider */}
        <div className="mx-auto max-w-6xl px-4">
          <div className="h-px bg-gradient-to-r from-transparent via-orange-500/20 to-transparent" />
        </div>

        {/* New Release Promo */}
        <div className="relative">
          <NewReleasePromo />
        </div>

        {/* Section Divider */}
        <div className="mx-auto max-w-6xl px-4">
          <div className="h-px bg-gradient-to-r from-transparent via-orange-500/20 to-transparent" />
        </div>

        {/* Pricing Section */}
        <div id="pricing" className="relative">
          <PricingSectionRedesigned />
        </div>

        {/* Section Divider */}
        <div className="mx-auto max-w-6xl px-4">
          <div className="h-px bg-gradient-to-r from-transparent via-orange-500/20 to-transparent" />
        </div>

        {/* FAQ Section */}
        <div id="faq" className="relative">
          <FAQAccordion items={faqItems} />
        </div>

        {/* Section Divider */}
        <div className="mx-auto max-w-6xl px-4">
          <div className="h-px bg-gradient-to-r from-transparent via-orange-500/20 to-transparent" />
        </div>

        {/* Sticky Footer */}
        <div>
          <StickyFooter />
        </div>
      </div>
    </div>
  );
};

export default Landing;
