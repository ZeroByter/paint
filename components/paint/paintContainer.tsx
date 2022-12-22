import { FC, useCallback, useEffect, useMemo, useRef } from "react";
import Canvas from "./canvas";
import css from "./paintContainer.module.scss";
import Layer from "@shared/types/layer";
import LayersPanel from "./layers/layersPanel";
import { PaintFetcher } from "components/contexts/paint";
import { clamp } from "lodash";
import RootContainer from "./rootContainer";
import LayersContainer from "./layersContainer";
import ColorsPanel from "./colors/colorsPanel";
import ToolsPanel from "./tools/toolsPanel";
import SelectionContainer from "./selection/selectionContainer";
import layersToImageData from "@client/layersToImageData";
import Selection from "@shared/types/selection";
import TransparencyBackground from "./transparencyBackground";
import Notification from "./notification";

const PaintContainer: FC = () => {
  const containerRef = useRef<HTMLDivElement | null>(null);

  const {
    width,
    height,
    scale,
    setScale,
    setLayers,
    layers,
    loadFromImage,
    selection,
    undoAction,
    redoAction,
    cropToSelection,
    setSelection,
    setNotification,
  } = PaintFetcher();

  useEffect(() => {
    const newLayers: Layer[] = [];

    newLayers.push(new Layer(width, height, true));
    setLayers(newLayers);

    document.addEventListener("paste", handlePaste);

    return () => {
      document.removeEventListener("paste", handlePaste);
    };
  }, []);

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.ctrlKey) {
        if (e.code == "KeyC") {
          const isSelectionValid = selection && selection.isValid();

          const finalX = isSelectionValid ? selection.x : 0;
          const finalY = isSelectionValid ? selection.y : 0;
          const finalWidth = isSelectionValid ? selection.width : width;
          const finalHeight = isSelectionValid ? selection.height : height;

          const canvas = document.createElement("canvas");
          canvas.width = finalWidth;
          canvas.height = finalHeight;

          const ctx = canvas.getContext("2d");
          if (!ctx) return;

          const newImageData = layersToImageData(
            finalX,
            finalY,
            finalWidth,
            finalHeight,
            width,
            layers.filter((layer) => layer.active && layer.visible)
          );

          ctx.putImageData(newImageData, 0, 0);

          setNotification(`Copied image`, newImageData);

          canvas.toBlob((blob) => {
            if (!blob) return;

            const item = new ClipboardItem({ "image/png": blob });
            navigator.clipboard.write([item]);
          });
        }

        if (e.code == "KeyZ") {
          undoAction();
          setNotification(`Undo`);
        }

        if (e.code == "KeyY") {
          redoAction();
          setNotification(`Redo`);
        }

        if (e.shiftKey && e.code == "KeyX") {
          cropToSelection(selection);
          setNotification(`Cropped to selection`);
        }
      }
    },
    [
      selection,
      width,
      height,
      layers,
      undoAction,
      redoAction,
      cropToSelection,
      setNotification,
    ]
  );

  useEffect(() => {
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [handleKeyDown]);

  const handleScroll = useCallback(
    (e: WheelEvent) => {
      if (!(e.target as any).getAttribute("data-interactable")) return;
      setScale(clamp(scale + e.deltaY / -100000, 0, 100));
    },
    [scale, setScale]
  );

  useEffect(() => {
    document.addEventListener("wheel", handleScroll);

    return () => {
      document.removeEventListener("wheel", handleScroll);
    };
  }, [handleScroll]);

  const handlePaste = (e: ClipboardEvent) => {
    if (!e.clipboardData || e.clipboardData.files.length != 1) return; //TODO: Support multiple images? Each image to it's own layer, canvas size is of the biggest image

    for (let i = 0; i < e.clipboardData.files.length; i++) {
      const file = e.clipboardData.files[i];

      if (!file.type.startsWith("image")) continue;

      const image = new Image();
      image.onload = () => {
        loadFromImage(image);
        setSelection(new Selection());
      };
      image.src = window.URL.createObjectURL(file);
    }
  };

  const renderLayers = layers.map((layer) => {
    return <Canvas key={layer.id} layer={layer} />;
  });

  return (
    <RootContainer>
      <div className={css.root} ref={containerRef}>
        <LayersContainer containerRef={containerRef}>
          <TransparencyBackground />
          {renderLayers}
          {/* <CursorHandle /> */}
        </LayersContainer>
        <SelectionContainer />
      </div>
      <LayersPanel />
      <ColorsPanel />
      <ToolsPanel />
      <Notification />
    </RootContainer>
  );
};

export default PaintContainer;
