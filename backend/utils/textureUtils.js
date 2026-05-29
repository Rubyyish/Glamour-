const Jimp = require('jimp');

/**
 * Calculate average color of image (ignoring transparent areas)
 */
function getAverageColor(img) {
  const data = img.bitmap.data;
  let r = 0, g = 0, b = 0, count = 0;
  
  for (let i = 0; i < data.length; i += 4) {
    if (data[i + 3] > 128) {
      r += data[i];
      g += data[i + 1];
      b += data[i + 2];
      count++;
    }
  }
  
  if (count === 0) return { r: 128, g: 128, b: 128 };
  return {
    r: Math.round(r / count),
    g: Math.round(g / count),
    b: Math.round(b / count)
  };
}

/**
 * Find the bounding box of the garment in the image
 */
function findGarmentBounds(img) {
  const data = img.bitmap.data;
  const w = img.bitmap.width;
  const h = img.bitmap.height;
  let minX = w, maxX = 0, minY = h, maxY = 0;

  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const idx = (y * w + x) * 4;
      if (data[idx + 3] > 10) {
        if (x < minX) minX = x;
        if (x > maxX) maxX = x;
        if (y < minY) minY = y;
        if (y > maxY) maxY = y;
      }
    }
  }
  return { minX, maxX, minY, maxY };
}

/**
 * Replace transparent areas with average color
 */
function flattenAlpha(img, avgColor) {
  const data = img.bitmap.data;
  for (let i = 0; i < data.length; i += 4) {
    if (data[i + 3] < 128) {
      data[i] = avgColor.r;
      data[i + 1] = avgColor.g;
      data[i + 2] = avgColor.b;
      data[i + 3] = 255;
    } else {
      data[i + 3] = 255;
    }
  }
  return img;
}

/**
 * Make texture seamless using blend edges technique
 */
function makeSeamless(img) {
  const w = img.bitmap.width;
  const h = img.bitmap.height;
  const data = img.bitmap.data;
  const blendW = Math.floor(w * 0.15);
  const blendH = Math.floor(h * 0.15);

  // Blend left/right edges
  for (let x = 0; x < blendW; x++) {
    const t = x / blendW;
    for (let y = 0; y < h; y++) {
      const idxL = (y * w + x) * 4;
      const idxR = (y * w + (w - 1 - x)) * 4;
      for (let c = 0; c < 3; c++) {
        data[idxL + c] = Math.round(
          data[idxL + c] * (1 - t) + data[idxR + c] * t
        );
      }
    }
  }

  // Blend top/bottom edges
  for (let y = 0; y < blendH; y++) {
    const t = y / blendH;
    for (let x = 0; x < w; x++) {
      const idxT = (y * w + x) * 4;
      const idxB = ((h - 1 - y) * w + x) * 4;
      for (let c = 0; c < 3; c++) {
        data[idxT + c] = Math.round(
          data[idxT + c] * (1 - t) + data[idxB + c] * t
        );
      }
    }
  }

  return img;
}

/**
 * Extract a seamless fabric texture patch from a garment image.
 * Crops the chest/body area, makes it seamless, tiles 2x2 → 1024x1024.
 */
async function extractTexture(imageBuffer) {
  try {
    const img = await Jimp.read(imageBuffer);
    const w = img.bitmap.width;
    const h = img.bitmap.height;

    // Get average color to fill any transparent background
    const avgColor = getAverageColor(img);
    flattenAlpha(img, avgColor);

    // Crop the chest/torso area — centre horizontally, upper-mid vertically
    // This avoids collar, sleeves, hem and focuses on the main fabric
    const patchW = Math.floor(w * 0.40);   // 40% of width
    const patchH = Math.floor(h * 0.30);   // 30% of height
    const patchX = Math.floor(w * 0.30);   // start at 30% from left (centre)
    const patchY = Math.floor(h * 0.25);   // start at 25% from top (chest area)

    console.log(`Texture patch: x=${patchX} y=${patchY} w=${patchW} h=${patchH}`);

    const patch = img.clone().crop(patchX, patchY, patchW, patchH);

    // Resize patch to 512x512 base
    patch.resize(512, 512);

    // Make the edges seamless so tiling doesn't show seams
    makeSeamless(patch);

    // Tile 2x2 into 1024x1024 — this is what Snap lens expects
    const final = new Jimp(1024, 1024, 0xffffffff);
    final.composite(patch, 0, 0);
    final.composite(patch, 512, 0);
    final.composite(patch, 0, 512);
    final.composite(patch, 512, 512);

    console.log('Texture extracted: 1024x1024 seamless tile');

    return await final.getBufferAsync(Jimp.MIME_PNG);
  } catch (error) {
    console.error('Error in extractTexture:', error);
    throw new Error(`Failed to extract texture: ${error.message}`);
  }
}

/**
 * Optimize texture for web usage
 */
async function optimizeTexture(imageBuffer, quality = 0.8) {
  try {
    const img = await Jimp.read(imageBuffer);
    return await img.getBufferAsync(Jimp.MIME_PNG);
  } catch (error) {
    console.error('Error in optimizeTexture:', error);
    throw new Error(`Failed to optimize texture: ${error.message}`);
  }
}

module.exports = {
  getAverageColor,
  findGarmentBounds,
  flattenAlpha,
  makeSeamless,
  extractTexture,
  optimizeTexture
};
