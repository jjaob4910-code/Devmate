import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Menu, X, ArrowRight } from "lucide-react";
import { FOOTER_CONTENT } from "../data";
import type { View } from "../views";

function BuildingsLogo({ className = "w-5 h-5" }: { className?: string }) {
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

interface HeaderProps {
  onCtaclick: () => void;
  view?: View;
  setView?: (v: View) => void;
}

export default function Header({ onCtaclick, view = "home", setView }: HeaderProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleLinkClick = (href: string) => {
    setIsOpen(false);
    if (setView && view !== "home") {
      setView("home");
      setTimeout(() => {
        const id = href.replace("#", "");
        const element = document.getElementById(id);
        if (element) {
          const headerOffset = 80;
          const elementPosition = element.getBoundingClientRect().top;
          const offsetPosition = elementPosition + window.pageYOffset - headerOffset;
          window.scrollTo({
            top: offsetPosition,
            behavior: "smooth"
          });
        }
      }, 100);
    } else {
      const id = href.replace("#", "");
      const element = document.getElementById(id);
      if (element) {
        const headerOffset = 80;
        const elementPosition = element.getBoundingClientRect().top;
        const offsetPosition = elementPosition + window.pageYOffset - headerOffset;
        window.scrollTo({
          top: offsetPosition,
          behavior: "smooth"
        });
      }
    }
  };

  return (
    <nav
      id="navbar"
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? "border-b border-white/10 apple-blur py-3"
          : "bg-transparent py-5"
      }`}
    >
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <a
            href="#home"
            className="flex items-center gap-2 group cursor-pointer"
            onClick={(e) => {
              e.preventDefault();
              window.location.reload();
            }}
            id="nav-logo"
          >
            <span className="font-display font-bold text-xl tracking-tight text-white mb-0">
              Dev Mate<span className="text-white/40 font-light">.</span>
            </span>
          </a>

          {/* Nav Items (Desktop) */}
          <div className="hidden md:flex items-center gap-8">
            {FOOTER_CONTENT.navigation.map((item) => (
              <a
                key={item.label}
                href={item.href}
                className="text-sm font-medium text-white/60 hover:text-white transition-colors"
                onClick={(e) => {
                  e.preventDefault();
                  handleLinkClick(item.href);
                }}
              >
                {item.label}
              </a>
            ))}
            <button
              onClick={() => { setView?.('feaso'); window.scrollTo({ top: 0 }); }}
              className={`text-sm font-medium transition-colors cursor-pointer ${view === 'feaso' ? 'text-white' : 'text-white/60 hover:text-white'}`}
              id="nav-feaso"
            >
              Feaso
            </button>
          </div>

          {/* CTA Button */}
          <div className="hidden md:flex">
            <button
              onClick={onCtaclick}
              className="px-5 py-2 rounded-full text-[13px] font-semibold bg-white text-black hover:bg-white/90 transition-all duration-200 flex items-center gap-1.5 active:scale-95 group shadow-sm cursor-pointer"
              id="header-cta"
            >
              Let's Talk
              <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5" />
            </button>
          </div>

          {/* Hamburger (Mobile) */}
          <div className="md:hidden flex items-center">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="p-1.5 rounded-lg text-white/60 hover:text-white focus:outline-none"
              aria-label="Toggle navigation menu"
              id="mobile-menu-btn"
            >
              {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.2 }}
            className="md:hidden absolute top-full left-0 right-0 bg-[#050505]/95 apple-blur border-b border-white/10 px-6 py-8 flex flex-col gap-6 shadow-2xl"
          >
            <div className="flex flex-col gap-4">
              {FOOTER_CONTENT.navigation.map((item) => (
                <a
                  key={item.label}
                  href={item.href}
                  className="text-base font-medium text-white/60 hover:text-white transition-colors py-2 border-b border-white/5"
                  onClick={(e) => {
                    e.preventDefault();
                    handleLinkClick(item.href);
                  }}
                >
                  {item.label}
                </a>
              ))}
              <button
                onClick={() => { setIsOpen(false); setView?.('feaso'); window.scrollTo({ top: 0 }); }}
                className="text-left text-base font-medium text-white/60 hover:text-white transition-colors py-2 border-b border-white/5 cursor-pointer"
              >
                Feaso
              </button>
            </div>

            <button
              onClick={() => {
                setIsOpen(false);
                onCtaclick();
              }}
              className="w-full py-3 rounded-xl text-sm font-semibold bg-white text-black hover:bg-white/90 transition-all duration-200 flex items-center justify-center gap-2 active:scale-95 cursor-pointer"
              id="mobile-drawer-cta"
            >
              Let's Talk
              <ArrowRight className="w-4 h-4" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}
