import mongoose from 'mongoose'
import passportLocalMongoose from 'passport-local-mongoose'
import {hashPassword, comparePassword} from '../utils/authUtils.js'

const userSchema = new mongoose.Schema({
    id: {
        type: String,
        required: true,
        unique: true,
    },
    name: {
        type: String,
        required: true,
        trim: true,
    },
    email: {
        type: String,
        required: true,
        trim: true,
        unique: true,
    },
    password: {
        type: String,
        required: true,
    },
    role: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Role',
        required: true,
    },
    isActive: { 
        type: Boolean,
        default: false 
    },
    activationCode: { 
        type: String
    },
})


userSchema.plugin(passportLocalMongoose);

userSchema.pre('save',hashPassword)
userSchema.methods.comparePassword = comparePassword

export default mongoose.model('User', userSchema)   