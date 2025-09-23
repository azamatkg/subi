import React from 'react';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { useAuth } from '@/hooks/useAuth';
import { LanguageSwitcher } from './LanguageSwitcher';
import { ThemeToggle } from '@/components/ui/theme-toggle';
import { cn } from '@/lib/utils';
import { ChevronLeft } from 'lucide-react';
import { navigationSections } from '@/constants/navigation';
import { sidebarStyles } from '@/constants/sidebar-styles';
import { useSidebarState } from '@/hooks/sidebar/useSidebarState';
import { useSidebarAccordion } from '@/hooks/sidebar/useSidebarAccordion';
import { filterNavigationSections } from '@/utils/sidebar';
import { SidebarSection } from './SidebarSection';

export const Sidebar: React.FC = () => {
  const { hasAnyRole } = useAuth();
  const { sidebarOpen, isMobile, toggleSidebar, closeSidebar } =
    useSidebarState();
  const { expandedSection, toggleSection } = useSidebarAccordion();

  // Filter navigation items based on user roles
  const filteredSections = filterNavigationSections(
    navigationSections,
    hasAnyRole
  );

  return (
    <>
      {/* Enhanced Sidebar */}
      <aside
        className={cn(
          sidebarStyles.sidebar.base,
          sidebarOpen
            ? sidebarStyles.sidebar.open
            : sidebarStyles.sidebar.closed,
          isMobile
            ? sidebarStyles.sidebar.mobile
            : sidebarOpen
              ? sidebarStyles.sidebar.desktop.open
              : sidebarStyles.sidebar.desktop.closed
        )}
        role='navigation'
        aria-label='Главное навигационное меню'
      >
        <div className={sidebarStyles.content.base}>
          {/* Enhanced Header */}
          <div className={sidebarStyles.content.header}>
            <div className='flex items-center gap-3'></div>

            {(sidebarOpen || isMobile) && (
              <div className={sidebarStyles.header.titleContainer}>
                <h1 className={sidebarStyles.header.title}>АСУБК</h1>
              </div>
            )}

            {/* Desktop collapse button */}
            {!isMobile && (
              <Button
                variant='ghost'
                size='sm'
                onClick={toggleSidebar}
                className={sidebarStyles.header.collapseButton}
                aria-label={sidebarOpen ? 'Свернуть меню' : 'Развернуть меню'}
              >
                <ChevronLeft
                  className={cn(
                    sidebarStyles.header.chevron,
                    !sidebarOpen && 'rotate-180'
                  )}
                />
              </Button>
            )}
          </div>

          {/* Enhanced Navigation */}
          <div className={sidebarStyles.content.navigation}>
            {filteredSections.map((section, sectionIndex) => (
              <div
                key={section.id || sectionIndex}
                className={sidebarStyles.section.container}
              >
                <SidebarSection
                  section={section}
                  sectionIndex={sectionIndex}
                  isExpanded={
                    section.id ? expandedSection === section.id : true
                  }
                  isCollapsed={!sidebarOpen}
                  isMobile={isMobile}
                  onToggleSection={() =>
                    section.id && toggleSection(section.id)
                  }
                  onItemClick={closeSidebar}
                />

                {sectionIndex < filteredSections.length - 1 && (
                  <Separator className={sidebarStyles.section.separator} />
                )}
              </div>
            ))}
          </div>

          {/* Enhanced Footer */}
          <div className={sidebarStyles.content.footer}>
            {/* Language and Theme Controls */}
            <div className={sidebarStyles.footer.container}>
              {!sidebarOpen && !isMobile ? (
                <div className={sidebarStyles.footer.controls.collapsed}>
                  <LanguageSwitcher
                    variant='ghost'
                    size='sm'
                    className={cn(sidebarStyles.footer.button, 'rounded-full')}
                  />
                  <ThemeToggle
                    variant='ghost'
                    size='sm'
                    className={cn(sidebarStyles.footer.button, 'rounded-full')}
                  />
                </div>
              ) : (
                <div className={sidebarStyles.footer.controls.expanded}>
                  <LanguageSwitcher
                    variant='ghost'
                    size='sm'
                    className={sidebarStyles.footer.button}
                    showText={false}
                  />
                  <ThemeToggle
                    variant='ghost'
                    size='sm'
                    className={sidebarStyles.footer.button}
                  />
                </div>
              )}
            </div>
          </div>
        </div>
      </aside>

      {/* Mobile Overlay */}
      {sidebarOpen && isMobile && (
        <div
          className={sidebarStyles.overlay}
          onClick={closeSidebar}
          aria-hidden='true'
        />
      )}
    </>
  );
};
