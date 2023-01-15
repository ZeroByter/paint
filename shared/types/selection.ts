import Location from "./location";

export type SelectionClickability = "CREATING" | "EDITING" | "WORKING";

class Selection {
  x: number;
  y: number;
  width: number;
  height: number;

  constructor(x = 0, y = 0, width = 0, height = 0) {
    this.x = x;
    this.y = y;
    this.width = width;
    this.height = height;
  }

  isValid() {
    return this.width > 0 && this.height > 0;
  }

  newLocation(newLocation: Location) {
    return new Selection(newLocation.x, newLocation.y, this.width, this.height);
  }

  copy() {
    return new Selection(this.x, this.y, this.width, this.height);
  }
}

export default Selection;
