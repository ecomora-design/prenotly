import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import Problem from "@/components/Problem";
import HowItWorks from "@/components/HowItWorks";
import Secretary from "@/components/Secretary";
import TwoSouls from "@/components/TwoSouls";
import Features from "@/components/Features";
import Notifications from "@/components/Notifications";
import TargetAudience from "@/components/TargetAudience";
import FAQ from "@/components/FAQ";
import ContactCTA from "@/components/ContactCTA";
import Footer from "@/components/Footer";
import WhatsAppButton from "@/components/WhatsAppButton";
import StickyCTA from "@/components/StickyCTA";

export default function Home() {
  return (
    <main className="pb-20 md:pb-0">
      <Navbar />
      <Hero />
      <Problem />
      <HowItWorks />
      <Secretary />
      <TwoSouls />
      <Features />
      <Notifications />
      <TargetAudience />
      <FAQ />
      <ContactCTA />
      <Footer />
      <StickyCTA />
      <WhatsAppButton />
    </main>
  );
}
