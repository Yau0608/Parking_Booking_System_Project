import sharp from 'sharp';

export const processImage = async (buffer) => {
  return sharp(buffer)
    .resize(200, 200, {
      fit: 'cover',
      position: 'center'
    })
    .jpeg({ quality: 80 })
    .toBuffer();
}; 