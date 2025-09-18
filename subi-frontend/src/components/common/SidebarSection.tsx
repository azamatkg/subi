import React from 'react';
import { Button } from '@/components/ui/button';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { ChevronDown, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import { NavSection } from '@/constants/navigation';
import { SidebarNavItem } from './SidebarNavItem';

interface SidebarSectionProps {
  section: NavSection;
  sectionIndex: number;
  isExpanded: boolean;
  isCollapsed: boolean;
  isMobile: boolean;
  onToggleSection: () => void;
  onItemClick: () => void;
}

export const SidebarSection: React.FC<SidebarSectionProps> = ({
  section,
  isExpanded,
  isCollapsed,
  isMobile,
  onToggleSection,
  onItemClick,
}) => {
  if (section.title) {
    // Collapsible section
    return (
      <Collapsible
        open={section.id ? isExpanded : true}
        onOpenChange={section.id ? onToggleSection : undefined}
      >
        {(!isCollapsed || isMobile) ? (
          // Full width trigger when sidebar is expanded
          <CollapsibleTrigger asChild>
            <Button
              variant="ghost"
              className="w-full justify-between px-3 py-2 h-auto text-xs font-semibold text-gray-400 uppercase tracking-wider hover:bg-gray-700 hover:text-gray-300 transition-colors"
            >
              <span>{section.title}</span>
              {section.id && (
                <ChevronDown
                  className={cn(
                    "h-4 w-4 transition-transform duration-200",
                    isExpanded ? "rotate-0" : "-rotate-90"
                  )}
                />
              )}
            </Button>
          </CollapsibleTrigger>
        ) : (
          // Icon-only trigger when sidebar is collapsed
          <CollapsibleTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              className="w-full h-8 p-0 hover:bg-gray-700 transition-colors"
              title={section.title}
            >
              <ChevronRight
                className={cn(
                  "h-4 w-4 transition-transform duration-200",
                  section.id && isExpanded ? "rotate-90" : "rotate-0"
                )}
              />
            </Button>
          </CollapsibleTrigger>
        )}

        <CollapsibleContent className="space-y-0.5">
          <nav className="space-y-0.5 mt-1">
            {section.items.map(item => (
              <SidebarNavItem
                key={item.href}
                item={item}
                isCollapsed={isCollapsed && !isMobile}
                onItemClick={onItemClick}
              />
            ))}
          </nav>
        </CollapsibleContent>
      </Collapsible>
    );
  }

  // Non-collapsible section (like Dashboard)
  return (
    <nav className="space-y-0.5">
      {section.items.map(item => (
        <SidebarNavItem
          key={item.href}
          item={item}
          isCollapsed={isCollapsed && !isMobile}
          onItemClick={onItemClick}
        />
      ))}
    </nav>
  );
};