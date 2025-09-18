import { NavSection } from '@/constants/navigation';

/**
 * Filter navigation sections based on user roles
 * @param sections - The navigation sections to filter
 * @param hasAnyRole - Function to check if user has any of the required roles
 * @returns Filtered sections with only items the user has access to
 */
export const filterNavigationSections = (
  sections: NavSection[],
  hasAnyRole: (roles: string[]) => boolean
): NavSection[] => {
  return sections
    .map(section => ({
      ...section,
      items: section.items.filter(item => {
        if (!item.roles) return true;
        return hasAnyRole(item.roles);
      }),
    }))
    .filter(section => section.items.length > 0);
};