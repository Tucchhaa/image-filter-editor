import { useState, createContext, ReactNode, FC, useMemo, useCallback } from 'react'

// Keep the new interfaces from server_timothy branch
export interface UploadedImage {
    file: File;
    preview: string;
    serverResponse?: UploadResponse;
}

export interface UploadResponse {
    status: string;
    message: string;
    details: {
        original_size: number;
        filename: string;
        mock_upscale_factor: number;
    };
}

// Combine both AppState interfaces
export interface AppState {
    image: UploadedImage | null;
    imageData: ImageData | null;
    updateAppState: (newState: Partial<AppState>) => void;
}

// Update defaultState to include both properties
const defaultState: AppState = {
    image: null,
    imageData: undefined,
    updateAppState: undefined,
};

export const AppContext = createContext<AppState>(defaultState);

export const AppContextProvider: FC<{ children: ReactNode }> = ({ children }) => {
    const [image, setImage] = useState<UploadedImage | null>(null);
    const [imageData, setImageData] = useState<ImageData | null>(null);

    const updateAppState = useCallback((newState: Partial<AppState>) => {
        // Handle both image and imageData updates
        if (newState.image !== undefined) {
            setImage(prevImage => {
                if (newState.image === null) return null;
                return {
                    ...prevImage,
                    ...newState.image,
                };
            });
        }
        if (newState.imageData !== undefined) {
            setImageData(newState.imageData);
        }
    }, []);

    const contextValue = useMemo(() => ({
        image,
        imageData, 
        updateAppState
    } as AppState), [image, imageData, updateAppState]);

    return (
        <AppContext.Provider value={contextValue}>
            {children}
        </AppContext.Provider>
    );
}