import React from 'react';

export default function Home() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-gray-900">
      <div className="grid text-center lg:max-w-5xl lg:w-full lg:grid-cols-2 lg:text-left">
        <h1 className="text-6xl font-bold mb-8 text-white text-center lg:text-left">
          Game Reviews!
        </h1>

        <div className="flex flex-wrap gap-4 items-center justify-center">
          <a
            href="/review/en"
            className="inline-block px-6 py-3 rounded-lg border border-white transition-all duration-300 ease-in-out transform hover:bg-black hover:text-black focus:outline-none focus:shadow-outline focus:border-blue-300 flex-shrink-0 flex-grow-0 w-200"
          >
            <div className="flex items-center justify-center h-full">
              <p className="text-gray-300 text-sm">Review the game in English.</p>
            </div>
          </a>

          <a
            href="/review/pt"
            className="inline-block px-6 py-3 rounded-lg border border-white transition-all duration-300 ease-in-out transform hover:bg-black hover:text-black focus:outline-none focus:shadow-outline focus:border-blue-300 flex-shrink-0 flex-grow-0 w-200"
          >
            <div className="flex items-center justify-center h-full">
              <p className="text-gray-300 text-sm">Fazer análise em Português.</p>
            </div>
          </a>
        </div>
      </div>
    </main>
  );
}
