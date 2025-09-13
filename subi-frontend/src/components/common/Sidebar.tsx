import React, { useEffect, useRef, useState } from 'react';
import { NavLink } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import { useAuth } from '@/hooks/useAuth';
import { LanguageSwitcher } from './LanguageSwitcher';
import { useTranslation } from '@/hooks/useTranslation';
import { useAppDispatch, useAppSelector } from '@/hooks/redux';
import { setSidebarOpen } from '@/store/slices/uiSlice';
import { ThemeToggle } from '@/components/ui/theme-toggle';
import { cn } from '@/lib/utils';
import {
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  CreditCard,
  Home,
  Scale,
  Settings,
  Users,
} from 'lucide-react';

interface NavItem {
  title: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  roles?: string[];
  badge?: string | number;
  description?: string;
  isNew?: boolean;
  end?: boolean;
}

interface NavSection {
  id?: string;
  title?: string;
  items: NavItem[];
}

const navigationSections: NavSection[] = [
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
    id: 'credit-management',
    title: 'Кредитное управление',
    items: [
      {
        title: 'navigation.creditPrograms',
        href: '/credit-programs',
        icon: CreditCard,
        roles: ['ADMIN', 'CREDIT_MANAGER', 'CREDIT_ANALYST'],
        description: 'Управление кредитными программами',
      },
      {
        title: 'navigation.decisions',
        href: '/decisions',
        icon: Scale,
        roles: ['ADMIN', 'DECISION_MAKER'],
        description: 'Основания на выдачу кредита',
      },
    ],
  },
  {
    id: 'administration',
    title: 'Администрирование',
    items: [
      {
        title: 'navigation.userManagement',
        href: '/admin/users',
        icon: Users,
        roles: ['ADMIN'],
        description: 'Управление пользователями',
      },
      {
        title: 'navigation.admin',
        href: '/admin',
        icon: Settings,
        roles: ['ADMIN'],
        description: 'Системные настройки',
        end: true,
      },
    ],
  },
];

