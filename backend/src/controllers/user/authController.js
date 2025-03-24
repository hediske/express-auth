import { validationResult } from 'express-validator';
class AuthController {
    
    constructor(authService) {
        this.authService = authService;

        this.register = this.register.bind(this);
        this.login = this.login.bind(this);
        this.activate = this.activate.bind(this);
        this.sendActivation = this.sendActivation.bind(this);
        this.sendResetPassword = this.sendResetPassword.bind(this);
        this.resetPassword = this.resetPassword.bind(this);
    }

    async register(req, res) {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }
        const { email, password, role = 'student', firstname, lastname, dateOfBirth } = req.body;
        try {
            const user = await this.authService.register(email, password, role, firstname, lastname, dateOfBirth);
            res.status(201).json({ message: 'User registered successfully. Please check your email to activate your account.', user });
        } catch (err) {
            res.status(400).json({ message: err.message });
        }
    }

    async login(req, res) {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }
        const { email, password } = req.body;
        try {
            const token = await this.authService.login(email, password);
            res.status(200).json({ message: 'User logged in successfully', token });
        } catch (err) {
            res.status(400).json({ message: err.message });
        }
    }

    async activate(req, res) {
        const { activationCode } = req.body;
        try {
            const user = await this.authService.activateAccount(activationCode);
            res.status(200).json({ message: 'Account activated successfully', user });
        } catch (err) {
            res.status(400).json({ message: err.message });
        }
    }

    async sendActivation(req, res) {
        const { email } = req.body;
        try {
            await this.authService.sendActivationEmail(email);
            res.status(200).json({ message: 'Activation email resent successfully' });
        } catch (err) {
            res.status(400).json({ message: err.message });
        }
    }

    async sendResetPassword(req, res) {
        const { email } = req.body;
        try {
            await this.authService.sendResetPasswordEmail(email);
            res.status(200).json({ message: 'Reset password email sent' });
        } catch (err) {
            res.status(400).json({ message: err.message });
        }
    }

    async resetPassword(req, res) {
        const { token, newPassword } = req.body;
        try {
            await this.authService.resetPassword(token, newPassword);
            res.status(200).json({ message: 'Password reset successfully' });
        } catch (err) {
            res.status(400).json({ message: err.message });
        }
    }
}
export default AuthController;
