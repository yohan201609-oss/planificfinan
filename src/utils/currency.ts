import { CurrencyConfig } from '../types';

// Currency configuration and formatting utilities
export const CURRENCIES: Record<string, CurrencyConfig & { decimals: number }> = {
  EUR: { locale: 'es-ES', decimals: 2, name: 'Euro (EUR)', symbol: '€' },
  USD: { locale: 'en-US', decimals: 2, name: 'Dólar Estadounidense (USD)', symbol: '$' },
  DOP: { locale: 'es-DO', decimals: 2, name: 'Peso Dominicano (DOP)', symbol: 'RD$' },
  MXN: { locale: 'es-MX', decimals: 2, name: 'Peso Mexicano (MXN)', symbol: '$' },
  ARS: { locale: 'es-AR', decimals: 2, name: 'Peso Argentino (ARS)', symbol: '$' },
  COP: { locale: 'es-CO', decimals: 0, name: 'Peso Colombiano (COP)', symbol: '$' },
  CLP: { locale: 'es-CL', decimals: 0, name: 'Peso Chileno (CLP)', symbol: '$' },
  PEN: { locale: 'es-PE', decimals: 2, name: 'Sol Peruano (PEN)', symbol: 'S/' },
  GBP: { locale: 'en-GB', decimals: 2, name: 'Libra Esterlina (GBP)', symbol: '£' },
  CAD: { locale: 'en-CA', decimals: 2, name: 'Dólar Canadiense (CAD)', symbol: '$' },
  JPY: { locale: 'ja-JP', decimals: 0, name: 'Yen Japonés (JPY)', symbol: '¥' }
};

export const formatCurrency = (amount: number, currency: string = 'EUR'): string => {
  const config = CURRENCIES[currency] || CURRENCIES.EUR;
  return new Intl.NumberFormat(config.locale, {
    style: 'currency',
    currency: currency,
    minimumFractionDigits: config.decimals
  }).format(amount);
};

export const getCurrencyConfig = (currency: string): CurrencyConfig & { decimals: number } => {
  return CURRENCIES[currency] || CURRENCIES.EUR;
};

export const getCurrencyName = (currency: string): string => {
  return CURRENCIES[currency]?.name || currency;
};



