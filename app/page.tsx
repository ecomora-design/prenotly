import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import Problem from "@/components/Problem";
import Comparison from "@/components/Comparison";
import NumbersSection from "@/components/NumbersSection";
import PricingHome from "@/components/PricingHome";
import ThreeSoftware from "@/components/ThreeSoftware";
import Features from "@/components/Features";
import HowItWorks from "@/components/HowItWorks";
import FAQ from "@/components/FAQ";
import ContactCTA from "@/components/ContactCTA";
import Footer from "@/components/Footer";
import AppButton from "@/components/AppButton";

export default function Home() {
  return (
    <main>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "SoftwareApplication",
            "name": "Prenotly",
            "applicationCategory": "BusinessApplication",
            "operatingSystem": "Web",
            "description": "Software per prenotazioni online e gestione appuntamenti per ristoranti, beauty e professionisti.",
            "offers": {
              "@type": "Offer",
              "price": "29.99",
              "priceCurrency": "EUR"
            }
          })
        }}
      />
      <Navbar />
      <Hero />
      <Problem />
      <Comparison />
      <NumbersSection />
      <ThreeSoftware />
      <Features />
      <HowItWorks />
      <FAQ />
      <PricingHome />
      <ContactCTA />
      <Footer />
      <AppButton />
    </main>
  );
}
