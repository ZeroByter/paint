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

  toString() {
    return `rgba(${this.r}, ${this.g}, ${this.b}, ${this.a})`;
  }
}
