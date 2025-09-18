import React from 'react';
import { Users, BarChart3, Shield, Key } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useTranslation } from '@/hooks/useTranslation';
import { useSetPageTitle } from '@/hooks/useSetPageTitle';
import { UserListPage } from './UserListPage';
import { UserManagementDashboard } from '@/components/dashboard/UserManagementDashboard';
import { RolesTabContent } from '@/components/admin/RolesTabContent';
import { PermissionsTabContent } from '@/components/admin/PermissionsTabContent';


export const UserManagementPage: React.FC = () => {
  const { t } = useTranslation();
  useSetPageTitle(t('navigation.userManagement'));

  return (
    <div className="container mx-auto py-6 space-y-6">
      <Tabs defaultValue="dashboard" className="space-y-6">
        <TabsList className="inline-flex items-center justify-start max-w-fit">
          <TabsTrigger value="dashboard" className="flex items-center gap-2">
            <BarChart3 className="h-4 w-4" />
            {/*{t('userManagement.tabs.dashboard')}*/}
          </TabsTrigger>
          <TabsTrigger value="users" className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            {t('userManagement.tabs.users')}
          </TabsTrigger>
          <TabsTrigger value="roles" className="flex items-center gap-2">
            <Shield className="h-4 w-4" />
            {t('userManagement.tabs.roles')}
          </TabsTrigger>
          <TabsTrigger value="permissions" className="flex items-center gap-2">
            <Key className="h-4 w-4" />
            {t('userManagement.tabs.permissions')}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="dashboard" className="space-y-6">
          <UserManagementDashboard />
        </TabsContent>

        <TabsContent value="users" className="space-y-4">
          <UserListPage />
        </TabsContent>

        <TabsContent value="roles" className="space-y-4">
          <RolesTabContent />
        </TabsContent>

        <TabsContent value="permissions" className="space-y-4">
          <PermissionsTabContent />
        </TabsContent>
      </Tabs>
    </div>
  );
};