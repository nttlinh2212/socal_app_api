import mongoose from 'mongoose'

const userSchema = new mongoose.Schema({
    username:{
        type: String,
        required:true,
        minlength:6,
        unique:true
    },
    email:{
        type: String,
        required:true,
        unique:true
    },
    password:{
        type: String,
        minlength:6
    },
    profilePicture:{
        type: String,
        default:''
    },
    coverPicture:{
        type: String,
        default:''
    },
    followings:{
        type: Array,
        default:[]
    },
    followers:{
        type: Array,
        default:[]
    },
    isAdmin:{
        type: Boolean,
        default:false
    },
    desc:{
        type: String,
        maxlength:50
    },
    city:{
        type: String,
        maxlength:50,
        default:"Ho Chi Minh"
    },
    from:{
        type: String,
        maxlength:50,
        default:"Ho Chi Minh"
    },
    relationship:{
        type: Number,
        enum:[1,2,3],
        default:1
    },
    refreshToken:{
        type: String
    },
},
    {
        timestamps:true
    }
)
const userModel = mongoose.model('user',userSchema);
export default userModel;