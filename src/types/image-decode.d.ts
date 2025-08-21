declare module "image-decode" {
  interface DecodedImage {
    width: number;
    height: number;
    data: Uint8Array; // RGBA pixel array
  }

  export default function decode(
    buffer: ArrayBuffer | Uint8Array | Buffer
  ): DecodedImage;
}
