import User from '../../models/User.js';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

dotenv.config();

class AuthService {

    async login(email , password) {
        const user = await User.findOne({ email });
        if (!user) {
            throw new Error('User not found');
        }
        const isMatch = await user.comparePassword(password);
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

    async register(email, password) {
        const user = await User.create({ email, password });
        return { message : 'User created successfully', "id" : user._id , "email" : user.email };
    }

    static async activate(activationCode) {
        const user = await User.findOne({ activationCode });
        if (!user) {
            throw new Error('Invalid or expired activation code');
        }
        user.isActive = true;
        user.activationCode = null; // Clear the activation code
        await user.save();
        return user;
    }
}   

export default AuthService;