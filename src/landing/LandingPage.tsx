import { useEffect, useState } from "react";
import { useNavigate } from "react-router";

import { useForceLight } from "../lib/useTheme";
import { Tour } from "../lib/Tour";
import { OnboardingFlow } from "./onboarding/OnboardingFlow";
import { Benefits, FAQ, FinalCta, Footer, Header, Hero, HowItWorks, Integrations, ListingTypes, LogoStrip } from "./sections";

export function LandingPage() {
  useForceLight();
  const [onboarding, setOnboarding] = useState(false);

  useEffect(() => {
    document.title = "Wix for ChatGPT — Get booked in ChatGPT";
  }, []);

  const start = () => setOnboarding(true);
  const navigate = useNavigate();
  // Shown on every visit; visitors can skip it.
  const [tour, setTour] = useState(true);

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
      {tour && !onboarding ? (
        <Tour
          onFinish={() => setTour(false)}
          steps={[
            {
              target: '[data-tour="get-listed"]',
              title: "This page is for businesses not yet on Wix",
              body: "A quick sign-up that makes them visible to AI agents like ChatGPT, so they get more bookings and ticket sales. Get listed free walks a barber shop through it: connect a bookings tool like Calendly and an events tool like Eventbrite, review what synced, publish.",
              cta: "Next",
            },
            {
              target: ['[data-tour="live-demo"]', '[data-tour="try-demo"]'],
              title: "Then see it from the customer's side",
              body: "Live demo opens a mock ChatGPT with Wix connected as an app. Ask it to book a haircut, buy concert tickets or reserve a table, and watch Wix handle it inside the chat.",
              cta: "Open live demo",
              onCta: () => navigate("/chatgpt"),
              secondary: "Stay here",
            },
          ]}
        />
      ) : null}
    </div>
  );
}
