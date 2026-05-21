import { Gamepad2, Languages } from 'lucide-react';

export default function Home() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-steam-darker">
      <div className="w-full max-w-2xl px-6 text-center">
        <div className="mb-10">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-steam-blue/10 mb-6">
            <Gamepad2 size={40} className="text-steam-blue" />
          </div>
          <h1 className="text-4xl md:text-5xl font-extrabold text-white tracking-tight mb-3">
            Steam Review Template
          </h1>
          <p className="text-gray-400 text-lg max-w-md mx-auto">
            Generate formatted game reviews for Steam with ease. Pick your ratings, add comments, and copy — ready to paste.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 items-center justify-center">
          <a
            href="/review/en"
            className="group flex items-center gap-3 px-8 py-4 rounded-lg bg-steam-blue text-steam-darker font-bold transition-all hover:bg-sky-300 hover:scale-[1.02] active:scale-[0.98]"
          >
            <Languages size={20} />
            English Review
          </a>
          <a
            href="/review/pt"
            className="group flex items-center gap-3 px-8 py-4 rounded-lg bg-gray-800 text-white font-bold border border-gray-700 transition-all hover:bg-gray-700 hover:border-gray-600 hover:scale-[1.02] active:scale-[0.98]"
          >
            <Languages size={20} />
            Análise em Português
          </a>
        </div>

        <div className="mt-12 text-sm text-gray-500">
          No account needed. Works entirely in your browser.
        </div>
      </div>
    </main>
  );
}
