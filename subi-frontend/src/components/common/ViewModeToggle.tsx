import React from 'react';
import { Grid, List } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { useTranslation } from '@/hooks/useTranslation';
import type { ViewMode } from '@/types/reference';

interface ViewModeToggleProps {
  viewMode: ViewMode;
  onViewModeChange: (mode: ViewMode) => void;
  disabled?: boolean;
}

export const ViewModeToggle: React.FC<ViewModeToggleProps> = ({
  viewMode,
  onViewModeChange,
  disabled = false,
}) => {
  const { t } = useTranslation();

  return (
    <TooltipProvider>
      <div className="flex items-center border rounded-md">
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant={viewMode === 'CARD' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => onViewModeChange('CARD')}
              disabled={disabled}
              className="rounded-r-none border-r"
            >
              <Grid className="h-4 w-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>{t('common.cardView')}</p>
          </TooltipContent>
        </Tooltip>

        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant={viewMode === 'TABLE' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => onViewModeChange('TABLE')}
              disabled={disabled}
              className="rounded-l-none"
            >
              <List className="h-4 w-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>{t('common.tableView')}</p>
          </TooltipContent>
        </Tooltip>
      </div>
    </TooltipProvider>
  );
};