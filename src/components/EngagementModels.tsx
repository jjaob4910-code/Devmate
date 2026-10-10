import { motion } from "motion/react";
import { ArrowRight, Check } from "lucide-react";
import { ENGAGEMENT_CONTENT } from "../data";

interface EngagementModelsProps {
  onCtaclick: () => void;
}

export default function EngagementModels({ onCtaclick }: EngagementModelsProps) {
  const lifecycleStages = [
    "Due diligence & site assessment",
    "Feasibility modelling & funding support",
    "Design & consultant coordination",
    "Planning approvals & council liaison",
    "Procurement & building package support",
    "Construction tracking & issue management",
    "Completion, handover & defects coordination"
  ];

  return (
    <section
      id="pricing"
      className="relative py-24 lg:py-32 bg-[#050505] border-t border-white/5 overflow-hidden"
    >
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-white/[0.01] rounded-full blur-[120px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-6 lg:px-8 relative z-10">
        
        {/* Heading */}
        <div className="max-w-3xl mx-auto text-center mb-16 lg:mb-20">
          <span className="text-[10px] uppercase font-mono tracking-widest text-white/40 font-bold block mb-3">
            Pricing
          </span>
          <h2 className="text-3xl sm:text-5xl font-display font-medium tracking-tight text-white mb-4" id="engagement-title">
            Tailored Development Support
          </h2>
          <div className="w-12 h-[1px] bg-white/20 mx-auto rounded-full" />
        </div>

        {/* Custom Single Card with Split Layout */}
        <div className="max-w-4xl mx-auto mb-16">
          <motion.div
            initial={{ opacity: 0, y: 25 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="relative rounded-3xl border border-white/10 overflow-hidden bg-white/[0.03] backdrop-blur-2xl p-8 sm:p-12 shadow-[0_12px_45px_rgba(255,255,255,0.01)]"
            id="price-card-single"
          >
            {/* Ambient decorative top corner light */}
            <div className="absolute -top-12 -right-12 w-48 h-48 bg-emerald-500/[0.03] rounded-full blur-3xl pointer-events-none" />

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-stretch">
              
              {/* Left Column: Model Pricing & Details */}
              <div className="lg:col-span-5 flex flex-col justify-between">
                <div>
                  <div className="mb-6">
                    <span className="inline-flex items-center gap-1.5 text-[9px] uppercase tracking-widest font-mono font-bold bg-emerald-500/10 text-emerald-400 px-3 py-1 rounded-full border border-emerald-500/20 shadow-[0_0_15px_rgba(16,185,129,0.1)]">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping shrink-0" />
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shrink-0 -ml-3" />
                      All-Inclusive Rate
                    </span>
                  </div>

                  <h3 className="text-2xl font-display font-semibold text-white mb-3">
                    Hourly Support
                  </h3>

                  <div className="flex items-baseline gap-2 mb-6">
                    <span className="text-5xl sm:text-6xl font-mono font-bold text-white tracking-tight">
                      $70
                    </span>
                    <span className="text-white/40 font-mono text-sm">/ hr</span>
                  </div>

                  <p className="text-white/60 text-sm leading-relaxed mb-8 font-sans font-light">
                    For one-off tasks, short term or ongoing support. Dev Mate helps you bridge resource gaps and manage complexities across the full property development lifecycle with complete clarity and agility.
                  </p>
                </div>

                <div className="pt-4">
                  <button
                    onClick={onCtaclick}
                    className="w-full lg:w-auto px-8 py-3.5 rounded-xl text-xs font-semibold tracking-wider uppercase bg-white text-black hover:bg-white/90 transition-all duration-300 shadow-lg cursor-pointer"
                    id="cta-price-model-single"
                  >
                    Get Started
                  </button>
                </div>
              </div>

              {/* Right Column: Key Stages */}
              <div className="lg:col-span-7 lg:border-l lg:border-white/5 lg:pl-12 flex flex-col justify-center">
                <span className="text-xs font-mono uppercase tracking-[0.2em] text-white/40 mb-3 block">
                  Project Lifecycle
                </span>
                <h4 className="text-md font-sans font-medium text-white mb-6">
                  Whatever stage your project is at:
                </h4>
                
                <ul className="space-y-4">
                  {lifecycleStages.map((stage, sIdx) => (
                    <motion.li 
                      key={sIdx}
                      initial={{ opacity: 0, x: 10 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.4, delay: sIdx * 0.05 }}
                      className="flex items-start gap-3.5 text-sm text-white/70 font-sans font-light"
                      id={`lifecycle-stage-${sIdx}`}
                    >
                      <span className="flex items-center justify-center w-5 h-5 rounded-full bg-emerald-500/10 border border-emerald-500/20 shrink-0 mt-0.5 shadow-[0_0_10px_rgba(16,185,129,0.05)]">
                        <Check className="w-3.5 h-3.5 text-emerald-400" />
                      </span>
                      <span>{stage}</span>
                    </motion.li>
                  ))}
                </ul>
              </div>

            </div>
          </motion.div>
        </div>

        {/* Dynamic Under-card callout */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="max-w-3xl mx-auto rounded-3xl border border-white/10 bg-white/[0.01] p-8 text-center"
          id="engagement-dialog-card"
        >
          <p className="text-sm sm:text-base text-white/60 font-sans font-light leading-relaxed mb-6">
            {ENGAGEMENT_CONTENT.callout}
          </p>
          <button
            onClick={onCtaclick}
            className="inline-flex items-center gap-2 px-6 py-3 rounded-full text-xs font-semibold uppercase tracking-wider bg-white text-black hover:bg-white/90 transition-colors group cursor-pointer"
            id="engagement-bottom-cta"
          >
            {ENGAGEMENT_CONTENT.ctaText}
            <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5" />
          </button>
        </motion.div>

      </div>
    </section>
  );
}
