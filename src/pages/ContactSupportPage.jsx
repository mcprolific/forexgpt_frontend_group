import React, { useState } from "react";
import { motion as Motion } from "framer-motion";
import PublicNavbar from "../layout/PublicNavbar";
import PublicFooter from "../layout/PublicFooter";
import Input from "../components/ui/Input";
import Button from "../components/ui/Button";
import Toast from "../components/ui/Toast";
import useToast from "../hooks/useToast";
import { useTheme } from "../context/ThemeContext";
import {
  EnvelopeIcon,
  ChatBubbleLeftRightIcon,
  ClockIcon,
} from "@heroicons/react/24/outline";

const GOLD = "#D4AF37";
const GOLD_LIGHT = "#FFD700";
const CHARCOAL = "#1A1A1A";
const CHARCOAL2 = "#242424";

const ContactSupportPage = () => {
  const { toast, show } = useToast();
  const { theme } = useTheme();
  const isLight = theme === "light";
  const BG = isLight ? "#F0EDE6" : CHARCOAL;
  const BG2 = isLight ? "#ffffff" : CHARCOAL2;
  const TEXT = isLight ? "#1A1A1A" : "#f3f4f6";
  const MUTED = isLight ? "#6b7280" : "rgba(255,255,255,0.80)";
  const [form, setForm] = useState({ name: "", email: "", topic: "", message: "" });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.name || !form.email || !form.message) {
      show("Please fill in all required fields", "error");
      return;
    }
    show("Support request sent! We'll get back to you within 24 hours.", "success");
    setForm({ name: "", email: "", topic: "", message: "" });
  };

  return (
    <div className="relative min-h-screen w-full overflow-hidden" style={{ background: BG, color: TEXT }}>
      <div className="pointer-events-none absolute inset-0"
        style={{ background: `radial-gradient(900px 500px at 50% 0%, rgba(212,175,55,0.10), transparent 65%), radial-gradient(600px 400px at 30% 90%, rgba(255,215,0,0.06), transparent 65%)` }} />
      <Motion.div
        aria-hidden
        initial={{ opacity: 0, scale: 0.95, x: -60, y: -30 }}
        animate={{ opacity: 0.3, scale: 1, x: 0, y: 0 }}
        transition={{ duration: 1.1, delay: 0.2, ease: "easeOut" }}
        className="pointer-events-none absolute -top-24 -left-20 h-64 w-64 rounded-full blur-3xl"
        style={{ background: `${GOLD}33` }}
      />
      <Motion.div
        aria-hidden
        initial={{ opacity: 0, scale: 0.95, x: 60, y: 30 }}
        animate={{ opacity: 0.25, scale: 1, x: 0, y: 0 }}
        transition={{ duration: 1.1, delay: 0.35, ease: "easeOut" }}
        className="pointer-events-none absolute bottom-10 right-0 h-72 w-72 rounded-full blur-3xl"
        style={{ background: `${GOLD_LIGHT}26` }}
      />
      <div className="pointer-events-none absolute inset-0 dot-grid" />
      <div className="pointer-events-none absolute inset-0 noise-overlay" />

      <PublicNavbar />

      {/* Hero */}
      <section className="max-w-5xl mx-auto px-6 pt-28 pb-8 text-center">
        <Motion.div initial={{ opacity: 0, y: -16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
          <div className="inline-flex items-center gap-2 rounded-full border px-4 py-1.5 text-xs font-semibold tracking-widest uppercase mb-6"
            style={{ borderColor: `${GOLD}40`, background: `${GOLD}10`, color: GOLD_LIGHT }}>
            Get Help
          </div>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold bg-clip-text text-transparent leading-tight"
            style={{ backgroundImage: `linear-gradient(135deg, ${GOLD_LIGHT}, ${GOLD}, #ffffff, ${GOLD})` }}>
            Contact Support
          </h1>
          <p className="mt-5 text-lg max-w-2xl mx-auto leading-relaxed" style={{ color: MUTED }}>
            Have a question or facing an issue? We're here to help. Send us a message and we'll respond within 24 hours.
          </p>
        </Motion.div>
      </section>

      <section className="max-w-5xl mx-auto px-6 py-10 pb-20">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

          {/* Contact info cards */}
          <div className="space-y-4">
            {[
              { icon: EnvelopeIcon, title: "Email Us", desc: "forexgptteam@gmail.com", sub: "For general inquiries" },
              { icon: ChatBubbleLeftRightIcon, title: "Live Chat", desc: "Available in-app", sub: "For quick questions" },
              { icon: ClockIcon, title: "Response Time", desc: "Within 24 hours", sub: "Mon – Fri" },
            ].map((c, i) => {
              const Icon = c.icon;
              return (
                <Motion.div key={i} initial={{ opacity: 0, x: -16, filter: "blur(2px)" }} animate={{ opacity: 1, x: 0, filter: "blur(0px)" }}
                  transition={{ delay: 0.1 + i * 0.1, duration: 0.5 }}
                  whileHover={{ y: -4, scale: 1.01, boxShadow: `0 16px 44px ${GOLD}22` }}
                  className="relative rounded-2xl border p-5 flex items-start gap-4 overflow-hidden"
                  style={{ background: BG2, borderColor: `${GOLD}22`, color: TEXT }}>
                  <div className="absolute top-0 left-0 right-0 h-px"
                    style={{ background: `linear-gradient(90deg, transparent, ${GOLD}55, transparent)` }} />
                  <div className="inline-flex items-center justify-center h-10 w-10 rounded-xl flex-shrink-0"
                    style={{ background: `${GOLD}15`, color: GOLD_LIGHT }}>
                    <Icon className="h-5 w-5" />
                  </div>
                  <div>
                    <div className="font-bold text-sm" style={{ color: "#F0D880" }}>{c.title}</div>
                    <div className="text-sm mt-0.5" style={{ color: MUTED }}>{c.desc}</div>
                    <div className="text-xs mt-0.5" style={{ color: isLight ? "#9ca3af" : "rgba(255,255,255,0.60)" }}>{c.sub}</div>
                  </div>
                </Motion.div>
              );
            })}
          </div>

          {/* Contact form */}
          <Motion.form onSubmit={handleSubmit} initial={{ opacity: 0, y: 16, filter: "blur(2px)" }} animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
            transition={{ delay: 0.2, duration: 0.5 }}
            whileHover={{ y: -3, boxShadow: `0 18px 48px ${GOLD}22` }}
            className="relative lg:col-span-2 rounded-2xl border p-8 overflow-hidden"
            style={{ background: BG2, borderColor: `${GOLD}22`, color: TEXT }}>
            <div className="absolute top-0 left-0 right-0 h-px"
              style={{ background: `linear-gradient(90deg, transparent, ${GOLD}55, transparent)` }} />
            <h2 className="text-xl font-bold mb-6" style={{ color: "#F0D880" }}>Send a Message</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input id="name" label="Full name" placeholder=" " value={form.name}
                onChange={(e) => setForm(s => ({ ...s, name: e.target.value }))}
                className={isLight ? "bg-white border-gray-300 text-gray-900" : "bg-black/40 border-white/10 text-gray-100"} />
              <Input id="email" label="Email address" placeholder=" " value={form.email}
                onChange={(e) => setForm(s => ({ ...s, email: e.target.value }))}
                className={isLight ? "bg-white border-gray-300 text-gray-900" : "bg-black/40 border-white/10 text-gray-100"} />
              <div className="md:col-span-2">
                <Input id="topic" label="Topic" placeholder=" " value={form.topic}
                  onChange={(e) => setForm(s => ({ ...s, topic: e.target.value }))}
                  className={isLight ? "bg-white border-gray-300 text-gray-900" : "bg-black/40 border-white/10 text-gray-100"} />
              </div>
              <div className="md:col-span-2">
                <Input id="message" label="Message" placeholder=" " value={form.message}
                  onChange={(e) => setForm(s => ({ ...s, message: e.target.value }))}
                  className={isLight ? "bg-white border-gray-300 text-gray-900" : "bg-black/40 border-white/10 text-gray-100"} />
              </div>
              <div className="md:col-span-2">
                <Button type="submit"
                  className="w-full btn-glow font-bold shadow-lg"
                  style={{ background: `linear-gradient(135deg, ${GOLD_LIGHT}, ${GOLD})`, color: CHARCOAL }}>
                  Send Message
                </Button>
              </div>
            </div>
          </Motion.form>
        </div>
      </section>

      <PublicFooter />
      {toast && <Toast message={toast.message} type={toast.type} />}
    </div>
  );
};

export default ContactSupportPage;
