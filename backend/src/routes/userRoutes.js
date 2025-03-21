import { body } from 'express-validator';
import express from 'express';
import AuthController from '../controllers/user/authController.js';
import AuthService from '../services/user/authService.js';
import { NoAdminRoles } from '../utils/roles.js';
import { formatDateMiddleware } from '../middlewares/formatDateMiddleware.js';

const router = express.Router();
const authService = new AuthService();
const authController = new AuthController(authService);

router.post('/register', [
    formatDateMiddleware, // Apply the middleware here
    body('email').trim().isEmail().withMessage('Invalid email'),
    body('password').trim().isLength({ min: 6 }).withMessage('Password must be at least 6 characters long'),
    body('role').optional().trim().isIn(NoAdminRoles).withMessage('Invalid role'),
    body('firstname').trim().isLength({ min: 3 }).withMessage('First name must be at least 3 characters long'),
    body('lastname').trim().isLength({ min: 3 }).withMessage('Last name must be at least 3 characters long'),
    body('dateOfBirth').isISO8601().withMessage('Invalid date of birth'),
], authController.register);

router.post('/login', [
    body('email').trim().isEmail().withMessage('Invalid email'),
    body('password').trim().isLength({ min: 6 }).withMessage('Password must be at least 6 characters long'),
], authController.login);

router.post('/activate', [
    body('activationCode').trim().isLength({ min: 6 }).withMessage('Invalid activation code').isNumeric().withMessage('Invalid activation code'),
], authController.activate);

router.post('/send-activation-email', async (req, res) => {
    const { email } = req.body;
    try {
        const user = await authService.sendActivationEmail(email);
        res.status(200).json({ message: 'Activation email sent successfully' });
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

router.post('/activate', async (req, res) => {
    const { activationCode } = req.body;
    try {
        const user = await authService.activateAccount(activationCode);
        res.status(200).json({ message: 'Account activated successfully', user });
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

router.post('/send-reset-password-email', async (req, res) => {
    const { email } = req.body;
    try {
        await authService.sendResetPasswordEmail(email);
        res.status(200).json({ message: 'Reset password email sent successfully' });
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

router.post('/reset-password', async (req, res) => {
    const { resetToken, newPassword } = req.body;
    try {
        await authService.resetPassword(resetToken, newPassword);
        res.status(200).json({ message: 'Password reset successfully' });
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

export default router;