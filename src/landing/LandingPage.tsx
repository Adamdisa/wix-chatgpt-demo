import { useEffect, useState } from "react";

import { useForceLight } from "../lib/useTheme";
import { OnboardingFlow } from "./onboarding/OnboardingFlow";
import { Benefits, FAQ, FinalCta, Footer, Header, Hero, HowItWorks, Integrations, ListingTypes, LogoStrip } from "./sections";

export function LandingPage() {
  useForceLight();
  const [onboarding, setOnboarding] = useState(false);

  useEffect(() => {
    document.title = "Wix for ChatGPT — Get booked in ChatGPT";
  }, []);

  const start = () => setOnboarding(true);

  return (
    <div className="lp min-h-dvh">
      <Header onStart={start} />
      <main>
        <Hero onStart={start} />
        <LogoStrip />
        <HowItWorks onStart={start} />
        <ListingTypes />
        <Benefits />
        <Integrations onStart={start} />
        <FAQ />
        <FinalCta onStart={start} />
      </main>
      <Footer />
      {onboarding ? <OnboardingFlow onClose={() => setOnboarding(false)} /> : null}
    </div>
  );
}
