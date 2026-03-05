import User from "../model/message.model.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

export const register = async (req,res) =>{
    try{
        const {username, email, password} = req.body;

        if(!username || !email || !password){
            return res.status(401).json({
                message:"Something is missing, please check!",
                success:false
            });
        }

        const user = await User.findOne({email});

        if(user){
            return res.status(401).json({
                message:"Try different email id",
                success:false
            });
        }

        const hashedPassword = await bcrypt.hash(password,10);

        await User.create({
            username,
            email,
            password:hashedPassword
        });

        return res.status(201).json({
            message:"Account created successfully",
            success:true
        });

    }catch(error){
        console.log(error);
    }
};


export const login = async(req,res)=>{
    try{

        const {email,password}=req.body;

        if(!email || !password){
            return res.status(401).json({
                message:"Something is missing please check!",
                success:false
            });
        }

        const user = await User.findOne({email});

        const isPasswordMatch = await bcrypt.compare(password,user.password);

        if(!isPasswordMatch){
            return res.status(401).json({
                message:"Incorrect email or password",
                success:false
            });
        }

        user={
            _id:user._id,
            username:user.username,
            email:user.email,
            profilePicture:user.profilePicture,
            bio:user.bio,
            followers:user.followers,
            following:user.following,
            posts:user.posts
        };

        const token = jwt.sign(
            {userId:user._id},
            process.env.SECRET_KEY,
            {expiresIn:"1d"}
        );

        return res
        .cookie("token",token,{
            httpOnly:true,
            sameSite:"strict",
            maxAge:1*24*60*60*1000
        })
        .json({
            message:`Welcome back ${user.username}`,
            success:true
        });

    }catch(error){
        console.log(error);
    }
};


export const logout = async(req,res)=>{
    try{

        return res
        .cookie("token","",{maxAge:0})
        .json({
            message:"Logged out successfully.",
            success:true
        });

    }catch(error){
        console.log(error);
    }
};


export const getProfile = async(req,res)=>{
    try{

        const userId = req.params.id;

        const user = await User.findById(userId);

        return res.status(200).json({
            user,
            success:true
        });

    }catch(error){
        console.log(error);
    }
};


export const editProfile = async(req,res)=>{
    try{

        const userId = req.id;
        const {bio,gender} = req.body;
        const profilePicture = req.file;

        let cloudResponse;

        if(profilePicture){
            const fileUri = getDataUri(profilePicture);
            cloudResponse = await cloudinary.uploader.upload(fileUri);
        }

        const user = await User.findById(userId);

        if(!user){
            return res.status(404).json({
                message:"User not found.",
                success:false
            });
        }

        if(bio) user.bio=bio;
        if(gender) user.gender=gender;
        if(profilePicture) user.profilePicture=cloudResponse.secure_url;

        await user.save();

        return res.status(200).json({
            message:"Profile updated.",
            success:true,
            user
        });

    }catch(error){
        console.log(error);
    }
};


export const getSuggestedUsers = async(req,res)=>{
    try{

        const suggestedUsers = await User
        .find({_id:{$ne:req.id}})
        .select("-password");

        if(!suggestedUsers){
            return res.status(400).json({
                message:"Currently do not have any users"
            });
        }

        return res.status(200).json({
            success:true,
            users:suggestedUsers
        });

    }catch(error){
        console.log(error);
    }
};


export const followOrUnfollow = async(req,res)=>{
    try{

        const whoFollows = req.id;
        const whomFollows = req.params.id;

        if(whoFollows===whomFollows){
            return res.status(400).json({
                message:"You cannot follow/unfollow yourself",
                success:false
            });
        }

        const user = await User.findById(whoFollows);
        const targetUser = await User.findById(whomFollows);

        if(!user || !targetUser){
            return res.status(400).json({
                message:"User not found",
                success:false
            });
        }

        const isFollowing = user.following.includes(whomFollows);

        if(isFollowing){

            await Promise.all([
                User.updateOne({_id:whoFollows},{$pull:{following:whomFollows}}),
                User.updateOne({_id:whomFollows},{$pull:{followers:whoFollows}})
            ]);
            return Response.status(200).json({message:'Unfollow successfully',success:true});
        }else{

            await Promise.all([
                User.updateOne({_id:whoFollows},{$push:{following:whomFollows}}),
                User.updateOne({_id:whomFollows},{$push:{followers:whoFollows}})
            ]);
            return Response.status(200).json({message:'Unfollow successfully',success:true});
        }
        
    }catch(error){
        console.log(error);
    }
};