import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "EQAI - Emotional Intelligence Meets AI",
  description: "Unlock your emotional intelligence with AI-powered assessments. EQAIGlobal combines cutting-edge artificial intelligence with evidence-based tools to help you understand and develop your emotional intelligence.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
