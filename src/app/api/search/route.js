import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic'; // Garante que a rota seja dinâmica

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get('q');
  const type = searchParams.get('type') || 'movie'; // movie ou series
  const id = searchParams.get('id'); // ID opcional para busca direta

  // Verificar se a chave da API está configurada
  const apiKey = process.env.RAPIDAPI_KEY;
  
  if (!apiKey) {
    console.error('RAPIDAPI_KEY não encontrada nas variáveis de ambiente');
    return NextResponse.json(
      { error: 'API key não configurada. Verifique o arquivo .env.local' },
      { status: 500 }
    );
  }

  try {
    // Se tiver ID, busca direta pelo endpoint /shows/{type}/{id}
    if (id) {
      const apiUrl = `https://streaming-availability.p.rapidapi.com/shows/${type}/${id}`;
      
      console.log('Buscando por ID em:', apiUrl);
      
      const response = await fetch(apiUrl, {
        method: 'GET',
        headers: {
          'x-rapidapi-key': apiKey,
          'x-rapidapi-host': 'streaming-availability.p.rapidapi.com',
        },
      });

      if (!response.ok) {
        const errorData = await response.text().catch(() => 'Erro desconhecido');
        console.error('API Error:', {
          status: response.status,
          statusText: response.statusText,
          errorData
        });
        
        let errorMessage = 'Erro ao buscar dados da API';
        if (response.status === 403) {
          errorMessage = 'Acesso negado. Verifique se a chave da API está correta e válida.';
        } else if (response.status === 429) {
          errorMessage = 'Muitas requisições. Aguarde um momento antes de tentar novamente.';
        } else if (response.status === 404) {
          errorMessage = 'Show não encontrado.';
        }
        
        return NextResponse.json(
          { 
            error: errorMessage,
            status: response.status,
            details: errorData 
          },
          { status: response.status }
        );
      }

      const data = await response.json();
      return NextResponse.json(data);
    } 
    // Se tiver query, primeiro busca o ID usando TMDB (gratuita), depois busca os detalhes
    else if (query) {
      console.log('Iniciando busca por:', { query, type, apiKey: apiKey ? 'Configurada' : 'Não configurada' });
      
      try {
        // Tenta usar a API do OMDB (mais simples, mas requer chave) ou TMDB
        // Primeiro, vamos tentar usar uma API que não precisa de chave: OMDb API (pode usar sem chave para algumas buscas)
        // Ou vamos usar a API do TMDB com chave opcional
        
        const tmdbApiKey = process.env.TMDB_API_KEY;
        let movieId = null;
        let movieData = null;
        
        // Tenta buscar no TMDB se tiver chave
        if (tmdbApiKey) {
          const tmdbSearchUrl = `https://api.themoviedb.org/3/search/${type === 'series' ? 'tv' : 'movie'}?api_key=${tmdbApiKey}&query=${encodeURIComponent(query)}&language=pt-BR`;
          
          console.log('Buscando ID no TMDB:', tmdbSearchUrl);
          
          const tmdbResponse = await fetch(tmdbSearchUrl);
          
          if (tmdbResponse.ok) {
            const tmdbData = await tmdbResponse.json();
            
            if (tmdbData.results && tmdbData.results.length > 0) {
              // Suporta paginação
              const page = parseInt(searchParams.get('page')) || 1;
              const perPage = parseInt(searchParams.get('perPage')) || 20;
              const startIndex = (page - 1) * perPage;
              const endIndex = startIndex + perPage;
              
              // Pega os resultados da página atual
              const results = tmdbData.results.slice(startIndex, endIndex);
              const totalResults = tmdbData.results.length;
              const totalPages = Math.ceil(totalResults / perPage);
              
              // Busca informações de streaming para cada filme
              const moviesWithStreaming = await Promise.all(
                results.map(async (tmdbMovie) => {
                  const movieId = tmdbMovie.id;
                  const streamingUrl = `https://streaming-availability.p.rapidapi.com/shows/${type}/${movieId}`;
                  
                  try {
                    const streamingResponse = await fetch(streamingUrl, {
                      method: 'GET',
                      headers: {
                        'x-rapidapi-key': apiKey,
                        'x-rapidapi-host': 'streaming-availability.p.rapidapi.com',
                      },
                    });

                    if (streamingResponse.ok) {
                      const streamingData = await streamingResponse.json();
                      
                      // A estrutura da API é: { streamingOptions: { us: [...], br: [...] } }
                      // Cada item no array tem: { service: { id, name }, type, link, videoLink, quality }
                      const finalData = {
                        ...streamingData,
                        tmdb: tmdbMovie
                      };
                      
                      // Garante que streamingOptions está presente (a API retorna assim)
                      // Não precisa converter, a estrutura já está correta
                      
                      return finalData;
                    } else {
                      // Se não encontrar streaming, retorna pelo menos os dados do TMDB
                      return {
                        tmdb: tmdbMovie,
                        streamingInfo: null,
                        message: 'Informações de streaming não disponíveis'
                      };
                    }
                  } catch (error) {
                    console.error(`Erro ao buscar streaming para ${tmdbMovie.title}:`, error);
                    return {
                      tmdb: tmdbMovie,
                      streamingInfo: null
                    };
                  }
                })
              );
              
              // Retorna array de resultados com informações de paginação
              return NextResponse.json({
                results: moviesWithStreaming,
                pagination: {
                  page,
                  perPage,
                  totalResults,
                  totalPages,
                  hasNextPage: page < totalPages,
                  hasPrevPage: page > 1
                }
              });
            }
          }
        }
        
        // Se não encontrou no TMDB, tenta usar a API do RapidAPI diretamente
        // Mas como não tem endpoint de busca, vamos retornar um erro mais útil
        if (!tmdbApiKey) {
          // Tenta buscar usando o endpoint /getByTitle ou similar (se existir)
          const alternativeEndpoints = [
            `https://streaming-availability.p.rapidapi.com/getByTitle?title=${encodeURIComponent(query)}&country=br&type=${type}`,
            `https://streaming-availability.p.rapidapi.com/find?title=${encodeURIComponent(query)}&country=br&type=${type}`,
          ];
          
          for (const altUrl of alternativeEndpoints) {
            console.log('Tentando endpoint alternativo:', altUrl);
            const altResponse = await fetch(altUrl, {
              method: 'GET',
              headers: {
                'x-rapidapi-key': apiKey,
                'x-rapidapi-host': 'streaming-availability.p.rapidapi.com',
              },
            });
            
            if (altResponse.ok) {
              const altData = await altResponse.json();
              return NextResponse.json(altData);
            }
          }
          
          // Se não encontrou em nenhum lugar
          return NextResponse.json(
            { 
              error: 'Esta API não possui busca por título. Você precisa do ID do filme. Configure uma chave do TMDB no .env.local (TMDB_API_KEY) para buscar por título.',
              status: 404,
              hint: 'Adicione TMDB_API_KEY no .env.local para habilitar busca por título'
            },
            { status: 404 }
          );
        }

        
      } catch (error) {
        console.error('Erro na busca:', error);
        return NextResponse.json(
          { 
            error: 'Erro ao buscar filme. Tente novamente.',
            details: error.message 
          },
          { status: 500 }
        );
      }
    } else {
      return NextResponse.json(
        { error: 'Query parameter "q" ou "id" é necessário' },
        { status: 400 }
      );
    }
  } catch (error) {
    console.error('Error fetching data:', error);
    return NextResponse.json(
      { 
        error: 'Erro interno do servidor',
        details: error.message 
      },
      { status: 500 }
    );
  }
}

