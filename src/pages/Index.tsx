import { Navigation } from "@/components/ui/navigation";
import { HeroSection } from "@/components/sections/HeroSection";
import { Testimonials } from "@/components/sections/Testimonials";
import { FeaturedProducts } from "@/components/sections/FeaturedProducts";
import { WhyChooseUs } from "@/components/sections/WhyChooseUs";
import { Footer } from "@/components/sections/Footer";
import { useEffect } from "react";
import { useSEO } from "@/hooks/useSEO";

const Index = () => {
  useSEO({
    title: "Sanyi Lights Argentina - Iluminación Profesional",
    description:
      "Equipos de iluminación profesional para eventos, espectáculos, TV y escenarios. Calidad premium en Argentina.",
  });

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (  
    <div className="min-h-screen bg-background">
      <Navigation isTransparent={true} />
      <HeroSection />
      <FeaturedProducts />
      <WhyChooseUs />
      <Testimonials />
      <Footer />
    </div>
  );
};

export default Index;
