import User from '../../models/User.js';

class authService {

    async login(email , password) {
        const user = await this.User.findOne({ email });
        if (!user) {
            throw new Error('User not found');
        }
        const isMatch = await user.comparePassword(password);
        if (!isMatch) {
            throw new Error('Invalid password');
        }
        
    }

    async register(email, password) {
        const user = await this.userModel.create({ email, password });
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

export default authService;