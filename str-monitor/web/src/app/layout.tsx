import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "STR Monitor - Pleasanton & Alameda County Short-Term Rental Compliance",
  description:
    "Never miss a regulation change. We monitor Pleasanton and Alameda County STR rules and alert you immediately when anything changes, with archived evidence.",
  keywords: [
    "Pleasanton Airbnb rules",
    "Pleasanton short-term rental permit",
    "Alameda County STR regulations",
    "short-term rental compliance",
    "VRBO regulations Pleasanton",
    "transient occupancy tax Pleasanton",
  ],
  openGraph: {
    title: "STR Monitor - Never Miss a Regulation Change",
    description:
      "Automated monitoring of Pleasanton & Alameda County short-term rental regulations. Get alerts when rules change.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
