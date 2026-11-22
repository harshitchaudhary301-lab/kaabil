import React from "react";
import { Navbar } from "@/components/shared/Navbar";
import { Footer } from "@/components/shared/Footer";
import { HeroSection } from "@/components/landing/HeroSection";
import { HowItWorksSection } from "@/components/landing/HowItWorksSection";
import { FeaturesSection } from "@/components/landing/FeaturesSection";
import { PortalCardsSection } from "@/components/landing/PortalCardsSection";
import { IntelligenceLoopSection } from "@/components/landing/IntelligenceLoopSection";
import { CareerReadinessPassportSection } from "@/components/landing/CareerReadinessPassportSection";
import { StreamExplorerSection } from "@/components/landing/StreamExplorerSection";
import { FaqSection } from "@/components/landing/FaqSection";
import { CinematicEndingSection } from "@/components/landing/CinematicEndingSection";

export default function LandingPage() {
  return (
    <div className="min-h-screen flex flex-col bg-[#FAF8FC] selection:bg-purple-200 selection:text-purple-900 text-slate-900 antialiased">
      {/* Glassmorphic Atmospheric Floating Navigation Bar with Language Switcher */}
      <Navbar />

      <main className="flex-1">
        {/* Section 1: Complete Full-Width Cinematic Hero Page with Campus Sunset Pixel Art */}
        <HeroSection />

        {/* Section 2: How KAABIL Works (Discover Strengths -> Choose Career -> Follow Roadmap -> Build Skills -> Unlock Future) */}
        <HowItWorksSection />

        {/* Section 3: Everything You Need for a Future-Ready Career (6 Feature Cards) */}
        <FeaturesSection />

        {/* Section 4: One Platform, Three Focused Experiences (Student, Institution, Employer) */}
        <PortalCardsSection />

        {/* Universal 13 Educational Streams Interactive Explorer */}
        <StreamExplorerSection />

        {/* Section 5: KAABIL Intelligence Loop (Educational and Institutional Flow) */}
        <IntelligenceLoopSection />

        {/* Section 6: Career Readiness & Verified Achievements (Realistic Demo Data) */}
        <CareerReadinessPassportSection />

        {/* Frequently Asked Questions */}
        <FaqSection />

        {/* Section 7: Final Cinematic Ending (Sunset Scene: Every Future Begins Somewhere) */}
        <CinematicEndingSection />
      </main>

      {/* Section 8: Deep Plum Footer with DPDP Compliance Safeguards */}
      <Footer />
    </div>
  );
}
