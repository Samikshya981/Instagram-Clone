import mongoose from "mongoose";
const postShema = new mongoose.Schema({
    caption:{type:String, deefault:''},
    image:{type:String, required:true},
    author: {type:mongoose.Schema.Types.ObjectId, reff:'User', required:true},
    likes:[{type:mongoose.Schema.Types.ObjectId, ref:'User'}],
    comments:[{tupe:mongoose.Schema.Types.ObjectId, ref:'Comment'}],

});
export const Post = mongoose.model('Post',postShema);