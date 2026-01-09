import { Link } from '@tanstack/react-router'
import { Github } from 'lucide-react'

export const Header = () => {
  return (
    <header className="sticky top-0 z-50 w-full border-b-4 border-black bg-white">
      <div className="container mx-auto flex h-20 items-center justify-between px-4">
        {/* Logo Area */}
        <Link
          to="/"
          search={(prev) => ({
            ...prev,
            search: undefined,
            reasoning: undefined,
            toolCall: undefined,
            openWeights: undefined,
          })}
          className="flex items-center gap-2 md:gap-3 group decoration-transparent"
        >
          <div className="size-8 md:size-10 bg-black text-white flex items-center justify-center border-2 border-black group-hover:bg-[#FEF08A] group-hover:text-black transition-colors">
            <svg
              viewBox="0 0 100 100"
              fill="currentColor"
              className="size-5 md:size-6"
            >
              <path d="M 25 20 L 50 20 L 50 55 L 75 55 L 75 80 L 25 80 Z" />
            </svg>
          </div>
          <span className="text-lg md:text-2xl font-black uppercase tracking-tighter text-black">
            LLMsModels
          </span>
        </Link>

        {/* Navigation */}
        <nav className="flex items-center gap-4 md:gap-8">
          <Link
            to="/about"
            className="text-base md:text-lg font-bold text-black border-b-4 border-transparent hover:border-black transition-all"
            activeProps={{
              className: 'border-black',
            }}
          >
            About
          </Link>
          <a
            href="https://github.com/gasatrya/llmsmodels"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 px-3 py-1.5 md:px-6 md:py-2 border-2 border-black bg-[#FEF08A] shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] active:translate-x-[4px] active:translate-y-[4px] active:shadow-none transition-all font-bold text-black text-sm md:text-base"
          >
            <Github className="size-5" />
            <span className="hidden sm:inline">Github</span>
          </a>
        </nav>
      </div>
    </header>
  )
}
