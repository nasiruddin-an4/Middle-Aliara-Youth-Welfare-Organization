"use client";
import { useLanguage } from "../context/LanguageContext";
import Link from "next/link";
import { Facebook, Youtube, Linkedin, MapPin, Phone, Mail } from "lucide-react";
import Image from "next/image";

export default function Footer() {
  const { content } = useLanguage();

  if (!content) return null;

  const { organization, copyright, description, sections } = content.footer;
  const { info } = content.contact_page;

  return (
    <footer className="relative bg-[#0b3321] text-white pt-20 pb-10 overflow-hidden text-sm">
      {/* Background Image / Shape */}
      <div
        className="absolute inset-0 z-0 opacity-80 pointer-events-none"
        style={{
          backgroundImage: "url('/10001.png')",
          backgroundSize: "cover",
          backgroundPosition: "bottom center",
          backgroundRepeat: "no-repeat",
        }}
      ></div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 lg:gap-8 mb-16">
          {/* Column 1: Organization Info & Contact */}
          <div className="flex flex-col gap-6">
            {/* Logo */}
            <div className="">
              <Image
                src="/whiteLogo@4x.png"
                alt="Logo"
                width={150}
                height={150}
              />
            </div>

            {/* Contact Info */}
            <div className="flex flex-col gap-4 text-gray-300">
              <div className="flex items-start gap-3">
                <MapPin
                  size={18}
                  className="shrink-0 mt-0.5 text-primary-light"
                />
                <span>{info.address}</span>
              </div>
              <div className="flex items-center gap-3">
                <Phone size={18} className="shrink-0 text-primary-light" />
                <a
                  href={`tel:${info.phone}`}
                  className="hover:text-white transition-colors"
                >
                  {info.phone}
                </a>
              </div>
              <div className="flex items-center gap-3">
                <Mail size={18} className="shrink-0 text-primary-light" />
                <a
                  href={`mailto:${info.email}`}
                  className="hover:text-white transition-colors"
                >
                  {info.email}
                </a>
              </div>
            </div>

            {/* Socials */}
            <div className="flex gap-4 mt-2">
              <a
                href="#"
                className="p-2 rounded-full bg-white/5 hover:bg-blue-600 hover:text-white transition-all duration-300 hover:-translate-y-1 border border-white/10"
              >
                <Facebook size={18} />
              </a>
              <a
                href="#"
                className="p-2 rounded-full bg-white/5 hover:bg-red-600 hover:text-white transition-all duration-300 hover:-translate-y-1 border border-white/10"
              >
                <Youtube size={18} />
              </a>
              <a
                href="#"
                className="p-2 rounded-full bg-white/5 hover:bg-blue-500 hover:text-white transition-all duration-300 hover:-translate-y-1 border border-white/10"
              >
                <Linkedin size={18} />
              </a>
            </div>
          </div>

          {/* Dynamic Columns */}
          {sections.map((section, idx) => (
            <div key={idx} className="flex flex-col gap-6">
              <h3 className="font-bold text-lg text-white border-b border-white/10 pb-2 w-fit pr-8">
                {section.title}
              </h3>
              <ul className="flex flex-col gap-3">
                {section.links.map((link, linkIdx) => (
                  <li key={linkIdx}>
                    <Link
                      href={link.href}
                      className="text-gray-300 hover:text-white transition-all duration-300 hover:translate-x-2 inline-block"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom Copyright */}
        <div className="pt-8 border-t border-white/10 text-center">
          <p className="text-xs text-gray-400">
            © {new Date().getFullYear()} {organization} - {copyright}
          </p>
        </div>
      </div>
    </footer>
  );
}
