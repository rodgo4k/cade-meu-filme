"use client";

import { useState } from "react";

export default function SearchBar({ onSearch }) {
  const [searchTerm, setSearchTerm] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      onSearch?.(searchTerm.trim());
    }
  };

  return (
    <form onSubmit={handleSubmit} className="w-full max-w-2xl">
      <div className="flex items-center gap-2 bg-[var(--background)] rounded-lg shadow-lg border border-gray-300 dark:border-gray-600 p-2 focus-within:ring-2 focus-within:ring-blue-500 focus-within:border-blue-500 transition-all">
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Digite o nome do filme..."
          className="flex-1 px-4 py-3 text-base outline-none bg-transparent text-[var(--foreground)] placeholder-gray-500 dark:placeholder-gray-400"
        />
        <button
          type="submit"
          className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-md transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
        >
          Pesquisar
        </button>
      </div>
    </form>
  );
}

