import User from '../../models/User.js';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import Role from '../../models/Role.js'; // Import the Role model
import crypto from 'crypto';
import nodemailer from 'nodemailer';
import hbs from 'nodemailer-express-handlebars';
import path from 'path';
import EmailService from '../email/emailService.js';
dotenv.config();

class AuthService {
   
    async login(email , password) { 
        try{
            if (!(email && password)) {
                throw new Error('Email and password are required');
            }
            const { user, error } = await User.authenticate()(email, password);

            if (error || !user) {
                console.log(error)
                throw new Error('Invalid email or password');
            }
    
            if (!user.isActive) {
                const error = new Error('Account not activated');
                error.code = 'ACCOUNT_NOT_ACTIVATED';
                throw error;
            }
    
            // Payload to encode in the token
            const payload = {
                id: user._id,
                email: user.email,
                role: user.role.name // Assuming role has a `name` field
            };
            const { password: userPassword, ...userWithoutPassword } = user.toObject();
            const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '1h' });
    
            return { token, user: userWithoutPassword };
        }
        catch (error) {
            console.log(error);
            throw new Error('Error logging in: ' + error.message);
        }

        
    }


    async register(email, password, roleName, firstname, lastname, dateOfBirth) {
        try {
            const userExists = await User.findOne({ email });
            if (userExists) {
                throw new Error('User already exists');
            }

            // Fetch the role by its name
            const role = await Role.findOne({ name: roleName });
            if (!role) {
                throw new Error('Invalid role');
            }

            // Use passport-local-mongoose's register method
            const newUser = new User({ email, firstname, lastname, dateOfBirth, role: role._id });
            await User.register(newUser, password);

            // Send activation email right after registration
            await this.sendActivationEmail(email);

            return { message: 'User created successfully', id: newUser._id, email: newUser.email };
        } catch (error) {
            console.log(error);
            throw new Error('Error creating user: ' + error.message);
        }
    }

    async activate(activationCode) {
        const user = await User.findOne({ activationCode });
        if (!user || user.activationExpires < Date.now()) {
            throw new Error('Activation code expired');
        }
        user.isActive = true;
        user.activationCode = null; // Clear the activation code
        user.activationExpires = null;
        await user.save();
        const { password, ...userWithoutPassword } = user.toObject();
        return userWithoutPassword;
    }

    async sendActivationEmail(email) { 
        const user = await User.findOne({ email });
        if (!user) {
            throw new Error('User not found');
        }
        if (user.isActive) {
            throw new Error('Account already activated');
        }
        const activationToken = crypto.randomBytes(32).toString('hex');
        user.activationCode = activationToken;
        user.activationExpires = Date.now() + 24 * 60 * 60 * 1000; 

        await user.save();

        const activationLink = `${process.env.FRONTEND_URL}/activate/${activationToken}`;

        await EmailService.sendMail({
            to: user.email,
            subject: 'Activate Your Account',
            template: 'activation', // Use the activation template
            context: {
                firstname: user.firstname,
                activationLink,
            },
        });

        return { message: 'Activation email resent successfully' };

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

        await EmailService.sendMail({
            to: user.email,
            subject: 'Reset Your Password',
            template: 'resetPassword', // Use the reset password template
            context: {
                firstname: user.firstname,
                resetLink,
            },
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