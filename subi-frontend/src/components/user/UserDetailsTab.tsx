import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { User, Mail, Phone, Users } from 'lucide-react';
import { useTranslation } from '@/hooks/useTranslation';
import type { UserResponseDto } from '@/types/user';

interface UserDetailsTabProps {
  user: UserResponseDto;
}

export const UserDetailsTab: React.FC<UserDetailsTabProps> = ({ user }) => {
  const { t } = useTranslation();

  // Validate user data exists
  if (!user) {
    console.error('UserDetailsTab: No user data provided');
    return (
      <div className='text-center py-8'>
        <p className='text-muted-foreground'>{t('common.noDataAvailable')}</p>
      </div>
    );
  }

  // Ensure required fields are present
  const hasRequiredData = user.id && user.username && user.email && user.firstName && user.lastName;
  if (!hasRequiredData) {
    console.error('UserDetailsTab: Missing required user data fields:', {
      hasId: !!user.id,
      hasUsername: !!user.username,
      hasEmail: !!user.email,
      hasFirstName: !!user.firstName,
      hasLastName: !!user.lastName,
    });
    return (
      <div className='text-center py-8'>
        <p className='text-muted-foreground'>{t('common.invalidData')}</p>
      </div>
    );
  }

  return (
    <div className='grid grid-cols-1 lg:grid-cols-2 gap-6'>
      <Card>
        <CardHeader>
          <CardTitle className='flex items-center gap-2'>
            <User className='h-5 w-5' />
            {t('userManagement.personalInformation')}
          </CardTitle>
        </CardHeader>
        <CardContent className='space-y-4'>
          <div>
            <Label className='text-sm font-medium text-muted-foreground'>
              {t('userManagement.fields.firstName')}
            </Label>
            <p className='text-base font-medium'>{user.firstName}</p>
          </div>
          <div>
            <Label className='text-sm font-medium text-muted-foreground'>
              {t('userManagement.fields.lastName')}
            </Label>
            <p className='text-base font-medium'>{user.lastName}</p>
          </div>
          {user.phone && (
            <div>
              <Label className='text-sm font-medium text-muted-foreground'>
                {t('userManagement.fields.phone')}
              </Label>
              <p className='text-base font-medium flex items-center gap-2'>
                <Phone className='h-4 w-4' />
                {user.phone}
              </p>
            </div>
          )}
          {user.department && (
            <div>
              <Label className='text-sm font-medium text-muted-foreground'>
                {t('userManagement.fields.department')}
              </Label>
              <p className='text-base font-medium flex items-center gap-2'>
                <Users className='h-4 w-4' />
                {user.department}
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className='flex items-center gap-2'>
            <Mail className='h-5 w-5' />
            {t('userManagement.systemInformation')}
          </CardTitle>
        </CardHeader>
        <CardContent className='space-y-4'>
          <div>
            <Label className='text-sm font-medium text-muted-foreground'>
              {t('userManagement.fields.username')}
            </Label>
            <p className='text-base font-mono'>@{user.username}</p>
          </div>
          <div>
            <Label className='text-sm font-medium text-muted-foreground'>
              {t('userManagement.fields.email')}
            </Label>
            <p className='text-base'>{user.email}</p>
          </div>
          <div>
            <Label className='text-sm font-medium text-muted-foreground'>
              {t('userManagement.fields.userId')}
            </Label>
            <p className='text-sm font-mono text-muted-foreground'>{user.id}</p>
          </div>
          <div>
            <Label className='text-sm font-medium text-muted-foreground'>
              {t('userManagement.fields.lastUpdated')}
            </Label>
            <p className='text-sm'>
              {user.updatedAt
                ? new Date(user.updatedAt).toLocaleString()
                : 'N/A'}
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};