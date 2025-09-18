import React from 'react';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useTranslation } from '@/hooks/useTranslation';
import { PAGINATION } from '@/constants';

interface PaginationData {
  totalPages: number;
  number: number;
  numberOfElements: number;
  totalElements: number;
}

interface PaginationControlsProps {
  data: PaginationData;
  pageSize: number;
  onPageChange: (page: number) => void;
  onPageSizeChange: (size: number) => void;
  entityName?: string;
}

export const PaginationControls: React.FC<PaginationControlsProps> = ({
  data,
  pageSize,
  onPageChange,
  onPageSizeChange,
  entityName = 'items',
}) => {
  const { t } = useTranslation();

  const {
    totalPages,
    number: currentPage,
    numberOfElements,
    totalElements,
  } = data;

  const handlePageSizeChange = (value: string) => {
    onPageSizeChange(Number(value));
    onPageChange(0);
  };

  return (
    <div className='flex items-center justify-between'>
      <div className='flex-1 text-sm text-muted-foreground'>
        {t('common.showing')} {numberOfElements} {t('common.of')}{' '}
        {totalElements} {entityName}
      </div>
      <div className='flex items-center space-x-6 lg:space-x-8'>
        <div className='flex items-center space-x-2'>
          <p className='text-sm font-medium'>{t('common.rowsPerPage')}</p>
          <Select
            value={pageSize.toString()}
            onValueChange={handlePageSizeChange}
          >
            <SelectTrigger className='h-8 w-[70px]'>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {PAGINATION.PAGE_SIZE_OPTIONS.map(size => (
                <SelectItem key={size} value={size.toString()}>
                  {size}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className='flex w-[100px] items-center justify-center text-sm font-medium'>
          {t('common.page')} {currentPage + 1} {t('common.of')}{' '}
          {totalPages || 1}
        </div>
        <div className='flex items-center space-x-2'>
          <Button
            variant='outline'
            className='h-8 w-8 p-0'
            onClick={() => onPageChange(0)}
            disabled={currentPage === 0}
          >
            <span className='sr-only'>{t('common.first')}</span>
            ««
          </Button>
          <Button
            variant='outline'
            className='h-8 w-8 p-0'
            onClick={() => onPageChange(Math.max(0, currentPage - 1))}
            disabled={currentPage === 0}
          >
            <span className='sr-only'>{t('common.previous')}</span>«
          </Button>
          <Button
            variant='outline'
            className='h-8 w-8 p-0'
            onClick={() =>
              onPageChange(Math.min(totalPages - 1, currentPage + 1))
            }
            disabled={currentPage >= totalPages - 1}
          >
            <span className='sr-only'>{t('common.next')}</span>»
          </Button>
          <Button
            variant='outline'
            className='h-8 w-8 p-0'
            onClick={() => onPageChange(totalPages - 1)}
            disabled={currentPage >= totalPages - 1}
          >
            <span className='sr-only'>{t('common.last')}</span>
            »»
          </Button>
        </div>
      </div>
    </div>
  );
};
