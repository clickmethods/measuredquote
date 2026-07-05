import { useState, useCallback } from 'react';
import type { Language } from '@/data/translations';

export function useLanguage(): Language {
  // Default to English; can be extended to read from URL/localStorage
  const [lang] = useState<Language>('en');
  return lang;
}

export function useLanguageToggle(): { lang: Language; setLang: (l: Language) => void; toggle: () => void } {
  const [lang, setLang] = useState<Language>('en');
  const toggle = useCallback(() => {
    setLang((prev) => (prev === 'en' ? 'es' : 'en'));
  }, []);
  return { lang, setLang, toggle };
}
