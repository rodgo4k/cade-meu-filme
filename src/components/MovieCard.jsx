"use client";

export default function MovieCard({ movie }) {
  if (!movie) return null;

  const {
    title,
    originalTitle,
    overview,
    releaseYear,
    genres = [],
    directors = [],
    cast = [],
    rating,
    runtime,
    imageSet,
    streamingOptions,
    tmdb
  } = movie;

  // Pega a imagem do poster
  const posterUrl = imageSet?.verticalPoster?.w240 || 
                   imageSet?.verticalPoster?.w360 ||
                   imageSet?.poster?.w240 ||
                   tmdb?.poster_path ? `https://image.tmdb.org/t/p/w500${tmdb.poster_path}` : null;

  // Processa informações de streaming
  // A estrutura da API é: { streamingOptions: { us: [...], br: [...] } }
  // Cada item no array tem: { service: { id, name }, type, link, videoLink, quality }
  const getStreamingServices = () => {
    const services = [];
    
    // Pega streamingOptions do objeto movie (pode estar em diferentes lugares)
    let so = streamingOptions || movie.streamingOptions;
    
    if (!so) {
      return services;
    }
    
    // streamingOptions é um objeto com países como chaves: { us: [...], br: [...] }
    const countries = ['br', 'us'];
    
    for (const country of countries) {
      const countryOptions = so[country];
      
      if (Array.isArray(countryOptions) && countryOptions.length > 0) {
        countryOptions.forEach((option) => {
          if (option && option.service) {
            // Evita duplicatas
            if (!services.find(s => s.id === option.service.id && s.country === country.toUpperCase())) {
              services.push({
                id: option.service.id,
                name: option.service.name,
                type: option.type, // subscription, rent, buy, free
                link: option.link,
                videoLink: option.videoLink,
                quality: option.quality,
                country: country.toUpperCase(),
                homePage: option.service.homePage
              });
            }
          }
        });
      }
    }
    
    return services;
  };
  
  const services = getStreamingServices();

  // Função para obter URL do ícone do serviço
  const getServiceIcon = (serviceName) => {
    if (!serviceName) return null;
    
    // Remove espaços e caracteres especiais para comparação
    const name = serviceName.toLowerCase().trim().replace(/[^a-z0-9]/g, '');
    
    // Debug: log temporário para ver o nome exato e o ícone encontrado
    if (name.includes('disney') || name.includes('prime')) {
      console.log('Nome do serviço:', serviceName, '-> Normalizado:', name);
    }
    
    const iconMap = {
      'netflix': 'https://cdn.jsdelivr.net/npm/simple-icons@v9/icons/netflix.svg',
      'disneyplus': '/assets/Disney+_logo.svg',
      'disney': '/assets/Disney+_logo.svg',
      'amazonprimevideo': 'https://cdn.jsdelivr.net/npm/simple-icons@v9/icons/amazonprimevideo.svg',
      'primevideo': 'https://cdn.jsdelivr.net/npm/simple-icons@v9/icons/amazonprimevideo.svg',
      'prime': 'https://cdn.jsdelivr.net/npm/simple-icons@v9/icons/amazonprimevideo.svg',
      'hbomax': 'https://cdn.jsdelivr.net/npm/simple-icons@v9/icons/hbomax.svg',
      'hbo': 'https://cdn.jsdelivr.net/npm/simple-icons@v9/icons/hbo.svg',
      'max': 'https://cdn.jsdelivr.net/npm/simple-icons@v9/icons/hbomax.svg',
      'appletv': 'https://cdn.jsdelivr.net/npm/simple-icons@v9/icons/appletv.svg',
      'apple': 'https://cdn.jsdelivr.net/npm/simple-icons@v9/icons/appletv.svg',
      'paramountplus': 'https://cdn.jsdelivr.net/npm/simple-icons@v9/icons/paramountplus.svg',
      'paramount': 'https://cdn.jsdelivr.net/npm/simple-icons@v9/icons/paramountplus.svg',
      'hulu': 'https://cdn.jsdelivr.net/npm/simple-icons@v9/icons/hulu.svg',
      'peacock': 'https://cdn.jsdelivr.net/npm/simple-icons@v9/icons/peacock.svg',
      'starz': 'https://cdn.jsdelivr.net/npm/simple-icons@v9/icons/starz.svg',
      'showtime': 'https://cdn.jsdelivr.net/npm/simple-icons@v9/icons/showtime.svg',
      'crunchyroll': 'https://cdn.jsdelivr.net/npm/simple-icons@v9/icons/crunchyroll.svg',
      'youtube': 'https://cdn.jsdelivr.net/npm/simple-icons@v9/icons/youtube.svg',
      'youtubepremium': 'https://cdn.jsdelivr.net/npm/simple-icons@v9/icons/youtubepremium.svg',
      'globoplay': 'https://cdn.jsdelivr.net/npm/simple-icons@v9/icons/globoplay.svg',
      'star': 'https://cdn.jsdelivr.net/npm/simple-icons@v9/icons/star.svg',
    };
    
    // Tenta encontrar correspondência exata primeiro
    if (iconMap[name]) {
      if (name.includes('disney') || name.includes('prime')) {
        console.log('Ícone encontrado (exato):', iconMap[name]);
      }
      return iconMap[name];
    }
    
    // Depois tenta correspondência parcial (mais específica primeiro)
    const sortedKeys = Object.keys(iconMap).sort((a, b) => b.length - a.length);
    for (const key of sortedKeys) {
      if (name.includes(key) || key.includes(name)) {
        if (name.includes('disney') || name.includes('prime')) {
          console.log('Ícone encontrado (parcial):', key, '->', iconMap[key]);
        }
        return iconMap[key];
      }
    }
    
    if (name.includes('disney') || name.includes('prime')) {
      console.log('Nenhum ícone encontrado para:', name, 'chaves disponíveis:', Object.keys(iconMap));
    }
    
    return null;
  };

  // Função para obter cor de fundo baseada no nome do serviço
  const getServiceColor = (serviceName) => {
    const name = serviceName.toLowerCase();
    const colorMap = {
      'netflix': 'bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200 hover:bg-red-200 dark:hover:bg-red-800',
      'disney+': 'bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 hover:bg-blue-200 dark:hover:bg-blue-800',
      'disney plus': 'bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 hover:bg-blue-200 dark:hover:bg-blue-800',
      'prime video': 'bg-cyan-100 dark:bg-cyan-900 text-cyan-800 dark:text-cyan-200 hover:bg-cyan-200 dark:hover:bg-cyan-800',
      'amazon prime': 'bg-cyan-100 dark:bg-cyan-900 text-cyan-800 dark:text-cyan-200 hover:bg-cyan-200 dark:hover:bg-cyan-800',
      'hbo max': 'bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-200 hover:bg-purple-200 dark:hover:bg-purple-800',
      'hbo': 'bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-200 hover:bg-purple-200 dark:hover:bg-purple-800',
      'max': 'bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-200 hover:bg-purple-200 dark:hover:bg-purple-800',
      'apple tv': 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-600',
      'apple tv+': 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-600',
      'paramount+': 'bg-indigo-100 dark:bg-indigo-900 text-indigo-800 dark:text-indigo-200 hover:bg-indigo-200 dark:hover:bg-indigo-800',
      'paramount plus': 'bg-indigo-100 dark:bg-indigo-900 text-indigo-800 dark:text-indigo-200 hover:bg-indigo-200 dark:hover:bg-indigo-800',
      'hulu': 'bg-emerald-100 dark:bg-emerald-900 text-emerald-800 dark:text-emerald-200 hover:bg-emerald-200 dark:hover:bg-emerald-800',
      'peacock': 'bg-teal-100 dark:bg-teal-900 text-teal-800 dark:text-teal-200 hover:bg-teal-200 dark:hover:bg-teal-800',
      'starz': 'bg-pink-100 dark:bg-pink-900 text-pink-800 dark:text-pink-200 hover:bg-pink-200 dark:hover:bg-pink-800',
      'showtime': 'bg-orange-100 dark:bg-orange-900 text-orange-800 dark:text-orange-200 hover:bg-orange-200 dark:hover:bg-orange-800',
      'crunchyroll': 'bg-amber-100 dark:bg-amber-900 text-amber-800 dark:text-amber-200 hover:bg-amber-200 dark:hover:bg-amber-800',
      'youtube': 'bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200 hover:bg-red-200 dark:hover:bg-red-800',
      'youtube premium': 'bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200 hover:bg-red-200 dark:hover:bg-red-800',
      'globoplay': 'bg-lime-100 dark:bg-lime-900 text-lime-800 dark:text-lime-200 hover:bg-lime-200 dark:hover:bg-lime-800',
      'globoplay+': 'bg-lime-100 dark:bg-lime-900 text-lime-800 dark:text-lime-200 hover:bg-lime-200 dark:hover:bg-lime-800',
    };
    
    // Tenta encontrar correspondência exata ou parcial
    for (const [key, color] of Object.entries(colorMap)) {
      if (name.includes(key)) {
        return color;
      }
    }
    
    // Se não encontrar, usa uma cor padrão baseada no hash do nome
    const colors = [
      'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 hover:bg-green-200 dark:hover:bg-green-800',
      'bg-violet-100 dark:bg-violet-900 text-violet-800 dark:text-violet-200 hover:bg-violet-200 dark:hover:bg-violet-800',
      'bg-rose-100 dark:bg-rose-900 text-rose-800 dark:text-rose-200 hover:bg-rose-200 dark:hover:bg-rose-800',
      'bg-sky-100 dark:bg-sky-900 text-sky-800 dark:text-sky-200 hover:bg-sky-200 dark:hover:bg-sky-800',
      'bg-fuchsia-100 dark:bg-fuchsia-900 text-fuchsia-800 dark:text-fuchsia-200 hover:bg-fuchsia-200 dark:hover:bg-fuchsia-800',
    ];
    
    // Gera um índice baseado no nome do serviço para consistência
    let hash = 0;
    for (let i = 0; i < name.length; i++) {
      hash = ((hash << 5) - hash) + name.charCodeAt(i);
      hash = hash & hash;
    }
    return colors[Math.abs(hash) % colors.length];
  };

  return (
    <div className="bg-[var(--background)] h-fit border border-gray-300 dark:border-gray-600 rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-300">
      <div className="flex flex-col md:flex-row md:items-stretch">
        {/* Poster */}
        {posterUrl && (
          <div className="md:w-auto md:h-fit flex-shrink-0 bg-gray-100 dark:bg-gray-800 md:flex md:items-stretch">
            <img
              src={posterUrl}
              alt={title}
              className="w-full h-auto md:w-auto md:h-[441px] md:object-contain"
            />
          </div>
        )}

        {/* Conteúdo */}
        <div className="flex-1 p-6 flex flex-col">
          {/* Título e Ano */}
          <div className="mb-3">
            <h3 className="text-2xl font-bold text-[var(--foreground)] mb-1">
              {title}
            </h3>
            {originalTitle !== title && (
              <p className="text-sm text-gray-500 dark:text-gray-400 italic">
                {originalTitle}
              </p>
            )}
            <div className="flex items-center gap-4 mt-2 text-sm text-gray-600 dark:text-gray-400">
              {releaseYear && <span>{releaseYear}</span>}
              {runtime && <span>{runtime} min</span>}
              {rating && (
                <span className="flex items-center gap-1">
                  <span className="text-yellow-500">★</span>
                  {rating}%
                </span>
              )}
            </div>
          </div>

          {/* Gêneros */}
          {genres.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-3">
              {genres.map((genre, index) => (
                <span
                  key={index}
                  className="px-2 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 text-xs rounded-full"
                >
                  {genre.name || genre}
                </span>
              ))}
            </div>
          )}

          {/* Sinopse */}
          {overview && (
            <p className="text-sm text-gray-700 dark:text-gray-300 mb-4 line-clamp-3">
              {overview}
            </p>
          )}

          {/* Diretores e Elenco */}
          <div className="mb-4 space-y-2 text-sm">
            {directors.length > 0 && (
              <div>
                <span className="font-semibold text-[var(--foreground)]">Diretor{directors.length > 1 ? 'es' : ''}: </span>
                <span className="text-gray-600 dark:text-gray-400">
                  {directors.join(", ")}
                </span>
              </div>
            )}
            {cast.length > 0 && (
              <div>
                <span className="font-semibold text-[var(--foreground)]">Elenco: </span>
                <span className="text-gray-600 dark:text-gray-400">
                  {cast.slice(0, 5).join(", ")}
                  {cast.length > 5 && ` +${cast.length - 5} mais`}
                </span>
              </div>
            )}
          </div>

          {/* Streamings Disponíveis */}
          {services.length > 0 ? (
            <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
              <h4 className="font-semibold text-[var(--foreground)] mb-3">
                Disponível em:
              </h4>
              <div className="flex flex-wrap gap-2">
                {services.map((service, index) => {
                  // Traduz os tipos de streaming
                  const typeLabels = {
                    'subscription': 'Assinatura',
                    'rent': 'Alugar',
                    'buy': 'Comprar',
                    'free': 'Grátis',
                    'ads': 'Com anúncios',
                    'addon': 'Add-on'
                  };
                  
                  const typeLabel = service.type 
                    ? typeLabels[service.type.toLowerCase()] || service.type
                    : 'Disponível';
                  
                  const serviceColor = getServiceColor(service.name);
                  const serviceIcon = getServiceIcon(service.name);
                  
                  return (
                    <a
                      key={index}
                      href={service.link || service.videoLink || '#'}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={`flex flex-col items-center gap-1 px-3 py-2 rounded-lg text-sm transition-colors cursor-pointer ${serviceColor}`}
                      title={service.name}
                    >
                      {serviceIcon ? (
                        <img 
                          src={serviceIcon} 
                          alt={service.name}
                          className="w-8 h-8"
                          onError={(e) => {
                            // Se o ícone falhar ao carregar, mostra o nome
                            console.error('Erro ao carregar ícone:', serviceIcon, 'para serviço:', service.name);
                            e.target.style.display = 'none';
                            const nameSpan = e.target.nextElementSibling;
                            if (nameSpan) nameSpan.style.display = 'block';
                          }}
                          onLoad={() => {
                            if (service.name.toLowerCase().includes('disney') || service.name.toLowerCase().includes('prime')) {
                              console.log('Ícone carregado com sucesso:', serviceIcon, 'para:', service.name);
                            }
                          }}
                        />
                      ) : null}
                      <span className={`font-semibold capitalize ${serviceIcon ? 'hidden' : 'block'}`}>
                        {service.name}
                      </span>
                      <span className="text-xs opacity-75">{typeLabel}</span>
                      {service.quality && (
                        <span className="text-xs opacity-60">{service.quality.toUpperCase()}</span>
                      )}
                      {service.country && (
                        <span className="text-xs opacity-60">({service.country})</span>
                      )}
                    </a>
                  );
                })}
              </div>
            </div>
          ) : (
            <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
              <p className="text-sm text-gray-500 dark:text-gray-400 italic">
                Informações de streaming não disponíveis
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

