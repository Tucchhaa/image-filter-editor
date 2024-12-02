import { useState, createContext, ReactNode, FC, useMemo, useCallback, useContext } from 'react'
import { BaseFilter } from "./filters/base-filter";
import { ImageHistory } from "./image-history";
import { AppContext } from "../app-context";

export interface EditorState {
    processingFilter: BaseFilter | null;
    applyFilter: (filter: BaseFilter, options: any) => Promise<void>;
    imageHistory: ImageHistory;
}

const defaultState: EditorState = {
    processingFilter: undefined,
    applyFilter: undefined,
    imageHistory: undefined,
};

export const EditorContext = createContext<EditorState>(defaultState);

export const EditorContextProvider: FC<{ children: ReactNode }> = ({ children }) => {
    const { imageData } = useContext(AppContext);
    const [processingFilter, setProcessingFilter] = useState(null);
    const imageHistory = useMemo(() => new ImageHistory([imageData]), [imageData]);

    const applyFilter = useCallback(async (filter: BaseFilter, options: any) => {
        setProcessingFilter(filter);

        const startTime = Date.now();
        const newImageData = await filter.applyFilter(imageHistory.getCurrentImage(), options);

        console.log('Processing time', Date.now() - startTime);

        imageHistory.push(newImageData);

        setProcessingFilter(null);
    }, []);

    const contextValue = useMemo(() => ({
        processingFilter, applyFilter, imageHistory
    } as EditorState), [processingFilter]);

    return (
        <EditorContext.Provider value={contextValue}>
            {children}
        </EditorContext.Provider>
    );
}
