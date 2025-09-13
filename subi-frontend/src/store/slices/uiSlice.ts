import { PayloadAction, createSlice } from '@reduxjs/toolkit';

interface UIState {
  sidebarOpen: boolean;
  theme: 'light' | 'dark';
  loading: {
    global: boolean;
    [key: string]: boolean;
  };
  notifications: Array<{
    id: string;
    type: 'success' | 'error' | 'warning' | 'info';
    title: string;
    message: string;
    duration?: number;
  }>;
  modals: {
    [key: string]: boolean;
  };
  breadcrumbs: Array<{
    label: string;
    href?: string;
  }>;
}

const initialState: UIState = {
  sidebarOpen: true,
  theme: (localStorage.getItem('theme') as 'light' | 'dark') || 'light',
  loading: {
    global: false,
  },
  notifications: [],
  modals: {},
  breadcrumbs: [],
};

const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    toggleSidebar: state => {
      state.sidebarOpen = !state.sidebarOpen;
    },
    setSidebarOpen: (state, action: PayloadAction<boolean>) => {
      state.sidebarOpen = action.payload;
    },
    setTheme: (state, action: PayloadAction<'light' | 'dark'>) => {
      state.theme = action.payload;
      localStorage.setItem('theme', action.payload);

      // Update document class for theme switching
      if (action.payload === 'dark') {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
    },
    toggleTheme: state => {
      const newTheme = state.theme === 'light' ? 'dark' : 'light';
      state.theme = newTheme;
      localStorage.setItem('theme', newTheme);

      // Update document class for theme switching
      if (newTheme === 'dark') {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
    },
    setLoading: (
      state,
      action: PayloadAction<{ key: string; loading: boolean }>
    ) => {
      state.loading[action.payload.key] = action.payload.loading;
    },
    setGlobalLoading: (state, action: PayloadAction<boolean>) => {
      state.loading.global = action.payload;
    },
    addNotification: (
      state,
      action: PayloadAction<Omit<UIState['notifications'][0], 'id'>>
    ) => {
      const notification = {
        ...action.payload,
        id: Date.now().toString(),
      };
      state.notifications.push(notification);
    },
    removeNotification: (state, action: PayloadAction<string>) => {
      state.notifications = state.notifications.filter(
        notification => notification.id !== action.payload
      );
    },
    clearNotifications: state => {
      state.notifications = [];
    },
    openModal: (state, action: PayloadAction<string>) => {
      state.modals[action.payload] = true;
    },
    closeModal: (state, action: PayloadAction<string>) => {
      state.modals[action.payload] = false;
    },
    closeAllModals: state => {
      state.modals = {};
    },
    setBreadcrumbs: (state, action: PayloadAction<UIState['breadcrumbs']>) => {
      state.breadcrumbs = action.payload;
    },
    addBreadcrumb: (
      state,
      action: PayloadAction<{ label: string; href?: string }>
    ) => {
      state.breadcrumbs.push(action.payload);
    },
    removeBreadcrumb: (state, action: PayloadAction<number>) => {
      state.breadcrumbs.splice(action.payload, 1);
    },
    clearBreadcrumbs: state => {
      state.breadcrumbs = [];
    },
  },
});

export const {
  toggleSidebar,
  setSidebarOpen,
  setTheme,
  toggleTheme,
  setLoading,
  setGlobalLoading,
  addNotification,
  removeNotification,
  clearNotifications,
  openModal,
  closeModal,
  closeAllModals,
  setBreadcrumbs,
  addBreadcrumb,
  removeBreadcrumb,
  clearBreadcrumbs,
} = uiSlice.actions;

export default uiSlice.reducer;
