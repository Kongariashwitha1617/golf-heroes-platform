'use client'
import { motion } from 'framer-motion'

const steps = [
  {
    number: '01',
    title: 'Subscribe',
    description: 'Choose monthly or yearly. A portion of your subscription automatically goes to your chosen charity.',
    color: '#00ff87',
  },
  {
    number: '02',
    title: 'Track Your Scores',
    description: 'Enter your latest Stableford scores after each round. We keep your best 5 on record.',
    color: '#60efff',
  },
  {
    number: '03',
    title: 'Enter the Draw',
    description: 'Your scores become your draw numbers. Every month we run a prize draw — match 3, 4, or 5 numbers to win.',
    color: '#ff6b9d',
  },
  {
    number: '04',
    title: 'Win & Give',
    description: 'Claim your winnings and watch your charity contributions grow with every subscription.',
    color: '#ffd700',
  },
]

export default function HowItWorks() {
  return (
    <section id="how-it-works" className="py-24 bg-[#0a1628]">
      <div className="max-w-7xl mx-auto px-6">
        
        <div className="text-center mb-16">
          <motion.p
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="text-[#00ff87] text-sm font-medium uppercase tracking-widest mb-3"
          >
            The Process
          </motion.p>
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-4xl md:text-5xl font-black text-white"
          >
            Simple. Rewarding. Meaningful.
          </motion.h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {steps.map((step, index) => (
            <motion.div
              key={step.number}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              className="bg-[#112240] rounded-2xl p-6 border border-white/5 hover:border-white/20 transition-all group"
            >
              <div
                className="text-5xl font-black mb-4 opacity-20 group-hover:opacity-40 transition-opacity"
                style={{ color: step.color }}
              >
                {step.number}
              </div>
              <h3 className="text-white font-bold text-xl mb-2">{step.title}</h3>
              <p className="text-gray-400 text-sm leading-relaxed">{step.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}