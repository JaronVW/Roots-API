import { v2 } from 'cloudinary';
import { API_KEY, API_SECRET, CLOUDINARY, CLOUD_NAME } from './constants';


export const CloudinaryProvider = {
  provide: CLOUDINARY,
  useFactory: () => {
    return v2.config({
      cloud_name: CLOUD_NAME,
      api_key: API_KEY,
      api_secret: API_SECRET,
    });
  },
};
