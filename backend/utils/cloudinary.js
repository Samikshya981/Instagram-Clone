import {v1 as cloudinary} from "cloudinary";
import dotenv from "dotenv";
dotenv.config({})
cloudinaty.config({
    cloud_name:process.env.cloud_name,
    api_keyB:process.env.api_key,
    api_secret:process.env.api_secret
});
export default cloudinary;