import { getDistance } from "@client/utils";

export default class Location {
  x: number;
  y: number;

  constructor(x?: Location | number, y?: number) {
    if (typeof x == "object") {
      this.y = x.y;
      this.x = x.x;
    } else {
      this.x = x ?? 0;
      this.y = y ?? 0;
    }
  }

  add = (x: Location | number, y?: number) => {
    if (typeof x == "object") {
      y = x.y;
      x = x.x;
    }

    return new Location(this.x + x, this.y + y!);
  };
  minus = (x: Location | number, y?: number) => {
    if (typeof x == "object") {
      y = x.y;
      x = x.x;
    }

    return new Location(this.x - x, this.y - y!);
  };
  multiply = (factor: number) => {
    return new Location(this.x * factor, this.y * factor);
  };
  divide = (factor: number) => {
    return new Location(this.x / factor, this.y / factor);
  };
  magnitude = () => {
    return Math.sqrt(this.x * this.x + this.y * this.y);
  };
  normalized = () => {
    const length = this.magnitude();
    return new Location(this.x / length, this.y / length);
  };
  distance = (otherVector: Location) => {
    return getDistance(this.x, this.y, otherVector.x, otherVector.y);
  };
  toAngle = () => {
    let angle = (Math.atan2(this.x, this.y) / Math.PI) * 180;

    if (angle > 180) angle -= 360;
    if (angle < -180) angle += 360;

    return angle;
  };
  static fromAngle = (angle: number) => {
    if (angle > 180) angle -= 360;
    if (angle < -180) angle += 360;

    return new Location(
      Math.sin((angle * Math.PI) / 180),
      Math.cos((angle * Math.PI) / 180)
    );
  };
  copy = () => {
    return new Location(this.x, this.y);
  };
  equals = (otherVector: Location) => {
    return this.x == otherVector.x && this.y == otherVector.y;
  };
  toString = () => {
    return `Location(${this.x},${this.y})`;
  };
  round = () => {
    return new Location(Math.round(this.x), Math.round(this.y));
  };
}
