import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Edit,
  Trash,
  Shield,
  Key,
  Users,
  Activity,
  MoreHorizontal,
  FileText,
  Calendar,
  User,
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { PageSkeleton } from '@/components/ui/skeleton';
import { ErrorFallback } from '@/components/ui/error-fallback';

import { useTranslation } from '@/hooks/useTranslation';
import { useSetPageTitle } from '@/hooks/useSetPageTitle';
import { useAuth } from '@/hooks/useAuth';
import { useGetRoleByIdQuery } from '@/store/api/roleApi';
import { RoleEditForm } from '@/components/roles/RoleEditForm';
import { RoleDeleteDialog } from '@/components/roles/RoleDeleteDialog';
import { SystemRoles } from '@/types/role';
import { ROUTES } from '@/constants';

export const RoleDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { hasAnyRole } = useAuth();

  // Validate ID parameter and redirect if invalid
  useEffect(() => {
    if (!id || id.trim() === '') {
      navigate(`${ROUTES.ADMIN}/user-management`, { replace: true });
      return;
    }
  }, [id, navigate]);

  // Dialog state
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  // API query
  const {
    data: role,
    isLoading,
    error,
  } = useGetRoleByIdQuery(id!, { skip: !id });

  useSetPageTitle(
    role ? `${role.name} - ${t('roleManagement.roleDetails')}` : t('roleManagement.roleDetails')
  );

  // Handle role actions
  const handleEdit = () => {
    setEditDialogOpen(true);
  };

  const handleDelete = () => {
    setDeleteDialogOpen(true);
  };

  const handleBackToRoles = () => {
    navigate(`${ROUTES.ADMIN}/user-management`);
  };

  const isSystemRole = (roleName: string) => {
    return SystemRoles.includes(roleName as typeof SystemRoles[number]);
  };

  const getRoleColor = (roleName: string): string => {
    const roleColors: Record<string, string> = {
      ADMIN: 'bg-red-100 text-red-800 border-red-200',
      CREDIT_MANAGER: 'bg-blue-100 text-blue-800 border-blue-200',
      CREDIT_ANALYST: 'bg-green-100 text-green-800 border-green-200',
      DECISION_MAKER: 'bg-purple-100 text-purple-800 border-purple-200',
      COMMISSION_MEMBER: 'bg-yellow-100 text-yellow-800 border-yellow-200',
      USER: 'bg-gray-100 text-gray-800 border-gray-200',
    };
    return roleColors[roleName] || roleColors.USER;
  };

  const canModifyRole = hasAnyRole(['ADMIN']);

  if (isLoading) {
    return <PageSkeleton />;
  }

  if (error) {
    return <ErrorFallback error={error as Error} type='network' />;
  }

  if (!role && !isLoading) {
    return (
      <ErrorFallback
        error={new Error(`Role not found with ID: ${id}`)}
        type='network'
      />
    );
  }

  return (
    <div className='space-y-6'>
      {/* Header with navigation and actions */}
      <div className='flex items-center justify-between'>
        <div className='flex items-center gap-4'>
          <Button
            variant='ghost'
            size='sm'
            onClick={handleBackToRoles}
            className='gap-2'
          >
            <ArrowLeft className='h-4 w-4' />
            {t('common.back')}
          </Button>

          {/* Role title with badge */}
          <div className='flex items-center gap-3'>
            <div className='flex items-center justify-center h-10 w-10 rounded-xl bg-gradient-to-br from-primary-100 to-primary-200 border border-primary-300 shadow-sm'>
              <Shield className='h-6 w-6 text-primary-700' />
            </div>
            <div>
              <h1 className='text-2xl font-bold text-foreground'>
                {role?.name}
              </h1>
              <div className='flex items-center gap-2 mt-1'>
                <Badge
                  variant='secondary'
                  className={`${getRoleColor(role?.name || '')} font-mono text-xs`}
                >
                  {role?.name}
                </Badge>
                {role && isSystemRole(role.name) && (
                  <Badge variant='outline' className='text-xs'>
                    {t('roleManagement.systemRole')}
                  </Badge>
                )}
              </div>
            </div>
          </div>
        </div>

        {canModifyRole && role && (
          <div className='flex items-center gap-2'>
            {!isSystemRole(role.name) && (
              <Button onClick={handleEdit} className='gap-2'>
                <Edit className='h-4 w-4' />
                {t('common.edit')}
              </Button>
            )}

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant='outline' size='icon'>
                  <MoreHorizontal className='h-4 w-4' />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align='end'>
                {!isSystemRole(role.name) && (
                  <>
                    <DropdownMenuItem onClick={handleEdit}>
                      <Edit className='mr-2 h-4 w-4' />
                      {t('roleManagement.editRole')}
                    </DropdownMenuItem>
                    <Separator />
                    <DropdownMenuItem
                      onClick={handleDelete}
                      className='text-destructive'
                    >
                      <Trash className='mr-2 h-4 w-4' />
                      {t('roleManagement.deleteRole')}
                    </DropdownMenuItem>
                  </>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        )}
      </div>

      {/* Main content tabs */}
      <Tabs defaultValue='details' className='w-full'>
        <TabsList className='flex w-full gap-1 justify-start'>
          <TabsTrigger value='details' className='flex-shrink-0'>
            <FileText className='h-4 w-4 mr-2' />
            {t('roleManagement.roleDetails')}
          </TabsTrigger>
          <TabsTrigger value='permissions' className='flex-shrink-0'>
            <Key className='h-4 w-4 mr-2' />
            {t('roleManagement.assignedPermissions')}
          </TabsTrigger>
          <TabsTrigger value='users' className='flex-shrink-0'>
            <Users className='h-4 w-4 mr-2' />
            {t('roleManagement.assignedUsers')}
          </TabsTrigger>
          <TabsTrigger value='activity' className='flex-shrink-0'>
            <Activity className='h-4 w-4 mr-2' />
            {t('common.activity')}
          </TabsTrigger>
        </TabsList>

        <TabsContent value='details' className='space-y-6'>
          <div className='grid grid-cols-1 lg:grid-cols-2 gap-6'>
            <Card>
              <CardHeader>
                <CardTitle className='flex items-center gap-2'>
                  <Shield className='h-5 w-5' />
                  {t('roleManagement.roleInformation')}
                </CardTitle>
              </CardHeader>
              <CardContent className='space-y-4'>
                <div>
                  <Label className='text-sm font-medium text-muted-foreground'>
                    {t('roleManagement.roleName')}
                  </Label>
                  <p className='text-base font-medium'>{role?.name}</p>
                </div>
                <div>
                  <Label className='text-sm font-medium text-muted-foreground'>
                    {t('roleManagement.roleDescription')}
                  </Label>
                  <p className='text-base'>
                    {role?.description || t('roleManagement.noDescription')}
                  </p>
                </div>
                <div>
                  <Label className='text-sm font-medium text-muted-foreground'>
                    {t('roleManagement.type')}
                  </Label>
                  <div className='flex items-center gap-2 mt-1'>
                    {role && isSystemRole(role.name) ? (
                      <Badge variant='secondary' className='text-xs'>
                        {t('roleManagement.systemRole')}
                      </Badge>
                    ) : (
                      <Badge variant='outline' className='text-xs'>
                        {t('roleManagement.customRole')}
                      </Badge>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className='flex items-center gap-2'>
                  <Calendar className='h-5 w-5' />
                  {t('roleManagement.metadata')}
                </CardTitle>
              </CardHeader>
              <CardContent className='space-y-4'>
                <div>
                  <Label className='text-sm font-medium text-muted-foreground'>
                    {t('roleManagement.roleId')}
                  </Label>
                  <p className='text-sm font-mono text-muted-foreground'>
                    {role?.id}
                  </p>
                </div>
                <div>
                  <Label className='text-sm font-medium text-muted-foreground'>
                    {t('common.created')}
                  </Label>
                  <p className='text-sm'>
                    {role?.createdAt
                      ? new Date(role.createdAt).toLocaleString()
                      : 'N/A'}
                  </p>
                </div>
                <div>
                  <Label className='text-sm font-medium text-muted-foreground'>
                    {t('roleManagement.lastUpdated')}
                  </Label>
                  <p className='text-sm'>
                    {role?.updatedAt
                      ? new Date(role.updatedAt).toLocaleString()
                      : 'N/A'}
                  </p>
                </div>
                <div>
                  <Label className='text-sm font-medium text-muted-foreground'>
                    {t('roleManagement.permissionsCount')}
                  </Label>
                  <p className='text-base font-medium'>
                    {role?.permissions.length || 0} {t('roleManagement.permissions')}
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value='permissions' className='space-y-6'>
          <Card>
            <CardHeader>
              <CardTitle className='flex items-center gap-2'>
                <Key className='h-5 w-5' />
                {t('roleManagement.assignedPermissions')} ({role?.permissions.length || 0})
              </CardTitle>
            </CardHeader>
            <CardContent>
              {role?.permissions && role.permissions.length > 0 ? (
                <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                  {role.permissions.map((permission) => (
                    <div
                      key={permission.id}
                      className='p-4 rounded-lg border bg-card hover:bg-accent/50 transition-colors'
                    >
                      <div className='flex items-start justify-between'>
                        <div className='flex-1'>
                          <h3 className='font-medium text-sm'>{permission.name}</h3>
                          {permission.description && (
                            <p className='text-xs text-muted-foreground mt-1'>
                              {permission.description}
                            </p>
                          )}
                        </div>
                        <Badge variant='outline' className='text-xs ml-2'>
                          {permission.name.split('_')[0]}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className='text-center py-12'>
                  <Key className='h-12 w-12 text-muted-foreground/50 mx-auto mb-4' />
                  <h3 className='text-lg font-medium text-muted-foreground mb-2'>
                    {t('roleManagement.noPermissions')}
                  </h3>
                  <p className='text-sm text-muted-foreground max-w-md mx-auto'>
                    {t('roleManagement.noPermissionsDescription')}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value='users' className='space-y-6'>
          <Card>
            <CardHeader>
              <CardTitle className='flex items-center gap-2'>
                <Users className='h-5 w-5' />
                {t('roleManagement.assignedUsers')}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className='text-center py-12'>
                <User className='h-12 w-12 text-muted-foreground/50 mx-auto mb-4' />
                <h3 className='text-lg font-medium text-muted-foreground mb-2'>
                  {t('roleManagement.userListNotAvailable')}
                </h3>
                <p className='text-sm text-muted-foreground max-w-md mx-auto'>
                  {t('roleManagement.userListNotAvailableDescription')}
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value='activity' className='space-y-6'>
          <Card>
            <CardHeader>
              <CardTitle className='flex items-center gap-2'>
                <Activity className='h-5 w-5' />
                {t('roleManagement.roleActivity')}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className='text-center py-12'>
                <Activity className='h-12 w-12 text-muted-foreground/50 mx-auto mb-4' />
                <h3 className='text-lg font-medium text-muted-foreground mb-2'>
                  {t('roleManagement.activityNotAvailable')}
                </h3>
                <p className='text-sm text-muted-foreground max-w-md mx-auto'>
                  {t('roleManagement.activityNotAvailableDescription')}
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Edit Dialog */}
      {role && (
        <RoleEditForm
          role={role}
          open={editDialogOpen}
          onOpenChange={setEditDialogOpen}
        />
      )}

      {/* Delete Dialog */}
      {role && (
        <RoleDeleteDialog
          role={role}
          open={deleteDialogOpen}
          onOpenChange={setDeleteDialogOpen}
        />
      )}
    </div>
  );
};