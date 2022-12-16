import { clamp } from "@client/utils";
import Color from "@shared/types/color";
import { PaintFetcher } from "components/contexts/paint";
import ToolbarProvider from "components/contexts/toolbar";
import ToolbarContainer, {
  MenuItem,
} from "components/toolbar/toolbarContainer";
import { isEmpty } from "lodash/fp";
import { FC } from "react";

const PaintToolbar: FC = () => {
  const { loadFromImage, width, height, layers } = PaintFetcher();

  const handleLoadUrl = () => {
    const url = prompt(
      "Image URL",
      "https://cdn.pixabay.com/photo/2015/03/17/02/01/cubes-677092__480.png"
    );

    if (isEmpty(url)) return;

    const image = new Image();
    image.src = url;
    image.onload = () => {
      loadFromImage(image);
    };
  };

  const handleLoadLocal = () => {
    const input = document.createElement("input");
    input.type = "file";

    input.onchange = (e: any) => {
      const files = e.target.files;

      //TODO: Duplicate code, same as in getting files from clipboard paste, need to merge it inside PaintContext eventually...
      for (let i = 0; i < files.length; i++) {
        const file = files[i];

        if (!file.type.startsWith("image")) continue;

        const image = new Image();
        image.onload = () => {
          loadFromImage(image);
        };
        image.src = window.URL.createObjectURL(file);
      }
    };

    input.click();
  };

  const addColors = (
    r1: number,
    g1: number,
    b1: number,
    a1: number,
    r2: number,
    g2: number,
    b2: number,
    a2: number
  ) => {
    const r = new Color(0, 0, 0, 0);

    r.a = 255 - (255 - a1) * (255 - a2);
    if (r.a <= 0) return r;
    r.r = (r1 * a1) / r.a + (r2 * a2 * (255 - a1)) / r.a;
    r.g = (g1 * a1) / r.a + (g2 * a2 * (255 - a1)) / r.a;
    r.b = (b1 * a1) / r.a + (b2 * a2 * (255 - a1)) / r.a;

    return r;
  };

  const handleSave = () => {
    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const pixels = new Uint8ClampedArray(width * height * 4);

    for (const layer of layers) {
      // if (!(layer.id in visibleLayers)) continue;

      for (let i = 0; i < layer.pixels.length / 4; i++) {
        const r1 = layer.pixels[i * 4];
        const g1 = layer.pixels[i * 4 + 1];
        const b1 = layer.pixels[i * 4 + 2];
        const a1 = layer.pixels[i * 4 + 3];

        const r2 = pixels[i * 4];
        const g2 = pixels[i * 4 + 1];
        const b2 = pixels[i * 4 + 2];
        const a2 = pixels[i * 4 + 3];

        const combined = addColors(r1, g1, b1, a1, r2, g2, b2, a2);

        pixels[i * 4] = combined.r;
        pixels[i * 4 + 1] = combined.g;
        pixels[i * 4 + 2] = combined.b;
        pixels[i * 4 + 3] = combined.a;
      }
    }

    ctx.putImageData(new ImageData(pixels, width, height), 0, 0);

    const downloadLink = document.createElement("a");
    downloadLink.setAttribute("download", "CanvasAsImage.png");
    const url = canvas
      .toDataURL()
      .replace(/^data:image\/png/, "data:application/octet-stream");
    downloadLink.setAttribute("href", url);
    downloadLink.click();
  };

  const toolbarMenuItems: MenuItem[] = [
    {
      text: "File",
      subItems: [
        { text: "Load (URL)", onClick: handleLoadUrl },
        { text: "Load (local)", onClick: handleLoadLocal },
        { text: "Download", onClick: handleSave },
      ],
    },
  ];

  return (
    <ToolbarProvider>
      <ToolbarContainer menuItems={toolbarMenuItems} />
    </ToolbarProvider>
  );
};

export default PaintToolbar;
