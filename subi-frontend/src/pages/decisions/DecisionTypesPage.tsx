import React, { useState } from 'react';
import { Plus, Search, MoreHorizontal, Edit, Trash, Eye } from 'lucide-react';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Separator } from '@/components/ui/separator';

import { useTranslation } from '@/hooks/useTranslation';
import { useSetPageTitle } from '@/hooks/useSetPageTitle';
import {
  useGetDecisionTypesQuery,
  useSearchDecisionTypesQuery,
  useCreateDecisionTypeMutation,
  useUpdateDecisionTypeMutation,
  useDeleteDecisionTypeMutation,
} from '@/store/api/decisionTypeApi';
import type { DecisionTypeResponseDto } from '@/types/decision';
import { ReferenceEntityStatus } from '@/types/decision';
import {
  createDecisionTypeSchema,
  updateDecisionTypeSchema,
  CreateDecisionTypeFormData,
  UpdateDecisionTypeFormData,
} from '@/schemas/decision';
import { PAGINATION } from '@/constants';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

type DialogMode = 'create' | 'edit' | 'view' | null;

export const DecisionTypesPage: React.FC = () => {
  const { t } = useTranslation();
  useSetPageTitle('Типы решений');

  // State management
  const [searchTerm, setSearchTerm] = useState('');
  const [page, setPage] = useState(0);
  const [size] = useState(PAGINATION.DEFAULT_PAGE_SIZE);
  const [dialogMode, setDialogMode] = useState<DialogMode>(null);
  const [selectedType, setSelectedType] =
    useState<DecisionTypeResponseDto | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  // API queries
  const queryParams = {
    page,
    size,
    sort: 'nameEn,asc',
    ...(searchTerm && { searchTerm }),
  };

  // Always call both hooks to comply with React hooks rules
  const {
    data: searchData,
    isLoading: searchLoading,
    error: searchError,
  } = useSearchDecisionTypesQuery(queryParams, {
    skip: !searchTerm,
  });

  const {
    data: listData,
    isLoading: listLoading,
    error: listError,
  } = useGetDecisionTypesQuery(queryParams, {
    skip: !!searchTerm,
  });

  // Use the appropriate data based on search term
  const decisionTypesData = searchTerm ? searchData : listData;
  const typesLoading = searchTerm ? searchLoading : listLoading;
  const typesError = searchTerm ? searchError : listError;

  const [createDecisionType, { isLoading: createLoading }] =
    useCreateDecisionTypeMutation();
  const [updateDecisionType, { isLoading: updateLoading }] =
    useUpdateDecisionTypeMutation();
  const [deleteDecisionType, { isLoading: deleteLoading }] =
    useDeleteDecisionTypeMutation();

  // Form setup
  const createForm = useForm<CreateDecisionTypeFormData>({
    resolver: zodResolver(createDecisionTypeSchema),
    defaultValues: {
      nameEn: '',
      nameRu: '',
      nameKg: '',
      description: '',
      status: ReferenceEntityStatus.ACTIVE,
    },
  });

  const editForm = useForm<UpdateDecisionTypeFormData>({
    resolver: zodResolver(updateDecisionTypeSchema),
  });

  // Dialog handlers
  const openCreateDialog = () => {
    createForm.reset();
    setDialogMode('create');
  };

  const openEditDialog = (type: DecisionTypeResponseDto) => {
    setSelectedType(type);
    editForm.reset({
      nameEn: type.nameEn,
      nameRu: type.nameRu,
      nameKg: type.nameKg,
      description: type.description || '',
      status: type.status,
    });
    setDialogMode('edit');
  };

  const openViewDialog = (type: DecisionTypeResponseDto) => {
    setSelectedType(type);
    setDialogMode('view');
  };

  const closeDialog = () => {
    setDialogMode(null);
    setSelectedType(null);
    createForm.reset();
    editForm.reset();
  };

  const openDeleteDialog = (type: DecisionTypeResponseDto) => {
    setSelectedType(type);
    setDeleteDialogOpen(true);
  };

  // CRUD handlers
  const handleCreate = async (data: CreateDecisionTypeFormData) => {
    try {
      await createDecisionType(data).unwrap();
      toast.success(t('decision.messages.decisionTypeCreated'));
      closeDialog();
    } catch (error: unknown) {
      const errorMessage =
        error &&
        typeof error === 'object' &&
        'data' in error &&
        error.data &&
        typeof error.data === 'object' &&
        'message' in error.data
          ? String(error.data.message)
          : t('common.error');
      toast.error(errorMessage);
    }
  };

  const handleUpdate = async (data: UpdateDecisionTypeFormData) => {
    if (!selectedType) return;

    try {
      await updateDecisionType({ id: selectedType.id, data }).unwrap();
      toast.success(t('decision.messages.decisionTypeUpdated'));
      closeDialog();
    } catch (error: unknown) {
      const errorMessage =
        error &&
        typeof error === 'object' &&
        'data' in error &&
        error.data &&
        typeof error.data === 'object' &&
        'message' in error.data
          ? String(error.data.message)
          : t('common.error');
      toast.error(errorMessage);
    }
  };

  const handleDelete = async () => {
    if (!selectedType) return;

    try {
      await deleteDecisionType(selectedType.id).unwrap();
      toast.success(t('decision.messages.decisionTypeDeleted'));
      setDeleteDialogOpen(false);
      setSelectedType(null);
    } catch (error: unknown) {
      const errorMessage =
        error &&
        typeof error === 'object' &&
        'data' in error &&
        error.data &&
        typeof error.data === 'object' &&
        'message' in error.data
          ? String(error.data.message)
          : t('common.error');
      toast.error(errorMessage);
    }
  };

  // Status badge component
  const StatusBadge: React.FC<{ status: ReferenceEntityStatus }> = ({
    status,
  }) => (
    <Badge
      variant={status === ReferenceEntityStatus.ACTIVE ? 'default' : 'outline'}
    >
      {t(`decision.referenceStatus.${status.toLowerCase()}`)}
    </Badge>
  );

  return (
    <div className='space-y-6'>
      {/* Page Header */}
      <div className='flex items-center justify-between'>
        <div>
          <h1 className='text-2xl font-semibold'>
            {t('decision.decisionTypes')}
          </h1>
          <p className='text-muted-foreground'>
            {t('common.manage')} {t('decision.decisionTypes').toLowerCase()}
          </p>
        </div>
        <Button onClick={openCreateDialog}>
          <Plus className='mr-2 h-4 w-4' />
          {t('common.create')} {t('decision.decisionType')}
        </Button>
      </div>

      {/* Search and Filter */}
      <Card className='border-0 shadow-sm bg-muted'>
        <CardContent className='p-6'>
          <div className='flex items-center space-x-4'>
            <div className='flex-1'>
              <div className='relative'>
                <Search className='absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground' />
                <Input
                  placeholder={t('decision.placeholders.searchTerm')}
                  value={searchTerm}
                  onChange={e => {
                    setSearchTerm(e.target.value);
                    setPage(0);
                  }}
                  className='pl-10'
                />
              </div>
            </div>
            <Button
              variant='outline'
              onClick={() => {
                setSearchTerm('');
                setPage(0);
              }}
            >
              {t('common.clear')}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Results Table */}
      <Card>
        <CardHeader>
          <CardTitle>
            {t('decision.decisionTypes')}
            {decisionTypesData && (
              <span className='ml-2 text-sm font-normal text-muted-foreground'>
                ({decisionTypesData.totalElements} {t('common.total')})
              </span>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {typesLoading ? (
            <div className='flex items-center justify-center p-8'>
              <div className='text-center'>
                <div className='h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent mx-auto mb-2'></div>
                <p className='text-muted-foreground'>
                  {t('decision.messages.loadingDecisionTypes')}
                </p>
              </div>
            </div>
          ) : typesError ? (
            <div className='text-center p-8'>
              <p className='text-destructive'>{t('common.error')}</p>
            </div>
          ) : !decisionTypesData?.content.length ? (
            <div className='text-center p-8'>
              <p className='text-muted-foreground'>
                {t('decision.messages.noResults')}
              </p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t('decision.fields.nameEn')}</TableHead>
                  <TableHead>{t('decision.fields.nameRu')}</TableHead>
                  <TableHead>{t('decision.fields.status')}</TableHead>
                  <TableHead>{t('decision.fields.createdAt')}</TableHead>
                  <TableHead className='w-[70px]'></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {decisionTypesData.content.map(type => (
                  <TableRow key={type.id}>
                    <TableCell>
                      <div className='space-y-1'>
                        <p className='font-medium'>{type.nameEn}</p>
                        {type.description && (
                          <p className='text-sm text-muted-foreground truncate max-w-[200px]'>
                            {type.description}
                          </p>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>{type.nameRu}</TableCell>
                    <TableCell>
                      <StatusBadge status={type.status} />
                    </TableCell>
                    <TableCell>
                      {new Date(type.createdAt).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant='ghost' className='h-8 w-8 p-0'>
                            <span className='sr-only'>
                              {t('common.openMenu')}
                            </span>
                            <MoreHorizontal className='h-4 w-4' />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align='end'>
                          <DropdownMenuItem
                            onClick={() => openViewDialog(type)}
                          >
                            <Eye className='mr-2 h-4 w-4' />
                            {t('common.view')}
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => openEditDialog(type)}
                          >
                            <Edit className='mr-2 h-4 w-4' />
                            {t('common.edit')}
                          </DropdownMenuItem>
                          <Separator />
                          <DropdownMenuItem
                            onClick={() => openDeleteDialog(type)}
                            className='text-destructive'
                          >
                            <Trash className='mr-2 h-4 w-4' />
                            {t('common.delete')}
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Create/Edit Dialog */}
      <Dialog
        open={
          dialogMode === 'create' ||
          dialogMode === 'edit' ||
          dialogMode === 'view'
        }
        onOpenChange={open => !open && closeDialog()}
      >
        <DialogContent className='max-w-2xl'>
          <DialogHeader>
            <DialogTitle>
              {dialogMode === 'create' &&
                `${t('common.create')} ${t('decision.decisionType')}`}
              {dialogMode === 'edit' &&
                `${t('common.edit')} ${t('decision.decisionType')}`}
              {dialogMode === 'view' && t('decision.decisionDetails')}
            </DialogTitle>
          </DialogHeader>

          {dialogMode === 'create' && (
            <Form {...createForm}>
              <form
                onSubmit={createForm.handleSubmit(handleCreate)}
                className='space-y-4'
              >
                <div className='grid grid-cols-3 gap-4'>
                  <FormField
                    control={createForm.control}
                    name='nameEn'
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t('decision.fields.nameEn')}</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={createForm.control}
                    name='nameRu'
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t('decision.fields.nameRu')}</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={createForm.control}
                    name='nameKg'
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t('decision.fields.nameKg')}</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={createForm.control}
                  name='description'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        {t('decision.fields.description')}{' '}
                        {t('common.optional')}
                      </FormLabel>
                      <FormControl>
                        <Textarea {...field} rows={3} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={createForm.control}
                  name='status'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t('decision.fields.status')}</FormLabel>
                      <FormControl>
                        <Select
                          value={field.value}
                          onValueChange={field.onChange}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {Object.values(ReferenceEntityStatus).map(
                              status => (
                                <SelectItem key={status} value={status}>
                                  {t(
                                    `decision.referenceStatus.${status.toLowerCase()}`
                                  )}
                                </SelectItem>
                              )
                            )}
                          </SelectContent>
                        </Select>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className='flex justify-end space-x-2'>
                  <Button type='button' variant='outline' onClick={closeDialog}>
                    {t('common.cancel')}
                  </Button>
                  <Button type='submit' disabled={createLoading}>
                    {createLoading ? t('common.creating') : t('common.create')}
                  </Button>
                </div>
              </form>
            </Form>
          )}

          {dialogMode === 'edit' && (
            <Form {...editForm}>
              <form
                onSubmit={editForm.handleSubmit(handleUpdate)}
                className='space-y-4'
              >
                <div className='grid grid-cols-3 gap-4'>
                  <FormField
                    control={editForm.control}
                    name='nameEn'
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t('decision.fields.nameEn')}</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={editForm.control}
                    name='nameRu'
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t('decision.fields.nameRu')}</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={editForm.control}
                    name='nameKg'
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t('decision.fields.nameKg')}</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={editForm.control}
                  name='description'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        {t('decision.fields.description')}{' '}
                        {t('common.optional')}
                      </FormLabel>
                      <FormControl>
                        <Textarea {...field} rows={3} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={editForm.control}
                  name='status'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t('decision.fields.status')}</FormLabel>
                      <FormControl>
                        <Select
                          value={field.value}
                          onValueChange={field.onChange}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {Object.values(ReferenceEntityStatus).map(
                              status => (
                                <SelectItem key={status} value={status}>
                                  {t(
                                    `decision.referenceStatus.${status.toLowerCase()}`
                                  )}
                                </SelectItem>
                              )
                            )}
                          </SelectContent>
                        </Select>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className='flex justify-end space-x-2'>
                  <Button type='button' variant='outline' onClick={closeDialog}>
                    {t('common.cancel')}
                  </Button>
                  <Button type='submit' disabled={updateLoading}>
                    {updateLoading ? t('common.updating') : t('common.update')}
                  </Button>
                </div>
              </form>
            </Form>
          )}

          {dialogMode === 'view' && selectedType && (
            <div className='space-y-4'>
              <div className='grid grid-cols-3 gap-4'>
                <div>
                  <p className='text-sm font-medium text-muted-foreground'>
                    {t('decision.fields.nameEn')}
                  </p>
                  <p className='font-medium'>{selectedType.nameEn}</p>
                </div>
                <div>
                  <p className='text-sm font-medium text-muted-foreground'>
                    {t('decision.fields.nameRu')}
                  </p>
                  <p className='font-medium'>{selectedType.nameRu}</p>
                </div>
                <div>
                  <p className='text-sm font-medium text-muted-foreground'>
                    {t('decision.fields.nameKg')}
                  </p>
                  <p className='font-medium'>{selectedType.nameKg}</p>
                </div>
              </div>

              {selectedType.description && (
                <div>
                  <p className='text-sm font-medium text-muted-foreground'>
                    {t('decision.fields.description')}
                  </p>
                  <p className='text-sm bg-muted p-3 rounded-lg'>
                    {selectedType.description}
                  </p>
                </div>
              )}

              <div className='grid grid-cols-2 gap-4'>
                <div>
                  <p className='text-sm font-medium text-muted-foreground'>
                    {t('decision.fields.status')}
                  </p>
                  <StatusBadge status={selectedType.status} />
                </div>
                <div>
                  <p className='text-sm font-medium text-muted-foreground'>
                    {t('decision.fields.createdAt')}
                  </p>
                  <p>{new Date(selectedType.createdAt).toLocaleDateString()}</p>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t('common.confirm')}</DialogTitle>
            <DialogDescription>
              {t('decision.messages.confirmDelete', {
                item: selectedType
                  ? `"${selectedType.nameEn}"`
                  : t('decision.decisionType').toLowerCase(),
              })}
            </DialogDescription>
          </DialogHeader>
          <div className='flex justify-end space-x-2'>
            <Button
              variant='outline'
              onClick={() => {
                setDeleteDialogOpen(false);
                setSelectedType(null);
              }}
            >
              {t('common.cancel')}
            </Button>
            <Button
              variant='destructive'
              onClick={handleDelete}
              disabled={deleteLoading}
            >
              {deleteLoading ? t('common.deleting') : t('common.delete')}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};
