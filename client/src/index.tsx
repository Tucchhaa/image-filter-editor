import { createRoot } from 'react-dom/client';
import { useContext } from "react";

import { CssBaseline, CssVarsProvider } from "@mui/joy";

import { ImageUploader } from "./image-uploader";
import { AppContext, AppContextProvider } from "./app-context";
import { Editor } from "./editor";

const root = createRoot(document.getElementById('app'));

const App = () => {
    const { image } = useContext(AppContext);

    return (
        <main>
            {
                image == null
                    ? <ImageUploader/>
                    : <Editor/>
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
