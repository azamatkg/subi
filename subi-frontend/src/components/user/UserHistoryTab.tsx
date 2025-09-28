import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { RotateCcw } from 'lucide-react';
import { useTranslation } from '@/hooks/useTranslation';

export const UserHistoryTab: React.FC = () => {
  const { t } = useTranslation();

  return (
    <Card>
      <CardHeader>
        <CardTitle className='flex items-center gap-2'>
          <RotateCcw className='h-5 w-5' />
          {t('userManagement.roleHistory')}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className='text-center py-12'>
          <RotateCcw className='h-12 w-12 text-muted-foreground/50 mx-auto mb-4' />
          <h3 className='text-lg font-medium text-muted-foreground mb-2'>
            {t('userManagement.roleHistoryNotAvailable')}
          </h3>
          <p className='text-sm text-muted-foreground max-w-md mx-auto'>
            {t('userManagement.roleHistoryNotAvailableDescription')}
          </p>
        </div>
      </CardContent>
    </Card>
  );
};