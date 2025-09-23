import React from 'react';
import { Key } from 'lucide-react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { useTranslation } from '@/hooks/useTranslation';

export const PermissionsTabContent: React.FC = () => {
  const { t } = useTranslation();

  return (
    <Card>
      <CardHeader>
        <CardTitle className='flex items-center gap-2'>
          <Key className='h-5 w-5' />
          {t('userManagement.permissions')}
        </CardTitle>
        <CardDescription>
          {t('userManagement.permissionsManagementDescription')}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className='flex items-center justify-center h-32'>
          <p className='text-muted-foreground'>
            {t('userManagement.permissionsManagementComingSoon')}
          </p>
        </div>
      </CardContent>
    </Card>
  );
};
