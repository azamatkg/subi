import { useTranslation as useI18nTranslation } from 'react-i18next';
import { Language } from '@/types';
import { STORAGE_KEYS } from '@/constants';

export const useTranslation = () => {
  const { t, i18n } = useI18nTranslation();

  const changeLanguage = (lng: Language) => {
    i18n.changeLanguage(lng);
    localStorage.setItem(STORAGE_KEYS.LANGUAGE, lng);
  };

  const currentLanguage = i18n.language as Language;

  // Helper function to format currency based on language
  const formatCurrency = (
    amount: number,
    currency: 'KGS' | 'USD' | 'EUR' = 'KGS'
  ) => {
    const locale =
      currentLanguage === Language.KG
        ? 'ky-KG'
        : currentLanguage === Language.RU
          ? 'ru-RU'
          : 'en-US';

    const currencyMap = {
      KGS: 'KGS',
      USD: 'USD',
      EUR: 'EUR',
    };

    const formatter = new Intl.NumberFormat(locale, {
      style: 'currency',
      currency: currencyMap[currency],
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    });

    return formatter.format(amount);
  };

  // Helper function to format numbers based on language
  const formatNumber = (num: number, options?: Intl.NumberFormatOptions) => {
    const locale =
      currentLanguage === Language.KG
        ? 'ky-KG'
        : currentLanguage === Language.RU
          ? 'ru-RU'
          : 'en-US';

    const formatter = new Intl.NumberFormat(locale, options);
    return formatter.format(num);
  };

  // Helper function to format dates based on language
  const formatDate = (
    date: Date | string,
    options?: Intl.DateTimeFormatOptions
  ) => {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    const locale =
      currentLanguage === Language.KG
        ? 'ky-KG'
        : currentLanguage === Language.RU
          ? 'ru-RU'
          : 'en-US';

    const defaultOptions: Intl.DateTimeFormatOptions = {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    };

    const formatter = new Intl.DateTimeFormat(
      locale,
      options || defaultOptions
    );
    return formatter.format(dateObj);
  };

  // Helper function to format date and time
  const formatDateTime = (date: Date | string) => {
    return formatDate(date, {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  // Helper function to format relative time
  const formatRelativeTime = (date: Date | string) => {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    const now = new Date();
    const diffInSeconds = Math.floor(
      (now.getTime() - dateObj.getTime()) / 1000
    );

    const intervals = [
      { label: t('time.years'), seconds: 31536000 },
      { label: t('time.months'), seconds: 2592000 },
      { label: t('time.weeks'), seconds: 604800 },
      { label: t('time.days'), seconds: 86400 },
      { label: t('time.hours'), seconds: 3600 },
      { label: t('time.minutes'), seconds: 60 },
      { label: t('time.seconds'), seconds: 1 },
    ];

    for (const interval of intervals) {
      const count = Math.floor(diffInSeconds / interval.seconds);
      if (count > 0) {
        return t('time.ago', { count, unit: interval.label });
      }
    }

    return t('time.justNow');
  };

  // Helper to get language-specific enum values
  const getEnumTranslation = (enumKey: string, enumValue: string) => {
    return t(`${enumKey}.${enumValue.toLowerCase()}`);
  };

  return {
    t,
    changeLanguage,
    currentLanguage,
    formatCurrency,
    formatNumber,
    formatDate,
    formatDateTime,
    formatRelativeTime,
    getEnumTranslation,
    isLoading: i18n.isInitialized === false,
  };
};
