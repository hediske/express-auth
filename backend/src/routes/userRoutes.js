import { body } from 'express-validator';
import express from 'express';
import authController from '../controllers/user/authController.js';

const router = express.Router();

router.post('/register', [
    body('email').trim().isEmail().withMessage('Invalid email'),
    body('password').trim().isLength({ min: 6 }).withMessage('Password must be at least 6 characters long'),
], (req, res) => authController.register(req, res));

router.post('/login', [
    body('email').trim().isEmail().withMessage('Invalid email'),
    body('password').trim().isLength({ min: 6 }).withMessage('Password must be at least 6 characters long'),
], (req, res) => authController.login(req, res));

router.post('/activate', [
    body('activationCode').trim().isLength({ min: 6 }).withMessage('Invalid activation code').isNumeric().withMessage('Invalid activation code'),
], (req, res) => authController.activate(req, res));

export default router;