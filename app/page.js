import Hero from "./components/Hero";
import PledgeSection from "./components/PledgeSection";
import CommunitySection from "./components/CommunitySection";
import OngoingActivitiesSection from "./components/OngoingActivitiesSection";
import GallerySection from "./components/GallerySection";
import CTASection from "./components/CTASection";

export default function Home() {
  return (
    <>
      <Hero />
      <PledgeSection />
      <OngoingActivitiesSection />
      <GallerySection />
      <CommunitySection />
      <CTASection />
    </>
  );
}
