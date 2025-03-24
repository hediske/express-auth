import nodemailer from 'nodemailer';
import hbs from 'nodemailer-express-handlebars';
import path from 'path';
import dotenv from 'dotenv';

dotenv.config();

class EmailService {
    constructor() {
        this.transporter = this._createTransporter();

        // Set up handlebars
        this.transporter.use('compile', hbs({
            viewEngine: {
                extname: '.hbs',
                layoutsDir: path.resolve('static/templates'),
                defaultLayout: false,
            },
            viewPath: path.resolve('static/templates'),
            extName: '.hbs',
        }));
    }

    _createTransporter() {
        if (process.env.NODE_ENV === 'production') {
            return nodemailer.createTransport({
                service: 'Gmail',
                auth: {
                    user: process.env.EMAIL_USER,
                    pass: process.env.EMAIL_PASS,
                },
            });
        } else {
            // Local dev with MailDev
            return nodemailer.createTransport({
                host: 'localhost',
                port: 1025,
                ignoreTLS: true,
            });
        }
    }

    async sendMail({ to, subject, template, context }) {
        await this.transporter.sendMail({
            from: process.env.EMAIL_USER || 'dev@local.test',
            to,
            subject,
            template,
            context,
        });
    }
}

export default new EmailService();
