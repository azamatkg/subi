import type { ReferenceListResponseDto } from '@/types/reference';

// Static reference types data - shows reference categories/types, not individual entities
// Based on the existing ReferencesPage structure but with extended properties for list functionality
export const referenceEntitiesData: ReferenceListResponseDto[] = [
  {
    id: '1',
    entityType: 'CURRENCIES',
    nameEn: 'Currencies',
    nameRu: 'Валюты',
    nameKg: 'Валюталар',
    description: 'Manage system currencies and exchange rates',
    status: 'ACTIVE',
    isAvailable: true,
    adminOnly: true,
    route: '/admin/currencies',
    createdAt: '2024-01-15T10:30:00Z',
    updatedAt: '2024-03-10T14:20:00Z',
    createdByUsername: 'admin',
    updatedByUsername: 'admin',
  },
  {
    id: '2',
    entityType: 'CREDIT_PURPOSES',
    nameEn: 'Credit Purposes',
    nameRu: 'Цели кредитования',
    nameKg: 'Кредит максаттары',
    description: 'Define available credit purposes and categories',
    status: 'INACTIVE',
    isAvailable: false,
    adminOnly: false,
    route: '/admin/credit-purposes',
    createdAt: '2024-02-01T09:15:00Z',
    updatedAt: '2024-02-15T16:45:00Z',
    createdByUsername: 'system',
    updatedByUsername: 'credit_manager',
  },
  {
    id: '3',
    entityType: 'DOCUMENT_TYPES',
    nameEn: 'Document Types',
    nameRu: 'Типы документов',
    nameKg: 'Документ түрлөрү',
    description: 'Configure document types and requirements',
    status: 'INACTIVE',
    isAvailable: false,
    adminOnly: false,
    route: '/admin/document-types',
    createdAt: '2024-01-20T11:00:00Z',
    updatedAt: '2024-02-28T13:30:00Z',
    createdByUsername: 'admin',
    updatedByUsername: 'document_admin',
  },
  {
    id: '4',
    entityType: 'DECISION_MAKING_BODIES',
    nameEn: 'Decision Making Bodies',
    nameRu: 'Органы принятия решений',
    nameKg: 'Чечим кабыл алуучу органдар',
    description: 'Manage decision-making bodies and committees',
    status: 'ACTIVE',
    isAvailable: true,
    adminOnly: true,
    route: '/admin/decision-making-bodies',
    createdAt: '2024-01-10T08:45:00Z',
    updatedAt: '2024-03-15T12:10:00Z',
    createdByUsername: 'admin',
    updatedByUsername: 'admin',
  },
  {
    id: '5',
    entityType: 'DECISION_TYPES',
    nameEn: 'Decision Types',
    nameRu: 'Типы решений',
    nameKg: 'Чечим түрлөрү',
    description: 'Define types of decisions and processes',
    status: 'ACTIVE',
    isAvailable: true,
    adminOnly: true,
    route: '/admin/decision-types',
    createdAt: '2024-01-12T10:20:00Z',
    updatedAt: '2024-03-08T15:55:00Z',
    createdByUsername: 'admin',
    updatedByUsername: 'decision_admin',
  },
  {
    id: '6',
    entityType: 'FLOATING_RATE_TYPES',
    nameEn: 'Floating Rate Types',
    nameRu: 'Типы плавающих ставок',
    nameKg: 'Калкып жүргөн ставка түрлөрү',
    description: 'Configure floating interest rate types',
    status: 'INACTIVE',
    isAvailable: false,
    adminOnly: false,
    route: '/admin/floating-rate-types',
    createdAt: '2024-02-05T14:10:00Z',
    updatedAt: '2024-02-20T11:30:00Z',
    createdByUsername: 'rate_admin',
    updatedByUsername: 'rate_admin',
  },
  {
    id: '7',
    entityType: 'REPAYMENT_ORDERS',
    nameEn: 'Repayment Orders',
    nameRu: 'Порядки погашения',
    nameKg: 'Төлөм тартиптери',
    description: 'Define repayment order rules and schedules',
    status: 'INACTIVE',
    isAvailable: false,
    adminOnly: true,
    route: '/admin/repayment-orders',
    createdAt: '2024-01-25T16:40:00Z',
    updatedAt: '2024-03-12T09:25:00Z',
    createdByUsername: 'admin',
    updatedByUsername: 'payment_admin',
  },
];

