import mongoose from 'mongoose'
import passportLocalMongoose from 'passport-local-mongoose'
import {hashPassword, comparePassword} from '../utils/authUtils.js'

const userSchema = new mongoose.Schema({
    firstname: {
        type: String,
        required: true,
        trim: true,
    },
    lastname: {
        type: String,
        required: true,
        trim: true,
    },
    dateOfBirth: {
        type: Date,
        required: true,
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
    activationExpires: {
        type: Date,
    },
    resetPasswordToken: {
        type: String,
    },
    resetPasswordExpires: {
        type: Date,
    },
})

userSchema.plugin(passportLocalMongoose);

userSchema.pre('save', async function (next) {
    if (this.isModified('password')) {
        try {
            this.password = await hashPassword(this.password); // Hash the password
        } catch (error) {
            return next(error);
        }
    }
    next();
});

userSchema.methods.comparePassword = comparePassword

export default mongoose.model('User', userSchema)