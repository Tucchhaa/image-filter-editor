import { createRoot } from 'react-dom/client';
import { useContext } from "react";

import { CssBaseline, CssVarsProvider } from "@mui/joy";

import { ImageUploader } from "./image-uploader";
import { AppContext, AppContextProvider } from "./app-context";
import { Editor } from "./editor/editor";
import { EditorContextProvider } from "./editor/editor-context";

const root = createRoot(document.getElementById('app'));

const App = () => {
    const { imageData } = useContext(AppContext);

    return (
        <main>
            {
                imageData == null
                    ? <ImageUploader/>
                    : <EditorContextProvider><Editor/></EditorContextProvider>
            }
        </main>
    );
}


root.render(
    <CssVarsProvider defaultMode="dark">
        <CssBaseline/>
        <AppContextProvider>
            <App/>
        </AppContextProvider>
    </CssVarsProvider>
);
