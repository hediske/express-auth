import { validationResult } from 'express-validator';

class AuthController {
    constructor(authService) {
        this.authService = authService;
        this.register = this.register.bind(this);
        this.login = this.login.bind(this);
        this.activate = this.activate.bind(this);
    }

    async register(req, res) {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }
        const { email, password } = req.body;
        try {
            const user = await this.authService.register(email, password);
            res.status(201).json({ message: 'User registered successfully', user });
        } catch (err) {
            res.status(400).json({ message: err.message });
        }
    }

    async login(req, res) {
        console.log("Tesing the login function");
        console.log('Request Body:', req.body); // Log the request body
        console.log(this.authService)
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            console.log("Found Errors")
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
            const user = await this.authService.activate(activationCode);
            if (user) {
                res.status(200).json({ message: 'Account activated successfully', user });
            } else {
                res.status(400).json({ message: 'Invalid or expired activation code' });
            }
        } catch (err) {
            res.status(400).json({ message: err.message });
        }
    }
}

export default AuthController;