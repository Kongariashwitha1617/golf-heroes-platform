import Link from 'next/link'

export default function Footer() {
  return (
    <footer className="bg-[#0a1628] border-t border-white/10 py-12">
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-[#00ff87] flex items-center justify-center">
              <span className="text-[#0a1628] font-black text-sm">GH</span>
            </div>
            <span className="font-bold text-xl text-white">Golf <span className="text-[#00ff87]">Heroes</span></span>
          </div>
          <div className="flex gap-6 text-sm text-gray-400">
            <Link href="#how-it-works" className="hover:text-white transition-colors">How it Works</Link>
            <Link href="#charities" className="hover:text-white transition-colors">Charities</Link>
            <Link href="#pricing" className="hover:text-white transition-colors">Pricing</Link>
            <Link href="/login" className="hover:text-white transition-colors">Login</Link>
          </div>
          <p className="text-gray-500 text-sm">© 2025 Golf Heroes. All rights reserved.</p>
        </div>
      </div>
    </footer>
  )
}