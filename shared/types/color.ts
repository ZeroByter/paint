import { lerp } from "@client/utils";

export default class Color {
  r: number;
  g: number;
  b: number;
  a: number;

  constructor(r?: number, g?: number, b?: number, a?: number) {
    this.r = r ?? 0;
    this.g = g ?? 0;
    this.b = b ?? 0;
    this.a = a ?? 0;
  }

  clone() {
    return new Color(this.r, this.g, this.b, this.a);
  }

  set(component: 0 | 1 | 2 | 3, value: number) {
    const clone = this.clone();

    switch (component) {
      case 0:
        clone.r = value;
        break;
      case 1:
        clone.g = value;
        break;
      case 2:
        clone.b = value;
        break;
      case 3:
        clone.a = value;
        break;
    }

    return clone;
  }

  lerp(otherColor: Color, t: number) {
    return new Color(
      lerp(this.r, otherColor.r, t),
      lerp(this.g, otherColor.g, t),
      lerp(this.b, otherColor.b, t),
      lerp(this.a, otherColor.r, t)
    );
  }

  toString() {
    return `rgba(${this.r}, ${this.g}, ${this.b}, ${this.a})`;
  }
}
