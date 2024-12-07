
import * as React from 'react';
import {  BaseFilter } from "./base-filter";
import {Slider, Stack, Typography } from "@mui/joy";

export const MosaicMadnessFilter: BaseFilter = {
    name: "Mosaic Madness",

    Options: ({ setOptions }: { setOptions: any }) => {
        React.useEffect(() => {
            // Set default options when the component mounts
            setOptions({ k: 5, tileSize: 10 });
        }, [setOptions]);
    
        const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
            const { name, value } = event.target;
            setOptions((prevOptions: any) => ({
                ...prevOptions,
                [name]: parseInt(value, 10),
            }));
        };
        
        return (
            <Stack spacing={0}>
                <div>
                    <Typography>Cluster Count (k):</Typography>
                    <Slider
                        name="k"
                        defaultValue={5}
                        min={1}
                        max={50}
                        step={1}
                        onChange={(e, value) => handleInputChange({ target: { name: 'k', value } })}
                        valueLabelDisplay="auto"
                    />
                </div>
                <div>
                    <Typography>Tile Size:</Typography>
                    <Slider
                        name="tileSize"
                        defaultValue={10}
                        min={1}
                        max={100}
                        step={1}
                        onChange={(e, value) => handleInputChange({ target: { name: 'tileSize', value } })}
                        valueLabelDisplay="auto"
                    />
                </div>
            </Stack>
        );
    },

    applyFilter: async (image: ImageData, options: { k: number; tileSize: number }): Promise<ImageData> => {
        console.log("Mosaic Madness filter is being applied...");
        console.log("Options:", options);
        const { k, tileSize } = options;
        console.log("Applying Mosaic Madness filter with options:", { k, tileSize });

        const { data, width, height } = image;

        // Helper function to initialize centroids
        const initializeCentroids = (k: number): number[][] => {
            const centroids: number[][] = [];
            for (let i = 0; i < k; i++) {
                const randomIndex = Math.floor(Math.random() * data.length / 4) * 4;
                centroids.push([data[randomIndex], data[randomIndex + 1], data[randomIndex + 2]]);
            }
            return centroids;
        };

        // Helper function to assign pixels to nearest centroids
        const assignToClusters = (centroids: number[][]): number[] => {
            const assignments: number[] = [];
            for (let i = 0; i < data.length; i += 4) {
                const pixel = [data[i], data[i + 1], data[i + 2]];
                let closestIndex = 0;
                let closestDistance = Infinity;

                for (let j = 0; j < centroids.length; j++) {
                    const [r, g, b] = centroids[j];
                    const distance = Math.sqrt(
                        (pixel[0] - r) ** 2 + (pixel[1] - g) ** 2 + (pixel[2] - b) ** 2
                    );

                    if (distance < closestDistance) {
                        closestDistance = distance;
                        closestIndex = j;
                    }
                }
                assignments.push(closestIndex);
            }
            return assignments;
        };

        // Helper function to compute new centroids
        const computeCentroids = (assignments: number[], k: number): number[][] => {
            const sums = Array.from({ length: k }, () => [0, 0, 0]);
            const counts = Array(k).fill(0);

            for (let i = 0; i < assignments.length; i++) {
                const clusterIndex = assignments[i];
                sums[clusterIndex][0] += data[i * 4];
                sums[clusterIndex][1] += data[i * 4 + 1];
                sums[clusterIndex][2] += data[i * 4 + 2];
                counts[clusterIndex]++;
            }

            return sums.map((sum, index) => {
                if (counts[index] === 0) return sum;
                return sum.map((value) => value / counts[index]);
            });
        };

        // Initialize centroids
        let centroids = initializeCentroids(k);
        let assignments: number[] = [];

        // Iterate until convergence or max iterations
        for (let iteration = 0; iteration < 10; iteration++) {
            assignments = assignToClusters(centroids);
            centroids = computeCentroids(assignments, k);
        }

        // Apply centroids to the image
        const newData = new Uint8ClampedArray(data.length);
        for (let i = 0; i < assignments.length; i++) {
            const clusterIndex = assignments[i];
            const [r, g, b] = centroids[clusterIndex];
            newData[i * 4] = r;
            newData[i * 4 + 1] = g;
            newData[i * 4 + 2] = b;
            newData[i * 4 + 3] = data[i * 4 + 3]; // Preserve alpha channel
        }

        return new ImageData(newData, width, height);
    },
};
