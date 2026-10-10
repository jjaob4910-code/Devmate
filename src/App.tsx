import { useState, useEffect } from "react";
import Header from "./components/Header";
import Hero from "./components/Hero";
import Metrics from "./components/Metrics";
import Services from "./components/Services";
import About from "./components/About";
import HowItWorks from "./components/HowItWorks";
import EngagementModels from "./components/EngagementModels";
import Contact from "./components/Contact";
import Footer from "./components/Footer";
import PrivacyPolicy from "./components/PrivacyPolicy";
import StandardTerms from "./components/StandardTerms";
import FeasoApp from "./feaso/FeasoApp";
import FeasoTeaser from "./components/FeasoTeaser";
import type { View } from "./views";

export default function App() {
  const [currentView, setCurrentView] = useState<View>('home');

  useEffect(() => {
    // Prevent browser from restoring previous scroll position on reload
    if ('scrollRestoration' in window.history) {
      window.history.scrollRestoration = 'manual';
    }

    // Clear any anchor/hash in the URL to prevent scrolling to sections on mount
    if (window.location.hash) {
      window.history.replaceState(null, "", window.location.pathname + window.location.search);
    }

    // Scroll to the very top of the home page
    window.scrollTo(0, 0);
  }, []);

  const handleScrollToContact = () => {
    if (currentView !== 'home') {
      setCurrentView('home');
      setTimeout(() => {
        const contactSection = document.getElementById("contact");
        if (contactSection) {
          const headerOffset = 80;
          const elementPosition = contactSection.getBoundingClientRect().top;
          const offsetPosition = elementPosition + window.pageYOffset - headerOffset;
          window.scrollTo({
            top: offsetPosition,
            behavior: "smooth"
          });
        }
      }, 100);
    } else {
      const contactSection = document.getElementById("contact");
      if (contactSection) {
        const headerOffset = 80;
        const elementPosition = contactSection.getBoundingClientRect().top;
        const offsetPosition = elementPosition + window.pageYOffset - headerOffset;
        window.scrollTo({
          top: offsetPosition,
          behavior: "smooth"
        });
      }
    }
  };

  const handleBackToHome = () => {
    setCurrentView('home');
    window.scrollTo({ top: 0 });
  };

  return (
    <div className="relative min-h-screen bg-[#050505] text-[#F5F5F7] antialiased selection:bg-white/10 selection:text-white">
      {/* Floating Header */}
      <Header onCtaclick={handleScrollToContact} view={currentView} setView={setCurrentView} />

      {/* Main Experience Layout or Legal Sub-pages */}
      {currentView === 'home' && (
        <main>
          {/* Hero Section */}
          <Hero onCtaclick={handleScrollToContact} />

          {/* Feaso teaser */}
          <FeasoTeaser onOpen={() => { setCurrentView('feaso'); window.scrollTo({ top: 0 }); }} />

          {/* About Section */}
          <About onCtaclick={handleScrollToContact} />

          {/* Services Section */}
          <Services />

          {/* Metrics Section */}
          <Metrics />

          {/* How It Works Section */}
          <HowItWorks />

          {/* Engagement Models section */}
          <EngagementModels onCtaclick={handleScrollToContact} />

          {/* Contact Section */}
          <Contact />
        </main>
      )}

      {currentView === 'feaso' && <FeasoApp />}

      {currentView === 'privacy' && (
        <PrivacyPolicy onBackToHome={handleBackToHome} />
      )}

      {currentView === 'terms' && (
        <StandardTerms onBackToHome={handleBackToHome} />
      )}

      {/* Footer component */}
      <Footer setView={setCurrentView} />
    </div>
  );
}
