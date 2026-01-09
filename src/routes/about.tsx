import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/about')({
  component: AboutPage,
})

function AboutPage() {
  return (
    <div className="container mx-auto px-4 py-8 min-h-screen flex flex-col font-sans text-black">
      <header className="mb-12 pt-20">
        <h1 className="text-4xl md:text-6xl font-black tracking-tighter uppercase mb-4 text-black drop-shadow-[4px_4px_0px_rgba(255,230,0,1)]">
          About <span className="bg-black text-white px-2">LLMsModels</span>
        </h1>
        <p className="text-xl text-black font-bold max-w-2xl leading-relaxed border-l-8 border-black pl-4">
          Understanding the mission and the people behind the project.
        </p>
      </header>

      <div className="grid md:grid-cols-2 gap-8">
        <section className="bg-white p-8 border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
          <h2 className="text-2xl font-black uppercase mb-4 bg-pink-300 inline-block px-2 border-2 border-black">
            What is it?
          </h2>
          <p className="text-lg font-medium leading-relaxed mb-4">
            LLMsModels is the most comprehensive database designed to help
            developers, researchers, and AI enthusiasts compare and discover
            state-of-the-art AI models.
          </p>
          <p className="text-lg font-medium leading-relaxed">
            From open-weights models to proprietary APIs, we provide detailed
            insights into reasoning capabilities, tool use, and more, all in one
            easy-to-navigate interface.
          </p>
        </section>

        <section className="bg-white p-8 border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
          <h2 className="text-2xl font-black uppercase mb-4 bg-blue-300 inline-block px-2 border-2 border-black">
            Who created it?
          </h2>
          <p className="text-lg font-medium leading-relaxed mb-4">
            This project was created and is maintained by{' '}
            <span className="font-black italic underline decoration-4 decoration-yellow-400">
              Satrya
            </span>
            .
          </p>
          <p className="text-lg font-medium leading-relaxed">
            Driven by a passion for the evolving AI landscape, the goal was to
            create a tool that makes model selection transparent and accessible
            for everyone.
          </p>
        </section>

        <section className="md:col-span-2 bg-gray-50 p-8 border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
          <h2 className="text-2xl font-black uppercase mb-4 bg-green-300 inline-block px-2 border-2 border-black">
            Credits
          </h2>
          <p className="text-lg font-medium leading-relaxed">
            A huge thank you to the team at{' '}
            <a
              href="https://github.com/anomalyco/models.dev"
              target="_blank"
              rel="noopener noreferrer"
              className="font-black underline hover:bg-yellow-200 transition-colors"
            >
              anomalyco/models.dev
            </a>
            . This application is powered by their excellent{' '}
            <a
              href="https://models.dev/api.json"
              target="_blank"
              rel="noopener noreferrer"
              className="font-bold underline hover:text-blue-600 transition-colors"
            >
              API
            </a>
            , which provides the underlying data that makes this explorer
            possible.
          </p>
        </section>
      </div>
    </div>
  )
}
