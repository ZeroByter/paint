import { addColors } from "@client/layersToImageData";
import { UndoPixel } from "@client/undo/undoPixelColor";
import { getDistance, lerp } from "@client/utils";
import Layer from "@shared/types/layer";
import Location from "@shared/types/location";
import ProjectionSelection from "@shared/types/projectionSelection";
import Selection from "@shared/types/selection";

export const projectImage = (
  layers: Layer[],
  projectionSelection: ProjectionSelection,
  initialSelection: Selection
) => {
  if (!projectionSelection) return;

  const {
    topLeftX,
    topLeftY,
    topRightX,
    topRightY,
    bottomLeftX,
    bottomLeftY,
    bottomRightX,
    bottomRightY,
  } = projectionSelection;

  const topDistance = getDistance(topLeftX, topLeftY, topRightX, topRightY);
  const bottomDistance = getDistance(
    bottomLeftX,
    bottomLeftY,
    bottomRightX,
    bottomRightY
  );
  const leftDistance = getDistance(
    topLeftX,
    topLeftY,
    bottomLeftX,
    bottomLeftY
  );
  const rightDistance = getDistance(
    topRightX,
    topRightY,
    bottomRightX,
    bottomRightY
  );

  let horizontalDistance = Math.max(topDistance, bottomDistance);
  let verticalDistance = Math.max(leftDistance, rightDistance);

  //very dirty hack to prevent gaps when generating image... need to find a better way to detect gaps and fill them in...
  horizontalDistance += horizontalDistance / 5;
  verticalDistance += verticalDistance / 5;

  horizontalDistance = horizontalDistance >> 0;
  verticalDistance = verticalDistance >> 0;

  const topMarks = new Map<number, Location>();
  const bottomMarks = new Map<number, Location>();
  const leftMarks = new Map<number, Location>();
  const rightMarks = new Map<number, Location>();

  for (let y = 0; y < verticalDistance; y++) {
    const verticalValue = y / verticalDistance;

    leftMarks.set(
      verticalValue,
      new Location(
        lerp(topLeftX, bottomLeftX, verticalValue),
        lerp(topLeftY, bottomLeftY, verticalValue)
      )
    );
    rightMarks.set(
      verticalValue,
      new Location(
        lerp(topRightX, bottomRightX, verticalValue),
        lerp(topRightY, bottomRightY, verticalValue)
      )
    );
  }
  for (let x = 0; x < horizontalDistance; x++) {
    const horizontalValue = x / horizontalDistance;

    topMarks.set(
      horizontalValue,
      new Location(
        lerp(topLeftX, topRightX, horizontalValue),
        lerp(topLeftY, topRightY, horizontalValue)
      )
    );
    bottomMarks.set(
      horizontalValue,
      new Location(
        lerp(bottomLeftX, bottomRightX, horizontalValue),
        lerp(bottomLeftY, bottomRightY, horizontalValue)
      )
    );
  }

  const affectedPixels = new Map<string, Map<number, UndoPixel>>();

  for (const layer of layers) {
    if (!layer.active) continue;

    const tempLayer = layer.temporaryLayer;
    if (!tempLayer) continue;

    affectedPixels.set(layer.id, new Map<number, UndoPixel>());

    let workingX = 0;
    let workingY = 0;
    let workingWidth = tempLayer.width;
    let workingHeight = tempLayer.height;

    if (initialSelection.isValid()) {
      workingX = initialSelection.x;
      workingY = initialSelection.y;
      workingWidth = initialSelection.width;
      workingHeight = initialSelection.height;
    }

    tempLayer.pixels.fill(0);

    for (let y = 0; y < verticalDistance; y++) {
      const verticalValue = y / verticalDistance;

      const leftMark = leftMarks.get(verticalValue) as Location;
      const rightMark = rightMarks.get(verticalValue) as Location;

      for (let x = 0; x < horizontalDistance; x++) {
        const horizontalValue = x / horizontalDistance;

        const tempLayerPixelIndex = tempLayer.getPixelIndex(
          lerp(workingX, workingX + workingWidth, horizontalValue) >> 0,
          lerp(workingY, workingY + workingHeight, verticalValue) >> 0
        );
        const tempLayerPixelR = tempLayer.pixelsCopy[tempLayerPixelIndex];
        const tempLayerPixelG = tempLayer.pixelsCopy[tempLayerPixelIndex + 1];
        const tempLayerPixelB = tempLayer.pixelsCopy[tempLayerPixelIndex + 2];
        const tempLayerPixelA = tempLayer.pixelsCopy[tempLayerPixelIndex + 3];

        const topMark = topMarks.get(horizontalValue) as Location;
        const bottomMark = bottomMarks.get(horizontalValue) as Location;

        const finalX = lerp(leftMark.x, rightMark.x, horizontalValue) >> 0;
        const finalY = lerp(topMark.y, bottomMark.y, verticalValue) >> 0;

        affectedPixels.get(layer.id)!.set(finalX + finalY * layer.width, {
          r: tempLayerPixelR,
          g: tempLayerPixelG,
          b: tempLayerPixelB,
          a: tempLayerPixelA,
        });

        tempLayer.setPixelData(
          finalX,
          finalY,
          tempLayerPixelR,
          tempLayerPixelG,
          tempLayerPixelB,
          tempLayerPixelA
        );
      }
    }

    tempLayer.updatePixels();
  }

  return affectedPixels;
};

