import { motion } from "motion/react";
import { ArrowRight, ChevronDown, CheckCircle } from "lucide-react";
import { HERO_CONTENT } from "../data";

interface HeroProps {
  onCtaclick: () => void;
}

export default function Hero({ onCtaclick }: HeroProps) {
  return (
    <section
      id="home"
      className="relative min-h-screen flex flex-col justify-center items-center px-6 lg:px-8 pt-24 overflow-hidden bg-[#050505] bg-grid-pattern"
    >
      {/* Decorative gradient glow corresponding to glass theme */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-white/[0.02] rounded-full blur-[130px] pointer-events-none" />

      <div className="max-w-4xl mx-auto text-center z-13 flex flex-col items-center">
        {/* Subtle Pill Badge */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6 }}
          className="inline-flex items-center gap-1.5 px-3.5 py-1.5 mb-8 rounded-full border border-white/10 bg-white/[0.03] text-xs font-mono text-white/70 backdrop-blur-md"
          id="hero-badge"
        >
          <span className="w-1.5 h-1.5 rounded-full bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.6)] animate-pulse" />
          Property Development Support
        </motion.div>

        {/* Hero Title with Frosted Gradient */}
        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.1, ease: "easeOut" }}
          className="text-[44px] sm:text-[64px] font-semibold leading-[1.2] sm:leading-[1.15] pb-2 tracking-tight mb-6 bg-clip-text text-transparent bg-gradient-to-b from-white via-white to-white/40"
          id="hero-title"
        >
          {HERO_CONTENT.headline}
        </motion.h1>

        {/* Hero Subheadline */}
        <motion.p
          initial={{ opacity: 0, y: 25 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
          className="max-w-2xl text-base sm:text-lg text-white/50 font-light leading-relaxed mb-10 font-sans"
          id="hero-subtitle"
        >
          {HERO_CONTENT.subheadline}
        </motion.p>

        {/* Primary Let's Talk CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="flex flex-col sm:flex-row items-center gap-4"
        >
          <button
            onClick={onCtaclick}
            className="w-full sm:w-auto px-8 py-3.5 rounded-full bg-white text-black text-[14px] font-semibold hover:bg-white/90 transition-all duration-305 flex items-center justify-center gap-2 shadow-lg active:scale-98 cursor-pointer group"
            id="hero-cta-btn"
          >
            {HERO_CONTENT.ctaText}
            <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5" />
          </button>
        </motion.div>
      </div>

      {/* Decorative Down Arrow Indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.5 }}
        transition={{ delay: 0.8, duration: 1 }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1 cursor-pointer hover:opacity-100 transition-opacity"
        onClick={() => {
          const metricsSec = document.getElementById("experience");
          if (metricsSec) {
            metricsSec.scrollIntoView({ behavior: "smooth", block: "start" });
          }
        }}
        id="hero-scroll-indicator"
      >
        <span className="text-[9px] font-mono tracking-widest text-white/40 uppercase">Discover more</span>
        <ChevronDown className="w-4 h-4 text-white/40 animate-bounce" />
      </motion.div>
    </section>
  );
}
