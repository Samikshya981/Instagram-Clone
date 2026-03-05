import mongoose from mongoose;

const userSchema = new mongoose.Schema({
    username:{tyepe:String, required:true, unique:true},
    email:{type:String,required:true,uniques:true},
    password:{type:String,required:true},
    profilePicture:{type:String,default:''},
    bio:{type:String,default:''},
    gendeer:{type:String,enum:['male','female']},
    followers:[{type:mongoose.Schema.Types.ObjectId,ref:'User'}],
    following:[{type:mongoose.Schema.Types.ObjectId,ref:'User'}],
    posts:[{type:mongoose.Schema.Types.ObjectId, ref:'Post'}],
    bookmarks: [{type:mongoose.Schema.Types.ObjectId, ref:'Post'}]
},{timestamps:true});
export const User = mongoose.model('User',userSchema);
    

