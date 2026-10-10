import { motion } from "motion/react";
import { MessageSquare, PhoneCall, CheckCircle, Zap } from "lucide-react";
import { HOW_IT_WORKS_CONTENT } from "../data";

export default function HowItWorks() {
  const getStepIcon = (num: string) => {
    switch (num) {
      case "1":
        return <MessageSquare className="w-5 h-5 text-white/80" />;
      case "2":
        return <PhoneCall className="w-5 h-5 text-white/80" />;
      case "3":
        return <Zap className="w-5 h-5 text-white/80" />;
      default:
        return <CheckCircle className="w-5 h-5 text-white/80" />;
    }
  };

  return (
    <section
      id="how-it-works"
      className="relative py-24 lg:py-32 bg-[#050505] border-t border-white/5 overflow-hidden"
    >
      <div className="absolute top-1/4 right-0 w-[300px] h-[300px] bg-white/[0.01] rounded-full blur-[90px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-6 lg:px-8 relative z-10">
        
        {/* Section Heading */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="max-w-3xl mx-auto text-center mb-16 lg:mb-24"
        >
          <span className="text-[10px] uppercase font-mono tracking-widest text-white/40 font-bold block mb-3">
            Onboarding
          </span>
          <h2 className="text-3xl sm:text-5xl font-display font-medium tracking-tight text-white mb-4" id="howitworks-title">
            Simple, Straightforward Process
          </h2>
          <div className="w-12 h-[1px] bg-white/20 mx-auto rounded-full" />
        </motion.div>

        {/* Steps with Connectors */}
        <div className="relative max-w-5xl mx-auto">
          {/* Desktop Visual Connector Line */}
          <div className="hidden lg:block absolute top-[40px] left-[10%] right-[10%] h-[1px] bg-gradient-to-r from-white/0 via-white/20 to-white/0" />

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 lg:gap-8">
            {HOW_IT_WORKS_CONTENT.steps.map((step, index) => (
              <motion.div
                key={step.stepNumber}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: index * 0.15 }}
                className="flex flex-col items-center text-center group"
                id={`how-step-${step.stepNumber}`}
              >
                {/* Numeric Step Ring */}
                <div className="relative mb-6">
                  {/* Subtle outer breathing glow effect */}
                  <div className="absolute inset-0 rounded-full bg-white/5 blur-md scale-150 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                  
                  <div className="w-20 h-20 rounded-full bg-white/[0.03] backdrop-blur-2xl border border-white/10 flex items-center justify-center relative z-10 transition-all duration-300 group-hover:border-white/30 group-hover:bg-white/[0.05] shadow-lg">
                    <span className="absolute -top-1 -right-1 text-[9px] font-mono bg-white/[0.05] border border-white/10 text-white/50 w-6 h-6 rounded-full flex items-center justify-center">
                      0{step.stepNumber}
                    </span>
                    {getStepIcon(step.stepNumber)}
                  </div>
                </div>

                {/* Step Headline */}
                <h3 className="text-lg font-display font-semibold text-white mb-3 group-hover:text-white/80 transition-colors">
                  {step.title}
                </h3>

                {/* Step Detail */}
                <p className="text-sm text-white/50 font-light leading-relaxed font-sans max-w-xs">
                  {step.description}
                </p>
                
                {/* Mobile indicators */}
                {index < HOW_IT_WORKS_CONTENT.steps.length - 1 && (
                  <div className="lg:hidden mt-8 text-white/20 flex justify-center animate-pulse">
                    ↓
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        </div>

      </div>
    </section>
  );
}