// Helper function to get entity icon
export const getEntityTypeIcon = (entityType: string): string => {
  switch (entityType) {
    case 'CURRENCIES':
      return '💱';
    case 'CREDIT_PURPOSES':
      return '🎯';
    case 'DOCUMENT_TYPES':
      return '📄';
    case 'DECISION_MAKING_BODIES':
      return '👥';
    case 'DECISION_TYPES':
      return '⚖️';
    case 'FLOATING_RATE_TYPES':
      return '📈';
    case 'REPAYMENT_ORDERS':
      return '💰';
    default:
      return '📋';
  }
};

// Helper function to get entity type name translation key
export const getEntityTypeTranslationKey = (entityType: string): string => {
  const key = entityType.toLowerCase().replace(/_/g, '');
  return `references.filters.entityTypes.${key}`;
};

// Function to filter and paginate reference entities (client-side)
export interface ReferenceListParams {
  page?: number;
  size?: number;
  searchTerm?: string;
  entityType?: string;
  status?: string;
  isAvailable?: boolean;
  createdDateFrom?: string;
  createdDateTo?: string;
  updatedDateFrom?: string;
  updatedDateTo?: string;
  sortField?: string;
  sortDirection?: 'asc' | 'desc';
  userRoles?: string[];
}

export interface PaginatedReferenceResult {
  content: ReferenceListResponseDto[];
  totalElements: number;
  totalPages: number;
  page: number;
  size: number;
  first: boolean;
  last: boolean;
  numberOfElements: number;
}

export const getFilteredReferenceEntities = (params: ReferenceListParams): PaginatedReferenceResult => {
  const {
    page = 0,
    size = 20,
    searchTerm = '',
    entityType,
    status,
    isAvailable,
    createdDateFrom,
    createdDateTo,
    updatedDateFrom,
    updatedDateTo,
    sortField = 'nameEn',
    sortDirection = 'asc',
    userRoles = [],
  } = params;

  const isAdmin = userRoles.includes('ADMIN');

  // Filter data
  const filtered = referenceEntitiesData.filter(entity => {
    // Role-based filtering
    if (entity.adminOnly && !isAdmin) {
      return false;
    }

    // Search term filtering
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      const matchesSearch =
        entity.nameEn.toLowerCase().includes(searchLower) ||
        entity.nameRu.toLowerCase().includes(searchLower) ||
        entity.nameKg.toLowerCase().includes(searchLower) ||
        entity.description?.toLowerCase().includes(searchLower) ||
        entity.entityType.toLowerCase().includes(searchLower);

      if (!matchesSearch) return false;
    }

    // Entity type filtering
    if (entityType && entity.entityType !== entityType) {
      return false;
    }

    // Status filtering
    if (status && entity.status !== status) {
      return false;
    }

    // Availability filtering
    if (isAvailable !== undefined && entity.isAvailable !== isAvailable) {
      return false;
    }

    // Date range filtering
    if (createdDateFrom && new Date(entity.createdAt) < new Date(createdDateFrom)) {
      return false;
    }
    if (createdDateTo && new Date(entity.createdAt) > new Date(createdDateTo)) {
      return false;
    }
    if (updatedDateFrom && new Date(entity.updatedAt) < new Date(updatedDateFrom)) {
      return false;
    }
    if (updatedDateTo && new Date(entity.updatedAt) > new Date(updatedDateTo)) {
      return false;
    }

    return true;
  });

  // Sort data
  filtered.sort((a, b) => {
    let aValue: unknown = a[sortField as keyof ReferenceListResponseDto];
    let bValue: unknown = b[sortField as keyof ReferenceListResponseDto];

    // Handle date sorting
    if (sortField === 'createdAt' || sortField === 'updatedAt') {
      aValue = new Date(aValue as string).getTime();
      bValue = new Date(bValue as string).getTime();
    }

    // Handle string sorting
    if (typeof aValue === 'string' && typeof bValue === 'string') {
      aValue = aValue.toLowerCase();
      bValue = bValue.toLowerCase();
    }

    if (aValue < bValue) return sortDirection === 'asc' ? -1 : 1;
    if (aValue > bValue) return sortDirection === 'asc' ? 1 : -1;
    return 0;
  });

  // Calculate pagination
  const totalElements = filtered.length;
  const totalPages = Math.ceil(totalElements / size);
  const startIndex = page * size;
  const endIndex = startIndex + size;
  const content = filtered.slice(startIndex, endIndex);

  return {
    content,
    totalElements,
    totalPages,
    page,
    size,
    first: page === 0,
    last: page >= totalPages - 1,
    numberOfElements: content.length,
  };
};