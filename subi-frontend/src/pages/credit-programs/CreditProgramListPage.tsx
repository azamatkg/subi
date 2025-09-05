import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useTranslation } from '@/hooks/useTranslation';
import { useSetPageTitle } from '@/hooks/useSetPageTitle';
import { CreditCard } from 'lucide-react';

export const CreditProgramListPage: React.FC = () => {
  const { t } = useTranslation();
  useSetPageTitle('Кредитные программы');

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">
          {t('creditProgram.programs')}
        </h1>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Кредитные программы</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">
            <CreditCard className="mx-auto h-12 w-12 mb-4 opacity-50" />
            <p>Функциональность в разработке</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
