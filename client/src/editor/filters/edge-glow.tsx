import * as React from "react";
import { BaseFilter } from "./base-filter";
import { Select, Option} from "@mui/joy";
// Utility function to create neon colors for edges

function getColorFromPalette(
  value: number,
  palette: string
): [number, number, number] {
  switch (palette) {
    case "psychedelic":
      return [
        Math.sin(value * 0.1) * 127 + 128,
        Math.sin(value * 0.2 + 2) * 127 + 128,
        Math.sin(value * 0.3 + 4) * 127 + 128,
      ];
    case "cool":
      return [
        0,
        Math.sin(value * 0.3) * 127 + 128,
        Math.cos(value * 0.2) * 127 + 128,
      ];
    case "warm":
      return [
        Math.cos(value * 0.3) * 127 + 128,
        Math.sin(value * 0.2) * 50 + 100,
        0,
      ];
    case "firestorm":
      return [
        Math.sin(value * 0.3) * 255,
        Math.sin(value * 0.2) * 127 + 128,
        0,
      ];
    default:
      return [255, 255, 255];
  }
}
// Sobel filter implementation
function applySobelFilter(image: ImageData, palette: string): ImageData {
  const { width, height, data } = image;
  const output = new ImageData(width, height);
  const sobelX = [-1, 0, 1, -2, 0, 2, -1, 0, 1];
  const sobelY = [-1, -2, -1, 0, 0, 0, 1, 2, 1];

  const getPixel = (x: number, y: number, c: number) => {
    const idx = (y * width + x) * 4 + c;
    return data[idx] || 0;
  };

  for (let y = 1; y < height - 1; y++) {
    for (let x = 1; x < width - 1; x++) {
      let gx = 0,
        gy = 0;

      for (let ky = -1; ky <= 1; ky++) {
        for (let kx = -1; kx <= 1; kx++) {
          const weightX = sobelX[(ky + 1) * 3 + (kx + 1)];
          const weightY = sobelY[(ky + 1) * 3 + (kx + 1)];
          const intensity =
            (getPixel(x + kx, y + ky, 0) +
              getPixel(x + kx, y + ky, 1) +
              getPixel(x + kx, y + ky, 2)) /
            3;

          gx += weightX * intensity;
          gy += weightY * intensity;
        }
      }

      const edgeMagnitude = Math.sqrt(gx ** 2 + gy ** 2);
      const [r, g, b] = getColorFromPalette(edgeMagnitude, palette);

    
    const idx = (y * width + x) * 4;
    output.data[idx] = r;
    output.data[idx + 1] = g;
    output.data[idx + 2] = b;
    output.data[idx + 3] = 255; // Alpha channel
    }
  }

  return output;
}

export const EdgeGlowFilter: BaseFilter = {
  name: "Edge Glow Filter",

  Options: ({ setOptions }) => {
    React.useEffect(() => {
      // Set the default palette value when the component mounts
      setOptions({ palette: "psychedelic" });
    }, [setOptions]);

    const handleInputChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
      const { name, value } = e.target;
      setOptions((prev: any) => ({
        ...prev,
        [name]: value,
      }));
    };
    return (
      <div>
        <Select defaultValue="psychedelic" onChange={(e, value) => handleInputChange({ target: { name: 'palette', value } })}
        variant="solid"
        >
        <Option value="psychedelic">Psychedelic</Option>
        <Option value="cool">Cool</Option>
        <Option value="warm">Warm</Option>
        <Option value="firestorm">Firestorm</Option>
        </Select>
      </div>
    );
  },

  applyFilter: async (image: ImageData, options: any) => {
    const { palette = "psychedelic" } = options; // Default to "psychedelic"
    return applySobelFilter(image, palette);
  },
};
