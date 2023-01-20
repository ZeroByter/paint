import { getDistance, lerp } from "@client/utils";
import Layer from "@shared/types/layer";
import Location from "@shared/types/location";
import ProjectionSelection from "@shared/types/projectionSelection";
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

  const horizontalDistance = Math.max(topDistance, bottomDistance);
  const verticalDistance = Math.max(leftDistance, rightDistance);

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
      for (let x = 0; x < horizontalDistance; x++) {
        const horizontalValue = x / horizontalDistance;
        const verticalValue = y / verticalDistance;

        const topMark = topMarks.get(horizontalValue) as Location;
        const bottomMark = bottomMarks.get(horizontalValue) as Location;
        const leftMark = leftMarks.get(verticalValue) as Location;
        const rightMark = rightMarks.get(verticalValue) as Location;

        const finalX = lerp(leftMark.x, rightMark.x, horizontalValue) >> 0;
        const finalY = lerp(topMark.y, bottomMark.y, verticalValue) >> 0;

        tempLayer.setPixelData(finalX, finalY, 255, 0, 0, 255);
      }
    }

    tempLayer.updatePixels();
  }
};

export const inverseProjectImage = () => {};
