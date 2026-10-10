import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { BookOpen, Calendar, Briefcase, CheckCircle2, ChevronDown } from "lucide-react";
import { SERVICES_CONTENT } from "../data";

export default function Services() {
  const [isExpanded, setIsExpanded] = useState(false);

  const toggleExpand = () => {
    setIsExpanded((prev) => !prev);
  };

  const getIcon = (id: string) => {
    switch (id) {
      case "feasibility":
        return <BookOpen className="w-5 h-5 text-white/80" />;
      case "coordination":
        return <Calendar className="w-5 h-5 text-white/80" />;
      case "management":
        return <Briefcase className="w-5 h-5 text-white/80" />;
      default:
        return <Briefcase className="w-5 h-5 text-white/80" />;
    }
  };

  const getSubtext = (id: string) => {
    switch (id) {
      case "feasibility":
        return "Committed to confident decision-making, before you're locked in";
      case "coordination":
        return "Committed to keeping your project on track, every step";
      case "management":
        return "Committed to flexible, reliable support when you need it";
      default:
        return "Committed to professional development support";
    }
  };

  const getTickItems = (id: string) => {
    switch (id) {
      case "feasibility":
        return [
          "Realistic numbers, not best-case guesses",
          "Straightforward reporting you can act on"
        ];
      case "coordination":
        return [
          "Proactive follow-up, not just reactive admin",
          "One clear point of contact across your consultants"
        ];
      case "management":
        return [
          "Scales up or down as your project demands",
          "No lock-in contracts or long onboarding"
        ];
      default:
        return [];
    }
  };

  return (
    <section
      id="services"
      className="relative py-24 lg:py-32 bg-[#050505] border-t border-white/5 overflow-hidden"
    >
      <div className="absolute top-1/2 left-0 w-[400px] h-[400px] bg-white/[0.01] rounded-full blur-[120px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-6 lg:px-8 relative z-10">
        
        {/* Section Heading */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="max-w-3xl mx-auto text-center mb-16 lg:mb-20"
        >
          <h2 className="text-3xl sm:text-5xl font-display font-bold tracking-tight text-white mb-4" id="services-title">
            {SERVICES_CONTENT.heading}
          </h2>
          <div className="w-12 h-[1px] bg-white/20 mx-auto rounded-full" />
        </motion.div>

        {/* Responsive Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {SERVICES_CONTENT.services.map((service, index) => {
            return (
              <motion.div
                key={service.id}
                layout="position"
                initial={{ opacity: 0, y: 25 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className={`relative p-8 rounded-3xl border transition-all duration-300 flex flex-col justify-between overflow-hidden bg-white/[0.03] backdrop-blur-2xl ${
                  isExpanded 
                    ? "border-white/20 shadow-[0_10px_30px_rgba(255,255,255,0.02)]" 
                    : "border-white/10 hover:border-white/15"
                }`}
                id={`service-card-${service.id}`}
              >
                <div>
                  {/* Service Icon */}
                  <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center mb-6">
                    {getIcon(service.id)}
                  </div>

                  {/* Service Title */}
                  <h3 className="text-lg font-display font-semibold text-white mb-3">
                    {service.title}
                  </h3>

                  {/* Service Description */}
                  <p className="text-sm text-white/70 leading-relaxed mb-6 font-sans">
                    {service.description}
                  </p>

                  {/* Inline Expanded Area details */}
                  <AnimatePresence initial={false}>
                    {isExpanded && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        className="overflow-hidden mb-6"
                      >
                        <div className="pt-4 border-t border-white/5 text-[13px] text-white/70 leading-relaxed font-sans space-y-3.5">
                          <p>{service.longDescription}</p>
                          
                          <div className="h-[1px] bg-white/5 w-full" />
                          
                          <div className="flex items-center gap-2 text-white/70 font-medium">
                            <CheckCircle2 className="w-3.5 h-3.5 text-green-500/70 shrink-0" />
                            <span>{getSubtext(service.id)}</span>
                          </div>

                          {getTickItems(service.id).map((tick, tIdx) => (
                            <div key={tIdx} className="flex items-start gap-2 text-white/70 font-light" id={`service-${service.id}-tick-${tIdx}`}>
                              <CheckCircle2 className="w-3.5 h-3.5 text-green-500/70 shrink-0 mt-0.5" />
                              <span>{tick}</span>
                            </div>
                          ))}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {/* Learn More Interactive Button */}
                <button
                  onClick={toggleExpand}
                  className="inline-flex items-center gap-2 text-[11px] font-semibold text-white/60 hover:text-white transition-colors uppercase tracking-widest mt-4 cursor-pointer"
                  id={`learn-more-${service.id}`}
                >
                  {isExpanded ? "Show Less" : "Learn More"}
                  <ChevronDown
                    className={`w-3.5 h-3.5 transition-transform duration-300 ${
                      isExpanded ? "rotate-180" : ""
                    }`}
                  />
                </button>
              </motion.div>
            );
          })}
        </div>

      </div>
    </section>
  );
}
