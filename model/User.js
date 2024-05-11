import  mongoose from 'mongoose';
import Post from "./Post.js"

const UserSchema = new mongoose.Schema({
    email:{
        type : String,
        required: true,
        unique : true,
    },
    password:{
        type : String,
        required: true,
        min : 4,
        max : 20,
    },
    isActivated: {
        type: Boolean,
        default : false,
    },
    activationLink: {
        type: String,
    },
    postsSaved: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Post'
      }]
} , {
    timestamps: true,
})

export default mongoose.model("User",UserSchema);