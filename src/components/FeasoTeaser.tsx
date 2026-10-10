import { motion } from "motion/react";
import { ArrowRight } from "lucide-react";

interface FeasoTeaserProps {
  onOpen: () => void;
}

export default function FeasoTeaser({ onOpen }: FeasoTeaserProps) {
  return (
    <section id="feaso" className="relative py-16 bg-[#050505] border-t border-white/5">
      <div className="max-w-5xl mx-auto px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
          className="frosted-glass-card p-8 sm:p-12 flex flex-col md:flex-row md:items-center justify-between gap-8"
        >
          <div className="max-w-xl">
            <span className="text-[10px] uppercase font-mono tracking-widest text-white/40 font-bold block mb-3">
              New · Early access
            </span>
            <h2 className="text-3xl sm:text-4xl font-display font-medium tracking-tight text-white mb-3">
              Feaso by Devmate
            </h2>
            <p className="text-white/50">
              A lightweight, web-based development feasibility tool. Model unit mix, timing, escalation and funding
              month by month, then see margin, IRR and residual land value update live.
            </p>
          </div>
          <button
            onClick={onOpen}
            className="shrink-0 px-6 py-3 rounded-full text-sm font-semibold bg-white text-black hover:bg-white/90 transition-all duration-200 flex items-center gap-2 active:scale-95 group cursor-pointer"
            id="feaso-teaser-cta"
          >
            Open Feaso
            <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5" />
          </button>
        </motion.div>
      </div>
    </section>
  );
}
