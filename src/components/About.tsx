import { motion } from "motion/react";
import { ArrowRight, Sparkles, MapPin } from "lucide-react";
import { ABOUT_CONTENT } from "../data";
import portraitImg from "../assets/images/headshot.jpg";

interface AboutProps {
  onCtaclick: () => void;
}

export default function About({ onCtaclick }: AboutProps) {
  return (
    <section
      id="about-me"
      className="relative py-24 lg:py-32 bg-[#050505] overflow-hidden"
    >
      <div className="max-w-7xl mx-auto px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-20 items-center">
          
          {/* Portrait Column */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="lg:col-span-5 relative"
            id="about-portrait-wrapper"
          >
            {/* Ambient white glass glow behind photo */}
            <div className="absolute inset-x-0 -bottom-10 h-64 bg-white/[0.01] rounded-full blur-[80px] pointer-events-none" />
            
            <div className="relative aspect-[3/4] w-full rounded-2xl overflow-hidden border border-white/10 shadow-2xl group">
              {/* Portrait image */}
              <img
                src={portraitImg}
                alt="Johnny Li - Assistant Development Manager"
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                referrerPolicy="no-referrer"
              />
              {/* Overlay with subtle visual details */}
              <div className="absolute inset-0 bg-gradient-to-t from-[#050505] via-transparent to-transparent opacity-80" />
              
              <div className="absolute bottom-6 left-6 right-6">
                <div className="px-3.5 py-2.5 rounded-xl backdrop-blur-md bg-[#050505]/80 border border-white/10 flex items-center justify-between">
                  <div>
                    <p className="text-[10px] font-mono text-white/40 uppercase tracking-wider">Assistant Development Manager</p>
                    <p className="text-sm font-semibold text-white">Johnny Li</p>
                  </div>
                  <div className="flex items-center gap-1 text-[11px] font-medium text-white/80">
                    <MapPin className="w-3.5 h-3.5 text-white/50" />
                    Melbourne, VIC
                  </div>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Content Narrative Column */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.8, ease: "easeOut", delay: 0.1 }}
            className="lg:col-span-7"
            id="about-content"
          >
            <span className="text-[10px] uppercase font-mono tracking-widest text-white/40 font-bold block mb-3">
              About Dev Mate
            </span>
            <h2 className="text-3xl sm:text-5xl font-display font-medium text-white mb-8 tracking-tight leading-tight">
              {ABOUT_CONTENT.heading}
            </h2>

            <div className="space-y-6 text-white/70 font-sans text-sm sm:text-base leading-relaxed mb-10">
              {ABOUT_CONTENT.paragraphs.map((p, idx) => (
                <p key={idx} className={idx === 0 ? "font-normal text-md" : "font-light"}>
                  {p}
                </p>
              ))}
            </div>

            {/* Let's Connect Action Button */}
            <button
              onClick={onCtaclick}
              className="px-6 py-3.5 rounded-full bg-white hover:bg-white/90 text-black font-semibold transition-all duration-300 flex items-center gap-2 group text-sm active:scale-98 cursor-pointer"
              id="about-cta-connect"
            >
              {ABOUT_CONTENT.ctaText}
              <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
            </button>
          </motion.div>

        </div>
      </div>
    </section>
  );
}
