import React from 'react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useAuth } from '@/hooks/useAuth';
import { useTranslation } from '@/hooks/useTranslation';
import { useAppDispatch, useAppSelector } from '@/hooks/redux';
import { toggleSidebar } from '@/store/slices/uiSlice';
import { ChevronLeft, LogOut, User, Settings, Bell } from 'lucide-react';
import { usePageTitle } from '@/hooks/useSetPageTitle';
import { cn } from '@/lib/utils';

export const Header: React.FC = () => {
  const { user, userDisplayName, logout } = useAuth();
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const { title } = usePageTitle();
  const sidebarOpen = useAppSelector(state => state.ui.sidebarOpen);

  const handleLogout = async () => {
    await logout();
  };

  // Get user initials for avatar
  const getInitials = (name?: string) => {
    if (!name) return 'U';
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase();
  };

  return (
    <header className='sticky top-0 z-50 w-full border-b bg-gray-900 border-gray-800'>
      <div className='flex h-16 items-center justify-between px-2'>
        {/* Left section */}
        <div className='flex items-center'>
          <Button
            variant='ghost'
            size='sm'
            className='lg:hidden text-gray-200 hover:bg-gray-800 hover:text-white h-8 w-8 p-0 rounded-full border border-gray-700 shadow-sm'
            onClick={() => dispatch(toggleSidebar())}
          >
            <ChevronLeft
              className={cn(
                'h-4 w-4 transition-transform text-gray-200',
                !sidebarOpen && 'rotate-180'
              )}
            />
          </Button>
        </div>

        {/* Center section - Page title */}
        <div className='absolute left-1/2 transform -translate-x-1/2'>
          {title && (
            <h1 className='text-xl font-semibold text-white truncate max-w-md sm:max-w-lg md:max-w-xl lg:max-w-2xl text-center'>
              {title}
            </h1>
          )}
        </div>

        {/* Right section */}
        <div className='flex items-center'>
          <Button
            variant='ghost'
            size='sm'
            className='relative h-9 w-9 text-gray-200 hover:bg-gray-800 hover:text-white'
          >
            <Bell className='h-4 w-4' />
            <span className='absolute top-0 right-0 flex h-2 w-2'>
              <span className='animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-500 opacity-75'></span>
              <span className='relative inline-flex rounded-full h-2 w-2 bg-blue-500'></span>
            </span>
          </Button>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant='ghost' className='relative h-9 w-9 rounded-full'>
                <Avatar className='h-9 w-9'>
                  <AvatarImage src='' alt={userDisplayName} />
                  <AvatarFallback className='bg-blue-900/50 text-blue-400 font-medium'>
                    {getInitials(userDisplayName)}
                  </AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              className='w-56 bg-gray-800 border-gray-700'
              align='end'
              forceMount
            >
              <DropdownMenuLabel className='font-normal'>
                <div className='flex flex-col space-y-1'>
                  <p className='text-sm font-medium leading-none text-white'>
                    {userDisplayName}
                  </p>
                  <p className='text-xs leading-none text-gray-400'>
                    {user?.email}
                  </p>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator className='bg-gray-700' />
              <DropdownMenuItem className='text-gray-200 focus:bg-gray-700 focus:text-white'>
                <User className='mr-2 h-4 w-4' />
                <span>{t('user.profile')}</span>
              </DropdownMenuItem>
              <DropdownMenuItem className='text-gray-200 focus:bg-gray-700 focus:text-white'>
                <Settings className='mr-2 h-4 w-4' />
                <span>{t('navigation.settings')}</span>
              </DropdownMenuItem>
              <DropdownMenuSeparator className='bg-gray-700' />
              <DropdownMenuItem
                className='text-gray-200 focus:bg-gray-700 focus:text-white'
                onClick={handleLogout}
              >
                <LogOut className='mr-2 h-4 w-4' />
                <span>{t('auth.logout')}</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
};
