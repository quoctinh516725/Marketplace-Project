import cloudinary from "./config/cloudinary";

export async function testCloudinary() {
  try {
    const result = await cloudinary.uploader.upload(
      "https://res.cloudinary.com/demo/image/upload/sample.jpg",
      {
        folder: "test",
      },
    );

    console.log("Upload thành công");
    console.log({
      public_id: result.public_id,
      url: result.secure_url,
    });
  } catch (error) {
    console.error("Upload thất bại");
    console.error(error);
  }
}
