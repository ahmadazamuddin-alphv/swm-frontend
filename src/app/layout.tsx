import type { Metadata } from "next";
import { DM_Sans } from "next/font/google";
import "./globals.css";

const dmSans = DM_Sans({
  variable: "--font-dm-sans",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Siaga Selangor | Waste & Road Watch",
  description:
    "A Selangor civic map for reporting illegal dumping and tracking road conditions.",
  icons: {
    icon: "/icon.png",
    apple: "/icon.png",
  },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${dmSans.variable} h-full antialiased`}>
      <body className="flex min-h-full flex-col">
        <template
          data-design-contract="selangorwaste-190f8599"
          dangerouslySetInnerHTML={{
            __html: `<!--
THESIS: Civic action begins with the map itself; refuse the generic municipal dashboard of colored metric tiles around a small map.
OWN-WORLD: Awesomic editorial zinc, white 36px surfaces, hairline Cloud borders, DM Sans, Obsidian actions, Ember punctuation only.
STORY: See where dumping changes, identify who owns the response, capture one live report, and watch it join the local map.
FIRST VIEWPORT: Sticky white navigation above an asymmetric civic headline and one decisive photographic surface; Dashboard gives the 3D map most of the viewport with a compact report rail.
FORM: User-pinned Awesomic editorial grid; seed 190f8599.
FINISH: unreviewed and undocumented is unfinished; this build ends with the finish review, the verdict, DESIGN.md, and every shipping raster carrying its provenance
-->`,
          }}
        />
        {children}
      </body>
    </html>
  );
}
