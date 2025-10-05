import React from 'react';
import { Maximize, Minimize } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useLayout } from '@/hooks/useLayout';
import { useTranslation } from '@/hooks/useTranslation';
import type { LayoutMode } from '@/lib/layout';

interface LayoutToggleProps {
  variant?: 'default' | 'ghost' | 'outline';
  size?: 'sm' | 'default' | 'lg';
  className?: string;
}

export function LayoutToggle({
  variant = 'ghost',
  size = 'default',
  className,
}: LayoutToggleProps) {
  const { layoutMode, setLayoutMode } = useLayout();
  const { t } = useTranslation();

  const getLayoutIcon = (mode: LayoutMode) => {
    switch (mode) {
      case 'boxed':
        return <Minimize className='h-4 w-4' aria-hidden='true' />;
      case 'full':
        return <Maximize className='h-4 w-4' aria-hidden='true' />;
      default:
        return <Minimize className='h-4 w-4' aria-hidden='true' />;
    }
  };

  const getLayoutLabel = (mode: LayoutMode) => {
    return t(`layout.${mode}`);
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant={variant}
          size={size}
          className={className}
          aria-label={`${t('layout.current')}: ${getLayoutLabel(layoutMode)}`}
        >
          {getLayoutIcon(layoutMode)}
          <span className='sr-only'>{t('layout.toggle')}</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align='end'
        className='min-w-[140px] bg-gray-800 border-gray-700'
      >
        <DropdownMenuItem
          onClick={() => setLayoutMode('boxed')}
          className='gap-2 cursor-pointer text-gray-200 focus:bg-gray-700 focus:text-white'
          aria-selected={layoutMode === 'boxed'}
        >
          <Minimize className='h-4 w-4' aria-hidden='true' />
          <span>{t('layout.boxed')}</span>
          {layoutMode === 'boxed' && (
            <span className='ml-auto text-xs text-muted-foreground'>✓</span>
          )}
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => setLayoutMode('full')}
          className='gap-2 cursor-pointer text-gray-200 focus:bg-gray-700 focus:text-white'
          aria-selected={layoutMode === 'full'}
        >
          <Maximize className='h-4 w-4' aria-hidden='true' />
          <span>{t('layout.full')}</span>
          {layoutMode === 'full' && (
            <span className='ml-auto text-xs text-muted-foreground'>✓</span>
          )}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

/**
 * Simple layout toggle button that cycles between modes
 */
export function SimpleLayoutToggle({ className }: { className?: string }) {
  const { layoutMode, setLayoutMode } = useLayout();
  const { t } = useTranslation();

  const cycleLayout = () => {
    setLayoutMode(layoutMode === 'boxed' ? 'full' : 'boxed');
  };

  return (
    <Button
      variant='ghost'
      size='sm'
      onClick={cycleLayout}
      className={className}
      aria-label={`${t('layout.current')}: ${t(`layout.${layoutMode}`)}. ${t('layout.clickToToggle')}`}
    >
      {layoutMode === 'boxed' && <Minimize className='h-4 w-4' />}
      {layoutMode === 'full' && <Maximize className='h-4 w-4' />}
      <span className='sr-only'>{t('layout.toggle')}</span>
    </Button>
  );
}
