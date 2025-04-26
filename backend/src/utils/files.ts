import { Buffer } from 'node:buffer';
import sharp from 'sharp';

export async function compress_image(
    input_file: File,
    quality: number = 80,
): Promise<File> {
    if (quality < 1 || quality > 100) throw new Error('Quality must be between 1 and 100.');
    if (!input_file?.arrayBuffer || typeof input_file.arrayBuffer !== 'function') {
        throw new Error('Input must be a File-like object with an arrayBuffer method.');
    }
    if (!input_file.type) throw new Error('Input File-like object must have a type property.');
    if (!input_file.name) throw new Error('Input File-like object must have a name property.');

    try {
        const image_buffer = Buffer.from(await input_file.arrayBuffer());
        const mime_type = input_file.type.toLowerCase();
        const input_name = input_file.name;

        const sharp_instance = sharp(image_buffer);
        let output_buffer: Buffer;

        switch (mime_type) {
            case 'image/jpeg':
            case 'image/jpg':
                output_buffer = await sharp_instance
                    .jpeg({
                        quality: quality,
                        progressive: true,
                        mozjpeg: true,
                    })
                    .toBuffer();
                break;
            case 'image/png': {
                const compression_level = Math.max(0, Math.min(9, Math.round(9 * (100 - quality) / 100)));
                output_buffer = await sharp_instance
                    .png({
                        quality: quality,
                        compressionLevel: compression_level,
                        progressive: true,
                        adaptiveFiltering: true,
                    })
                    .toBuffer();
                break;
            }
            case 'image/webp':
                output_buffer = await sharp_instance
                    .webp({
                        quality: quality,
                        lossless: quality === 100,
                    })
                    .toBuffer();
                break;
            case 'image/gif':
                output_buffer = await sharp_instance.gif().toBuffer();
                break;
            case 'image/tiff':
            case 'image/tif':
                output_buffer = await sharp_instance
                    .tiff({
                        quality: quality,
                    })
                    .toBuffer();
                break;
            case 'image/avif':
                output_buffer = await sharp_instance
                    .avif({
                        quality: quality,
                        lossless: quality === 100,
                    })
                    .toBuffer();
                break;
            default:
                throw new Error(`Unsupported image format for compression: ${mime_type}`);
        }

        return new File([output_buffer], input_name, { type: mime_type });
    } catch (error) {
        console.error('Error during image compression:', error);
        throw new Error(`Image compression failed: ${error instanceof Error ? error.message : String(error)}`);
    }
}

export const to_base64_string = async (file: File, chunk_size: number = 8192): Promise<string> => {
    const buffer = await file.arrayBuffer();
    const uint8_array = new Uint8Array(buffer);
    let binary_string = '';

    for (let i = 0; i < uint8_array.length; i += chunk_size) {
        const chunk = uint8_array.subarray(i, i + chunk_size);
        binary_string += String.fromCharCode.apply(null, chunk as unknown as number[]);
    }

    return btoa(binary_string);
};