export const Sidebar: React.FC = () => {
  const { hasAnyRole } = useAuth();
  const { t } = useTranslation();
  const sidebarOpen = useAppSelector(state => state.ui.sidebarOpen);
  const dispatch = useAppDispatch();
  const [isMobile, setIsMobile] = useState(false);
  const previousMobileRef = useRef(false);

  // Accordion state management with localStorage persistence - single section only
  const [expandedSection, setExpandedSection] = useState<string | null>(() => {
    try {
      const saved = localStorage.getItem('sidebar-expanded-section');
      if (saved) {
        return JSON.parse(saved);
      }
    } catch (error) {
      console.warn('Failed to load sidebar state from localStorage:', error);
    }
    // Default: credit-management section expanded
    return 'credit-management';
  });

  // Initial mobile setup - runs only once
  useEffect(() => {
    const isMobileView = window.innerWidth < 1024;
    setIsMobile(isMobileView);
    previousMobileRef.current = isMobileView;

    // Auto-close on initial load if mobile
    if (isMobileView) {
      dispatch(setSidebarOpen(false));
    }
  }, [dispatch]); // Only depends on dispatch - runs once

  // Handle window resize
  useEffect(() => {
    const checkMobile = () => {
      const wasMobile = previousMobileRef.current;
      const isMobileView = window.innerWidth < 1024;
      setIsMobile(isMobileView);
      previousMobileRef.current = isMobileView;

      // Auto-close sidebar only when transitioning from desktop to mobile
      if (!wasMobile && isMobileView && sidebarOpen) {
        dispatch(setSidebarOpen(false));
      }
    };

    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, [dispatch, sidebarOpen]); // This can depend on sidebarOpen since it only runs on resize

  const toggleSidebar = () => {
    dispatch(setSidebarOpen(!sidebarOpen));
  };

  const closeSidebar = () => {
    if (isMobile) {
      dispatch(setSidebarOpen(false));
    }
  };

  // Toggle section expansion with localStorage persistence - single section accordion
  const toggleSection = (sectionId: string) => {
    setExpandedSection(prev => {
      // If clicking the currently expanded section, collapse it
      // If clicking a different section, expand it (auto-collapses others)
      const newExpanded = prev === sectionId ? null : sectionId;

      // Save to localStorage
      try {
        localStorage.setItem(
          'sidebar-expanded-section',
          JSON.stringify(newExpanded)
        );
      } catch (error) {
        console.warn('Failed to save sidebar state to localStorage:', error);
      }

      return newExpanded;
    });
  };

  // Filter navigation items based on user roles
  const filteredSections = navigationSections
    .map(section => ({
      ...section,
      items: section.items.filter(item => {
        if (!item.roles) {
          return true;
        }
        return hasAnyRole(item.roles);
      }),
    }))
    .filter(section => section.items.length > 0);

  // Enhanced NavLink component
  const EnhancedNavLink: React.FC<{ item: NavItem; isCollapsed: boolean }> = ({
    item,
    isCollapsed,
  }) => (
    <NavLink
      to={item.href}
      end={item.end}
      onClick={closeSidebar}
      className={({ isActive }) =>
        cn(
          'group relative flex items-center gap-3 px-3 py-2.5 text-sm font-medium rounded-lg transition-all duration-200',
          'hover:bg-gray-800 hover:text-white',
          'focus:outline-none focus:ring-2 focus:ring-gray-700 focus:ring-offset-2 focus:ring-offset-gray-900',
          isActive ? 'bg-blue-900/50 text-white shadow-sm' : 'text-gray-200',
          isCollapsed && 'justify-center px-2'
        )
      }
      aria-label={isCollapsed ? t(item.title) : undefined}
      title={isCollapsed ? item.description : undefined}
    >
      <item.icon className='h-5 w-5 shrink-0' aria-hidden='true' />

      {!isCollapsed && (
        <>
          <div className='flex-1 truncate'>
            <div className='truncate'>{t(item.title)}</div>
            {item.description && (
              <div className='text-xs text-gray-400 truncate'>
                {item.description}
              </div>
            )}
          </div>

          {item.badge && (
            <Badge
              variant={item.isNew ? 'default' : 'secondary'}
              className={cn(
                'text-xs px-1.5 py-0.5 h-auto',
                item.isNew && 'bg-emerald-500 text-white animate-pulse'
              )}
            >
              {item.badge}
            </Badge>
          )}
        </>
      )}

      {/* Tooltip for collapsed state */}
      {isCollapsed && item.badge && (
        <div className='absolute -right-1 -top-1'>
          <Badge
            variant='default'
            className='h-5 w-5 p-0 text-xs flex items-center justify-center bg-red-500'
          >
            {typeof item.badge === 'number' && item.badge > 9
              ? '9+'
              : item.badge}
          </Badge>
        </div>
      )}
    </NavLink>
  );

  return (
    <>
      {/* Enhanced Sidebar */}
      <aside
        className={cn(
          'fixed top-0 left-0 z-40 h-screen transition-all duration-300 ease-in-out',
          'border-r border-gray-800',
          'lg:translate-x-0',
          sidebarOpen ? 'translate-x-0' : '-translate-x-full',
          isMobile ? 'w-80' : sidebarOpen ? 'w-72' : 'w-16'
        )}
        role='navigation'
        aria-label='Главное навигационное меню'
      >
        <div className='flex h-full flex-col bg-gray-800'>
          {/* Enhanced Header */}
          <div className='flex items-center justify-between p-4 h-16 border-b border-gray-800 bg-gray-900 relative'>
            <div className='flex items-center gap-3'></div>

            {(sidebarOpen || isMobile) && (
              <div className='absolute left-0 right-0 flex justify-center'>
                <h1 className='text-lg font-semibold text-white'>АСУБК</h1>
              </div>
            )}

            {/* Desktop collapse button */}
            {!isMobile && (
              <Button
                variant='ghost'
                size='sm'
                onClick={toggleSidebar}
                className='h-8 w-8 p-0 hover:bg-gray-800 rounded-full border border-gray-700 shadow-sm z-10'
                aria-label={sidebarOpen ? 'Свернуть меню' : 'Развернуть меню'}
              >
                <ChevronLeft
                  className={cn(
                    'h-4 w-4 transition-transform text-gray-200',
                    !sidebarOpen && 'rotate-180'
                  )}
                />
              </Button>
            )}
          </div>

          {/* Enhanced Navigation */}
          <div className='flex-1 overflow-y-auto p-3 space-y-1'>
            {filteredSections.map((section, sectionIndex) => (
              <div key={section.id || sectionIndex} className='space-y-1'>
                {section.title ? (
                  // Collapsible section
                  <Collapsible
                    open={section.id ? expandedSection === section.id : true}
                    onOpenChange={() => section.id && toggleSection(section.id)}
                  >
                    {sidebarOpen || isMobile ? (
                      // Full width trigger when sidebar is expanded
                      <CollapsibleTrigger asChild>
                        <Button
                          variant='ghost'
                          className='w-full justify-between px-3 py-2 h-auto text-xs font-semibold text-gray-400 uppercase tracking-wider hover:bg-gray-700 hover:text-gray-300 transition-colors'
                        >
                          <span>{section.title}</span>
                          {section.id && (
                            <ChevronDown
                              className={cn(
                                'h-4 w-4 transition-transform duration-200',
                                expandedSection === section.id
                                  ? 'rotate-0'
                                  : '-rotate-90'
                              )}
                            />
                          )}
                        </Button>
                      </CollapsibleTrigger>
                    ) : (
                      // Icon-only trigger when sidebar is collapsed
                      <CollapsibleTrigger asChild>
                        <Button
                          variant='ghost'
                          size='sm'
                          className='w-full h-8 p-0 hover:bg-gray-700 transition-colors'
                          title={section.title}
                        >
                          <ChevronRight
                            className={cn(
                              'h-4 w-4 transition-transform duration-200',
                              section.id && expandedSection === section.id
                                ? 'rotate-90'
                                : 'rotate-0'
                            )}
                          />
                        </Button>
                      </CollapsibleTrigger>
                    )}

                    <CollapsibleContent className='space-y-0.5'>
                      <nav className='space-y-0.5 mt-1'>
                        {section.items.map(item => (
                          <EnhancedNavLink
                            key={item.href}
                            item={item}
                            isCollapsed={!sidebarOpen && !isMobile}
                          />
                        ))}
                      </nav>
                    </CollapsibleContent>
                  </Collapsible>
                ) : (
                  // Non-collapsible section (like Dashboard)
                  <nav className='space-y-0.5'>
                    {section.items.map(item => (
                      <EnhancedNavLink
                        key={item.href}
                        item={item}
                        isCollapsed={!sidebarOpen && !isMobile}
                      />
                    ))}
                  </nav>
                )}

                {sectionIndex < filteredSections.length - 1 && (
                  <Separator className='my-3 bg-gray-800' />
                )}
              </div>
            ))}
          </div>

          {/* Enhanced Footer */}
          <div className='border-t border-gray-800 bg-gray-900'>
            {/* Language and Theme Controls */}
            <div className='p-3'>
              {!sidebarOpen && !isMobile ? (
                <div className='flex justify-center gap-1'>
                  <LanguageSwitcher
                    variant='ghost'
                    size='sm'
                    className='h-10 w-10 p-0 rounded-full text-gray-200 hover:bg-gray-800'
                  />
                  <ThemeToggle
                    variant='ghost'
                    size='sm'
                    className='h-10 w-10 p-0 rounded-full text-gray-200 hover:bg-gray-800'
                  />
                </div>
              ) : (
                <div className='flex items-center justify-center gap-2'>
                  <LanguageSwitcher
                    variant='ghost'
                    size='sm'
                    className='h-10 w-10 p-0 text-gray-200 hover:bg-gray-800'
                    showText={false}
                  />
                  <ThemeToggle
                    variant='ghost'
                    size='sm'
                    className='h-10 w-10 p-0 text-gray-200 hover:bg-gray-800'
                  />
                </div>
              )}
            </div>
          </div>
        </div>
      </aside>

      {/* Mobile Overlay */}
      {sidebarOpen && isMobile && (
        <div
          className='fixed inset-0 bg-black/50 z-30 lg:hidden'
          onClick={closeSidebar}
          aria-hidden='true'
        />
      )}
    </>
  );
};
