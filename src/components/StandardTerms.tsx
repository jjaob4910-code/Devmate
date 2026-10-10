import { motion } from "motion/react";
import { ArrowLeft, Scale } from "lucide-react";

interface StandardTermsProps {
  onBackToHome: () => void;
}

export default function StandardTerms({ onBackToHome }: StandardTermsProps) {
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
              <Scale className="w-4 h-4 text-white/80" />
            </span>
            <span className="text-xs uppercase font-mono tracking-widest text-[#F5F5F7]/40">Trading Framework</span>
          </div>
          <h1 className="text-3xl sm:text-5xl font-display font-medium tracking-tight text-white mb-4">
            Standard Engagement Terms
          </h1>
          <p className="text-white/50 font-sans font-light text-sm sm:text-base max-w-2xl leading-relaxed">
            Effective June 21, 2026. This document governs standard professional services or ongoing project representation tasks provided to clients by Dev Mate.
          </p>
        </div>

        {/* Legal Text Segments */}
        <div className="space-y-10 text-white/70 font-sans font-light text-sm sm:text-base leading-relaxed">
          
          <div className="space-y-3">
            <h2 className="text-white text-lg font-display font-medium tracking-tight">1. Services and Advisory Nature</h2>
            <p>
              Dev Mate offers professional development coordination, client representation, feasibility review, design consultant syncing, council permit tracking, and physical building status reporting. All reporting, briefs, and recommendations provided constitute advisory support to streamline project administration. They do not constitute statutory certifying or legal legal advice. Clients must retain registered certifying specialists for structural inspections and final engineering sign-off.
            </p>
          </div>

          <div className="space-y-3">
            <h2 className="text-white text-lg font-display font-medium tracking-tight">2. Engagement Pricing and Billing Structure</h2>
            <p>
              Services are priced at an hourly rate of <strong className="text-white font-mono">$70 / hr</strong>. Timelog summaries highlighting exact tasks completed (such as procurement organisation, checklist updates, meeting administration, and consultant package compilations) will be provided with invoicing. Invoices are produced either bi-weekly or monthly and are payable within seven (7) business days from delivery.
            </p>
          </div>

          <div className="space-y-3">
            <h2 className="text-white text-lg font-display font-medium tracking-tight">3. Client Executive Authority</h2>
            <p>
              The Client retains final decider authority over all structural, budgetary, design package approvals, and legal contracts related to their property portfolio. Dev Mate administers and coordinates tasks to streamline decision processing, but relies on accurate site variables, feasibility models, and parameters supplied by the Client or their certified specialists.
            </p>
          </div>

          <div className="space-y-3">
            <h2 className="text-white text-lg font-display font-medium tracking-tight">4. Independent Consultant Status</h2>
            <p>
              Dev Mate operates exclusively as an independent professional contractor. No components of this temporary or ongoing cooperation establish a formal corporate partnership, legal joint venture, fiduciary trust connection, or permanent employment contract between Dev Mate and the Client.
            </p>
          </div>

          <div className="space-y-3">
            <h2 className="text-white text-lg font-display font-medium tracking-tight">5. Professional Liability and Third-Party Dependencies</h2>
            <p>
              While Dev Mate implements rigorous coordination and schedules tasks prudently on behalf of our clients, we are not legally accountable for project delivery timeline impacts originating from municipal authority approval delays, subcontractor default cases, building material shortages, or professional design errors committed by certified engineers.
            </p>
          </div>

          <div className="space-y-3">
            <h2 className="text-white text-lg font-display font-medium tracking-tight">6. Engagement Break and End Clause</h2>
            <p>
              Either party may scale down, suspend, or terminate the advisory arrangement at any time by issuing five (5) business days' written notice to the other. Upon notice, the Client shall settle any balance outstanding for verified hours of work performed up to the date of termination.
            </p>
          </div>

        </div>

        {/* Bottom CTA Card */}
        <div className="mt-16 border border-white/5 bg-white/[0.01] rounded-2xl p-8 text-center">
          <p className="text-sm text-white/50 mb-6 font-light">
            Ready to secure flexible hourly development support for your upcoming projects?
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
