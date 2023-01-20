import { getDistance, lerp } from "@client/utils";
import Location from "@shared/types/location";
import { PaintContextType } from "components/contexts/paint";

const getNormalizedDirection = (
  x1: number,
  y1: number,
  x2: number,
  y2: number
) => {
  const minusX = x1 - x2;
  const minusY = y1 - y2;
  const magnitude = Math.sqrt(minusX * minusX + minusY * minusY);
  return new Location(minusX / magnitude, minusY / magnitude);
};

const getLocationFromLocation = (
  baseX: number,
  baseY: number,
  horDir: Location,
  horDist: number,
  verDir: Location,
  verDist: number
) => {
  return new Location(
    baseX + Math.round(horDir.x * horDist) + Math.round(verDir.x * verDist),
    baseY + Math.round(horDir.y * horDist) + Math.round(verDir.y * verDist)
  );
};

export const projectImage = (state: PaintContextType) => {
  const { layers, width, height, projectionSelection } = state;

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

  const topDirection = getNormalizedDirection(
    topRightX,
    topRightY,
    topLeftX,
    topLeftY
  );
  const bottomDirection = getNormalizedDirection(
    bottomRightX,
    bottomRightY,
    bottomLeftX,
    bottomLeftY
  );
  const leftDirection = getNormalizedDirection(
    bottomLeftX,
    bottomLeftY,
    topLeftX,
    topLeftY
  );
  const rightDirection = getNormalizedDirection(
    bottomRightX,
    bottomRightY,
    topRightX,
    topRightY
  );

  const horizontalDistance = Math.max(topDistance, bottomDistance);
  const verticalDistance = Math.max(leftDistance, rightDistance);

  for (const layer of layers) {
    if (!layer.active) continue;

    const tempLayer = layer.temporaryLayer;
    if (!tempLayer) continue;

    tempLayer.pixels.fill(0);

    for (let y = 0; y < verticalDistance; y++) {
      for (let x = 0; x < horizontalDistance; x++) {
        const topMark = new Location(
          lerp(topLeftX, topRightX, x / horizontalDistance),
          lerp(topLeftY, topRightY, x / horizontalDistance)
        );
        const bottomMark = new Location(
          lerp(bottomLeftX, bottomRightX, x / horizontalDistance),
          lerp(bottomLeftY, bottomRightY, x / horizontalDistance)
        );
        const leftMark = new Location(
          lerp(topLeftX, bottomLeftX, y / verticalDistance),
          lerp(topLeftY, bottomLeftY, y / verticalDistance)
        );
        const rightMark = new Location(
          lerp(topRightX, bottomRightX, y / verticalDistance),
          lerp(topRightY, bottomRightY, y / verticalDistance)
        );

        const finalLocation = new Location(
          lerp(leftMark.x, rightMark.x, x / horizontalDistance),
          lerp(topMark.y, bottomMark.y, y / verticalDistance)
        );

        tempLayer.setPixelData(
          Math.round(finalLocation.x),
          Math.round(finalLocation.y),
          255,
          0,
          0,
          255
        );
      }
    }

    tempLayer.updatePixels();
  }
};

export const inverseProjectImage = () => {};
