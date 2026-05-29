import mongoose from "mongoose";

const storySchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    image: { type: String, required: true },
    createdAt: { type: Date, default: Date.now, expires: 86400 } // Automatically expires in 24 hours (86400 seconds)
});

export const Story = mongoose.model('Story', storySchema);
