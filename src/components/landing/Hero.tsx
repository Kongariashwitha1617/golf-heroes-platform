'use client'
import { motion } from 'framer-motion'
import Link from 'next/link'

export default function Hero() {
  return (
    <section className="min-h-screen flex items-center justify-center relative overflow-hidden bg-[#0a1628]">
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-[#00ff87]/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-6 pt-24 pb-16 text-center relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="inline-flex items-center gap-2 bg-[#00ff87]/10 border border-[#00ff87]/30 rounded-full px-4 py-2 mb-8"
        >
          <span className="w-2 h-2 rounded-full bg-[#00ff87] animate-pulse" />
          <span className="text-[#00ff87] text-sm font-medium">10% of every subscription goes to charity</span>
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="text-5xl md:text-7xl font-black text-white mb-6 leading-tight"
        >
          Play Golf.
          <br />
          <span className="bg-gradient-to-r from-[#00ff87] to-[#60efff] bg-clip-text text-transparent">
            Change Lives.
          </span>
          <br />
          Win Big.
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="text-gray-400 text-xl md:text-2xl max-w-2xl mx-auto mb-10"
        >
          Track your Stableford scores, enter monthly prize draws, and support the charity you love — all in one place.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-16"
        >
          <Link
            href="/signup"
            className="bg-[#00ff87] text-[#0a1628] px-8 py-4 rounded-full text-lg font-black hover:bg-[#00cc6a] transition-all hover:scale-105 shadow-lg shadow-[#00ff87]/25"
          >
            Start Your Journey →
          </Link>
          <Link
            href="#how-it-works"
            className="border border-white/20 text-white px-8 py-4 rounded-full text-lg font-medium hover:border-[#00ff87]/50 hover:text-[#00ff87] transition-all"
          >
            See How It Works
          </Link>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="grid grid-cols-3 gap-8 max-w-lg mx-auto"
        >
          {[
            { value: '£10K+', label: 'Prize Pool Monthly' },
            { value: '12+', label: 'Charities Supported' },
            { value: '500+', label: 'Active Players' },
          ].map((stat) => (
            <div key={stat.label} className="text-center">
              <div className="text-2xl md:text-3xl font-black text-[#00ff87]">{stat.value}</div>
              <div className="text-gray-500 text-xs md:text-sm mt-1">{stat.label}</div>
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  )
}