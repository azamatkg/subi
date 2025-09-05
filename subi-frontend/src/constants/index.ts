// Application constants
export const APP_NAME = 'ASUBK Financial Management System';

// API Configuration
export const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api';

// Local Storage Keys
export const STORAGE_KEYS = {
  ACCESS_TOKEN: 'access_token',
  REFRESH_TOKEN: 'refresh_token',
  USER_DATA: 'user_data',
  LANGUAGE: 'language',
  THEME: 'theme',
} as const;

// Route paths
export const ROUTES = {
  HOME: '/',
  LOGIN: '/login',
  DASHBOARD: '/dashboard',
  APPLICATIONS: '/applications',
  CREDIT_PROGRAMS: '/credit-programs',
  DOCUMENTS: '/documents',
  COMMISSIONS: '/commissions',
  ADMIN: '/admin',
  DECISIONS: '/decisions',
  DECISION_TYPES: '/admin/decision-types',
  DECISION_MAKING_BODIES: '/admin/decision-making-bodies',
} as const;

// Default pagination settings
export const PAGINATION = {
  DEFAULT_PAGE_SIZE: 20,
  PAGE_SIZE_OPTIONS: [10, 20, 50, 100],
} as const;

// Form validation rules
export const VALIDATION = {
  TIN_LENGTH: 14,
  PHONE_PATTERN: /^\+996\d{9}$/,
  MIN_LOAN_AMOUNT: 1000,
  MIN_MONTHLY_PAYMENT: 1000,
} as const;
