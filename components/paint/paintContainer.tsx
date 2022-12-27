import { FC, useCallback, useEffect, useRef } from "react";
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
import Location from "@shared/types/location";
import PasteAction from "@client/undo/pasteAction";
import useDocumentEvent from "@client/hooks/useDocumentEvent";
import { ilerp, lerp } from "@client/utils";

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
    offset,
    getRealScale,
    setOffset,
    addUndoAction,
    scaleToSize,
  } = PaintFetcher();

  useDocumentEvent(
    "paste",
    useCallback(
      (e: ClipboardEvent) => {
        if (!e.clipboardData || e.clipboardData.files.length != 1) return; //TODO: Support multiple images? Each image to it's own layer, canvas size is of the biggest image

        for (let i = 0; i < e.clipboardData.files.length; i++) {
          const file = e.clipboardData.files[i];

          if (!file.type.startsWith("image")) continue;

          const image = new Image();
          image.onload = () => {
            addUndoAction(new PasteAction(layers, width, height, image));
            loadFromImage(image);
            setSelection(new Selection());
          };
          image.src = window.URL.createObjectURL(file);
        }
      },
      [addUndoAction, height, layers, loadFromImage, setSelection, width]
    )
  );

  useEffect(() => {
    const newLayers: Layer[] = [];

    newLayers.push(new Layer(width, height, true));
    setLayers(newLayers);

    const a = window.innerWidth / width;
    const b = (window.innerHeight - 31 - 60) / height; //TODO: 31 is a bad hard-wired variable, need to make this actually dynamic based on canvas's available size!
    setScale(ilerp(0.25, 1600, Math.min(b, a)));
  }, []);

  useDocumentEvent(
    "keydown",
    useCallback(
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
            const didUndo = undoAction();
            if (didUndo) {
              setNotification(`Undo`);
            }
          }

          if (e.code == "KeyY") {
            const redo = redoAction();
            if (redo) {
              setNotification(`Redo`);
            }
          }

          if (e.shiftKey && e.code == "KeyX" && selection.isValid()) {
            setOffset(new Location());
            scaleToSize(selection.width, selection.height);

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
        setNotification,
        undoAction,
        redoAction,
        setOffset,
        scaleToSize,
        cropToSelection,
      ]
    )
  );

  useDocumentEvent(
    "wheel",
    useCallback(
      (e: WheelEvent) => {
        if (!(e.target as any).getAttribute("data-interactable")) return;
        const containerOffset = { x: 0, y: 0 };

        if (containerRef.current) {
          const container = containerRef.current;
          const rect = container.getBoundingClientRect();
          containerOffset.x = rect.x;
          containerOffset.y = rect.y;
        }

        const realScale = getRealScale();

        const preMouseLoc = new Location(
          Math.floor(
            (e.clientX -
              containerOffset.x +
              (width * realScale) / 2 -
              offset.x * realScale) /
              realScale
          ),
          Math.floor(
            (e.clientY -
              containerOffset.y +
              (height * realScale) / 2 -
              offset.y * realScale) /
              realScale
          )
        );

        const newScale = clamp(
          scale + e.deltaY / -100000 / lerp(3, 0.1, scale / 0.04),
          0,
          100
        );
        const newRealScale = getRealScale(newScale);

        const postMouseLoc = new Location(
          Math.floor(
            (e.clientX -
              containerOffset.x +
              (width * newRealScale) / 2 -
              offset.x * newRealScale) /
              newRealScale
          ),
          Math.floor(
            (e.clientY -
              containerOffset.y +
              (height * newRealScale) / 2 -
              offset.y * newRealScale) /
              newRealScale
          )
        );

        const difference = postMouseLoc.minus(preMouseLoc);

        setScale(newScale);
        setOffset(offset.add(difference));
      },
      [getRealScale, height, offset, scale, setOffset, setScale, width]
    )
  );

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
