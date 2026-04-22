'use client'
import { useState } from 'react'
import Link from 'next/link'
import { Menu, X } from 'lucide-react'

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <nav className="fixed top-0 w-full z-50 bg-[#0a1628]/80 backdrop-blur-md border-b border-white/10">
      <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-[#00ff87] flex items-center justify-center">
            <span className="text-[#0a1628] font-black text-sm">GH</span>
          </div>
          <span className="font-bold text-xl text-white">Golf <span className="text-[#00ff87]">Heroes</span></span>
        </Link>

        <div className="hidden md:flex items-center gap-8">
          <Link href="#how-it-works" className="text-gray-400 hover:text-white transition-colors text-sm">How it Works</Link>
          <Link href="#charities" className="text-gray-400 hover:text-white transition-colors text-sm">Charities</Link>
          <Link href="#pricing" className="text-gray-400 hover:text-white transition-colors text-sm">Pricing</Link>
          <Link href="/login" className="text-gray-400 hover:text-white transition-colors text-sm">Login</Link>
          <Link href="/signup" className="bg-[#00ff87] text-[#0a1628] px-5 py-2 rounded-full text-sm font-bold hover:bg-[#00cc6a] transition-colors">
            Get Started
          </Link>
        </div>

        <button className="md:hidden text-white" onClick={() => setIsOpen(!isOpen)}>
          {isOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {isOpen && (
        <div className="md:hidden bg-[#112240] border-t border-white/10 px-6 py-4 flex flex-col gap-4">
          <Link href="#how-it-works" className="text-gray-400 hover:text-white text-sm" onClick={() => setIsOpen(false)}>How it Works</Link>
          <Link href="#charities" className="text-gray-400 hover:text-white text-sm" onClick={() => setIsOpen(false)}>Charities</Link>
          <Link href="#pricing" className="text-gray-400 hover:text-white text-sm" onClick={() => setIsOpen(false)}>Pricing</Link>
          <Link href="/login" className="text-gray-400 hover:text-white text-sm" onClick={() => setIsOpen(false)}>Login</Link>
          <Link href="/signup" className="bg-[#00ff87] text-[#0a1628] px-5 py-2 rounded-full text-sm font-bold text-center" onClick={() => setIsOpen(false)}>
            Get Started
          </Link>
        </div>
      )}
    </nav>
  )
}