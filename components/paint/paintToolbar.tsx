import useWindowEvent from "@client/hooks/useWindowEvent";
import layersToImageData from "@client/layersToImageData";
import Tools from "@client/tools";
import { clamp } from "@client/utils";
import Color from "@shared/types/color";
import Selection from "@shared/types/selection";
import { PaintFetcher } from "components/contexts/paint";
import { loadFromImage, selectTool } from "components/contexts/paintUtils";
import ToolbarProvider from "components/contexts/toolbar";
import ToolbarContainer, {
  MenuItem,
} from "components/toolbar/toolbarContainer";
import { isEmpty, noop } from "lodash/fp";
import { FC, useCallback } from "react";

const PaintToolbar: FC = () => {
  const paintState = PaintFetcher();
  const { width, height, layers, setSelection } = paintState;

  const handleLoadUrl = () => {
    const url = prompt(
      "Image URL",
      "https://cdn.pixabay.com/photo/2015/03/17/02/01/cubes-677092__480.png" //TODO: Remove this default URL eventually...
    );

    if (isEmpty(url)) return;

    const image = new Image();
    image.crossOrigin = "Anonymous";
    image.src = url;
    image.onload = () => {
      loadFromImage(paintState, image);
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
        image.crossOrigin = "anonymous";
        image.onload = () => {
          loadFromImage(paintState, image);
        };
        image.src = window.URL.createObjectURL(file);
      }
    };

    input.click();
  }, [paintState]);

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

  const selectProjectionSelectionTool = () => {
    selectTool(paintState, "projectionSelect", false);
    Tools["projectionSelect"].setInverse(false);
    Tools["projectionSelect"].onSelect(paintState);
  };

  const selectInverseProjectionSelectionTool = () => {
    setSelection(new Selection());

    selectTool(paintState, "projectionSelect", false);
    Tools["projectionSelect"].setInverse(true);
    Tools["projectionSelect"].onSelect(paintState);
  };

  const openGithub = () => {
    open("https://github.com/zerobyter/paint");
  };

  const openTrello = () => {
    open("https://trello.com/b/JvFPH5KM/paint-online");
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
    {
      text: "Effects",
      subItems: [
        { text: "Project Layer", onClick: selectProjectionSelectionTool },
        {
          text: "Inverse Project Layer",
          onClick: selectInverseProjectionSelectionTool,
        },
      ],
    },
    {
      text: "About",
      subItems: [
        { text: "View GitHub", onClick: openGithub },
        { text: "View Trello", onClick: openTrello },
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
