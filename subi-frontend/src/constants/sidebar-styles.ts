export const sidebarStyles = {
  // Main sidebar container
  sidebar: {
    base: 'fixed top-0 left-0 z-40 h-screen transition-all duration-300 ease-in-out border-r border-gray-800 lg:translate-x-0',
    open: 'translate-x-0',
    closed: '-translate-x-full',
    mobile: 'w-80',
    desktop: {
      open: 'w-72',
      closed: 'w-16',
    },
  },

  // Sidebar content
  content: {
    base: 'flex h-full flex-col bg-gray-800',
    header:
      'flex items-center justify-between p-4 h-16 border-b border-gray-800 bg-gray-900 relative',
    navigation: 'flex-1 overflow-y-auto p-3 space-y-1',
    footer: 'border-t border-gray-800 bg-gray-900',
  },

  // Header elements
  header: {
    title: 'text-lg font-semibold text-white',
    titleContainer: 'absolute left-0 right-0 flex justify-center',
    collapseButton:
      'h-8 w-8 p-0 hover:bg-gray-800 rounded-full border border-gray-700 shadow-sm z-10',
    chevron: 'h-4 w-4 transition-transform text-gray-200',
  },

  // Section styles
  section: {
    container: 'space-y-1',
    separator: 'my-3 bg-gray-800',
    trigger: {
      expanded:
        'w-full justify-between px-3 py-2 h-auto text-xs font-semibold text-gray-400 uppercase tracking-wider hover:bg-gray-700 hover:text-gray-300 transition-colors',
      collapsed: 'w-full h-8 p-0 hover:bg-gray-700 transition-colors',
    },
    content: 'space-y-0.5',
    nav: 'space-y-0.5 mt-1',
    chevron: 'h-4 w-4 transition-transform duration-200',
  },

  // Footer styles
  footer: {
    container: 'p-3',
    controls: {
      collapsed: 'flex justify-center gap-1',
      expanded: 'flex items-center justify-center gap-2',
    },
    button: 'h-10 w-10 p-0 text-gray-200 hover:bg-gray-800',
  },

  // Mobile overlay
  overlay: 'fixed inset-0 bg-black/50 z-30 lg:hidden',
} as const;
