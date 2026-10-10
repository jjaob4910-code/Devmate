import { motion } from "motion/react";
import { ArrowLeft, Shield } from "lucide-react";

interface PrivacyPolicyProps {
  onBackToHome: () => void;
}

export default function PrivacyPolicy({ onBackToHome }: PrivacyPolicyProps) {
  return (
    <section className="relative min-h-screen py-24 lg:py-32 bg-[#050505] overflow-hidden">
      {/* Visual background ambient details */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-white/[0.01] rounded-full blur-[140px] pointer-events-none" />
      
      <div className="max-w-4xl mx-auto px-6 lg:px-8 relative z-10">
        
        {/* Back navigation header */}
        <div className="mb-12">
          <button
            onClick={onBackToHome}
            className="inline-flex items-center gap-2 text-xs font-mono uppercase tracking-widest text-white/50 hover:text-white transition-colors cursor-pointer group"
          >
            <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
            Back to Home
          </button>
        </div>

        {/* Title Block */}
        <div className="border-b border-white/10 pb-8 mb-12">
          <div className="flex items-center gap-3 mb-4">
            <span className="flex items-center justify-center w-8 h-8 rounded-lg bg-white/5 border border-white/10">
              <Shield className="w-4 h-4 text-white/80" />
            </span>
            <span className="text-xs uppercase font-mono tracking-widest text-[#F5F5F7]/40">Legal Framework</span>
          </div>
          <h1 className="text-3xl sm:text-5xl font-display font-medium tracking-tight text-white mb-4">
            Privacy Policy
          </h1>
          <p className="text-white/50 font-sans font-light text-sm sm:text-base max-w-2xl leading-relaxed">
            Effective June 21, 2026. Your privacy and intellectual property are fundamentally respected. This policy clarifies how Dev Mate gathers, accesses, and safeguards material gathered during advisory engagements.
          </p>
        </div>

        {/* Legal Text Segments */}
        <div className="space-y-10 text-white/70 font-sans font-light text-sm sm:text-base leading-relaxed">
          
          <div className="space-y-3">
            <h2 className="text-white text-lg font-display font-medium tracking-tight">1. Collection of Business and Project Information</h2>
            <p>
              Dev Mate receives information explicitly and voluntarily supplied by you. This typically includes contact parameters (e.g., name, professional affiliation, email credentials, and phone numbers) alongside project-specific parameters (e.g., site plans, brief details, consultant outputs, and development objectives) delivered through direct communication channel channels or inquiry forms.
            </p>
          </div>

          <div className="space-y-3">
            <h2 className="text-white text-lg font-display font-medium tracking-tight">2. Intended Utilisation of Information</h2>
            <p>
              Your personal and corporate data is engaged exclusively to perform professional coordination, prepare building summaries, facilitate consultant liaison, process updates, and address property development questions. We do not engage with third-party tracking algorithms, nor do we sell, trade, or distribute your email or project profiles to third-party entities.
            </p>
          </div>

          <div className="space-y-3">
            <h2 className="text-white text-lg font-display font-medium tracking-tight">3. Confidentiality and Document Guarding</h2>
            <p>
              We prioritise the high-sensitivity nature of physical real estate developments and conceptual layout packages. All design concepts, due diligence assessments, feasibility files, and construction schedules provided to Dev Mate remain strictly confidential and secured against unauthorised digital access or accidental leaks.
            </p>
          </div>

          <div className="space-y-3">
            <h2 className="text-white text-lg font-display font-medium tracking-tight">4. Cookies and Analytical Trackers</h2>
            <p>
              This website employs local, privacy-safe, non-intrusive metadata to ensure speed performance and monitor overall responsiveness across different screen viewports. We do not track users across foreign sites or participate in cookie tracking networks.
            </p>
          </div>

          <div className="space-y-3">
            <h2 className="text-white text-lg font-display font-medium tracking-tight">5. Contact and Informational Authority</h2>
            <p>
              Under relevant privacy guidelines, you hold absolute authority to review, modify, or permanently request deletion of any contact credentials or briefing history stored in our correspondence databases. To exercise your data rights, please contact us directly at <span className="font-mono text-white select-all">Johnny@devmate.com.au</span>.
            </p>
          </div>

        </div>

        {/* Bottom CTA Card */}
        <div className="mt-16 border border-white/5 bg-white/[0.01] rounded-2xl p-8 text-center">
          <p className="text-sm text-white/50 mb-6 font-light">
            Have questions regarding these security processes or our client information standards?
          </p>
          <button
            onClick={onBackToHome}
            className="px-6 py-3 rounded-xl bg-white text-black font-semibold text-xs uppercase tracking-wider hover:bg-white/95 transition-colors cursor-pointer"
          >
            RETURN HOME
          </button>
        </div>

      </div>
    </section>
  );
}
