import { convolution, Filter } from "./filter";

export const Laplacian = {
    name: "Laplacian",
    Options,
    applyFilter: (imageData: ImageData) => {
        const kernel = [
            [0, -1, 0],
            [-1, 5, -1],
            [0, -1, 0],
        ];

        return convolution(imageData, kernel);
    }
} as Filter;

function Options() {
    return (
        <>
            <i>No options available</i>
        </>
    )
}
