import cloudinary from '../config/cloudinary.js';
import fs from 'fs';

export const uploadToCloudinary = async (filePath, folder = 'console-ecommerce') => {
  try {
    const result = await cloudinary.uploader.upload(filePath, {
      folder,
      resource_type: 'auto',
      transformation: [{ quality: 'auto', fetch_format: 'auto' }],
    });

    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }

    return {
      public_id: result.public_id,
      url: result.secure_url,
    };
  } catch (error) {
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }
    throw error;
  }
};

export const uploadBufferToCloudinary = async (buffer, folder = 'console-ecommerce') => {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder,
        resource_type: 'auto',
        transformation: [{ quality: 'auto', fetch_format: 'auto' }],
      },
      (error, result) => {
        if (error) reject(error);
        else
          resolve({
            public_id: result.public_id,
            url: result.secure_url,
          });
      }
    );
    uploadStream.end(buffer);
  });
};

export const deleteFromCloudinary = async (publicId) => {
  if (publicId) {
    await cloudinary.uploader.destroy(publicId);
  }
};
