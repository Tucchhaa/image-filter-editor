import { BaseFilter } from "./filters/base-filter";
import { useCallback, useContext, useState } from "react";
import { EditorContext } from "./editor-context";
import { Box, Button, Stack, Typography } from "@mui/joy";
import CloseRoundedIcon from "@mui/icons-material/CloseRounded";

export const EditorItem = ({ filter }: { filter: BaseFilter }) => {
    const [opened, setOpened] = useState(false);
    const [options, setOptions] = useState(null);
    const { applyFilter, processingFilter } = useContext(EditorContext);

    const toggleOpened = useCallback(() => { setOpened(!opened); }, [opened]);

    const isLoading = processingFilter === filter;
    const isDisabled = isLoading === false && processingFilter !== null;

    return (
        <Box className="filter-item">
            <Typography level="title-md" onClick={toggleOpened}>{ filter.name }</Typography>

            { opened &&
                <>
                    <Box sx={{ margin: '4px 0 8px' }}>
                        <filter.Options setOptions={setOptions} />
                    </Box>

                    <Stack direction="row">
                        <Button
                            loading={isLoading}
                            disabled={isDisabled}
                            onClick={() => { applyFilter(filter, options); }
                        }
                            size="sm"
                        >
                            Apply
                        </Button>

                        <Button
                            onClick={toggleOpened}
                            size="sm" color="neutral" variant="plain"
                        >
                            <CloseRoundedIcon />
                        </Button>
                    </Stack>
                </>
            }
        </Box>
    );
}