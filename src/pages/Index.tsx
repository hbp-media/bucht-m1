import Navbar from "@/components/Navbar";
import HeroSection from "@/components/HeroSection";
import AdvantagesSection from "@/components/AdvantagesSection";
import ContactSection from "@/components/ContactSection";
import Footer from "@/components/Footer";

const Index = () => {
  return (
    <main className="bg-background">
      <Navbar />
      <HeroSection />
      <AdvantagesSection />
      <ContactSection />
      <Footer />
    </main>
  );
};

export default Index;
