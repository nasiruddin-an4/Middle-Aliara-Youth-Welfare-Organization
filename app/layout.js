import { Inter, Playfair_Display } from "next/font/google";
import "./globals.css";
import { LanguageProvider } from "./context/LanguageContext";
import LayoutWrapper from "./components/LayoutWrapper";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
const playfair = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-playfair",
});

export const metadata = {
  title: "মধ্য আলীয়ারা যুব কল্যাণ সংগঠন ও প্রবাসী ঐক্য পরিষদ - Probashi Unity",
  description:
    "A modern, transparent, and professional community platform for expatriates to foster unity and financial accountability.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="bn">
      <body
        className={`${inter.variable} ${playfair.variable} antialiased font-sans`}
      >
        <LanguageProvider>
          <LayoutWrapper>{children}</LayoutWrapper>
        </LanguageProvider>
      </body>
    </html>
  );
}
