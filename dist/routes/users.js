"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const router = express_1.default.Router();
const auth_1 = require("../middleware/auth");
const userController_1 = require("../controller/userController");
/* GET users listing. */
router.get("/verify/:token", async (req, res) => {
    try {
        const token = req.params.token;
        const user = await (0, userController_1.verifyUser)(token);
        const link = process.env.FRONTEND_URL;
        res.redirect(`${link}/login`);
    }
    catch (error) {
        console.error("Verification error:", error);
        res.status(500).send("Verification failed. Please try again.");
    }
});
router.post('/create', userController_1.RegisterUser);
router.post('/login', userController_1.LoginUser);
router.post('/forgotpassword', userController_1.forgotPassword);
router.delete('/delete/:id', auth_1.auth, userController_1.deleteUser);
router.get('/getuser/:id', auth_1.auth, userController_1.getUser);
router.get('/getusers', auth_1.auth, userController_1.getUsers);
exports.default = router;
