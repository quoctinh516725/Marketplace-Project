import cloudinary from "../config/cloudinary";

interface UploadOptions {
  folder: string;
  publicId?: string;
  overwrite?: boolean;
}
export async function uploadStream(
  file: Express.Multer.File,
  options: UploadOptions,
) {
  return await new Promise((resolve, rejects) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        folder: options.folder,
        public_id: options.publicId,
        overwrite: options.overwrite,
      },
      (error, result) => {
        if (error) rejects(error);
        resolve(result);
      },
    );

    stream.end(file.buffer);
  });
}
