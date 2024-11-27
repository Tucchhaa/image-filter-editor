import { useState, createContext, ReactNode, FC, useMemo, useCallback, useContext } from 'react';

export interface AppState {
  imageData: ImageData | null;
  updateAppState: (newState: Partial<AppState>) => void;
}

const defaultState: AppState = {
  imageData: null,
  updateAppState: () => {},
};

export const AppContext = createContext<AppState>(defaultState);

export const AppContextProvider: FC<{ children: ReactNode }> = ({ children }) => {
  const [imageData, setImageData] = useState<ImageData | null>(null);

  const updateAppState = useCallback((newState: Partial<AppState>) => {
    if (newState.imageData !== undefined) {
      setImageData(newState.imageData);
    }
  }, []);

  const contextValue = useMemo(
    () => ({
      imageData,
      updateAppState,
    }),
    [imageData, updateAppState]
  );

  return <AppContext.Provider value={contextValue}>{children}</AppContext.Provider>;
};

export const useAppContext = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useAppContext must be used within an AppProvider');
  }
  return context;
};
