import { useState, createContext, ReactNode, FC, useMemo, useCallback, useContext } from 'react'
import { BaseFilter } from "./filters/base-filter";
import { ImageHistory } from "./image-history";
import { AppContext } from "../app-context";

export interface EditorState {
    processingFilter: BaseFilter | null;
    applyFilter: (filter: BaseFilter, options: any) => Promise<void>;
    imageHistory: ImageHistory;
    setCurrentHistoryIndex: (index: number) => void;
}

const defaultState: EditorState = {
    processingFilter: undefined,
    applyFilter: undefined,
    imageHistory: undefined,
    setCurrentHistoryIndex: undefined,
};

export const EditorContext = createContext<EditorState>(defaultState);

export const EditorContextProvider: FC<{ children: ReactNode }> = ({ children }) => {
    const { imageData } = useContext(AppContext);
    const [processingFilter, setProcessingFilter] = useState(null);

    const imageHistory = useMemo(() => new ImageHistory([imageData]), [imageData]);
    const [currentHistoryIndex, _setCurrentHistoryIndex] = useState(imageHistory.currentIndex);

    const applyFilter = useCallback(async (filter: BaseFilter, options: any) => {
        setProcessingFilter(filter);

        const startTime = Date.now();
        const newImageData = await filter.applyFilter(imageHistory.getCurrentImage(), options);

        console.log('Processing time', Date.now() - startTime);

        imageHistory.push(newImageData);
        _setCurrentHistoryIndex(imageHistory.currentIndex);

        setProcessingFilter(null);
    }, []);

    const setCurrentHistoryIndex = useCallback(index => {
        index = Math.min(imageHistory.stack.length-1, Math.max(0, index));
        imageHistory.currentIndex = index;
        _setCurrentHistoryIndex(index);
    }, [currentHistoryIndex, _setCurrentHistoryIndex]);

    const contextValue = useMemo(() => ({
            processingFilter,
            applyFilter,
            imageHistory,
            setCurrentHistoryIndex,
        } as EditorState),
        [processingFilter, imageHistory, applyFilter, setCurrentHistoryIndex]
    );

    return (
        <EditorContext.Provider value={contextValue}>
            {children}
        </EditorContext.Provider>
    );
}
