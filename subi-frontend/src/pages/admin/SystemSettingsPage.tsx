import React from 'react';
import { useTranslation } from '@/hooks/useTranslation';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Settings } from 'lucide-react';

export const SystemSettingsPage: React.FC = () => {
  const { t } = useTranslation();

  return (
    <div className='container mx-auto p-6'>
      <div className='flex items-center gap-4 mb-6'>
        <Settings className='h-8 w-8 text-blue-500' />
        <div>
          <h1 className='text-3xl font-bold'>
            {t('navigation.systemSettings')}
          </h1>
          <p className='text-gray-500'>Настройки и конфигурация системы</p>
        </div>
      </div>

      <div className='grid gap-6 md:grid-cols-2'>
        <Card>
          <CardHeader>
            <CardTitle>Системные параметры</CardTitle>
            <CardDescription>Основные настройки работы системы</CardDescription>
          </CardHeader>
          <CardContent>
            <p className='text-gray-500'>
              Настройки системы находятся в разработке:
            </p>
            <ul className='mt-4 space-y-2 text-gray-600'>
              <li>• Параметры безопасности</li>
              <li>• Настройки уведомлений</li>
              <li>• Конфигурация бэкапа</li>
              <li>• Лимиты и ограничения</li>
            </ul>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Интеграции</CardTitle>
            <CardDescription>Настройки внешних интеграций</CardDescription>
          </CardHeader>
          <CardContent>
            <p className='text-gray-500'>Управление интеграциями:</p>
            <ul className='mt-4 space-y-2 text-gray-600'>
              <li>• API конфигурация</li>
              <li>• Внешние сервисы</li>
              <li>• Синхронизация данных</li>
              <li>• Мониторинг подключений</li>
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
