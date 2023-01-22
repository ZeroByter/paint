class ProjectionSelection {
  topLeftX: number;
  topLeftY: number;
  topRightX: number;
  topRightY: number;
  bottomLeftX: number;
  bottomLeftY: number;
  bottomRightX: number;
  bottomRightY: number;

  constructor(
    topLeftX = 0,
    topLeftY = 0,
    topRightX = 0,
    topRightY = 0,
    bottomLeftX = 0,
    bottomLeftY = 0,
    bottomRightX = 0,
    bottomRightY = 0
  ) {
    this.topLeftX = topLeftX;
    this.topLeftY = topLeftY;
    this.topRightX = topRightX;
    this.topRightY = topRightY;
    this.bottomLeftX = bottomLeftX;
    this.bottomLeftY = bottomLeftY;
    this.bottomRightX = bottomRightX;
    this.bottomRightY = bottomRightY;
  }

  /**
   * Sets a new location for one of the corners of the selection
   * @param cornerIndex index of corner we want to move:
   * 0: top left
   * 1: top right
   * 2: bottom left
   * 3: bottom right
   * @param x new corner X
   * @param y new corner Y
   * @returns ProjectionSelection
   */
  newCornerLocation(cornerIndex: number, x: number, y: number) {
    const newSelection = new ProjectionSelection(
      this.topLeftX,
      this.topLeftY,
      this.topRightX,
      this.topRightY,
      this.bottomLeftX,
      this.bottomLeftY,
      this.bottomRightX,
      this.bottomRightY
    );

    if (cornerIndex == 0) {
      newSelection.topLeftX = x;
      newSelection.topLeftY = y;
    } else if (cornerIndex == 1) {
      newSelection.topRightX = x;
      newSelection.topRightY = y;
    } else if (cornerIndex == 2) {
      newSelection.bottomLeftX = x;
      newSelection.bottomLeftY = y;
    } else if (cornerIndex == 3) {
      newSelection.bottomRightX = x;
      newSelection.bottomRightY = y;
    }

    return newSelection;
  }
}

export default ProjectionSelection;
