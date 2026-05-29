import sharp from "sharp";
import cloudinary from "../utils/cloudinary.js";
import { Story } from "../model/story.model.js";
import { User } from "../model/user.model.js";

export const addStory = async (req, res) => {
    try {
        const image = req.file;
        const userId = req.id;

        if (!image) return res.status(400).json({ message: 'Image required', success: false });

        // Optimize image using sharp
        const optimizedImageBuffer = await sharp(image.buffer)
            .resize({ width: 600, height: 900, fit: 'inside' })
            .toFormat('jpeg', { quality: 80 })
            .toBuffer();

        const fileUri = `data:image/jpeg;base64,${optimizedImageBuffer.toString('base64')}`;
        const cloudResponse = await cloudinary.uploader.upload(fileUri);

        const story = await Story.create({
            image: cloudResponse.secure_url,
            user: userId
        });

        await story.populate({ path: 'user', select: 'username profilePicture' });

        return res.status(201).json({
            message: 'Story uploaded successfully',
            story,
            success: true
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({
            message: "Internal server error",
            success: false
        });
    }
};

export const getStories = async (req, res) => {
    try {
        const userId = req.id;
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ message: "User not found", success: false });
        }

        const followings = user.following || [];
        // Only return stories created in the last 24 hours
        const cutoff = new Date(Date.now() - 24 * 60 * 60 * 1000);

        const stories = await Story.find({
            user: { $in: [userId, ...followings] },
            createdAt: { $gte: cutoff }
        })
        .populate('user', 'username profilePicture')
        .sort({ createdAt: -1 });

        return res.status(200).json({
            success: true,
            stories
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({
            message: "Internal server error",
            success: false
        });
    }
};
