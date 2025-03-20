import { body } from 'express-validator';
import express from 'express';
import AuthController from '../controllers/user/authController.js';
import AuthService from '../services/user/authService.js';

const router = express.Router();
const authService = new AuthService();
const authController = new AuthController(authService);

router.post('/register', [
    body('email').trim().isEmail().withMessage('Invalid email'),
    body('password').trim().isLength({ min: 6 }).withMessage('Password must be at least 6 characters long'),
], authController.register);

router.post('/login', [
    body('email').trim().isEmail().withMessage('Invalid email'),
    body('password').trim().isLength({ min: 6 }).withMessage('Password must be at least 6 characters long'),
], authController.login);

router.post('/activate', [
    body('activationCode').trim().isLength({ min: 6 }).withMessage('Invalid activation code').isNumeric().withMessage('Invalid activation code'),
], authController.activate);

export default router;