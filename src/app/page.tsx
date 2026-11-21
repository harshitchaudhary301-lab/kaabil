import React from "react";
import { Navbar } from "@/components/shared/Navbar";
import { Footer } from "@/components/shared/Footer";
import { CinematicIntro } from "@/components/shared/CinematicIntro";
import { HeroSection } from "@/components/landing/HeroSection";
import { PortalCardsSection } from "@/components/landing/PortalCardsSection";
import { StreamExplorerSection } from "@/components/landing/StreamExplorerSection";
import { FeaturesSection } from "@/components/landing/FeaturesSection";
import { IntelligenceLoopSection } from "@/components/landing/IntelligenceLoopSection";
import { ProductShowcaseSection } from "@/components/landing/ProductShowcaseSection";
import { CareerDiscoverySection } from "@/components/landing/CareerDiscoverySection";
import { FaqSection } from "@/components/landing/FaqSection";
import { CinematicEndingSection } from "@/components/landing/CinematicEndingSection";

export default function LandingPage() {
  return (
    <div className="min-h-screen flex flex-col bg-[#F8FAFC] selection:bg-primary/20 selection:text-primary text-text-primary antialiased">
      {/* 1. Lightweight 3-Second Brand Intro (Only on First Visit with Skip Option) */}
      <CinematicIntro />

      {/* 2. Glassmorphism Floating Navigation Bar */}
      <Navbar />

      <main className="flex-1">
        {/* 3. Completely New Two-Column Hero with Original Interactive Career Ecosystem */}
        <HeroSection />

        {/* 4. Three Distinctive Premium Portal Cards (Student, Institution, Employer) */}
        <PortalCardsSection />

        {/* 5. Interactive All 13 Educational Streams Explorer with Category Filtering */}
        <StreamExplorerSection />

        {/* 6. Signature KAABIL Innovations Bento Grid (8 Features with Mini-Visualizations) */}
        <FeaturesSection />

        {/* 7. Interactive KAABIL Intelligence Loop (Discover -> Learn -> Assess -> Verify -> Improve -> Connect) */}
        <IntelligenceLoopSection />

        {/* 8. Tab-Based Interactive Product Showcase (5 Portals & Capabilities) */}
        <ProductShowcaseSection />

        {/* 9. Live Career Discovery with Dynamic Search & Multi-Stream Filtering */}
        <CareerDiscoverySection />

        {/* 10. Frequently Asked Questions with Transparent Guidance */}
        <FaqSection />

        {/* 11. Final Cinematic Ending Page Section with Approved Sunset Art */}
        <CinematicEndingSection />
      </main>

      {/* 12. Deep-Plum Premium Footer with DPDP Compliance Safeguards */}
      <Footer />
    </div>
  );
}
