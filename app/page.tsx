import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import ThreeSoftware from "@/components/ThreeSoftware";
import HowItWorks from "@/components/HowItWorks";
import FAQ from "@/components/FAQ";
import ContactCTA from "@/components/ContactCTA";
import Footer from "@/components/Footer";
import WhatsAppButton from "@/components/WhatsAppButton";

export default function Home() {
  return (
    <main>
      <Navbar />
      <Hero />
      <ThreeSoftware />
      <HowItWorks />
      <FAQ />
      <ContactCTA />
      <Footer />
      <WhatsAppButton />
    </main>
  );
}
