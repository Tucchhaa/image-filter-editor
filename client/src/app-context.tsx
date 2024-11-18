import { useState, createContext, ReactNode, FC, useMemo, useCallback } from 'react'

export interface UploadedImage {
    file: File;
    preview: string;
    serverResponse?: UploadResponse;  // Add this new field
}

// Add this interface for the server response
export interface UploadResponse {
    status: string;
    message: string;
    details: {
        original_size: number;
        filename: string;
        mock_upscale_factor: number;
    };
}

export interface AppState {
    image: UploadedImage | null;
    updateAppState: (newState: Partial<AppState>) => void;
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
            setImage(prevImage => {
                if (newState.image === null) return null;
                return {
                    ...prevImage,
                    ...newState.image,
                };
            });
        }
    }, []);

    const contextValue = useMemo(() => ({
        image, 
        updateAppState
    } as AppState), [image, updateAppState]);

    return (
        <AppContext.Provider value={contextValue}>
            {children}
        </AppContext.Provider>
    );
}