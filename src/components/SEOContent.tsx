import React from 'react'

export const SEOContent: React.FC = () => {
  return (
    <section className="mt-8 md:px-8 prose prose-gray max-w-none pb-12 border-t-4 border-black pt-12 bg-gray-50">
      <h2 className="text-4xl font-black text-black uppercase mb-6 inline-block bg-pink-300 px-2 py-1 border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
        Everything You Need to Know About LLM Models
      </h2>

      <div className="grid md:grid-cols-2 gap-12 text-black">
        <div className="bg-white p-6 border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
          <h3 className="text-xl font-bold text-black mb-3 border-b-2 border-black inline-block">
            Understanding Open Weights vs. Proprietary Models
          </h3>
          <p className="mb-4">
            When choosing a Large Language Model (LLM), one of the first
            decisions is between open-weights and proprietary models.
            <strong>Open-weights models</strong> allow you to run the model on
            your own infrastructure, giving you full control over privacy and
            customization. Popular examples include the{' '}
            <strong>Llama series</strong>, <strong>Qwen</strong>, and{' '}
            <strong>DeepSeek</strong>.
          </p>
          <p>
            <strong>Proprietary models</strong>, like <strong>GPT-5.2</strong>{' '}
            or <strong>Claude 4.5 Opus</strong>, are accessed via API. They
            often offer state-of-the-art performance but come with usage costs
            and data privacy considerations.
          </p>
        </div>

        <div className="bg-white p-6 border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
          <h3 className="text-xl font-bold text-black mb-3 border-b-2 border-black inline-block">
            Reasoning Capabilities & Tool Use
          </h3>
          <p className="mb-4">
            Modern LLMs are evolving beyond text generation.{' '}
            <strong>Reasoning models</strong> (like{' '}
            <strong>GPT-5.2 Thinking</strong> or <strong>Claude 4.5</strong>)
            uses "chain of thought" to solve complex logic, math, and coding
            problems with higher accuracy.
          </p>
          <p>
            <strong>Tool Use</strong> (or Function Calling) is critical for
            building automated agents. Models with high "Tool Call" capabilities
            can reliably interact with external APIs, databases, and software
            environments, making them the engines of agentic workflows.
          </p>
        </div>

        <div className="bg-white p-6 border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
          <h3 className="text-xl font-bold text-black mb-3 border-b-2 border-black inline-block">
            The Power of Context Windows
          </h3>
          <p className="mb-4">
            The <strong>context window</strong> determines how much information
            a model can process at once. Measured in tokens, it includes both
            your prompt and the model&apos;s previous responses.
          </p>
          <p>
            Models like <strong>Gemini 3</strong> offer massive windows
            (exceeding 1 million tokens), allowing users to upload entire
            codebases or massive document libraries for analysis without losing
            track of subtle details.
          </p>
        </div>

        <div className="bg-white p-6 border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
          <h3 className="text-xl font-bold text-black mb-3 border-b-2 border-black inline-block">
            Tokenization and Economics
          </h3>
          <p className="mb-4">
            LLMs don&apos;t read words; they process <strong>tokens</strong>{' '}
            (roughly 0.75 words per token). This is how usage is metered and
            charged by API providers like OpenAI and Anthropic.
          </p>
          <p>
            Understanding token efficiency is key to managing costs in 2026,
            especially when deploying multi-agent systems that make recursive
            calls to models like <strong>GPT-5.2 Pro</strong> or{' '}
            <strong>Claude 4.5 Sonnet</strong>.
          </p>
        </div>
      </div>
    </section>
  )
}
