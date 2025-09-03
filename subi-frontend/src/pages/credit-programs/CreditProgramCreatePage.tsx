import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useTranslation } from '@/hooks/useTranslation';

export const CreditProgramCreatePage: React.FC = () => {
  const { t } = useTranslation();
  return (
    <Card>
      <CardHeader>
        <CardTitle>{t('creditProgram.newProgram')}</CardTitle>
      </CardHeader>
      <CardContent>
        <p>Функциональность в разработке</p>
      </CardContent>
    </Card>
  );
};