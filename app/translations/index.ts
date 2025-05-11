export const translations = {
  en: {
    title: "Is it on Hydra?",
    subtitle: "Your ultimate game search engine. Fast, reliable, and always up to date.",
    searchPlaceholder: "Search for any game...",
    discoverBadge: "Search Games in Sources",
    features: {
      fast: {
        title: "Lightning Fast",
        description: "Instant search results"
      },
      smart: {
        title: "Smart Search",
        description: "Filter by your favorite sources"
      },
      reliable: {
        title: "Reliable",
        description: "Always up to date"
      }
    },
    credits: "Created by Moyase",
    search: {
      loading: "Searching games",
      loadingSubtext: "This might take a moment",
      resultsFound: "Found {count} results for",
      noResults: "No results found for",
      date: "Date",
      sources: "Sources"
    },
    sources: "Sources",
    filter: {
      selectAll: "Select All",
      clearAll: "Clear All"
    },
    gameResult: {
      select: "Select",
      copy: "Copy",
      copied: "Copied!",
      selectVersion: "Select Version",
      cancel: "Cancel"
    },
    announcement: {
      title: "New Feature: Multiple Source Versions",
      message: `Hello, this is Moyase! I've recently added the ability to choose different versions of sources. This update was implemented specifically for our Russian users who can't access hydralinks.cloud.

If you're from Russia, please select the Russian version of the source for it to work properly with Hydra.

The source versions are identical but hosted on different servers. Russian users can't access hydralinks.cloud because it uses Cloudflare, which is restricted in Russia.

Thank you for reading!
With love,
Moyase`
    },
    common: {
      close: 'Close',
    },
  },
  pt: {
    title: "Está no Hydra?",
    subtitle: "Seu mecanismo de busca definitivo para jogos. Rápido, confiável e sempre atualizado.",
    searchPlaceholder: "Pesquisar qualquer jogo...",
    discoverBadge: "Procure Jogos nas Fontes",
    features: {
      fast: {
        title: "Super Rápido",
        description: "Resultados instantâneos"
      },
      smart: {
        title: "Busca Inteligente",
        description: "Filtre por suas fontes favoritas"
      },
      reliable: {
        title: "Confiável",
        description: "Sempre atualizado"
      }
    },
    credits: "Criado por Moyase",
    search: {
      loading: "Procurando jogos",
      loadingSubtext: "Isso pode levar um momento",
      resultsFound: "Encontrados {count} resultados para",
      noResults: "Nenhum resultado encontrado para",
      date: "Data",
      sources: "Fontes"
    },
    sources: "Fontes",
    filter: {
      selectAll: "Selecionar Tudo",
      clearAll: "Limpar Tudo"
    },
    gameResult: {
      select: "Selecionar",
      copy: "Copiar",
      copied: "Copiado!",
      selectVersion: "Selecionar Versão",
      cancel: "Cancelar"
    },
    announcement: {
      title: "Nova Funcionalidade: Múltiplas Versões de Fontes",
      message: `Olá, aqui é o Moyase! Recentemente, adicionei a capacidade de escolher diferentes versões das fontes. Esta atualização foi implementada especificamente para nossos usuários russos que não conseguem acessar o hydralinks.cloud.

Se você é da Rússia, por favor, selecione a versão russa da fonte para que funcione corretamente com o Hydra.

As versões das fontes são idênticas, mas estão hospedadas em servidores diferentes. Usuários russos não conseguem acessar o hydralinks.cloud porque ele usa Cloudflare, que é restrito na Rússia.

Obrigado por ler!
Com amor,
Moyase`
    },
    common: {
      close: 'Close',
    },
  },
  ru: {
    title: "Is it on Hydra?",
    subtitle: "Твой универсальный поиск игр. Быстрый, надежный и всегда актуальный.",
    searchPlaceholder: "Поиск любой игры...",
    discoverBadge: "Ищите Игры в Источниках",
    features: {
      fast: {
        title: "Быстрый",
        description: "Получите результаты поиска мгновенно"
      },
      smart: {
        title: "Умный поиск",
        description: "Фильтр по вашим любимым источникам"
      },
      reliable: {
        title: "Надежный",
        description: "Всегда актуальный"
      }
    },
    credits: "Создано Moyase",
    search: {
      loading: "Поиск игр",
      loadingSubtext: "Это может занять некоторое время",
      resultsFound: "Найдено {count} результатов для",
      noResults: "Нет результатов для",
      date: "Дата",
      sources: "Источники"
    },
    sources: "Источники",
    filter: {
      selectAll: "Выбрать все",
      clearAll: "Очистить все"
    },
    gameResult: {
      select: "Выбрать",
      copy: "Копировать",
      copied: "Скопировано!",
      selectVersion: "Выберите версию",
      cancel: "Отмена"
    },
    announcement: {
      title: "Новая функция: Разные версии источников",
      message: `Привет, это Moyase! Недавно я добавил возможность выбора разных версий источников. Это обновление было реализовано специально для наших пользователей из России, у которых нет доступа к hydralinks.cloud.

Если вы из России, пожалуйста, выбирайте русскую версию источника, чтобы он корректно работал с Hydra.

Версии источников идентичны, но размещены на разных серверах. Пользователи из России не могут получить доступ к hydralinks.cloud, так как сайт использует Cloudflare, который ограничен в России.

Спасибо за внимание!
С любовью,
Moyase`
    },
    common: {
      close: 'Закрыть',
    },
  }
}

export type Language = keyof typeof translations 