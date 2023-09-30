"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteUser = exports.forgotPassword = exports.getUsers = exports.getUser = exports.verifyUser = exports.LoginUser = exports.RegisterUser = void 0;
const uuid_1 = require("uuid");
const userModel_1 = require("../models/userModel");
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const utils_1 = require("../utils/utils");
const verificationEmail_1 = require("../email/verificationEmail");
const emailService_1 = require("../middleware/emailService");
const forgotPassword_1 = require("../email/forgotPassword");
const secret = process.env.JWT_SECRET;
async function RegisterUser(req, res, next) {
    const id = (0, uuid_1.v4)();
    try {
        const validateResult = utils_1.registerSchema.validate(req.body, utils_1.options);
        if (validateResult.error) {
            return res.status(400).json({
                Error: validateResult.error.details[0].message
            });
        }
        const duplicatEmail = await userModel_1.User.findOne({ email: req.body.email });
        if (duplicatEmail) {
            return res.status(409).json({
                msg: "Email has be used already"
            });
        }
        const passwordHash = await bcryptjs_1.default.hash(req.body.password, 8);
        const record = await userModel_1.User.create({
            firstname: req.body.firstname,
            lastname: req.body.lastname,
            email: req.body.email,
            isVerified: true,
            isAdmin: false,
            password: passwordHash
        });
        if (record) {
            const email = req.body.email;
            const subject = "User verification";
            const firstname = req.body.username;
            const token = jsonwebtoken_1.default.sign({ id }, secret, { expiresIn: '7d' });
            const html = (0, verificationEmail_1.emailVerificationView)(token);
            await (0, emailService_1.sendMail)(html, email, subject, firstname);
            return res.status(200).json({
                message: "You have successfully signed up.",
                record
            });
        }
    }
    catch (err) {
        console.log(err);
        return res.status(500).json({
            message: 'failed to register',
            route: '/register'
        });
    }
}
exports.RegisterUser = RegisterUser;
async function LoginUser(req, res, next) {
    const id = (0, uuid_1.v4)();
    try {
        const validateResult = utils_1.LoginSchema.validate(req.body, utils_1.options);
        if (validateResult.error) {
            return res.status(400).json({
                Error: validateResult.error.details[0].message
            });
        }
        const user = await userModel_1.User.findOne({ email: req.body.email });
        const { id } = user;
        const token = (0, utils_1.generateToken)({ id });
        res.cookie('mytoken', token, { httpOnly: true });
        res.cookie('id', id, { httpOnly: true });
        const validUser = await bcryptjs_1.default.compare(req.body.password, user.password);
        if (!validUser) {
            res.status(401);
            res.json({ message: "incorrect password"
            });
        }
        if (validUser) {
            res.status(200);
            res.json({ message: "login successful",
                token,
                user
            });
        }
    }
    catch (err) {
        console.log(err);
        res.status(500);
        res.json({
            message: 'failed to login',
            route: '/login'
        });
    }
}
exports.LoginUser = LoginUser;
async function verifyUser(token) {
    try {
        const decode = jsonwebtoken_1.default.verify(token, process.env.JWT_SECRET);
        const details = decode;
        const id = details.id;
        const user = await userModel_1.User.findOne();
        if (!user) {
            throw new Error('User not found');
        }
        await userModel_1.User.findOne({ isVerified: true });
        return { message: 'User verified successfully', user };
    }
    catch (error) {
        console.error('Error verifying user:', error);
        throw error;
    }
}
exports.verifyUser = verifyUser;
async function getUser(req, res, next) {
    try {
        //const id=req.user.id;
        const { id } = req.params;
        const record = await userModel_1.User.findById(id);
        res.status(200).json({ "record": record });
    }
    catch (error) {
        res.status(500).json({
            msg: "Invalid User",
            route: "/user/:id",
        });
    }
}
exports.getUser = getUser;
async function getUsers(req, res, next) {
    try {
        const { id } = req.params;
        const record = await userModel_1.User.find();
        res.status(200).json({ "record": record });
    }
    catch (error) {
        res.status(500).json({
            msg: "Invalid User",
            route: "/user",
        });
    }
}
exports.getUsers = getUsers;
async function forgotPassword(req, res) {
    try {
        const user = await userModel_1.User.findOne({ email: req.body.email });
        if (!user) {
            return res.status(404).json({
                message: 'email not found'
            });
        }
        const { id } = user;
        const fromUser = process.env.FROM;
        const subject = "Reset Password";
        const html = (0, forgotPassword_1.forgotPasswordVerification)(id);
        await (0, emailService_1.sendMail)(html, req.body.email, subject, fromUser);
        res.status(200).json({
            message: 'Check email for the verification link'
        });
    }
    catch (error) {
        res.status(500).json({
            message: 'Internal server error'
        });
    }
}
exports.forgotPassword = forgotPassword;
async function deleteUser(req, res, next) {
    try {
        const { id } = req.params;
        const record = await userModel_1.User.findById(id);
        if (!record) {
            return res.status(404).json({
                msg: "User not found",
            });
        }
        const deletedRecord = await record.deleteOne();
        return res.status(200).json({
            msg: "User deleted successfully",
        });
    }
    catch (error) {
        return res.status(500).json({
            msg: "failed to delete",
            route: "/deleteuser/:id",
        });
    }
}
exports.deleteUser = deleteUser;
