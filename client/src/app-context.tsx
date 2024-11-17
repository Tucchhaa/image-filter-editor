import { useState, createContext, ReactNode, FC, useMemo, useCallback } from 'react'

export interface UploadedImage {
    file: File,
    preview: string
}

export interface AppState {
    image: UploadedImage | null,
    updateAppState: (newState: Partial<AppState>) => void
}

const defaultState: AppState = {
    image: null,
    updateAppState: (newState?: Partial<AppState>) => {},
};

export const AppContext = createContext<AppState>(defaultState);

export const AppContextProvider: FC<{ children: ReactNode }> = ({ children }) => {
    const [image, setImage] = useState<UploadedImage | null>(null);

    const updateAppState = useCallback((newState: Partial<AppState>) => {
        if (newState.image !== undefined) {
            setImage(newState.image);
        }
    }, []);

    const contextValue = useMemo(() => ({
        image, updateAppState
    } as AppState), [image, updateAppState]);

    return (
        <AppContext.Provider value={contextValue}>
            {children}
        </AppContext.Provider>
    );
}
