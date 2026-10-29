import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import ThreeSoftware from "@/components/ThreeSoftware";
import HowItWorks from "@/components/HowItWorks";
import FAQ from "@/components/FAQ";
import ContactCTA from "@/components/ContactCTA";
import Footer from "@/components/Footer";
import AppButton from "@/components/AppButton";

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
      <AppButton />
    </main>
  );
}
