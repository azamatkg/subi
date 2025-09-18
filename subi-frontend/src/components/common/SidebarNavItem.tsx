import React from 'react';
import { NavLink } from 'react-router-dom';
import { Badge } from '@/components/ui/badge';
import { useTranslation } from '@/hooks/useTranslation';
import { cn } from '@/lib/utils';
import { NavItem } from '@/constants/navigation';

interface SidebarNavItemProps {
  item: NavItem;
  isCollapsed: boolean;
  onItemClick: () => void;
}

export const SidebarNavItem: React.FC<SidebarNavItemProps> = ({
  item,
  isCollapsed,
  onItemClick,
}) => {
  const { t } = useTranslation();

  return (
    <NavLink
      to={item.href}
      end={item.end}
      onClick={onItemClick}
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
};