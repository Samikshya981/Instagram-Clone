import { User } from "../model/user.model.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import getDataUri from "../utils/datauri.js";
import cloudinary from "../utils/cloudinary.js";
import { Notification } from "../model/notification.model.js";
import { getReceiverSocketId, io } from "../socket/socket.js";

export const register = async (req, res) => {
  try {
    const { username, email, password } = req.body;

    if (!username || !email || !password) {
      return res.status(401).json({
        message: "Something is missing, please check!",
        success: false,
      });
    }

    const user = await User.findOne({ email });
    if (user) {
      return res.status(401).json({
        message: "Try different email id",
        success: false,
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = await User.create({ username, email, password: hashedPassword });

    const userData = {
      _id: newUser._id,
      username: newUser.username,
      email: newUser.email,
      profilePicture: newUser.profilePicture,
      bio: newUser.bio,
      followers: newUser.followers,
      following: newUser.following,
      posts: newUser.posts,
    };

    const token = jwt.sign({ userId: userData._id }, process.env.SECRET_KEY, {
      expiresIn: "1d",
    });

    return res
      .cookie("token", token, {
        httpOnly: true,
        sameSite: "lax",
        maxAge: 1 * 24 * 60 * 60 * 1000,
      })
      .status(201)
      .json({
        message: "Account created successfully",
        success: true,
        user: userData,
      });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      message: "Internal server error",
      success: false
    });
  }
};

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(401).json({
        message: "Something is missing please check!",
        success: false,
      });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({
        message: "Incorrect email or password",
        success: false,
      });
    }

    const isPasswordMatch = await bcrypt.compare(password, user.password);
    if (!isPasswordMatch) {
      return res.status(401).json({
        message: "Incorrect email or password",
        success: false,
      });
    }

    const userData = {
      _id: user._id,
      username: user.username,
      email: user.email,
      profilePicture: user.profilePicture,
      bio: user.bio,
      followers: user.followers,
      following: user.following,
      posts: user.posts,
    };

    const token = jwt.sign({ userId: userData._id }, process.env.SECRET_KEY, {
      expiresIn: "1d",
    });

    return res
      .cookie("token", token, {
        httpOnly: true,
        sameSite: "lax",
        maxAge: 1 * 24 * 60 * 60 * 1000,
      })
      .json({
        message: `Welcome back ${userData.username}`,
        success: true,
        user: userData,
      });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      message: "Internal server error",
      success: false
    });
  }
};

export const logout = async (req, res) => {
  try {
    return res.cookie("token", "", { maxAge: 0 }).json({
      message: "Logged out successfully.",
      success: true,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      message: "Internal server error",
      success: false
    });
  }
};

export const getProfile = async (req, res) => {
  try {
    const userId = req.params.id;

    const user = await User.findById(userId).select("-password");

    if (!user) {
      return res.status(404).json({
        message: "User not found",
        success: false
      });
    }

    return res.status(200).json({
      user,
      success: true
    });

  } catch (error) {
    console.log(error);

    return res.status(500).json({
      message: "Internal server error",
      success: false
    });
  }
};

export const editProfile = async (req, res) => {
  try {
    const userId = req.id;
    const { bio, gender } = req.body;
    const profilePicture = req.file;

    let cloudResponse;
    if (profilePicture) {
      const fileUri = getDataUri(profilePicture);
      cloudResponse = await cloudinary.uploader.upload(fileUri.content);
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found.", success: false });
    }

    if (bio) user.bio = bio;
    if (gender) user.gender = gender;
    if (profilePicture) user.profilePicture = cloudResponse.secure_url;

    await user.save();

    return res.status(200).json({
      message: "Profile updated.",
      success: true,
      user,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      message: "Internal server error",
      success: false
    });
  }
};

export const getSuggestedUsers = async (req, res) => {
  try {
    const suggestedUsers = await User.find({ _id: { $ne: req.id } }).select("-password").limit(5);
    return res.status(200).json({ success: true, users: suggestedUsers });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      message: "Internal server error",
      success: false
    });
  }
};

export const followOrUnfollow = async (req, res) => {
  try {
    const whoFollows = req.id;
    const whomFollows = req.params.id;

    if (whoFollows === whomFollows) {
      return res.status(400).json({
        message: "You cannot follow/unfollow yourself",
        success: false,
      });
    }

    const user = await User.findById(whoFollows);
    const targetUser = await User.findById(whomFollows);

    if (!user || !targetUser) {
      return res.status(400).json({ message: "User not found", success: false });
    }

    const isFollowing = user.following.includes(whomFollows);

    if (isFollowing) {
      await Promise.all([
        User.updateOne({ _id: whoFollows }, { $pull: { following: whomFollows } }),
        User.updateOne({ _id: whomFollows }, { $pull: { followers: whoFollows } }),
      ]);
      return res.status(200).json({ message: "Unfollow successfully", success: true });
    } else {
      await Promise.all([
        User.updateOne({ _id: whoFollows }, { $push: { following: whomFollows } }),
        User.updateOne({ _id: whomFollows }, { $push: { followers: whoFollows } }),
      ]);

      // Create database notification and emit socket event for real-time update
      try {
        const senderUser = await User.findById(whoFollows).select("username profilePicture");
        const notification = await Notification.create({
          receiver: whomFollows,
          sender: whoFollows,
          type: 'follow',
          message: `${senderUser.username} started following you.`,
        });

        const receiverSocketId = getReceiverSocketId(whomFollows);
        if (receiverSocketId) {
          io.to(receiverSocketId).emit('notification', {
            ...notification.toObject(),
            sender: senderUser
          });
        }
      } catch (err) {
        console.error("Failed to create follow notification:", err);
      }

      return res.status(200).json({ message: "Follow successfully", success: true });
    }
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      message: "Internal server error",
      success: false
    });
  }
};

export const searchUsers = async (req, res) => {
  try {
    const { query } = req.query;
    if (!query) {
      return res.status(200).json({ success: true, users: [] });
    }

    const users = await User.find({
      $or: [
        { username: { $regex: query, $options: "i" } },
        { bio: { $regex: query, $options: "i" } }
      ]
    }).select("username profilePicture bio");

    return res.status(200).json({ success: true, users });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Internal server error", success: false });
  }
};

export const getChatUsers = async (req, res) => {
  try {
    // Get all users except the current logged-in user
    const chatUsers = await User.find({ _id: { $ne: req.id } }).select("-password");
    return res.status(200).json({ success: true, users: chatUsers });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Internal server error", success: false });
  }
};
