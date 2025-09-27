import React from 'react';
import {
  Home,
  Settings,
  Scale,
  CreditCard,
  Users,
  Database,
  FileText,
} from 'lucide-react';

export interface NavItem {
  title: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  roles?: string[];
  badge?: string | number;
  description?: string;
  isNew?: boolean;
  end?: boolean;
}

export interface NavSection {
  id?: string;
  title?: string;
  items: NavItem[];
}

export const navigationSections: NavSection[] = [
  {
    items: [
      {
        title: 'navigation.dashboard',
        href: '/dashboard',
        icon: Home,
        description: 'Главная панель управления',
      },
    ],
  },
  {
    id: 'administration',
    title: 'Администрирование системы',
    items: [
      {
        title: 'navigation.userManagement',
        href: '/admin/user-management',
        icon: Users,
        roles: ['ADMIN'],
        description: 'Управление пользователями',
      },
      {
        title: 'navigation.references',
        href: '/admin/reference-list',
        icon: Database,
        roles: ['ADMIN'],
        description: 'Справочники и данные',
      },
      {
        title: 'navigation.systemSettings',
        href: '/admin/settings',
        icon: Settings,
        roles: ['ADMIN'],
        description: 'Настройки системы',
      },
    ],
  },
  {
    id: 'credit-operations',
    title: 'Кредитные операции',
    items: [
      {
        title: 'navigation.applications',
        href: '/applications',
        icon: FileText,
        roles: ['CREDIT_ANALYST', 'DECISION_MAKER'],
        description: 'Заявки на кредит',
      },
      {
        title: 'navigation.creditPrograms',
        href: '/credit-programs',
        icon: CreditCard,
        roles: ['ADMIN', 'CREDIT_MANAGER', 'CREDIT_ANALYST'],
        description: 'Кредитные программы',
      },
      {
        title: 'navigation.decisions',
        href: '/decisions',
        icon: Scale,
        roles: ['ADMIN', 'DECISION_MAKER'],
        description: 'Решения по кредитам',
      },
      {
        title: 'navigation.commissionReviews',
        href: '/commission',
        icon: Users,
        roles: ['COMMISSION_MEMBER'],
        description: 'Комиссионные рассмотрения',
      },
    ],
  },
];
