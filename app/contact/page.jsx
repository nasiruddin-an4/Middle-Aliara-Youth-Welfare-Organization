"use client";
import React, { useState } from "react";
import { useLanguage } from "../context/LanguageContext";
import { MapPin, Phone, Mail, Send, MessageCircle } from "lucide-react";
import Swal from "sweetalert2";

export default function ContactPage() {
  const { content } = useLanguage();
  const [formData, setFormData] = useState({
    name: "",
    contact: "",
    message: "",
  });

  // Guard clause
  if (!content || !content.contact_page) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  const { hero, info, form } = content.contact_page;

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      const result = await response.json();

      if (result.success) {
        Swal.fire({
          icon: "success",
          title: "Message Sent!",
          text: "Thank you for contacting us. We will get back to you soon.",
          confirmButtonColor: "#009b5a",
        });
        setFormData({ name: "", contact: "", message: "" });
      } else {
        Swal.fire({
          icon: "error",
          title: "Oops...",
          text: result.message || "Something went wrong!",
        });
      }
    } catch (error) {
      console.error("Error submitting form:", error);
      Swal.fire({
        icon: "error",
        title: "Oops...",
        text: "Failed to send message. Please try again later.",
      });
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 font-sans">
      {/* Hero Section */}
      <section className="relative bg-primary overflow-hidden pt-32 pb-20 lg:pt-40 lg:pb-28">
        <div className="absolute inset-0 bg-linear-to-br from-primary via-emerald-700 to-teal-900 opacity-90"></div>
        {/* Abstract Pattern */}
        <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]"></div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-white">
          <div className="inline-flex items-center justify-center p-3 bg-white/10 rounded-full mb-6 backdrop-blur-sm">
            <MessageCircle className="w-8 h-8 text-secondary" />
          </div>
          <h1 className="text-4xl md:text-5xl font-bold mb-6 tracking-tight leading-tight">
            {hero.title}
          </h1>
          <p className="max-w-2xl mx-auto text-lg md:text-xl text-emerald-50 leading-relaxed font-light">
            {hero.description}
          </p>
        </div>
      </section>

      {/* Main Content */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Contact Info Card */}
          <div className="bg-white rounded-3xl shadow-xl overflow-hidden flex flex-col h-full">
            <div className="bg-slate-900 p-8 text-white relative overflow-hidden">
              <div className="absolute top-0 right-0 -mt-4 -mr-4 w-24 h-24 bg-secondary/20 rounded-full blur-2xl"></div>
              <h2 className="text-2xl font-bold relative z-10">{info.title}</h2>
            </div>

            <div className="p-8 grow flex flex-col justify-center gap-8">
              {/* Address */}
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-emerald-100 rounded-xl flex items-center justify-center text-emerald-600 shrink-0">
                  <MapPin className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 text-lg mb-1">
                    Address
                  </h3>
                  <p className="text-slate-600 leading-relaxed max-w-xs">
                    {info.address}
                  </p>
                </div>
              </div>

              {/* Phone */}
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center text-blue-600 shrink-0">
                  <Phone className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 text-lg mb-1">
                    Phone
                  </h3>
                  <a
                    href={`tel:${info.phone}`}
                    className="text-slate-600 hover:text-primary transition-colors text-lg font-mono block"
                  >
                    {info.phone}
                  </a>
                </div>
              </div>

              {/* Email */}
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center text-purple-600 shrink-0">
                  <Mail className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 text-lg mb-1">
                    Email
                  </h3>
                  <a
                    href={`mailto:${info.email}`}
                    className="text-slate-600 hover:text-primary transition-colors text-lg break-all"
                  >
                    {info.email}
                  </a>
                </div>
              </div>
            </div>

            {/* Map Placeholder or Decorative Bottom */}
            <div className="h-48 bg-gray-100 relative grayscale opacity-60">
              <iframe
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d14631.063765181773!2d90.8653755!3d23.3512255!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3754f923768b55d9%3A0xc39f8f4119bd4904!2sKachua%2C%20Chandpur!5e0!3m2!1sen!2sbd!4v1700000000000!5m2!1sen!2sbd"
                width="100%"
                height="100%"
                style={{ border: 0 }}
                allowFullScreen=""
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                title="Map of Kachua, Chandpur"
              ></iframe>
            </div>
          </div>

          {/* Contact Form */}
          <div className="bg-white rounded-3xl shadow-xl p-8 lg:p-10">
            <h2 className="text-3xl font-bold text-gray-900 mb-8">
              {form.title}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  {form.name_label}
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all outline-none bg-gray-50 focus:bg-white"
                  placeholder="..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  {form.contact_label}
                </label>
                <input
                  type="text"
                  name="contact"
                  value={formData.contact}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all outline-none bg-gray-50 focus:bg-white"
                  placeholder="..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  {form.message_label}
                </label>
                <textarea
                  name="message"
                  value={formData.message}
                  onChange={handleChange}
                  required
                  rows={5}
                  className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all outline-none bg-gray-50 focus:bg-white resize-none"
                  placeholder="..."
                ></textarea>
              </div>

              <button
                type="submit"
                className="w-full py-4 rounded-xl bg-primary hover:bg-green-700 text-white font-bold text-lg shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex items-center justify-center gap-2"
              >
                {form.submit_button}
                <Send size={20} />
              </button>
            </form>
          </div>
        </div>
      </section>
    </div>
  );
}
