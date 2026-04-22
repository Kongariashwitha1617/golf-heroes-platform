'use client'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { Check } from 'lucide-react'

const plans = [
  {
    name: 'Monthly',
    price: '$9.99',
    period: 'per month',
    features: [
      'Full score tracking',
      'Monthly prize draw entry',
      'Charity contribution (min 10%)',
      'Winner dashboard',
      'Email notifications',
    ],
    cta: 'Start Monthly',
    highlighted: false,
  },
  {
    name: 'Yearly',
    price: '$99.99',
    period: 'per year',
    badge: 'Save 17%',
    features: [
      'Everything in Monthly',
      '2 months free',
      'Priority draw entry',
      'Increased charity impact',
      'Early access to features',
    ],
    cta: 'Start Yearly',
    highlighted: true,
  },
]

export default function PricingSection() {
  return (
    <section id="pricing" className="py-24 bg-[#112240]">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center mb-16">
          <motion.p
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="text-[#00ff87] text-sm font-medium uppercase tracking-widest mb-3"
          >
            Pricing
          </motion.p>
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-4xl md:text-5xl font-black text-white"
          >
            One subscription. <br />Endless impact.
          </motion.h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-3xl mx-auto">
          {plans.map((plan, index) => (
            <motion.div
              key={plan.name}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              className={`relative rounded-2xl p-8 border ${
                plan.highlighted
                  ? 'bg-[#00ff87]/5 border-[#00ff87]/50 shadow-lg shadow-[#00ff87]/10'
                  : 'bg-[#0a1628] border-white/10'
              }`}
            >
              {plan.badge && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-[#00ff87] text-[#0a1628] text-xs font-black px-4 py-1 rounded-full">
                  {plan.badge}
                </div>
              )}
              <h3 className="text-white font-bold text-xl mb-2">{plan.name}</h3>
              <div className="flex items-end gap-2 mb-6">
                <span className="text-4xl font-black text-white">{plan.price}</span>
                <span className="text-gray-400 text-sm mb-1">{plan.period}</span>
              </div>
              <ul className="space-y-3 mb-8">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-center gap-3 text-gray-300 text-sm">
                    <Check size={16} className="text-[#00ff87] flex-shrink-0" />
                    {feature}
                  </li>
                ))}
              </ul>

              <Link
                href="/signup"
                className={`block text-center py-3 px-6 rounded-full font-bold transition-all hover:scale-105 ${
                  plan.highlighted
                    ? 'bg-[#00ff87] text-[#0a1628] hover:bg-[#00cc6a]'
                    : 'border border-white/20 text-white hover:border-[#00ff87]/50 hover:text-[#00ff87]'
                }`}
              >
                {plan.cta}
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}