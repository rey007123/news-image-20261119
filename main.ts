import { copyFileSync, mkdirSync, readFileSync, statSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const MAX_BYTES = 1024 * 1024; // 1 MiB
const MAX_DIM = 1024;

interface ImageInfo {
  format: "png" | "jpeg";
  width: number;
  height: number;
  bytes: number;
}

function parsePngDimensions(buf: Buffer): { width: number; height: number } {
  if (buf.length < 33) {
    throw new Error("PNG file is truncated (fewer than 33 bytes).");
  }
  const ihdr = buf.toString("ascii", 12, 16);
  if (ihdr !== "IHDR") {
    throw new Error(`Expected IHDR chunk at byte 12, found ${ihdr}.`);
  }
  const hasIend = buf.includes(Buffer.from("IEND", "ascii"));
  if (!hasIend) {
    throw new Error("PNG file is missing IEND trailer chunk.");
  }
  return {
    width: buf.readUInt32BE(16),
    height: buf.readUInt32BE(20),
  };
}

function parseJpegDimensions(buf: Buffer): { width: number; height: number } {
  let offset = 2;
  while (offset + 9 < buf.length) {
    while (offset < buf.length && buf[offset] === 0xff) {
      offset += 1;
    }
    if (offset >= buf.length) {
      break;
    }
    const marker = buf[offset];
    offset += 1;
    if (marker === 0xd9 || marker === 0xda) {
      break;
    }
    if (offset + 2 > buf.length) {
      break;
    }
    const segmentLength = buf.readUInt16BE(offset);
    if (segmentLength < 2 || offset + segmentLength > buf.length) {
      throw new Error("Malformed JPEG segment length.");
    }
    if (
      (marker >= 0xc0 && marker <= 0xc3) ||
      (marker >= 0xc5 && marker <= 0xc7) ||
      (marker >= 0xc9 && marker <= 0xcb) ||
      (marker >= 0xcd && marker <= 0xcf)
    ) {
      const height = buf.readUInt16BE(offset + 3);
      const width = buf.readUInt16BE(offset + 5);
      return { width, height };
    }
    offset += segmentLength;
  }
  throw new Error("Could not find JPEG SOF marker for image dimensions.");
}

function inspectImage(filePath: string): ImageInfo {
  const stats = statSync(filePath);
  if (stats.size <= 0) {
    throw new Error("Image file is empty.");
  }
  if (stats.size > MAX_BYTES) {
    throw new Error(`Image exceeds 1 MiB limit (${stats.size} bytes).`);
  }
  const buf = readFileSync(filePath);
  const isPng =
    buf.length >= 8 &&
    buf[0] === 0x89 &&
    buf[1] === 0x50 &&
    buf[2] === 0x4e &&
    buf[3] === 0x47 &&
    buf[4] === 0x0d &&
    buf[5] === 0x0a &&
    buf[6] === 0x1a &&
    buf[7] === 0x0a;
  const isJpeg = buf.length >= 3 && buf[0] === 0xff && buf[1] === 0xd8 && buf[2] === 0xff;

  if (!isPng && !isJpeg) {
    throw new Error("Unsupported image format: expected PNG or JPEG header.");
  }

  const dims = isPng ? parsePngDimensions(buf) : parseJpegDimensions(buf);
  if (dims.width <= 0 || dims.height <= 0 || dims.width > MAX_DIM || dims.height > MAX_DIM) {
    throw new Error(
      `Image dimensions ${dims.width}x${dims.height} exceed ${MAX_DIM}x${MAX_DIM} maximum.`
    );
  }

  return {
    format: isPng ? "png" : "jpeg",
    width: dims.width,
    height: dims.height,
    bytes: stats.size,
  };
}

function main(): void {
  const here = dirname(fileURLToPath(import.meta.url));
  const sourcePath = resolve(here, "entry.png");
  const info = inspectImage(sourcePath);

  const outDir = resolve(process.env.MAKEFUN_OUTPUT_DIR || "/output");
  mkdirSync(outDir, { recursive: true });
  const destPath = join(outDir, "entry.png");
  copyFileSync(sourcePath, destPath);

  console.log(
    `Validated ${info.format.toUpperCase()} (${info.width}x${info.height}, ${info.bytes} bytes) -> ${destPath}`
  );
}

main();
