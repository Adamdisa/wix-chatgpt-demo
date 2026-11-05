import { Navigate, Route, Routes } from "react-router";

import { ChatGPTPage } from "./chatgpt/ChatGPTPage";
import { DashboardPage } from "./landing/dashboard/DashboardPage";
import { LandingPage } from "./landing/LandingPage";

export function App() {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/dashboard" element={<DashboardPage />} />
      <Route path="/chatgpt" element={<ChatGPTPage />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
