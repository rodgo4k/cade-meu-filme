"use client";

import { useState } from "react";
import TopBar from "@/components/topBar/page";
import SearchBar from "@/components/SearchBar";
import MovieCard from "@/components/MovieCard";

export default function Home() {
  const [searchResults, setSearchResults] = useState(null);
  const [pagination, setPagination] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [currentQuery, setCurrentQuery] = useState("");

  const handleSearch = async (query, page = 1) => {
    setLoading(true);
    setError(null);
    
    // Se for uma nova busca, limpa os resultados
    if (query !== currentQuery) {
      setSearchResults(null);
      setCurrentQuery(query);
      setCurrentPage(1);
    }

    try {
      const response = await fetch(`/api/search?q=${encodeURIComponent(query)}&type=movie&page=${page}&perPage=20`);
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Erro desconhecido' }));
        
        // Mensagens de erro mais amigáveis
        let errorMessage = errorData.error || 'Erro ao buscar filmes';
        
        if (response.status === 403) {
          errorMessage = 'Acesso negado. Verifique a configuração da API.';
        } else if (response.status === 429) {
          errorMessage = 'Muitas requisições. Aguarde um momento.';
        }
        
        throw new Error(errorMessage);
      }

      const data = await response.json();
      
      // Se tiver paginação, processa os dados
      if (data.results && data.pagination) {
        if (page === 1) {
          setSearchResults(data.results);
        } else {
          // Adiciona novos resultados aos existentes
          setSearchResults(prev => [...(prev || []), ...data.results]);
        }
        setPagination(data.pagination);
        setCurrentPage(page);
      } else {
        // Formato antigo (sem paginação) - compatibilidade
        setSearchResults(data);
        setPagination(null);
      }
    } catch (err) {
      setError(err.message);
      console.error('Erro na busca:', err);
    } finally {
      setLoading(false);
    }
  };

  const loadMore = () => {
    if (pagination?.hasNextPage && !loading) {
      handleSearch(currentQuery, currentPage + 1);
    }
  };

  return (
    <div className="flex flex-col items-center min-h-screen">
      <TopBar />
      <div className="flex flex-col items-center gap-6 flex-1 px-4 py-8 w-full">
        <div className="flex flex-col items-center gap-2">
          <h1 className="text-4xl font-bold font-custom">Cade meu filme?</h1>
          <p className="text-base w-full max-w-2xl text-center">
            Cade meu filme? é um site que ajuda você a encontrar o filme que você está procurando, te mostrando em quais streamings e países 
            ele está disponível e o plano mínimo para assisti-lo.
          </p>
        </div>
        <SearchBar onSearch={handleSearch} />
        
        {loading && (
          <div className="mt-4 text-gray-600 dark:text-gray-400">
            Pesquisando...
          </div>
        )}

        {error && (
          <div className="mt-4 text-red-600 dark:text-red-400">
            Erro: {error}
          </div>
        )}

        {searchResults && (
          <div className="mt-8 w-full max-w-6xl">
            <h2 className="text-2xl font-bold mb-6 text-[var(--foreground)]">
              Resultados da busca
              {pagination && (
                <span className="text-lg font-normal text-gray-500 dark:text-gray-400 ml-2">
                  ({pagination.totalResults} resultados)
                </span>
              )}
            </h2>
            <div className="space-y-6">
              {/* Se for um array de resultados (prioridade) */}
              {Array.isArray(searchResults) && searchResults.length > 0 && (
                <>
                  {searchResults.map((movie, index) => (
                    <MovieCard key={movie.id || movie.tmdb?.id || index} movie={movie} />
                  ))}
                  
                  {/* Botão de carregar mais */}
                  {pagination?.hasNextPage && (
                    <div className="flex justify-center pt-4">
                      <button
                        onClick={loadMore}
                        disabled={loading}
                        className="px-6 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-semibold rounded-lg transition-colors"
                      >
                        {loading ? 'Carregando...' : 'Carregar mais resultados'}
                      </button>
                    </div>
                  )}
                  
                  {/* Indicador de página */}
                  {pagination && (
                    <div className="text-center text-sm text-gray-500 dark:text-gray-400 pt-2">
                      Página {pagination.page} de {pagination.totalPages} 
                      ({searchResults.length} de {pagination.totalResults} resultados carregados)
                    </div>
                  )}
                </>
              )}
              {/* Se for um único resultado (objeto) */}
              {!Array.isArray(searchResults) && searchResults.id && (
                <MovieCard movie={searchResults} />
              )}
              {/* Se não houver resultados */}
              {(!Array.isArray(searchResults) || searchResults.length === 0) && !searchResults.id && (
                <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                  Nenhum resultado encontrado
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
