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
    body('activationCode').trim().isLength({min:32,max:32}).withMessage('Invalid activation code'),
], authController.activate);

router.post('/send-activation-email', [
    body('email').trim().isEmail().withMessage('Invalid email'),
], authController.sendActivation);

router.post('/forgot-password', [
    body('email').trim().isEmail().withMessage('Invalid email'),
], authController.forgotPassword);

router.post('/reset-password', [
    body('token').trim().isLength({min:32,max:32}).withMessage('Invalid reset code'),
    body('newPassword').trim().isLength({ min: 6 }).withMessage('Password must be at least 6 characters long'),
], authController.resetPassword);

export default router;