# Page Title Implementation

This document explains how page titles are implemented in the header of the application.

## How it works

1. A `PageTitleContext` is created to manage the page title state
2. The `MainLayout` component wraps the application with the `PageTitleProvider`
3. The `Header` component consumes the page title from the context and displays it
4. Each page component sets its title using the `useSetPageTitle` hook

## Usage

To set a page title, import and use the `useSetPageTitle` hook in your page component:

```tsx
import { useSetPageTitle } from '@/hooks/useSetPageTitle';

export const MyPage: React.FC = () => {
  useSetPageTitle('My Page Title');
  
  return (
    <div>
      {/* Page content */}
    </div>
  );
};
```

## Files involved

- `src/contexts/PageTitleContext.tsx` - Context provider for page titles
- `src/hooks/useSetPageTitle.ts` - Hook to simplify setting page titles
- `src/components/layouts/MainLayout.tsx` - Wraps the app with PageTitleProvider
- `src/components/common/Header.tsx` - Displays the page title
- `src/pages/dashboard/DashboardPage.tsx` - Example implementation
- `src/pages/TestPage.tsx` - Test page for verification

## Benefits

- Centralized page title management
- Accessible implementation with proper screen reader support
- Easy to use with a simple hook
- Responsive design that truncates long titles