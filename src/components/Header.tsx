import { Link } from '@tanstack/react-router'

import { useState } from 'react'
import {
  Home,
  Menu,
  X,
} from 'lucide-react'

export default function Header() {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <>
      <header className="fixed top-0 left-0 right-0 z-50 p-4 flex items-center border-b border-border/40 bg-background/80 backdrop-blur-xl supports-[backdrop-filter]:bg-background/60">
        <button
          onClick={() => setIsOpen(true)}
          className="p-2 hover:bg-accent hover:text-accent-foreground rounded-lg transition-colors text-muted-foreground hover:text-foreground"
          aria-label="Open menu"
        >
          <Menu size={24} />
        </button>
        <h1 className="ml-4 text-xl font-semibold">
          <Link to="/" search={{}}>
            <div className="flex items-center gap-2">
               <span className="bg-gradient-to-r from-blue-400 to-cyan-300 bg-clip-text text-transparent font-bold text-2xl tracking-tight">
                LLM Models
               </span>
            </div>
          </Link>
        </h1>
      </header>

      <div className="h-20" /> {/* Spacer for fixed header */}

      <aside
        className={`fixed top-0 left-0 h-full w-80 bg-background/95 backdrop-blur-xl border-r border-border text-foreground shadow-2xl z-50 transform transition-transform duration-300 ease-in-out flex flex-col ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex items-center justify-between p-4 border-b border-gray-700">
          <h2 className="text-xl font-bold">Navigation</h2>
          <button
            onClick={() => setIsOpen(false)}
            className="p-2 hover:bg-accent hover:text-accent-foreground rounded-lg transition-colors text-muted-foreground hover:text-foreground"
            aria-label="Close menu"
          >
            <X size={24} />
          </button>
        </div>

        <nav className="flex-1 p-4 overflow-y-auto">
          <Link
            to="/"
            search={{}}
            onClick={() => setIsOpen(false)}
            className="flex items-center gap-3 p-3 rounded-lg hover:bg-accent hover:text-accent-foreground transition-all duration-200 mb-1 text-muted-foreground"
            activeProps={{
              className:
                'flex items-center gap-3 p-3 rounded-lg bg-primary/10 text-primary hover:bg-primary/20 transition-all duration-200 mb-1 font-medium',
            }}
          >
            <Home size={20} />
            <span className="font-medium">Home</span>
          </Link>
        </nav>
      </aside>
    </>
  )
}
