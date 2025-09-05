import React, { useEffect, useState } from 'react';
import { NavLink } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useAuth } from '@/hooks/useAuth';
import { useTranslation } from '@/hooks/useTranslation';
import { useAppSelector, useAppDispatch } from '@/hooks/redux';
import { setSidebarOpen } from '@/store/slices/uiSlice';
import { ThemeToggle } from '@/components/ui/theme-toggle';
import { cn } from '@/lib/utils';
import {
  Home,
  Settings,
  ChevronLeft,
  Building2,
  Scale,
  Menu,
  X,
  LogOut,
  User,
  Bell,
  HelpCircle,
} from 'lucide-react';

interface NavItem {
  title: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  roles?: string[];
  badge?: string | number;
  description?: string;
  isNew?: boolean;
}

interface NavSection {
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
    title: 'Оформление документации',
    items: [
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
    title: 'Администрирование',
    items: [
      {
        title: 'navigation.admin',
        href: '/admin',
        icon: Settings,
        roles: ['ADMIN'],
        description: 'Системные настройки',
      },
    ],
  },
];

export const Sidebar: React.FC = () => {
  const { hasAnyRole, user, userDisplayName, logout } = useAuth();
  const { t } = useTranslation();
  const sidebarOpen = useAppSelector(state => state.ui.sidebarOpen);
  const dispatch = useAppDispatch();
  const [isMobile, setIsMobile] = useState(false);

  // Check mobile screen size
  useEffect(() => {
    const checkMobile = () => {
      const isMobileView = window.innerWidth < 1024;
      setIsMobile(isMobileView);

      // Auto-close sidebar on mobile when screen becomes smaller
      if (isMobileView && sidebarOpen) {
        dispatch(setSidebarOpen(false));
      }
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, [dispatch, sidebarOpen]);

  const toggleSidebar = () => {
    dispatch(setSidebarOpen(!sidebarOpen));
  };

  const closeSidebar = () => {
    if (isMobile) {
      dispatch(setSidebarOpen(false));
    }
  };

  // Get user initials for avatar
  const getInitials = (name?: string) => {
    if (!name) return 'U';
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase();
  };

  // Filter navigation items based on user roles
  const filteredSections = navigationSections
    .map(section => ({
      ...section,
      items: section.items.filter(item => {
        if (!item.roles) return true;
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
      <item.icon className="h-5 w-5 shrink-0" aria-hidden="true" />

      {!isCollapsed && (
        <>
          <div className="flex-1 truncate">
            <div className="truncate">{t(item.title)}</div>
            {item.description && (
              <div className="text-xs text-gray-400 truncate">
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
        <div className="absolute -right-1 -top-1">
          <Badge
            variant="default"
            className="h-5 w-5 p-0 text-xs flex items-center justify-center bg-red-500"
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
      {/* Mobile Menu Button */}
      <Button
        variant="ghost"
        size="sm"
        className={cn(
          'fixed top-4 left-4 z-50 lg:hidden',
          'h-10 w-10 p-0 bg-gray-900/80 backdrop-blur-sm border border-gray-800 shadow-md',
          sidebarOpen && 'bg-gray-800 border-gray-700'
        )}
        onClick={toggleSidebar}
        aria-label={sidebarOpen ? 'Закрыть меню' : 'Открыть меню'}
      >
        {sidebarOpen ? (
          <X className="h-5 w-5 text-gray-200" />
        ) : (
          <Menu className="h-5 w-5 text-gray-200" />
        )}
      </Button>

      {/* Enhanced Sidebar */}
      <aside
        className={cn(
          'fixed top-0 left-0 z-40 h-screen transition-all duration-300 ease-in-out',
          'border-r border-gray-800',
          'lg:translate-x-0',
          sidebarOpen ? 'translate-x-0' : '-translate-x-full',
          isMobile ? 'w-80' : sidebarOpen ? 'w-72' : 'w-16'
        )}
        role="navigation"
        aria-label="Главное навигационное меню"
      >
        <div className="flex h-full flex-col bg-gray-800">
          {/* Enhanced Header */}
          <div className="flex items-center justify-between p-4 h-16 border-b border-gray-800 bg-gray-900 relative">
            <div className="flex items-center gap-3">
            </div>
            
            {(sidebarOpen || isMobile) && (
              <div className="absolute left-0 right-0 flex justify-center">
                <h1 className="text-lg font-semibold text-white">АСУБК</h1>
              </div>
            )}

            {/* Desktop collapse button */}
            {!isMobile && (
              <Button
                variant="ghost"
                size="sm"
                onClick={toggleSidebar}
                className="h-8 w-8 p-0 hover:bg-gray-800 rounded-full border border-gray-700 shadow-sm z-10"
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
          <div className="flex-1 overflow-y-auto p-3 space-y-1">
            {filteredSections.map((section, sectionIndex) => (
              <div key={sectionIndex} className="space-y-1">
                {section.title && (sidebarOpen || isMobile) && (
                  <>
                    <div className="px-3 py-2">
                      <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
                        {section.title}
                      </h3>
                    </div>
                  </>
                )}

                <nav className="space-y-0.5">
                  {section.items.map(item => (
                    <EnhancedNavLink
                      key={item.href}
                      item={item}
                      isCollapsed={!sidebarOpen && !isMobile}
                    />
                  ))}
                </nav>

                {sectionIndex < filteredSections.length - 1 && (
                  <Separator className="my-3 bg-gray-800" />
                )}
              </div>
            ))}
          </div>

          {/* Enhanced Footer */}
          <div className="border-t border-gray-800 bg-gray-900">
            {/* User Profile */}
            <div className="p-3 border-t border-gray-800 bg-gray-900">
              {!sidebarOpen && !isMobile ? (
                <div className="flex justify-center gap-1">
                  <ThemeToggle variant="ghost" size="sm" className="h-10 w-10 p-0 rounded-full text-gray-200 hover:bg-gray-800" />
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="ghost"
                        className="h-10 w-10 p-0 rounded-full"
                        aria-label="Меню пользователя"
                      >
                        <Avatar className="h-8 w-8">
                          <AvatarFallback className="bg-blue-900/50 text-blue-400 text-sm font-semibold">
                            {getInitials(userDisplayName)}
                          </AvatarFallback>
                        </Avatar>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent
                      side="right"
                      className="w-56 ml-2 bg-gray-800 border-gray-700"
                    >
                      <div className="px-2 py-1.5">
                        <p className="font-medium text-white">
                          {userDisplayName}
                        </p>
                        <p className="text-sm text-gray-400">
                          {user?.roles?.[0] || 'Пользователь'}
                        </p>
                      </div>
                      <DropdownMenuSeparator className="bg-gray-700" />
                      <DropdownMenuItem className="text-gray-200 focus:bg-gray-700 focus:text-white">
                        <User className="mr-2 h-4 w-4" />
                        Профиль
                      </DropdownMenuItem>
                      <DropdownMenuItem className="text-gray-200 focus:bg-gray-700 focus:text-white">
                        <Bell className="mr-2 h-4 w-4" />
                        Уведомления
                      </DropdownMenuItem>
                      <DropdownMenuItem className="text-gray-200 focus:bg-gray-700 focus:text-white">
                        <HelpCircle className="mr-2 h-4 w-4" />
                        Помощь
                      </DropdownMenuItem>
                      <DropdownMenuSeparator className="bg-gray-700" />
                      <DropdownMenuItem
                        onClick={logout}
                        className="text-destructive focus:text-destructive"
                      >
                        <LogOut className="mr-2 h-4 w-4" />
                        Выход
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              ) : (
                <div className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-800/50 transition-colors">
                    <Avatar className="h-10 w-10">
                      <AvatarFallback className="bg-blue-900/50 text-blue-400 font-semibold">
                        {getInitials(userDisplayName)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-white truncate">
                        {userDisplayName}
                      </p>
                      <p className="text-xs text-gray-400 truncate">
                        {user?.roles?.[0] || 'Пользователь'}
                      </p>
                    </div>
                    <div className="flex items-center gap-1">
                      <ThemeToggle variant="ghost" size="sm" className="h-8 w-8 p-0 text-gray-200 hover:bg-gray-800" />
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 w-8 p-0 text-gray-200 hover:bg-gray-800"
                            aria-label="Меню пользователя"
                          >
                            <Settings className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent
                          side="right"
                          className="w-48 bg-gray-800 border-gray-700"
                        >
                          <DropdownMenuItem className="text-gray-200 focus:bg-gray-700 focus:text-white">
                            <User className="mr-2 h-4 w-4" />
                            Профиль
                          </DropdownMenuItem>
                          <DropdownMenuItem className="text-gray-200 focus:bg-gray-700 focus:text-white">
                            <Bell className="mr-2 h-4 w-4" />
                            Уведомления
                          </DropdownMenuItem>
                          <DropdownMenuItem className="text-gray-200 focus:bg-gray-700 focus:text-white">
                            <HelpCircle className="mr-2 h-4 w-4" />
                            Помощь
                          </DropdownMenuItem>
                          <DropdownMenuSeparator className="bg-gray-700" />
                          <DropdownMenuItem
                            onClick={logout}
                            className="text-destructive focus:text-destructive"
                          >
                            <LogOut className="mr-2 h-4 w-4" />
                            Выход
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>
              )}
            </div>

            {/* Footer Info */}
            {(sidebarOpen || isMobile) && (
              <div className="px-3 py-2 border-t border-gray-800 bg-gray-900">
                <div className="text-xs text-gray-400 space-y-1">
                  <div className="flex items-center justify-between">
                    <span>ASUBK Financial</span>
                    <Badge
                      variant="outline"
                      className="text-xs px-1 border-gray-700 text-gray-400"
                    >
                      v1.0.0
                    </Badge>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </aside>

      {/* Mobile Overlay */}
      {sidebarOpen && isMobile && (
        <div
          className="fixed inset-0 bg-black/50 z-30 lg:hidden"
          onClick={closeSidebar}
          aria-hidden="true"
        />
      )}
    </>
  );
};
