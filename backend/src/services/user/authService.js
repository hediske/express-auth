


class authService {

    constructor(userModel) {
        this.userModel = userModel;
    }

    async login(request) {
        const { email, password } = request;
        const user = await this.userModel.findOne({ email });
        if (!user) {
            throw new Error('User not found');
        }
        const isMatch = await user.comparePassword(password);
        if (!isMatch) {
            throw new Error('Invalid password');
        }
        return { message : 'Login successful'  };
    }

    async register(request) {
        const { email, password } = request;
        const user = await this.userModel.create({ email, password });
        return { message : 'User created successfully', "id" : user._id , "email" : user.email };
    }


    async activate(request) {
        const { email, activationCode } = request;
        const user = await this.userModel.findOne({ email });
        if (!user) {
            throw new Error('User not found');
        }
        // Check if the activation code is correct
    }
}   

export default authService; 