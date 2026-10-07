import sharp from 'sharp';
import { IMAGE_TYPES, MAX_UPLOAD } from './catalog-validation';

export async function optimizeImage(bytes: Buffer, type: string): Promise<Buffer> {
  if (!IMAGE_TYPES.includes(type) || !bytes.length || bytes.length > MAX_UPLOAD) throw new Error('invalid image');
  const image = sharp(bytes, { limitInputPixels: 40_000_000, animated: false });
  const meta = await image.metadata();
  const mime: Record<string, string> = { jpeg: 'image/jpeg', png: 'image/png', webp: 'image/webp' };
  if (!meta.format || mime[meta.format] !== type || !meta.width || !meta.height || (meta.pages ?? 1) > 1) throw new Error('invalid image');
  return image.rotate().resize(1600, 1600, { fit: 'inside', withoutEnlargement: true }).webp({ quality: 82 }).toBuffer();
}
