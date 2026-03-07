export async function enhanceImage(
  imageSrc: string,
  options: {
    brightness: number; // 0 to 2 (1 is normal)
    contrast: number;   // 0 to 2 (1 is normal)
    sharpen: number;    // 0 to 1 (0 is none)
  }
): Promise<string> {
  const img = new Image();
  img.src = imageSrc;
  await new Promise((resolve) => (img.onload = resolve));

  const canvas = document.createElement('canvas');
  canvas.width = img.width;
  canvas.height = img.height;
  const ctx = canvas.getContext('2d');

  if (!ctx) throw new Error('Could not get canvas context');

  // Apply basic filters
  ctx.filter = `brightness(${options.brightness * 100}%) contrast(${options.contrast * 100}%)`;
  ctx.drawImage(img, 0, 0);

  if (options.sharpen > 0) {
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const sharpenedData = sharpen(imageData, options.sharpen);
    ctx.putImageData(sharpenedData, 0, 0);
  }

  return canvas.toDataURL('image/png');
}

function sharpen(imageData: ImageData, amount: number) {
  const { width, height, data } = imageData;
  const output = new ImageData(new Uint8ClampedArray(data), width, height);
  const outputData = output.data;

  // Simple sharpening kernel
  // [ 0, -1,  0]
  // [-1,  5, -1]
  // [ 0, -1,  0]
  const kernel = [
    0, -1, 0,
    -1, 5, -1,
    0, -1, 0
  ];

  for (let y = 1; y < height - 1; y++) {
    for (let x = 1; x < width - 1; x++) {
      for (let c = 0; c < 3; c++) { // RGB
        let sum = 0;
        for (let ky = 0; ky < 3; ky++) {
          for (let kx = 0; kx < 3; kx++) {
            const idx = ((y + ky - 1) * width + (x + kx - 1)) * 4 + c;
            sum += data[idx] * kernel[ky * 3 + kx];
          }
        }
        const idx = (y * width + x) * 4 + c;
        // Blend original with sharpened based on amount
        outputData[idx] = data[idx] * (1 - amount) + sum * amount;
      }
    }
  }

  return output;
}
