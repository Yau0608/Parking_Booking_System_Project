//Created by
//Ho Cheuk Wing 21106121d
//Wong Hiu Yau 21092461d


import sharp from 'sharp';

export const processImage = async (buffer, type = 'profile') => {
  const config = {
    profile: {
      width: 200,
      height: 200
    },
    event: {
      width: 800,
      height: 400
    }
  };

  const { width, height } = config[type];

  return sharp(buffer)
    .resize(width, height, {
      fit: 'cover',
      position: 'center'
    })
    .jpeg({ quality: 80 })
    .toBuffer();
}; 