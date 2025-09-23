import React from 'react';
import { Shield } from 'lucide-react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { useTranslation } from '@/hooks/useTranslation';

export const RolesTabContent: React.FC = () => {
  const { t } = useTranslation();

  return (
    <Card>
      <CardHeader>
        <CardTitle className='flex items-center gap-2'>
          <Shield className='h-5 w-5' />
          {t('userManagement.rolesList')}
        </CardTitle>
        <CardDescription>
          {t('userManagement.rolesManagementDescription')}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className='flex items-center justify-center h-32'>
          <p className='text-muted-foreground'>
            {t('userManagement.rolesManagementComingSoon')}
          </p>
        </div>
      </CardContent>
    </Card>
  );
};
