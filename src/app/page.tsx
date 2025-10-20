"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function LandingPage() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-b from-blue-50 to-white relative overflow-hidden">
      {/* Background graphic */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-32 -right-32 w-[600px] h-[600px] bg-blue-200 rounded-full blur-3xl opacity-40 animate-pulse"></div>
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-yellow-200 rounded-full blur-3xl opacity-30 animate-pulse"></div>
      </div>

      <div className="relative z-10 text-center px-6 max-w-3xl">
        <motion.h1
          initial={{ opacity: 0, y: -40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-5xl md:text-6xl font-extrabold text-gray-900 leading-tight"
        >
          Emil's
          <span className="text-blue-600"> Event Dashboard</span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.2 }}
          className="mt-6 text-lg text-gray-600 max-w-2xl mx-auto"
        >
          Create, manage, and explore sports events effortlessly. Whether it’s a
          local tournament or a national competition — Fastbreak keeps you in
          control.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.7, delay: 0.4 }}
          className="mt-10 flex flex-col sm:flex-row justify-center gap-4"
        >
          <Link href="/login">
            <Button
              size="lg"
              className="text-lg px-8 py-6 shadow-lg cursor-pointer transition-all duration-200 hover:scale-[1.03] active:scale-[0.97] hover:opacity-90"
            >
              Get Started
            </Button>
          </Link>
          <Link href="/signup">
            <Button
              size="lg"
              variant="outline"
              className="text-lg px-8 py-6 border-2 cursor-pointer transition-all duration-200 hover:scale-[1.03] active:scale-[0.97] hover:bg-gray-100"
            >
              Create Account
            </Button>
          </Link>
        </motion.div>
      </div>
    </main>
  );
}