import { IMAGE_TYPES, MAX_ORIGINAL, MAX_UPLOAD } from './catalog-validation';
export async function preparePhoto(file: File): Promise<File> {
  if (!IMAGE_TYPES.includes(file.type)) throw new Error('Elegí una foto JPG, PNG o WebP. Si es HEIC, exportala como JPG.');
  if (!file.size || file.size > MAX_ORIGINAL) throw new Error('Elegí una foto de hasta 15 MB.');
  let bitmap: ImageBitmap;
  try { bitmap = await createImageBitmap(file); } catch { throw new Error('No pudimos leer esta foto. Elegí otra imagen.'); }
  try {
    if (bitmap.width * bitmap.height > 40_000_000) throw new Error('La foto tiene demasiada resolución. Elegí una versión más pequeña.');
    const ratio = Math.min(1, 1600 / Math.max(bitmap.width, bitmap.height));
    const canvas = document.createElement('canvas');
    canvas.width = Math.max(1, Math.round(bitmap.width * ratio));
    canvas.height = Math.max(1, Math.round(bitmap.height * ratio));
    const context = canvas.getContext('2d');
    if (!context) throw new Error('No pudimos preparar la foto. Probá otro navegador.');
    context.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
    const blob = await new Promise<Blob | null>(resolve => canvas.toBlob(resolve, 'image/webp', 0.85));
    if (!blob || blob.size > MAX_UPLOAD) throw new Error('La foto sigue siendo demasiado grande. Elegí una versión más pequeña.');
    return new File([blob], 'foto.webp', { type: blob.type });
  } finally { bitmap.close(); }
}
