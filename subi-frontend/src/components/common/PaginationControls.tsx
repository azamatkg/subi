import React from 'react';
import { Button } from '@/components/ui/button';
import { useTranslation } from '@/hooks/useTranslation';

interface PaginationControlsProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  disabled?: boolean;
}

export const PaginationControls: React.FC<PaginationControlsProps> = ({
  currentPage,
  totalPages,
  onPageChange,
  disabled = false,
}) => {
  const { t } = useTranslation();

  const handleFirstPage = () => onPageChange(0);
  const handlePreviousPage = () => onPageChange(Math.max(0, currentPage - 1));
  const handleNextPage = () => onPageChange(Math.min(totalPages - 1, currentPage + 1));
  const handleLastPage = () => onPageChange(totalPages - 1);

  const isFirstPage = currentPage === 0;
  const isLastPage = currentPage >= totalPages - 1;

  return (
    <div className="flex items-center justify-center space-x-2">
      <Button
        variant="outline"
        size="sm"
        onClick={handleFirstPage}
        disabled={disabled || isFirstPage}
      >
        <span className="sr-only">{t('common.first')}</span>
        ««
      </Button>

      <Button
        variant="outline"
        size="sm"
        onClick={handlePreviousPage}
        disabled={disabled || isFirstPage}
      >
        <span className="sr-only">{t('common.previous')}</span>
        ‹
      </Button>

      <div className="flex items-center px-4 text-sm font-medium">
        {t('common.page')} {currentPage + 1} {t('common.of')} {totalPages}
      </div>

      <Button
        variant="outline"
        size="sm"
        onClick={handleNextPage}
        disabled={disabled || isLastPage}
      >
        <span className="sr-only">{t('common.next')}</span>
        ›
      </Button>

      <Button
        variant="outline"
        size="sm"
        onClick={handleLastPage}
        disabled={disabled || isLastPage}
      >
        <span className="sr-only">{t('common.last')}</span>
        »»
      </Button>
    </div>
  );
};