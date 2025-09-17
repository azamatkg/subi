import React from 'react';
import { Users, BarChart3, Shield, Key } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useTranslation } from '@/hooks/useTranslation';
import { useSetPageTitle } from '@/hooks/useSetPageTitle';
import { UserListPage } from './UserListPage';

export const UserManagementPage: React.FC = () => {
  const { t } = useTranslation();
  useSetPageTitle(t('navigation.userManagement'));

  return (
    <div className="container mx-auto py-6 space-y-6">
      <Tabs defaultValue="dashboard" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="dashboard" className="flex items-center gap-2">
            <BarChart3 className="h-4 w-4" />
            {t('userManagement.dashboard')}
          </TabsTrigger>
          <TabsTrigger value="users" className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            {t('userManagement.users')}
          </TabsTrigger>
          <TabsTrigger value="roles" className="flex items-center gap-2">
            <Shield className="h-4 w-4" />
            {t('userManagement.rolesList')}
          </TabsTrigger>
          <TabsTrigger value="permissions" className="flex items-center gap-2">
            <Key className="h-4 w-4" />
            {t('userManagement.permissions')}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="dashboard" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5" />
                {t('userManagement.dashboard')}
              </CardTitle>
              <CardDescription>
                Панель управления пользователями и аналитика
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-center h-32">
                <p className="text-muted-foreground">
                  Панель управления будет реализована позже
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="users" className="space-y-4">
          <UserListPage />
        </TabsContent>

        <TabsContent value="roles" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                {t('userManagement.rolesList')}
              </CardTitle>
              <CardDescription>
                Управление ролями пользователей
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-center h-32">
                <p className="text-muted-foreground">
                  Управление ролями будет реализовано позже
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="permissions" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Key className="h-5 w-5" />
                {t('userManagement.permissions')}
              </CardTitle>
              <CardDescription>
                Управление разрешениями системы
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-center h-32">
                <p className="text-muted-foreground">
                  Управление разрешениями будет реализовано позже
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};