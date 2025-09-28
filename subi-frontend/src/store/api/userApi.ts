// Re-export all user API endpoints from focused API files
// This maintains backward compatibility while improving code organization

// Import all API endpoints
import './user/userCrudApi';
import './user/userStatusApi';
import './user/userBulkApi';
import './user/userValidationApi';
import './user/userStatisticsApi';

// Re-export all hooks for backward compatibility
export {
  // CRUD Operations
  useGetUsersQuery,
  useSearchAndFilterUsersQuery,
  useGetUserByIdQuery,
  useCreateUserMutation,
  useUpdateUserMutation,
  useDeleteUserMutation,
  useLazyGetUsersQuery,
  useLazySearchAndFilterUsersQuery,
  useLazyGetUserByIdQuery,
} from './user/userCrudApi';

export {
  // Status & Security Operations
  useUpdateUserStatusMutation,
  useActivateUserMutation,
  useSuspendUserMutation,
  useResetUserPasswordMutation,
} from './user/userStatusApi';

export {
  // Bulk Operations & Filtering
  useBulkUpdateUserStatusMutation,
  useBulkUpdateUserRolesMutation,
  useExportUsersQuery,
  useGetUsersByRoleQuery,
  useGetUsersByDepartmentQuery,
  useLazyExportUsersQuery,
} from './user/userBulkApi';

export {
  // Validation Operations
  useCheckUsernameAvailabilityQuery,
  useCheckEmailAvailabilityQuery,
  useGetUserDepartmentsQuery,
} from './user/userValidationApi';

export {
  // Statistics & Analytics
  useGetUserStatisticsQuery,
  useGetUserActivityLogQuery,
  useGetUserRoleHistoryQuery,
  useLazyGetUserStatisticsQuery,
} from './user/userStatisticsApi';
