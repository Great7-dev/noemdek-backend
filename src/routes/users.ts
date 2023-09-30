import express from 'express';
const router = express.Router()
import { auth } from '../middleware/auth';
import { LoginUser, RegisterUser, deleteUser, forgotPassword, getUser, getUsers, verifyUser } from '../controller/userController';


/* GET users listing. */
router.get("/verify/:token", async (req, res) => {
  try {
    const token = req.params.token;
    const user = await verifyUser(token);
    const link = process.env.FRONTEND_URL;
    res.redirect(`${link}/login`);
  } catch (error) {
    console.error("Verification error:", error);
    res.status(500).send("Verification failed. Please try again.");
  }
});
router.post('/create', RegisterUser);
router.post('/login', LoginUser);
router.post('/forgotpassword', forgotPassword)
router.delete('/delete/:id', auth, deleteUser);
router.get('/getuser/:id',auth, getUser);
router.get('/getusers', auth, getUsers);





export default router;
