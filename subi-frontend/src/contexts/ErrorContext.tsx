import React, { ReactNode, createContext, useReducer } from 'react';

interface ErrorState {
  errors: Record<string, Error>;
  retryAttempts: Record<string, number>;
  errorPatterns: Record<string, number>;
  globalErrorHandler: ((error: Error, errorInfo?: React.ErrorInfo) => void) | null;
}

type ErrorAction =
  | { type: 'ADD_ERROR'; id: string; error: Error }
  | { type: 'CLEAR_ERROR'; id: string }
  | { type: 'CLEAR_ALL_ERRORS' }
  | { type: 'INCREMENT_RETRY'; id: string }
  | { type: 'RESET_RETRY'; id: string }
  | { type: 'TRACK_ERROR_PATTERN'; pattern: string }
  | { type: 'SET_GLOBAL_HANDLER'; handler: (error: Error, errorInfo?: React.ErrorInfo) => void };

const initialState: ErrorState = {
  errors: {},
  retryAttempts: {},
  errorPatterns: {},
  globalErrorHandler: null,
};

function errorReducer(state: ErrorState, action: ErrorAction): ErrorState {
  switch (action.type) {
    case 'ADD_ERROR':
      return {
        ...state,
        errors: {
          ...state.errors,
          [action.id]: action.error,
        },
      };

    case 'CLEAR_ERROR': {
      const { [action.id]: _, ...remainingErrors } = state.errors;
      const { [action.id]: __, ...remainingRetries } = state.retryAttempts;
      return {
        ...state,
        errors: remainingErrors,
        retryAttempts: remainingRetries,
      };
    }

    case 'CLEAR_ALL_ERRORS':
      return {
        ...state,
        errors: {},
        retryAttempts: {},
      };

    case 'INCREMENT_RETRY':
      return {
        ...state,
        retryAttempts: {
          ...state.retryAttempts,
          [action.id]: (state.retryAttempts[action.id] || 0) + 1,
        },
      };

    case 'RESET_RETRY': {
      const { [action.id]: ___, ...remainingRetryAttempts } = state.retryAttempts;
      return {
        ...state,
        retryAttempts: remainingRetryAttempts,
      };
    }

    case 'TRACK_ERROR_PATTERN':
      return {
        ...state,
        errorPatterns: {
          ...state.errorPatterns,
          [action.pattern]: (state.errorPatterns[action.pattern] || 0) + 1,
        },
      };

    case 'SET_GLOBAL_HANDLER':
      return {
        ...state,
        globalErrorHandler: action.handler,
      };

    default:
      return state;
  }
}

interface ErrorContextValue {
  state: ErrorState;
  addError: (id: string, error: Error) => void;
  clearError: (id: string) => void;
  clearAllErrors: () => void;
  incrementRetry: (id: string) => void;
  resetRetry: (id: string) => void;
  trackErrorPattern: (pattern: string) => void;
  setGlobalErrorHandler: (handler: (error: Error, errorInfo?: React.ErrorInfo) => void) => void;
  getRetryCount: (id: string) => number;
  hasError: (id: string) => boolean;
  getError: (id: string) => Error | undefined;
  canRetry: (id: string, maxRetries?: number) => boolean;
  getErrorPatternCount: (pattern: string) => number;
}

// eslint-disable-next-line react-refresh/only-export-components
export const ErrorContext = createContext<ErrorContextValue | undefined>(undefined);

interface ErrorProviderProps {
  children: ReactNode;
}

export function ErrorProvider({ children }: ErrorProviderProps) {
  const [state, dispatch] = useReducer(errorReducer, initialState);

  const contextValue: ErrorContextValue = {
    state,
    addError: (id: string, error: Error) => {
      dispatch({ type: 'ADD_ERROR', id, error });

      // Track error patterns
      const errorType = error.constructor.name;
      const errorMessage = error.message.toLowerCase();

      if (errorMessage.includes('network')) {
        dispatch({ type: 'TRACK_ERROR_PATTERN', pattern: 'network' });
      } else if (errorMessage.includes('timeout')) {
        dispatch({ type: 'TRACK_ERROR_PATTERN', pattern: 'timeout' });
      } else if (errorMessage.includes('unauthorized') || errorMessage.includes('403')) {
        dispatch({ type: 'TRACK_ERROR_PATTERN', pattern: 'auth' });
      } else if (errorMessage.includes('server') || errorMessage.includes('500')) {
        dispatch({ type: 'TRACK_ERROR_PATTERN', pattern: 'server' });
      }

      dispatch({ type: 'TRACK_ERROR_PATTERN', pattern: errorType });

      // Call global error handler if set
      if (state.globalErrorHandler) {
        state.globalErrorHandler(error);
      }
    },
    clearError: (id: string) => dispatch({ type: 'CLEAR_ERROR', id }),
    clearAllErrors: () => dispatch({ type: 'CLEAR_ALL_ERRORS' }),
    incrementRetry: (id: string) => dispatch({ type: 'INCREMENT_RETRY', id }),
    resetRetry: (id: string) => dispatch({ type: 'RESET_RETRY', id }),
    trackErrorPattern: (pattern: string) => dispatch({ type: 'TRACK_ERROR_PATTERN', pattern }),
    setGlobalErrorHandler: (handler: (error: Error, errorInfo?: React.ErrorInfo) => void) =>
      dispatch({ type: 'SET_GLOBAL_HANDLER', handler }),
    getRetryCount: (id: string) => state.retryAttempts[id] || 0,
    hasError: (id: string) => id in state.errors,
    getError: (id: string) => state.errors[id],
    canRetry: (id: string, maxRetries = 3) => (state.retryAttempts[id] || 0) < maxRetries,
    getErrorPatternCount: (pattern: string) => state.errorPatterns[pattern] || 0,
  };

  return (
    <ErrorContext.Provider value={contextValue}>
      {children}
    </ErrorContext.Provider>
  );
}

