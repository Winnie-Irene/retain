const ACCEPTED_TYPES = ["image/png", "image/jpeg", "image/webp"];
const MAX_FILE_BYTES = 8 * 1024 * 1024;

function loadImage(url: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve(image);
    image.onerror = () => reject(new Error("That file could not be read as a picture"));
    image.src = url;
  });
}

export async function toAvatarDataUrl(file: File, size = 256): Promise<string> {
  if (!ACCEPTED_TYPES.includes(file.type)) {
    throw new Error("Use a PNG, JPG or WEBP picture");
  }
  if (file.size > MAX_FILE_BYTES) {
    throw new Error("That picture is over 8 MB. Try a smaller one.");
  }

  const url = URL.createObjectURL(file);
  try {
    const image = await loadImage(url);
    const side = Math.min(image.naturalWidth, image.naturalHeight);
    const sx = (image.naturalWidth - side) / 2;
    const sy = (image.naturalHeight - side) / 2;

    const canvas = document.createElement("canvas");
    canvas.width = size;
    canvas.height = size;
    const context = canvas.getContext("2d");
    if (!context) throw new Error("Your browser could not prepare the picture");

    context.fillStyle = "#FFFDFC";
    context.fillRect(0, 0, size, size);
    context.drawImage(image, sx, sy, side, side, 0, 0, size, size);
    return canvas.toDataURL("image/jpeg", 0.86);
  } finally {
    URL.revokeObjectURL(url);
  }
}