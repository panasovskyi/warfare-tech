import { v2 as cloudinary } from "cloudinary";

export const uploadBufferToCloudinary = (
  fileBuffer: Buffer,
  folderName = "signal.ie",
): Promise<string> => {
  return new Promise((res, rej) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder: folderName,
        resource_type: "image",
      },

      (error, result) => {
        if (error) {
          return rej(error);
        }

        if (!result) {
          return rej(new Error("Unable to upload an image"));
        }

        res(result.secure_url);
      },
    );

    uploadStream.end(fileBuffer);
  });
};