export const inverseProjectImage = (
  layers: Layer[],
  projectionSelection: ProjectionSelection
) => {
  const {
    topLeftX,
    topLeftY,
    topRightX,
    topRightY,
    bottomLeftX,
    bottomLeftY,
    bottomRightX,
    bottomRightY,
  } = projectionSelection;

  const topDistance = getDistance(topLeftX, topLeftY, topRightX, topRightY);
  const bottomDistance = getDistance(
    bottomLeftX,
    bottomLeftY,
    bottomRightX,
    bottomRightY
  );
  const leftDistance = getDistance(
    topLeftX,
    topLeftY,
    bottomLeftX,
    bottomLeftY
  );
  const rightDistance = getDistance(
    topRightX,
    topRightY,
    bottomRightX,
    bottomRightY
  );

  const horizontalDistance = Math.max(topDistance, bottomDistance) >> 0;
  const verticalDistance = Math.max(leftDistance, rightDistance) >> 0;

  //very dirty hack to prevent gaps when generating image... need to find a better way to detect gaps and fill them in...
  // let scaledHorizontalDistance = horizontalDistance + horizontalDistance / 5;
  // let scaledVerticalDistance = verticalDistance + verticalDistance / 5;

  // scaledHorizontalDistance = scaledHorizontalDistance >> 0;
  // scaledVerticalDistance = scaledVerticalDistance >> 0;

  const topMarks = new Map<number, Location>();
  const bottomMarks = new Map<number, Location>();
  const leftMarks = new Map<number, Location>();
  const rightMarks = new Map<number, Location>();

  for (let y = 0; y < verticalDistance; y++) {
    const verticalValue = y / verticalDistance;

    leftMarks.set(
      y,
      new Location(
        lerp(topLeftX, bottomLeftX, verticalValue),
        lerp(topLeftY, bottomLeftY, verticalValue)
      )
    );
    rightMarks.set(
      y,
      new Location(
        lerp(topRightX, bottomRightX, verticalValue),
        lerp(topRightY, bottomRightY, verticalValue)
      )
    );
  }
  for (let x = 0; x < horizontalDistance; x++) {
    const horizontalValue = x / horizontalDistance;

    topMarks.set(
      x,
      new Location(
        lerp(topLeftX, topRightX, horizontalValue),
        lerp(topLeftY, topRightY, horizontalValue)
      )
    );
    bottomMarks.set(
      x,
      new Location(
        lerp(bottomLeftX, bottomRightX, horizontalValue),
        lerp(bottomLeftY, bottomRightY, horizontalValue)
      )
    );
  }

  const pixels = new Uint8ClampedArray(
    horizontalDistance * verticalDistance * 4
  );

  for (const layer of layers) {
    if (!layer.active) continue;

    for (let y = 0; y < verticalDistance; y++) {
      const verticalValue = y / verticalDistance;

      const leftMark = leftMarks.get(y) as Location;
      const rightMark = rightMarks.get(y) as Location;

      for (let x = 0; x < horizontalDistance; x++) {
        const horizontalValue = x / horizontalDistance;

        const topMark = topMarks.get(x) as Location;
        const bottomMark = bottomMarks.get(x) as Location;

        const finalX = lerp(leftMark.x, rightMark.x, horizontalValue) >> 0;
        const finalY = lerp(topMark.y, bottomMark.y, verticalValue) >> 0;

        const pixelIndex = layer.getPixelIndex(finalX, finalY);
        const pixelR = layer.pixels[pixelIndex];
        const pixelG = layer.pixels[pixelIndex + 1];
        const pixelB = layer.pixels[pixelIndex + 2];
        const pixelA = layer.pixels[pixelIndex + 3];

        const localPixelIndex = x + y * horizontalDistance;

        const addedColor = addColors(
          pixelR,
          pixelG,
          pixelB,
          pixelA,
          pixels[localPixelIndex * 4],
          pixels[localPixelIndex * 4 + 1],
          pixels[localPixelIndex * 4 + 2],
          pixels[localPixelIndex * 4 + 3]
        );
        pixels[localPixelIndex * 4] = addedColor.r;
        pixels[localPixelIndex * 4 + 1] = addedColor.g;
        pixels[localPixelIndex * 4 + 2] = addedColor.b;
        pixels[localPixelIndex * 4 + 3] = addedColor.a;
      }
    }
  }

  return {
    horizontalDistance,
    verticalDistance,
    pixels,
  };
};
