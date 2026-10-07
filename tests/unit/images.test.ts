import { describe, expect, it } from 'vitest';
import sharp from 'sharp';
import { optimizeImage } from '@/lib/image-processing';
import { MAX_UPLOAD } from '@/lib/catalog-validation';
describe('Validación real de fotos', () => {
  it('optimiza, limita dimensiones y quita metadata', async () => {
    const bytes = await sharp({ create: { width: 2000, height: 2400, channels: 3, background: '#332D52' } }).jpeg().toBuffer();
    const result = await optimizeImage(bytes, 'image/jpeg');
    const meta = await sharp(result).metadata();
    expect(meta.format).toBe('webp'); expect(meta.height).toBe(1600); expect(meta.exif).toBeUndefined();
  });
  it('no confía en el MIME declarado', async () => {
    const bytes = await sharp({ create: { width: 10, height: 10, channels: 3, background: 'white' } }).png().toBuffer();
    await expect(optimizeImage(bytes, 'image/jpeg')).rejects.toThrow();
  });
  it('rechaza SVG, texto y archivos sobredimensionados', async () => {
    await expect(optimizeImage(Buffer.from('<svg/>'), 'image/svg+xml')).rejects.toThrow();
    await expect(optimizeImage(Buffer.from('not a photo'), 'image/jpeg')).rejects.toThrow();
    await expect(optimizeImage(Buffer.alloc(MAX_UPLOAD + 1), 'image/png')).rejects.toThrow();
  });
});
