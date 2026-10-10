import { motion } from "motion/react";
import { METRICS_CONTENT } from "../data";
import { Award, Layers, ShieldCheck, CheckSquare } from "lucide-react";

export default function Metrics() {
  return (
    <section
      id="experience"
      className="relative py-24 lg:py-32 bg-[#050505] border-t border-white/5 overflow-hidden"
    >
      <div className="max-w-7xl mx-auto px-6 lg:px-8 relative z-10">
        
        {/* Section Heading */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="max-w-3xl mx-auto text-center mb-16 lg:mb-20"
        >
          <h2 className="text-3xl sm:text-5xl font-display font-bold tracking-tight text-white mb-4" id="experience-title">
            Experience
          </h2>
          <div className="w-12 h-[1px] bg-white/20 mx-auto rounded-full" />
        </motion.div>

        {/* Metric Cards - Premium Split Layout */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto mb-16">
          {METRICS_CONTENT.cards.map((card, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.6, delay: idx * 0.12 }}
              whileHover={{ y: -4, transition: { duration: 0.2 } }}
              className="relative p-6 sm:p-8 rounded-3xl border border-white/10 bg-white/[0.03] backdrop-blur-2xl transition-all flex flex-col justify-between overflow-hidden group"
              id={`stat-card-${idx}`}
            >
              {/* Subtle top light bar */}
              <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-white/10 to-transparent group-hover:via-white/30 transition-all duration-500" />
              
              <div className="flex justify-between items-start mb-6">
                <span className="text-[10px] uppercase font-mono tracking-widest text-white/40">
                  {card.category}
                </span>
                <span className="w-1.5 h-1.5 rounded-full bg-white/30 group-hover:bg-white transition-colors" />
              </div>
 
              <div>
                <span className="font-display font-bold text-4xl sm:text-5xl text-white block tracking-tight mb-2">
                  {card.value}
                </span>
                <span className="text-white/60 font-sans font-medium text-[11px] sm:text-xs tracking-wide uppercase leading-normal">
                  {card.label}
                </span>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Credentials & Focus Areas Section */}
        <div className="max-w-4xl mx-auto text-center border-t border-white/5 pt-16">
          
          {/* Subheading titled Expertise */}
          <motion.h3
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-xs font-mono uppercase tracking-[0.2em] text-white mb-6 font-semibold"
            id="expertise-subheading"
          >
            Expertise
          </motion.h3>

          {/* List of focus areas */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="flex flex-wrap justify-center items-center gap-x-3 gap-y-2 mb-8"
            id="focus-areas"
          >
            {METRICS_CONTENT.focusAreas.map((area, index) => (
              <div key={index} className="flex items-center gap-3">
                <span className="text-[11px] font-semibold py-1.5 px-3.5 rounded-full bg-white/[0.03] border border-white/10 text-white/70">
                  {area}
                </span>
                {index < METRICS_CONTENT.focusAreas.length - 1 && (
                  <span className="text-white/20 hidden sm:inline select-none">•</span>
                )}
              </div>
            ))}
          </motion.div>

          {/* Core Support Statement */}
          <motion.p
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.15 }}
            className="text-base sm:text-lg lg:text-xl font-sans text-white/60 font-light leading-relaxed max-w-3xl mx-auto text-center"
            id="metrics-philosophy"
          >
            "{METRICS_CONTENT.supportStatement}"
          </motion.p>
        </div>

      </div>
    </section>
  );
}
