import mongoose from "mongoose";

const connectDB = async () => {
    try {
        if (!process.env.MONGO_URI) {
            console.error("❌ MONGO_URI is missing in .env");
            process.exit(1);
        }
        await mongoose.connect(process.env.MONGO_URI);
        console.log('mongodb connected successfully.');
    }catch (error) {
    console.error("❌ MongoDB connection failed:", error);
    process.exit(1);
    }
}
export default connectDB;