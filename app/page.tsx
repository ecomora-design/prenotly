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
      <ThreeSoftware />
      <HowItWorks />
      <FAQ />
      <ContactCTA />
      <Footer />
      <AppButton />
    </main>
  );
}
