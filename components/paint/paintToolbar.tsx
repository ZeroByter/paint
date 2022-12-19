import useWindowEvent from "@client/hooks/useWindowEvent";
import layersToImageData from "@client/layersToImageData";
import { clamp } from "@client/utils";
import Color from "@shared/types/color";
import { PaintFetcher } from "components/contexts/paint";
import ToolbarProvider from "components/contexts/toolbar";
import ToolbarContainer, {
  MenuItem,
} from "components/toolbar/toolbarContainer";
import { isEmpty } from "lodash/fp";
import { FC, useCallback } from "react";

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

  const handleLoadLocal = useCallback(() => {
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
  }, [loadFromImage]);

  const handleSave = useCallback(() => {
    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.putImageData(
      layersToImageData(
        0,
        0,
        width,
        height,
        width,
        layers.filter((layer) => layer.visible)
      ),
      0,
      0
    );

    const downloadLink = document.createElement("a");
    downloadLink.setAttribute("download", "DownloadedImage.png");
    const url = canvas
      .toDataURL()
      .replace(/^data:image\/png/, "data:application/octet-stream");
    downloadLink.setAttribute("href", url);
    downloadLink.click();
  }, [height, layers, width]);

  useWindowEvent(
    "keydown",
    useCallback(
      (e: KeyboardEvent) => {
        if (e.ctrlKey) {
          if (e.code == "KeyS") {
            e.preventDefault();

            handleSave();
          }
          if (e.code == "KeyO") {
            e.preventDefault();

            handleLoadLocal();
          }
        }
      },
      [handleLoadLocal, handleSave]
    )
  );

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
