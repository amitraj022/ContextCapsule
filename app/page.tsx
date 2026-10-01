import { CompressionDemo } from "@/components/CompressionDemo";
import { ContinueAnywhere } from "@/components/ContinueAnywhere";
import { Features } from "@/components/Features";
import { FinalCTA } from "@/components/FinalCTA";
import { Footer } from "@/components/Footer";
import { Hero } from "@/components/Hero";
import { HowItWorks } from "@/components/HowItWorks";
import { Navbar } from "@/components/Navbar";

export default function Home() {
  return (
      <main className="page-shell">
        <div className="page-surface">
          <div className="aurora" aria-hidden="true" />
          <Navbar />
          <Hero />
        </div>
        <HowItWorks />
        <CompressionDemo />
        <ContinueAnywhere />
        <Features />
        <FinalCTA />
        <Footer />
      </main>
  );
}
