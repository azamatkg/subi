import { useState } from 'react';

export const useSidebarAccordion = () => {
  // Accordion state management with localStorage persistence - single section only
  const [expandedSection, setExpandedSection] = useState<string | null>(() => {
    try {
      const saved = localStorage.getItem('sidebar-expanded-section');
      if (saved) {
        return JSON.parse(saved);
      }
    } catch (error) {
      console.warn('Failed to load sidebar state from localStorage:', error);
    }
    // Default: credit-operations section expanded
    return 'credit-operations';
  });

  // Toggle section expansion with localStorage persistence - single section accordion
  const toggleSection = (sectionId: string) => {
    setExpandedSection(prev => {
      // If clicking the currently expanded section, collapse it
      // If clicking a different section, expand it (auto-collapses others)
      const newExpanded = prev === sectionId ? null : sectionId;

      // Save to localStorage
      try {
        localStorage.setItem(
          'sidebar-expanded-section',
          JSON.stringify(newExpanded)
        );
      } catch (error) {
        console.warn('Failed to save sidebar state to localStorage:', error);
      }

      return newExpanded;
    });
  };

  return {
    expandedSection,
    toggleSection,
  };
};
