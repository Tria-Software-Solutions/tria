import { Navigation } from '@/components/sections/Navigation';
import { Hero } from '@/components/sections/Hero';
import { Process } from '@/components/sections/Process';
import { Services } from '@/components/sections/Services';
import { Portfolio } from '@/components/sections/Portfolio';
import { Testimonials } from '@/components/sections/Testimonials';
import { Billing } from '@/components/sections/Billing';
import { Contact } from '@/components/sections/Contact';
import { Footer } from '@/components/sections/Footer';

export default function Home() {
  return (
    <main className="min-h-screen">
      <Navigation />
      <Hero />
      <Process />
      <Services />
      <Portfolio />
      <Testimonials />
      <Billing />
      <Contact />
      <Footer />
    </main>
  );
}
