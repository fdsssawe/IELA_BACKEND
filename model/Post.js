import  mongoose from 'mongoose';

const PostSchema = new mongoose.Schema({
    original: {
        type: String,
        required: true,
    },
    result: {
        type: String,
        required: true,
    },
    author: {
        type: String,
        required:true
    },
} , {
    timestamps: true,
})

export default mongoose.model("Post",PostSchema);