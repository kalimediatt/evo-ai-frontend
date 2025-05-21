export const getEnv = (key: string, defaultValue?: string): string => {
  if (typeof window !== 'undefined' && typeof window.__ENV === 'object') {
    return window.__ENV[key] || defaultValue || '';
  }
  return defaultValue || '';
};

export const getApiUrl = (): string => {
  return getEnv('NEXT_PUBLIC_API_URL', 'https://evo-ai.safeskale.com/');
};
