import { Navigate, Route, Routes } from "react-router";

import { ChatGPTPage } from "./chatgpt/ChatGPTPage";
import { SITE_PROMPT } from "./chatgpt/engine/useConversation";
import { DashboardPage } from "./landing/dashboard/DashboardPage";
import { LandingPage } from "./landing/LandingPage";

export function App() {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/dashboard" element={<DashboardPage />} />
      <Route path="/chatgpt" element={<ChatGPTPage />} />
      {/* Deep link for the site-creation + domain flow. */}
      <Route path="/domain" element={<Navigate to={`/chatgpt?prompt=${encodeURIComponent(SITE_PROMPT)}`} replace />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
