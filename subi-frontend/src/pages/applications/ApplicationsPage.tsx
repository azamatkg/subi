import React from 'react';
import { useTranslation } from '@/hooks/useTranslation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { FileText, Search, Filter, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';

export const ApplicationsPage: React.FC = () => {
  const { t } = useTranslation();

  return (
    <div className="container mx-auto p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <FileText className="h-8 w-8 text-blue-500" />
          <div>
            <h1 className="text-3xl font-bold">{t('navigation.applications')}</h1>
            <p className="text-gray-500">Управление заявками на кредит</p>
          </div>
        </div>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          Новая заявка
        </Button>
      </div>

      <div className="grid gap-6">
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Список заявок</CardTitle>
                <CardDescription>
                  Все заявки на кредитование с возможностью фильтрации и поиска
                </CardDescription>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" size="sm">
                  <Search className="h-4 w-4 mr-2" />
                  Поиск
                </Button>
                <Button variant="outline" size="sm">
                  <Filter className="h-4 w-4 mr-2" />
                  Фильтры
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-gray-500 mb-4">
              Страница находится в разработке. Будет реализовано:
            </p>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              <div className="p-4 border rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-medium">12-статусная схема</span>
                  <Badge variant="outline">Workflow</Badge>
                </div>
                <p className="text-sm text-gray-600">
                  Полный жизненный цикл заявки от подачи до выдачи кредита
                </p>
              </div>
              <div className="p-4 border rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-medium">Документооборот</span>
                  <Badge variant="outline">Docs</Badge>
                </div>
                <p className="text-sm text-gray-600">
                  Управление документами и шаблонами с версионностью
                </p>
              </div>
              <div className="p-4 border rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-medium">Массовые операции</span>
                  <Badge variant="outline">Bulk</Badge>
                </div>
                <p className="text-sm text-gray-600">
                  Групповое изменение статусов и назначение ответственных
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};