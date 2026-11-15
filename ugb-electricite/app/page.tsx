import { Hero } from "@/components/site/Hero";
import { Nav } from "@/components/site/Nav";
import { ScrollFX } from "@/components/site/ScrollFX";
import { Contact, Engagements, Expertise, Footer, Realisations, Services } from "@/components/site/Sections";

export default function Home() {
  return (
    <>
      <Nav />
      <main>
        <Hero />
        <Services />
        <Expertise />
        <Realisations />
        <Engagements />
        <Contact />
      </main>
      <Footer />
      <ScrollFX />
    </>
  );
}
