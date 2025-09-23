import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import {
  Plus,
  Search,
  FileText,
  MoreHorizontal,
  Eye,
  Edit,
  SlidersHorizontal,
  Grid3x3,
  List,
  RefreshCw,
  Download,
  Calendar,
  MapPin,
} from 'lucide-react';
import {
  AccessibleAmount,
  AccessibleDate,
  AccessibleStatusBadge,
} from '@/components/ui/accessible-status-badge';
import {
  AccessibleHeading,
  Landmark,
  LiveRegion,
} from '@/components/ui/focus-trap';
import { ListItemSkeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';
import { useSetPageTitle } from '@/hooks/useSetPageTitle';

type ViewMode = 'grid' | 'list';
type SortOption =
  | 'date-desc'
  | 'date-asc'
  | 'amount-desc'
  | 'amount-asc'
  | 'name-asc'
  | 'name-desc';

export const ApplicationListPage: React.FC = () => {
  useSetPageTitle('Заявки');
  const [searchTerm, setSearchTerm] = useState('');
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [programFilter, setProgramFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<SortOption>('date-desc');
  const [isLoading, setIsLoading] = useState(false);

  // Enhanced mock data
  const mockApplications = React.useMemo(
    () => [
      {
        id: '1',
        applicantName: 'Айгүл Токтосунова',
        inn: '12345678901234',
        amount: 500000,
        status: 'UNDER_COMPLETION',
        createdAt: '2024-09-01T10:00:00Z',
        programName: 'Микрокредитование',
        location: 'Бишкек',
        phone: '+996 555 123 456',
        priority: 'high' as const,
        assignedTo: 'Aida Nurbekova',
        documentsCount: 8,
        missingDocuments: 2,
      },
      {
        id: '2',
        applicantName: 'Максат Жолдошев',
        inn: '23456789012345',
        amount: 750000,
        status: 'APPROVED',
        createdAt: '2024-09-01T09:30:00Z',
        programName: 'Малый бизнес',
        location: 'Ош',
        phone: '+996 702 987 654',
        priority: 'medium' as const,
        assignedTo: 'Bektur Sydykov',
        documentsCount: 12,
        missingDocuments: 0,
      },
      {
        id: '3',
        applicantName: 'Нургуль Осмонова',
        inn: '34567890123456',
        amount: 300000,
        status: 'SUBMITTED',
        createdAt: '2024-09-01T08:45:00Z',
        programName: 'Стартап поддержка',
        location: 'Каракол',
        phone: '+996 559 111 222',
        priority: 'low' as const,
        assignedTo: 'Cholpon Asanova',
        documentsCount: 5,
        missingDocuments: 3,
      },
      {
        id: '4',
        applicantName: 'Болот Сыдыков',
        inn: '45678901234567',
        amount: 1200000,
        status: 'REJECTED',
        createdAt: '2024-08-31T16:20:00Z',
        programName: 'Развитие АПК',
        location: 'Нарын',
        phone: '+996 551 333 444',
        priority: 'medium' as const,
        assignedTo: 'Azamat Toktosunov',
        documentsCount: 10,
        missingDocuments: 0,
      },
      {
        id: '5',
        applicantName: 'Жамиля Кадырова',
        inn: '56789012345678',
        amount: 800000,
        status: 'UNDER_REVIEW',
        createdAt: '2024-08-31T14:15:00Z',
        programName: 'Женское предпринимательство',
        location: 'Талас',
        phone: '+996 777 555 666',
        priority: 'high' as const,
        assignedTo: 'Gulnara Mamytova',
        documentsCount: 9,
        missingDocuments: 1,
      },
      {
        id: '6',
        applicantName: 'Улукбек Асанов',
        inn: '67890123456789',
        amount: 600000,
        status: 'SUBMITTED',
        createdAt: '2024-08-30T11:20:00Z',
        programName: 'Микрокредитование',
        location: 'Баткен',
        phone: '+996 500 777 888',
        priority: 'medium' as const,
        assignedTo: 'Nursultan Orozbek uulu',
        documentsCount: 6,
        missingDocuments: 4,
      },
    ],
    []
  );

  const programs = [
    'Микрокредитование',
    'Малый бизнес',
    'Стартап поддержка',
    'Развитие АПК',
    'Женское предпринимательство',
  ];

  const statusOptions = [
    { value: 'SUBMITTED', label: 'Подана' },
    { value: 'UNDER_COMPLETION', label: 'На доработке' },
    { value: 'UNDER_REVIEW', label: 'На рассмотрении' },
    { value: 'APPROVED', label: 'Одобрена' },
    { value: 'REJECTED', label: 'Отклонена' },
  ];

  // Helper functions
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase();
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'text-red-600 dark:text-red-400';
      case 'medium':
        return 'text-amber-600 dark:text-amber-400';
      case 'low':
        return 'text-emerald-600 dark:text-emerald-400';
      default:
        return 'text-muted-foreground';
    }
  };

  // Enhanced filtering and sorting
  const filteredAndSortedApplications = React.useMemo(() => {
    const filtered = mockApplications.filter(app => {
      const matchesSearch =
        app.applicantName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        app.inn.includes(searchTerm) ||
        app.programName.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesStatus =
        statusFilter === 'all' || app.status === statusFilter;
      const matchesProgram =
        programFilter === 'all' || app.programName === programFilter;

      return matchesSearch && matchesStatus && matchesProgram;
    });

    // Sort applications
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'date-desc':
          return (
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
          );
        case 'date-asc':
          return (
            new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
          );
        case 'amount-desc':
          return b.amount - a.amount;
        case 'amount-asc':
          return a.amount - b.amount;
        case 'name-asc':
          return a.applicantName.localeCompare(b.applicantName);
        case 'name-desc':
          return b.applicantName.localeCompare(a.applicantName);
        default:
          return 0;
      }
    });

    return filtered;
  }, [mockApplications, searchTerm, statusFilter, programFilter, sortBy]);

  // Simulated loading effect
  useEffect(() => {
    if (searchTerm || statusFilter !== 'all' || programFilter !== 'all') {
      setIsLoading(true);
      const timer = setTimeout(() => setIsLoading(false), 300);
      return () => clearTimeout(timer);
    }
  }, [searchTerm, statusFilter, programFilter]);

  const handleClearFilters = () => {
    setSearchTerm('');
    setStatusFilter('all');
    setProgramFilter('all');
    setSortBy('date-desc');
  };

  const handleRefresh = () => {
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
    }, 500);
  };

  return (
    <Landmark role='main' aria-labelledby='applications-title'>
      <LiveRegion>{isLoading && 'Загружается список заявок'}</LiveRegion>

      <div className='space-y-6 p-4 sm:p-6 max-w-7xl mx-auto'>
        {/* Enhanced Header */}
        <header className='space-y-4'>
          <div className='flex flex-col sm:flex-row sm:items-center justify-between gap-4'>
            <div className='space-y-2'>
              <AccessibleHeading
                level={1}
                id='applications-title'
                className='text-3xl sm:text-4xl font-bold tracking-tight bg-gradient-to-r from-primary to-primary/80 bg-clip-text text-transparent'
              >
                Заявки на кредит
              </AccessibleHeading>
              <p className='text-muted-foreground text-base sm:text-lg leading-relaxed'>
                Управление и отслеживание кредитных заявок
              </p>
            </div>

            <div className='flex items-center gap-3'>
              <Button
                variant='outline'
                size='sm'
                onClick={handleRefresh}
                disabled={isLoading}
                className='gap-2'
                aria-label='Обновить список'
              >
                <RefreshCw
                  className={cn(
                    'h-4 w-4 transition-transform',
                    isLoading && 'animate-spin'
                  )}
                />
                <span className='hidden sm:inline'>Обновить</span>
              </Button>

              <Button className='gap-2 shadow-lg hover:shadow-xl transition-shadow'>
                <Plus className='h-4 w-4' />
                <span className='hidden sm:inline'>Новая заявка</span>
                <span className='sm:hidden'>Создать</span>
              </Button>
            </div>
          </div>
        </header>

        {/* Enhanced Search and Filters */}
        <Card className='border-0 shadow-lg'>
          <CardContent className='p-4 sm:p-6 space-y-4'>
            {/* Main Search Bar */}
            <div className='flex flex-col sm:flex-row gap-3'>
              <div className='flex-1 relative'>
                <Search className='absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground' />
                <Input
                  placeholder='Поиск по имени, ИНН, программе...'
                  value={searchTerm}
                  onChange={e => setSearchTerm(e.target.value)}
                  className='pl-10 h-11 transition-all duration-200 border-2 focus:border-primary'
                  aria-label='Поиск заявок'
                />
              </div>

              <div className='flex gap-2'>
                <Button
                  variant='outline'
                  onClick={() => setIsFilterOpen(!isFilterOpen)}
                  className={cn(
                    'gap-2 transition-all duration-200',
                    isFilterOpen && 'bg-primary text-primary-foreground'
                  )}
                  aria-expanded={isFilterOpen}
                >
                  <SlidersHorizontal className='h-4 w-4' />
                  <span className='hidden sm:inline'>Фильтры</span>
                </Button>

                <div className='hidden sm:flex border-l border-border pl-2 gap-1'>
                  <Button
                    variant={viewMode === 'grid' ? 'default' : 'ghost'}
                    size='sm'
                    onClick={() => setViewMode('grid')}
                    aria-label='Режим сетки'
                  >
                    <Grid3x3 className='h-4 w-4' />
                  </Button>
                  <Button
                    variant={viewMode === 'list' ? 'default' : 'ghost'}
                    size='sm'
                    onClick={() => setViewMode('list')}
                    aria-label='Режим списка'
                  >
                    <List className='h-4 w-4' />
                  </Button>
                </div>
              </div>
            </div>

            {/* Collapsible Filters */}
            {isFilterOpen && (
              <div className='grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-4 gap-4 p-4 bg-muted/30 rounded-xl'>
                <div className='space-y-2'>
                  <Label className='text-sm font-semibold'>Статус</Label>
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger className='h-9'>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value='all'>Все статусы</SelectItem>
                      {statusOptions.map(status => (
                        <SelectItem key={status.value} value={status.value}>
                          {status.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className='space-y-2'>
                  <Label className='text-sm font-semibold'>Программа</Label>
                  <Select
                    value={programFilter}
                    onValueChange={setProgramFilter}
                  >
                    <SelectTrigger className='h-9'>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value='all'>Все программы</SelectItem>
                      {programs.map(program => (
                        <SelectItem key={program} value={program}>
                          {program}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className='space-y-2'>
                  <Label className='text-sm font-semibold'>Сортировка</Label>
                  <Select
                    value={sortBy}
                    onValueChange={value => setSortBy(value as SortOption)}
                  >
                    <SelectTrigger className='h-9'>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value='date-desc'>Дата ↓</SelectItem>
                      <SelectItem value='date-asc'>Дата ↑</SelectItem>
                      <SelectItem value='amount-desc'>Сумма ↓</SelectItem>
                      <SelectItem value='amount-asc'>Сумма ↑</SelectItem>
                      <SelectItem value='name-asc'>Имя ↑</SelectItem>
                      <SelectItem value='name-desc'>Имя ↓</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className='flex items-end'>
                  <Button
                    variant='outline'
                    size='sm'
                    onClick={handleClearFilters}
                    className='w-full h-9'
                  >
                    Сбросить
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Results Section */}
        <div className='space-y-4'>
          <div className='flex items-center justify-between'>
            <div className='flex items-center gap-3'>
              <h2 className='text-xl font-semibold'>Результаты</h2>
              <Badge variant='outline' className='text-sm'>
                {filteredAndSortedApplications.length} из{' '}
                {mockApplications.length}
              </Badge>
            </div>

            {filteredAndSortedApplications.length > 0 && (
              <div className='flex items-center gap-2'>
                <Button variant='ghost' size='sm' className='gap-2'>
                  <Download className='h-4 w-4' />
                  <span className='hidden sm:inline'>Экспорт</span>
                </Button>
              </div>
            )}
          </div>

          {/* Applications Grid/List */}
          {isLoading ? (
            <div className='space-y-4'>
              {Array.from({ length: 3 }).map((_, i) => (
                <ListItemSkeleton key={i} showAvatar showBadge />
              ))}
            </div>
          ) : filteredAndSortedApplications.length === 0 ? (
            <Card className='border-0 shadow-sm'>
              <CardContent className='text-center py-12'>
                <div className='space-y-4'>
                  <FileText className='mx-auto h-16 w-16 text-muted-foreground/50' />
                  <div className='space-y-2'>
                    <h3 className='text-lg font-semibold'>Заявки не найдены</h3>
                    <p className='text-muted-foreground max-w-md mx-auto'>
                      Попробуйте изменить критерии поиска или очистить фильтры
                    </p>
                  </div>
                  <Button onClick={handleClearFilters} variant='outline'>
                    Сбросить фильтры
                  </Button>
                </div>
              </CardContent>
            </Card>
          ) : (
            <div
              className={cn(
                viewMode === 'grid'
                  ? 'grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-6'
                  : 'space-y-3'
              )}
            >
              {filteredAndSortedApplications.map(application => (
                <Card
                  key={application.id}
                  className={cn(
                    'group transition-all duration-200 cursor-pointer border-0 shadow-sm hover:shadow-lg',
                    'focus:ring-2 focus:ring-primary/20 focus:outline-none',
                    application.priority === 'high' &&
                      'ring-1 ring-red-200 dark:ring-red-800/50',
                    viewMode === 'list' && 'hover:-translate-y-0.5'
                  )}
                  tabIndex={0}
                  role='button'
                  aria-label={`Заявка ${application.applicantName}`}
                >
                  <CardContent className='p-4 sm:p-6'>
                    <div className='space-y-4'>
                      {/* Header with Avatar and Actions */}
                      <div className='flex items-start justify-between'>
                        <div className='flex items-center gap-3'>
                          <Avatar
                            className={cn(
                              'transition-transform group-hover:scale-110',
                              viewMode === 'grid' ? 'h-12 w-12' : 'h-10 w-10'
                            )}
                          >
                            <AvatarFallback className='bg-primary/10 text-primary font-semibold'>
                              {getInitials(application.applicantName)}
                            </AvatarFallback>
                          </Avatar>
                          <div className='space-y-1'>
                            <h3 className='font-semibold text-foreground group-hover:text-primary transition-colors'>
                              {application.applicantName}
                            </h3>
                            <div className='flex items-center gap-2 text-xs text-muted-foreground'>
                              <span
                                className={cn(
                                  'font-medium',
                                  getPriorityColor(application.priority)
                                )}
                              >
                                {application.priority === 'high'
                                  ? '●'
                                  : application.priority === 'medium'
                                    ? '●'
                                    : '●'}
                              </span>
                              <span>{application.assignedTo}</span>
                            </div>
                          </div>
                        </div>

                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button
                              variant='ghost'
                              size='sm'
                              className='h-8 w-8 p-0 opacity-0 group-hover:opacity-100 transition-opacity'
                            >
                              <MoreHorizontal className='h-4 w-4' />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align='end'>
                            <DropdownMenuItem>
                              <Eye className='mr-2 h-4 w-4' />
                              Просмотр
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              <Edit className='mr-2 h-4 w-4' />
                              Редактировать
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem>
                              <Download className='mr-2 h-4 w-4' />
                              Документы
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>

                      {/* Status and Amount */}
                      <div className='flex items-center justify-between'>
                        <AccessibleStatusBadge status={application.status} />
                        <AccessibleAmount
                          amount={application.amount}
                          className='text-lg font-bold'
                        />
                      </div>

                      {/* Details */}
                      <div className='space-y-3 text-sm'>
                        <div className='flex items-center gap-2 text-muted-foreground'>
                          <MapPin className='h-3 w-3' />
                          <span>{application.location}</span>
                          <span>•</span>
                          <span>{application.programName}</span>
                        </div>

                        <div className='flex items-center justify-between text-xs'>
                          <div className='flex items-center gap-2'>
                            <Calendar className='h-3 w-3 text-muted-foreground' />
                            <AccessibleDate
                              date={application.createdAt}
                              format='short'
                            />
                          </div>

                          <div className='flex items-center gap-4'>
                            <span
                              className={cn(
                                'font-medium',
                                application.missingDocuments > 0
                                  ? 'text-amber-600'
                                  : 'text-emerald-600'
                              )}
                            >
                              {application.documentsCount -
                                application.missingDocuments}
                              /{application.documentsCount} док.
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </Landmark>
  );
};
