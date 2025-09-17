import React from 'react';
import { useTranslation } from '@/hooks/useTranslation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Users, Calendar, CheckCircle, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';

export const CommissionReviewsPage: React.FC = () => {
  const { t } = useTranslation();

  return (
    <div className="container mx-auto p-6">
      <div className="flex items-center gap-4 mb-6">
        <Users className="h-8 w-8 text-blue-500" />
        <div>
          <h1 className="text-3xl font-bold">{t('navigation.commissionReviews')}</h1>
          <p className="text-gray-500">Комиссионные рассмотрения заявок</p>
        </div>
      </div>

      <div className="grid gap-6 mb-6 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Активные рассмотрения
            </CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">12</div>
            <p className="text-xs text-muted-foreground">
              Заявки на рассмотрении
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Завершенные
            </CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">45</div>
            <p className="text-xs text-muted-foreground">
              За текущий месяц
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Ближайшие заседания
            </CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">3</div>
            <p className="text-xs text-muted-foreground">
              На следующей неделе
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Комиссионные рассмотрения</CardTitle>
            <CardDescription>
              Многомембернальная оценка заявок с агрегацией финальных результатов
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-gray-500 mb-4">
              Страница находится в разработке. Будет реализовано:
            </p>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-4">
                <div className="p-4 border rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium">Многопользовательская оценка</span>
                    <Badge>Multi-user</Badge>
                  </div>
                  <p className="text-sm text-gray-600">
                    Возможность нескольким членам комиссии оценивать одну заявку
                  </p>
                </div>
                <div className="p-4 border rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium">Планирование заседаний</span>
                    <Badge variant="outline">Schedule</Badge>
                  </div>
                  <p className="text-sm text-gray-600">
                    Календарь заседаний комиссии с уведомлениями
                  </p>
                </div>
              </div>
              <div className="space-y-4">
                <div className="p-4 border rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium">Агрегация результатов</span>
                    <Badge variant="secondary">Analytics</Badge>
                  </div>
                  <p className="text-sm text-gray-600">
                    Автоматическое подведение итогов голосования комиссии
                  </p>
                </div>
                <div className="p-4 border rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium">История решений</span>
                    <Badge variant="outline">Archive</Badge>
                  </div>
                  <p className="text-sm text-gray-600">
                    Архив всех решений комиссии с возможностью поиска
                  </p>
                </div>
              </div>
            </div>
            <div className="mt-6 pt-4 border-t">
              <Button variant="outline" disabled>
                Запланировать заседание
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};