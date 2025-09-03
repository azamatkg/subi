import React from 'react';
import { NavLink } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { useAuth } from '@/hooks/useAuth';
import { useTranslation } from '@/hooks/useTranslation';
import { useAppSelector, useAppDispatch } from '@/hooks/redux';
import { setSidebarOpen } from '@/store/slices/uiSlice';
import { cn } from '@/lib/utils';
import { 
  Home, 
  FileText, 
  CreditCard, 
  FolderOpen, 
  Users, 
  Settings,
  ChevronLeft,
  Building2
} from 'lucide-react';

interface NavItem {
  title: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  roles?: string[];
}

const navigationItems: NavItem[] = [
  {
    title: 'navigation.dashboard',
    href: '/dashboard',
    icon: Home,
  },
  {
    title: 'navigation.applications',
    href: '/applications',
    icon: FileText,
  },
  {
    title: 'navigation.creditPrograms',
    href: '/credit-programs',
    icon: CreditCard,
  },
  {
    title: 'navigation.documents',
    href: '/documents',
    icon: FolderOpen,
  },
  {
    title: 'navigation.commissions',
    href: '/commissions',
    icon: Users,
    roles: ['ADMIN', 'CREDIT_ANALYST', 'COMMISSION_MEMBER'],
  },
  {
    title: 'navigation.admin',
    href: '/admin',
    icon: Settings,
    roles: ['ADMIN'],
  },
];

export const Sidebar: React.FC = () => {
  const { hasAnyRole } = useAuth();
  const { t } = useTranslation();
  const sidebarOpen = useAppSelector((state) => state.ui.sidebarOpen);
  const dispatch = useAppDispatch();

  const toggleSidebar = () => {
    dispatch(setSidebarOpen(!sidebarOpen));
  };

  const filteredItems = navigationItems.filter((item) => {
    if (!item.roles) return true;
    return hasAnyRole(item.roles);
  });

  return (
    <>
      {/* Sidebar */}
      <aside
        className={cn(
          'fixed top-0 left-0 z-50 h-screen transition-all duration-300 bg-sidebar border-r border-sidebar-border',
          sidebarOpen ? 'w-64' : 'w-16'
        )}
      >
        <div className="flex h-full flex-col">
          {/* Header */}
          <div className="flex items-center justify-between p-4 h-14 border-b border-sidebar-border">
            <div className={cn('flex items-center gap-2', !sidebarOpen && 'justify-center')}>
              <Building2 className="h-6 w-6 text-sidebar-primary" />
              {sidebarOpen && (
                <span className="font-semibold text-sidebar-foreground">ASUBK</span>
              )}
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={toggleSidebar}
              className="h-8 w-8 p-0 hover:bg-sidebar-accent"
            >
              <ChevronLeft
                className={cn(
                  'h-4 w-4 transition-transform text-sidebar-foreground',
                  !sidebarOpen && 'rotate-180'
                )}
              />
            </Button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-2">
            <ul className="space-y-1">
              {filteredItems.map((item) => (
                <li key={item.href}>
                  <NavLink
                    to={item.href}
                    className={({ isActive }) =>
                      cn(
                        'flex items-center gap-3 px-3 py-2 text-sm rounded-md transition-all hover:bg-sidebar-accent hover:text-sidebar-accent-foreground group',
                        isActive
                          ? 'bg-sidebar-primary text-sidebar-primary-foreground'
                          : 'text-sidebar-foreground',
                        !sidebarOpen && 'justify-center px-2'
                      )
                    }
                  >
                    <item.icon className="h-4 w-4 shrink-0" />
                    {sidebarOpen && (
                      <span className="truncate">{t(item.title)}</span>
                    )}
                  </NavLink>
                </li>
              ))}
            </ul>
          </nav>

          {/* Footer */}
          <div className="p-4 border-t border-sidebar-border">
            {sidebarOpen && (
              <div className="text-xs text-sidebar-foreground/60">
                <p>ASUBK Financial Management</p>
                <p>v1.0.0</p>
              </div>
            )}
          </div>
        </div>
      </aside>

      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => dispatch(setSidebarOpen(false))}
        />
      )}
    </>
  );
};