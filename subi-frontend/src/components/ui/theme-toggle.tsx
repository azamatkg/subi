import React from 'react';
import { Moon, Sun, Monitor } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useTheme } from '@/hooks/useTheme';
import type { Theme } from '@/lib/theme';

interface ThemeToggleProps {
  variant?: 'default' | 'ghost' | 'outline';
  size?: 'sm' | 'default' | 'lg';
  className?: string;
}

export function ThemeToggle({
  variant = 'ghost',
  size = 'default',
  className,
}: ThemeToggleProps) {
  const { theme, setTheme } = useTheme();

  const getThemeIcon = (selectedTheme: Theme) => {
    switch (selectedTheme) {
      case 'light':
        return <Sun className="h-4 w-4" aria-hidden="true" />;
      case 'dark':
        return <Moon className="h-4 w-4" aria-hidden="true" />;
      case 'system':
        return <Monitor className="h-4 w-4" aria-hidden="true" />;
      default:
        return <Monitor className="h-4 w-4" aria-hidden="true" />;
    }
  };

  const getThemeLabel = (selectedTheme: Theme) => {
    switch (selectedTheme) {
      case 'light':
        return 'Светлая тема';
      case 'dark':
        return 'Темная тема';
      case 'system':
        return 'Системная тема';
      default:
        return 'Системная тема';
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant={variant}
          size={size}
          className={className}
          aria-label={`Текущая тема: ${getThemeLabel(theme)}`}
        >
          {getThemeIcon(theme)}
          <span className="sr-only">Переключить тему</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="min-w-[140px] bg-gray-800 border-gray-700">
        <DropdownMenuItem
          onClick={() => setTheme('light')}
          className="gap-2 cursor-pointer text-gray-200 focus:bg-gray-700 focus:text-white"
          aria-selected={theme === 'light'}
        >
          <Sun className="h-4 w-4" aria-hidden="true" />
          <span>Светлая</span>
          {theme === 'light' && (
            <span className="ml-auto text-xs text-muted-foreground">✓</span>
          )}
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => setTheme('dark')}
          className="gap-2 cursor-pointer text-gray-200 focus:bg-gray-700 focus:text-white"
          aria-selected={theme === 'dark'}
        >
          <Moon className="h-4 w-4" aria-hidden="true" />
          <span>Темная</span>
          {theme === 'dark' && (
            <span className="ml-auto text-xs text-muted-foreground">✓</span>
          )}
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => setTheme('system')}
          className="gap-2 cursor-pointer text-gray-200 focus:bg-gray-700 focus:text-white"
          aria-selected={theme === 'system'}
        >
          <Monitor className="h-4 w-4" aria-hidden="true" />
          <span>Системная</span>
          {theme === 'system' && (
            <span className="ml-auto text-xs text-muted-foreground">✓</span>
          )}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

/**
 * Simple theme toggle button that cycles through themes
 */
export function SimpleThemeToggle({ className }: { className?: string }) {
  const { theme, setTheme } = useTheme();

  const cycleTheme = () => {
    const themeOrder: Theme[] = ['light', 'dark', 'system'];
    const currentIndex = themeOrder.indexOf(theme);
    const nextIndex = (currentIndex + 1) % themeOrder.length;
    setTheme(themeOrder[nextIndex]);
  };

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={cycleTheme}
      className={className}
      aria-label={`Текущая тема: ${theme}. Нажмите чтобы переключить`}
    >
      {theme === 'light' && <Sun className="h-4 w-4" />}
      {theme === 'dark' && <Moon className="h-4 w-4" />}
      {theme === 'system' && <Monitor className="h-4 w-4" />}
      <span className="sr-only">Переключить тему</span>
    </Button>
  );
}
