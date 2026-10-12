import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import ThreeSoftware from "@/components/ThreeSoftware";
import DashboardFlow from "@/components/DashboardFlow";
import Problem from "@/components/Problem";
import HowItWorks from "@/components/HowItWorks";
import Secretary from "@/components/Secretary";
import Features from "@/components/Features";
import Notifications from "@/components/Notifications";
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
      <ThreeSoftware />
      <DashboardFlow />
      <Problem />
      <Secretary />
      <Features />
      <Notifications />
      <FAQ />
      <ContactCTA />
      <Footer />
      <StickyCTA />
      <WhatsAppButton />
    </main>
  );
}
