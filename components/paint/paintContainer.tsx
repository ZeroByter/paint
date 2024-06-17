import { FC, useCallback, useEffect, useRef } from "react";
import Canvas from "./canvas";
import css from "./paintContainer.module.scss";
import Layer from "@shared/types/layer";
import LayersPanel from "./layers/layersPanel";
import { PaintContextType, PaintFetcher } from "components/contexts/paint";
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
import {
  addUndoAction,
  addUpdateCallbacks,
  cropToSelection,
  getRealScale,
  loadOntoNewLayerImage,
  redoAction,
  scaleToSize,
  selectTool,
  setActiveLayers,
  setNotification,
  setPrompt,
  undoAction,
} from "components/contexts/paintUtils";
import ProjectionSelectionContainer from "./projectionSelection/projectionSelectionContainer";
import HistoryPanel from "./history/historyPanel";
import Tools from "@client/tools";

const PaintContainer: FC = () => {
  const containerRef = useRef<HTMLDivElement | null>(null);

  const paintState = PaintFetcher();
  const {
    width,
    height,
    scale,
    setScale,
    setLayers,
    layers,
    selection,
    setProjectionSelection,
    offset,
    setOffset,
  } = paintState;

  useDocumentEvent(
    "paste",
    useCallback(
      (e: ClipboardEvent) => {
        if (e.target != document.body) return;
        if (!e.clipboardData || e.clipboardData.files.length != 1) return; //TODO: Support multiple images? Each image to it's own layer, canvas size is of the biggest image

        for (let i = 0; i < e.clipboardData.files.length; i++) {
          const file = e.clipboardData.files[i];

          if (!file.type.startsWith("image")) continue;

          const image = new Image();
          image.crossOrigin = "anonymous";
          image.onload = async () => {
            let newLayer: Layer;

            let lastActiveLayer = 0;
            for (const index in layers) {
              const layer = layers[index];
              const indexNumber = parseInt(index);

              if (!layer.active) continue;

              if (indexNumber > lastActiveLayer) {
                lastActiveLayer = indexNumber;
              }
            }

            if(image.width > paintState.width || image.height > paintState.height){
              // const buttons = [
              //   "Expand canvas",
              //   "Keep canvas size",
              //   "Cancel"
              // ]
              // const choice = await setPrompt(paintState, "Pasted image is larger than current canvas.", buttons)

              const buttons = [
                "Yes",
                "No",
              ]
              const choice = await setPrompt(paintState, "Resize canvas to fit image?", buttons)

              if(choice == 0){
                //TODO: do resize
              }
            }

            addUpdateCallbacks(paintState, [
              (state: PaintContextType) => {
                newLayer = loadOntoNewLayerImage(state, image);

                addUndoAction(
                  state,
                  new PasteAction(
                    newLayer.id,
                    newLayer.name,
                    newLayer.active,
                    newLayer.visible,
                    new Uint8ClampedArray(newLayer.temporaryLayer!.pixels),
                    image.width,
                    image.height,
                    lastActiveLayer
                  )
                );
              },
              (state: PaintContextType) => {
                setActiveLayers(state, [newLayer.id]);
              },
              (state: PaintContextType) => {
                const { setSelection, setProjectionSelection } = state;

                setSelection(new Selection(0, 0, image.width, image.height));
                setProjectionSelection(undefined);
              },
              (state: PaintContextType) => {
                Tools["selectHardMove"].existingTempLayer = true;
                selectTool(state, "selectHardMove");
              },
            ]);
          };
          image.src = window.URL.createObjectURL(file);
        }
      },
      [layers, paintState]
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
        if (e.target == document.body && e.ctrlKey) {
          if (e.code == "KeyC" && !e.shiftKey) {
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

            setNotification(paintState, `Copied image`, newImageData);

            canvas.toBlob((blob) => {
              if (!blob) return;

              const item = new ClipboardItem({ "image/png": blob });
              navigator.clipboard.write([item]);
            });
          }

          if (e.code == "KeyZ" && !e.shiftKey) {
            const didUndo = undoAction(paintState);
            if (didUndo) {
              setNotification(paintState, `Undo`);
            }
          }

          if (e.code == "KeyY" || (e.shiftKey && e.code == "KeyZ")) {
            const redo = redoAction(paintState);
            if (redo) {
              setNotification(paintState, `Redo`);
            }
          }

          if (e.shiftKey && e.code == "KeyX" && selection.isValid()) {
            setOffset(new Location());
            scaleToSize(paintState, selection.width, selection.height);

            cropToSelection(paintState, selection);
            setNotification(paintState, `Cropped to selection`);
          }
        }
      },
      [selection, width, height, layers, paintState, setOffset]
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

        const realScale = getRealScale(paintState);

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
        const newRealScale = getRealScale(paintState, newScale);

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
      [height, offset, paintState, scale, setOffset, setScale, width]
    )
  );

  const renderLayers = layers.map((layer, index) => {
    return <Canvas key={layer.id} order={index} layer={layer} />;
  });
  const renderTemporaryLayers = layers.map((layer, index) => {
    if (!layer.temporaryLayer) return null;

    return (
      <Canvas
        key={`${layer.id}-temp1`}
        order={index}
        layer={layer.temporaryLayer}
      />
    );
  });

  return (
    <RootContainer>
      <div className={css.root} ref={containerRef}>
        <LayersContainer containerRef={containerRef}>
          <TransparencyBackground />
          {renderLayers}
          {renderTemporaryLayers}
          {/* <CursorHandle /> */}
        </LayersContainer>
        <SelectionContainer />
        <ProjectionSelectionContainer />
      </div>
      <LayersPanel />
      {process.env.NODE_ENV == "development" && <HistoryPanel />}
      <ColorsPanel />
      <ToolsPanel />
      <Notification />
    </RootContainer>
  );
};

export default PaintContainer;
