import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Amplo — Local marketing on autopilot",
  description:
    "Amplo runs social media and local SEO for local businesses automatically — writing posts, turning Google reviews into content, and keeping you visible. Pick your niche, set it once, and it just runs.",
  openGraph: {
    title: "Amplo — Local marketing on autopilot",
    description:
      "AI social media & local SEO on autopilot for realtors, dentists, lawyers, med spas and local pros.",
    type: "website",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        {/* Respect a saved theme before paint to avoid a flash. */}
        <script
          dangerouslySetInnerHTML={{
            __html: `try{var t=localStorage.getItem('amplo-theme');if(t)document.documentElement.setAttribute('data-theme',t);}catch(e){}`,
          }}
        />
      </head>
      <body>{children}</body>
    </html>
  );
}
