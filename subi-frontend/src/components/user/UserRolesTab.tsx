import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Shield } from 'lucide-react';
import { useTranslation } from '@/hooks/useTranslation';
import type { UserResponseDto } from '@/types/user';

interface RoleObject {
  name?: string;
  role?: string;
}

interface UserRolesTabProps {
  user: UserResponseDto;
}

export const UserRolesTab: React.FC<UserRolesTabProps> = ({ user }) => {
  const { t } = useTranslation();

  // Validate user data and roles
  if (!user) {
    console.error('UserRolesTab: No user data provided');
    return (
      <div className='text-center py-8'>
        <p className='text-muted-foreground'>{t('common.noDataAvailable')}</p>
      </div>
    );
  }

  const userRoles = Array.isArray(user.roles) ? user.roles : [];

  if (userRoles.length === 0) {
    console.warn('UserRolesTab: User has no roles assigned:', user.id);
  }

  const getRoleColor = (role: string): string => {
    const roleColors: Record<string, string> = {
      ADMIN: 'bg-red-100 text-red-800 border-red-200',
      CREDIT_MANAGER: 'bg-blue-100 text-blue-800 border-blue-200',
      CREDIT_ANALYST: 'bg-green-100 text-green-800 border-green-200',
      DECISION_MAKER: 'bg-purple-100 text-purple-800 border-purple-200',
      COMMISSION_MEMBER: 'bg-yellow-100 text-yellow-800 border-yellow-200',
      USER: 'bg-gray-100 text-gray-800 border-gray-200',
    };
    return roleColors[role] || roleColors.USER;
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className='flex items-center gap-2'>
          <Shield className='h-5 w-5' />
          {t('userManagement.currentRoles')}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {userRoles.length === 0 ? (
          <div className='text-center py-12'>
            <Shield className='h-12 w-12 text-muted-foreground/50 mx-auto mb-4' />
            <h3 className='text-lg font-medium text-muted-foreground mb-2'>
              {t('userManagement.noRolesAssigned')}
            </h3>
            <p className='text-sm text-muted-foreground max-w-md mx-auto'>
              {t('userManagement.noRolesAssignedDescription')}
            </p>
          </div>
        ) : (
          <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
            {userRoles.map((role, index) => {
              // Ensure role is a string - handle both string and object formats
              const roleString =
                typeof role === 'string'
                  ? role
                  : (role as RoleObject)?.name ||
                    (role as RoleObject)?.role ||
                    String(role);

              // Validate role string
              if (!roleString) {
                console.error('Invalid role data:', role);
                return null;
              }

              return (
                <div
                  key={`${roleString}-${index}`}
                  className={`p-4 rounded-lg border ${getRoleColor(roleString)}`}
                >
                  <div className='flex items-center justify-between'>
                    <div>
                      <h3 className='font-medium'>
                        {t(
                          `userManagement.roles.${roleString.toLowerCase()}`,
                          { defaultValue: roleString }
                        )}
                      </h3>
                      <p className='text-sm opacity-75 mt-1'>
                        {t(
                          `userManagement.roleDescriptions.${roleString.toLowerCase()}`,
                          { defaultValue: '' }
                        )}
                      </p>
                    </div>
                    <Badge variant='secondary' className='ml-2'>
                      {roleString}
                    </Badge>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
};