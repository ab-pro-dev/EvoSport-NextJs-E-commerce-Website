import { v2 as cloudinary } from "cloudinary";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME || "vgnpcqyo",
  api_key: process.env.CLOUDINARY_API_KEY || "926495334652662",
  api_secret: process.env.CLOUDINARY_API_SECRET || "2fI7L6c2tsruZIrpc9EZ8v7_ka4",
  secure: true,
});

export { cloudinary };
