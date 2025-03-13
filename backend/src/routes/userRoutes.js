import {body} from 'express-validator';
import express from 'express';
import authController from '../controllers/user/authController';


const router = express.Router();

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