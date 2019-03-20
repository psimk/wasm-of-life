type TImageArrayConstructors =
  | Int32ArrayConstructor
  | Float32ArrayConstructor
  | Float64ArrayConstructor
  | Uint8ArrayConstructor;
type TImageArray = Int32Array | Float32Array | Float64Array | Uint8Array;

export interface IDimensions {
  height: number;
  width: number;
}

export default abstract class Drawer {
  private readonly canvas: HTMLCanvasElement;
  private readonly context: CanvasRenderingContext2D;
  private readonly imageData: ImageData;

  constructor(dimensions: IDimensions) {
    this.canvas = document.createElement('canvas');
    this.context = this.canvas.getContext('2d') as CanvasRenderingContext2D;

    if (!dimensions) throw 'You need to set the global dimensions';

    this.canvas.height = dimensions.height;
    this.canvas.width = dimensions.width;

    this.imageData = this.context.createImageData(this.canvas.width, this.canvas.height);

    document.body.appendChild(this.canvas);
  }

  protected get dimensions(): { width: number; height: number } {
    return {
      height: this.canvas.height,
      width: this.canvas.width,
    };
  }

  protected get area(): number {
    return this.dimensions.width * this.dimensions.height;
  }

  protected update(): void {
    this.context.putImageData(this.imageData, 0, 0);
  }

  protected createImageDataBuffer(arrayConstructor: TImageArrayConstructors): TImageArray {
    return new arrayConstructor(this.imageData.data.buffer);
  }
}
