import User from '../../models/User.js';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import Role from '../../models/Role.js'; // Import the Role model
import crypto from 'crypto';
import nodemailer from 'nodemailer';

dotenv.config();

class AuthService {

    async login(email , password) {
        try{
            if (!email || !password) {
                throw new Error('Email and password are required');
            }
            const user = await User.findOne({ email });
            if (!user) {
                throw new Error('User not found');
            }
            const isMatch = await user.comparePassword(password, user.password);
            if (!isMatch) {
                throw new Error('Invalid password');
            }
    
            if (!user.isActive) {
                throw new Error('Account not activated');
            }
    
            // Payload to encode in the token
            const payload = {
                id: user._id,
                email: user.email,
                role: user.role.name // Assuming role has a `name` field
            };
    
            const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '1h' });
    
            return token
        }
        catch (error) {
            console.log(error);
            throw new Error('Error logging in: ' + error.message);
        }

        
    }

    async register(email, password, roleName,firstname,lastname,dateOfBirth) {
        try {
            const user = await User.findOne({ email });
            if (user) {
                throw new Error('User already exists');
            }

            // Fetch the role by its name
            const role = await Role.findOne({ name: roleName });
            if (!role) {
                throw new Error('Invalid role');
            }

            // Create the user with the role's ObjectId
            const newUser = await User.create({ email, password, role: role._id , firstname,lastname,dateOfBirth});
            return { message: 'User created successfully', id: newUser._id, email: newUser.email };
        } catch (error) {
            console.log(error);
            throw new Error('Error creating user: ' + error.message);
        }
    }

    async activate(activationCode) {
        const user = await User.findOne({ activationCode });
        if (!user) {
            throw new Error('Invalid or expired activation code');
        }
        user.isActive = true;
        user.activationCode = null; // Clear the activation code
        await user.save();
        return user;
    }

    async sendActivationEmail(user) {
        const activationToken = crypto.randomBytes(32).toString('hex');
        user.activationCode = activationToken;
        await user.save();

        const activationLink = `${process.env.FRONTEND_URL}/activate/${activationToken}`;
        const transporter = nodemailer.createTransport({
            service: 'Gmail', // Use your email service
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS,
            },
        });

        await transporter.sendMail({
            from: process.env.EMAIL_USER,
            to: user.email,
            subject: 'Activate Your Account',
            html: `<p>Click <a href="${activationLink}">here</a> to activate your account.</p>`,
        });
    }

    async activateAccount(activationCode) {
        const user = await User.findOne({ activationCode });
        if (!user) {
            throw new Error('Invalid or expired activation code');
        }
        user.isActive = true;
        user.activationCode = null; // Clear the activation code
        await user.save();
        return user;
    }

    async sendResetPasswordEmail(email) {
        const user = await User.findOne({ email });
        if (!user) {
            throw new Error('User not found');
        }

        const resetToken = crypto.randomBytes(32).toString('hex');
        user.resetPasswordToken = resetToken;
        user.resetPasswordExpires = Date.now() + 3600000; // 1 hour
        await user.save();

        const resetLink = `${process.env.FRONTEND_URL}/reset-password/${resetToken}`;
        const transporter = nodemailer.createTransport({
            service: 'Gmail', // Use your email service
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS,
            },
        });

        await transporter.sendMail({
            from: process.env.EMAIL_USER,
            to: user.email,
            subject: 'Reset Your Password',
            html: `<p>Click <a href="${resetLink}">here</a> to reset your password.</p>`,
        });
    }

    async resetPassword(resetToken, newPassword) {
        const user = await User.findOne({
            resetPasswordToken: resetToken,
            resetPasswordExpires: { $gt: Date.now() },
        });
        if (!user) {
            throw new Error('Invalid or expired reset token');
        }

        user.password = newPassword;
        user.resetPasswordToken = null;
        user.resetPasswordExpires = null;
        await user.save();
    }
}   

export default AuthService;