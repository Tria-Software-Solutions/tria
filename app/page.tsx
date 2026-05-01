import { Navigation } from '@/components/sections/Navigation';
import { Hero } from '@/components/sections/Hero';
import { Services } from '@/components/sections/Services';
import { Billing } from '@/components/sections/Billing';
import { Process } from '@/components/sections/Process';
import { Contact } from '@/components/sections/Contact';
import { Footer } from '@/components/sections/Footer';

export default function Home() {
  return (
    <main className="min-h-screen">
      <Navigation />
      <Hero />
      <Services />
      <Billing />
      <Process />
      <Contact />
      <Footer />
    </main>
  );
}
