import { manipulateAsync } from 'expo-image-manipulator';
import { PNG_DATA_PREFIX, JPG_DATA_PREFIX, IMG_BASE_SIZE } from 'constants';

export const aspectFit = (width, height, r = IMG_BASE_SIZE) => {
  const rate = Math.min(r / width, r / height);
  return {
    width: parseInt(width * rate),
    height: parseInt(height * rate)
  }
}

export const aspectFill = (width, height, r = IMG_BASE_SIZE) => {
  const rate = Math.max(r / width, r / height);
  return {
    width: parseInt(width * rate),
    height: parseInt(height * rate)
  }
}

export const prefixPng = (base64Image) => 
  !!base64Image && !base64Image.startsWith(PNG_DATA_PREFIX) ?
    PNG_DATA_PREFIX + base64Image :
    base64Image;

export const prefixJpg = (base64Image) => 
  !!base64Image && !base64Image.startsWith(JPG_DATA_PREFIX) ?
  JPG_DATA_PREFIX + base64Image :
    base64Image;


export const removeExifRotation = (base64Image) => 
  manipulateAsync(
    base64Image,
    [{ rotate: 0 }],
    { compress: 1, format: 'png', base64: true }
  )
  .then(({base64}) => base64)
  .catch(e => base64Image);