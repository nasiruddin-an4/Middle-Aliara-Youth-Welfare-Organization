import "./globals.css";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import { LanguageProvider } from "./context/LanguageContext";

export const metadata = {
  title: "মধ্য আলীয়ারা যুব কল্যাণ সংগঠন ও প্রবাসী ঐক্য পরিষদ - Probashi Unity",
  description:
    "A modern, transparent, and professional community platform for expatriates to foster unity and financial accountability.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="bn">
      <body className="antialiased">
        <LanguageProvider>
          <Navbar />
          <main className="min-h-screen">{children}</main>
          <Footer />
        </LanguageProvider>
      </body>
    </html>
  );
}
