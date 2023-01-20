import { getDistance, lerp } from "@client/utils";
import Layer from "@shared/types/layer";
import Location from "@shared/types/location";
import ProjectionSelection from "@shared/types/projectionSelection";

export const projectImage = (
  layers: Layer[],
  projectionSelection: ProjectionSelection
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

  for (const layer of layers) {
    if (!layer.active) continue;

    const tempLayer = layer.temporaryLayer;
    if (!tempLayer) continue;

    tempLayer.pixels.fill(0);

    for (let y = 0; y < verticalDistance; y++) {
      const verticalValue = y / verticalDistance;

      const leftMark = leftMarks.get(verticalValue) as Location;
      const rightMark = rightMarks.get(verticalValue) as Location;

      for (let x = 0; x < horizontalDistance; x++) {
        const horizontalValue = x / horizontalDistance;

        const tempLayerPixelIndex = tempLayer.getPixelIndex(
          lerp(0, tempLayer.width, horizontalValue) >> 0,
          lerp(0, tempLayer.height, verticalValue) >> 0
        );
        const tempLayerPixelR = tempLayer.pixelsCopy[tempLayerPixelIndex];
        const tempLayerPixelG = tempLayer.pixelsCopy[tempLayerPixelIndex + 1];
        const tempLayerPixelB = tempLayer.pixelsCopy[tempLayerPixelIndex + 2];
        const tempLayerPixelA = tempLayer.pixelsCopy[tempLayerPixelIndex + 3];

        const topMark = topMarks.get(horizontalValue) as Location;
        const bottomMark = bottomMarks.get(horizontalValue) as Location;

        const finalX = lerp(leftMark.x, rightMark.x, horizontalValue) >> 0;
        const finalY = lerp(topMark.y, bottomMark.y, verticalValue) >> 0;

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
};

export const inverseProjectImage = () => {};
