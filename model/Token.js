import  mongoose, { Schema } from 'mongoose';

const TokenSchema = new mongoose.Schema({
    isActive: {
        type : Schema.Types.ObjectId,
        ref : 'User',
    },
    refreshToken:{
        type : String,
        require : true
    }
})

export default mongoose.model("Token",TokenSchema);