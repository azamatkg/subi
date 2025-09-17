import React from 'react';
import { useTranslation } from '@/hooks/useTranslation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Database } from 'lucide-react';

export const ReferencesPage: React.FC = () => {
  const { t } = useTranslation();

  return (
    <div className="container mx-auto p-6">
      <div className="flex items-center gap-4 mb-6">
        <Database className="h-8 w-8 text-blue-500" />
        <div>
          <h1 className="text-3xl font-bold">{t('navigation.references')}</h1>
          <p className="text-gray-500">Управление справочниками и системными данными</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Справочники системы</CardTitle>
          <CardDescription>
            Здесь будет располагаться управление справочниками системы
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-gray-500">
            Страница находится в разработке. Будет реализовано управление:
          </p>
          <ul className="mt-4 space-y-2 text-gray-600">
            <li>• Справочники регионов и городов</li>
            <li>• Типы документов</li>
            <li>• Категории клиентов</li>
            <li>• Настройки процентных ставок</li>
            <li>• Шаблоны документов</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
};