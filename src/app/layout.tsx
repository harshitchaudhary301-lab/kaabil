import type { Metadata, Viewport } from "next";
import "./globals.css";

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
};

export const metadata: Metadata = {
  title: "KAABIL (काबिल) — Universal Career & Education Ecosystem",
  description:
    "Every Stream. Every Skill. Every Future. AI-powered universal career clarity, education guidance, skill development, and employment ecosystem for India.",
  keywords: [
    "career guidance",
    "India career platform",
    "medical stream",
    "commerce stream",
    "STEM PCM",
    "arts humanities",
    "vocational ITI",
    "skill passport",
    "AI career mentor",
    "KAABIL",
  ],
  authors: [{ name: "Harshit Chaudhary & KAABIL Architecture Team" }],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-background font-sans text-text-primary antialiased selection:bg-primary/20 selection:text-primary">
        {children}
      </body>
    </html>
  );
}
