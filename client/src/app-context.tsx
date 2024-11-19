import { useState, createContext, ReactNode, FC, useMemo, useCallback } from 'react'

export interface AppState {
    imageData: ImageData | null,
    updateAppState: (newState: Partial<AppState>) => void
}

const defaultState: AppState = {
    imageData: undefined,
    updateAppState: undefined,
};

export const AppContext = createContext<AppState>(defaultState);

export const AppContextProvider: FC<{ children: ReactNode }> = ({ children }) => {
    const [imageData, setImageData] = useState<ImageData | null>(null);

    const updateAppState = useCallback((newState: Partial<AppState>) => {
        if (newState.imageData !== undefined) {
            setImageData(newState.imageData);
        }
    }, []);

    const contextValue = useMemo(() => ({
        imageData, updateAppState
    } as AppState), [imageData, updateAppState]);

    return (
        <AppContext.Provider value={contextValue}>
            {children}
        </AppContext.Provider>
    );
}
