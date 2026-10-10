import React from "react";
import { FOOTER_CONTENT } from "../data";
import { ArrowUp } from "lucide-react";
import type { View } from "../views";

function BuildingsLogo({ className = "w-3.5 h-3.5" }: { className?: string }) {
  return (
    <svg 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="1.8" 
      strokeLinecap="round" 
      strokeLinejoin="round" 
      className={className}
    >
      <path d="M3 21h18" />
      <path d="M5 21V7a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v14" />
      <path d="M13 21V11a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v10" />
      <path d="M8 9h1" />
      <path d="M8 13h1" />
      <path d="M8 17h1" />
      <path d="M16 13h1" />
      <path d="M16 17h1" />
    </svg>
  );
}

interface FooterProps {
  setView?: (v: View) => void;
}

export default function Footer({ setView }: FooterProps) {
  const handleScrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth"
    });
  };

  const handleLinkClick = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    e.preventDefault();
    if (setView) {
      setView('home');
    }
    setTimeout(() => {
      const id = href.replace("#", "");
      const element = document.getElementById(id);
      if (element) {
        const headerOffset = 85;
        const elementPosition = element.getBoundingClientRect().top;
        const offsetPosition = elementPosition + window.pageYOffset - headerOffset;
        window.scrollTo({
          top: offsetPosition,
          behavior: "smooth"
        });
      }
    }, setView ? 100 : 0);
  };

  return (
    <footer className="bg-[#050505] border-t border-white/5 py-16 text-white/40 text-sm">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-12 items-start mb-12">
          
          {/* Logo & Headline statement Column */}
          <div className="md:col-span-6 space-y-4">
            <div className="flex items-center gap-2 text-white">
              <span className="font-display font-bold text-lg tracking-tight">
                Dev Mate<span className="text-white/40 font-light">.</span>
              </span>
            </div>
            
            <p className="text-white/50 font-sans leading-relaxed text-xs sm:text-sm max-w-md">
              {FOOTER_CONTENT.statement}
            </p>
          </div>

          {/* Quick links Column */}
          <div className="md:col-span-4 space-y-3">
            <h4 className="text-white text-xs font-mono font-bold uppercase tracking-wider">Navigation</h4>
            <div className="flex flex-col gap-2">
              {FOOTER_CONTENT.navigation.map((link) => (
                <a
                  key={link.label}
                  href={link.href}
                  onClick={(e) => handleLinkClick(e, link.href)}
                  className="text-white/40 hover:text-white transition-colors text-xs"
                >
                  {link.label}
                </a>
              ))}
            </div>
          </div>

          {/* Scroll to Top Column */}
          <div className="md:col-span-2 flex md:justify-end">
            <button
              onClick={handleScrollToTop}
              className="w-10 h-10 rounded-full border border-white/10 hover:border-white/20 bg-white/5 flex items-center justify-center text-white/70 hover:text-white transition-colors cursor-pointer"
              aria-label="Scroll to top of page"
              id="footer-scroll-top-btn"
            >
              <ArrowUp className="w-4 h-4" />
            </button>
          </div>

        </div>

        {/* Footer legalities */}
        <div className="border-t border-white/5 pt-8 flex flex-col sm:flex-row justify-between items-center gap-4 text-[11px] font-mono text-white/30">
          <p>© {new Date().getFullYear()} Dev Mate. All Rights Reserved.</p>
          <div className="flex gap-4">
            <button
              onClick={() => {
                if (setView) {
                  setView('privacy');
                  window.scrollTo({ top: 0 });
                }
              }}
              className="hover:text-white transition-colors cursor-pointer bg-transparent border-none p-0 inline font-mono outline-none"
            >
              Privacy Policy
            </button>
          </div>
        </div>

      </div>
    </footer>
  );
}
