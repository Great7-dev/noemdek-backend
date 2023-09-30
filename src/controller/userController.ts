import express,{Request,Response,NextFunction}  from "express"
import {v4 as uuidv4} from "uuid";
import { User } from '../models/userModel';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { generateToken, LoginSchema, options, registerSchema } from "../utils/utils";
import { emailVerificationView } from "../email/verificationEmail";
import { sendMail } from "../middleware/emailService";
import { forgotPasswordVerification } from "../email/forgotPassword";

const secret = process.env.JWT_SECRET as string


export async function RegisterUser(req:Request, res:Response, next:NextFunction) {
    const id = uuidv4()
    try{
        const validateResult = registerSchema.validate(req.body,options)
        if(validateResult.error){
            return res.status(400).json({
                Error:validateResult.error.details[0].message
            })
        }
        const duplicatEmail =  await User.findOne({email: req.body.email})
        if(duplicatEmail){
            return res.status(409).json({
                msg:"Email has be used already"
            })
        }
        
        const passwordHash = await bcrypt.hash(req.body.password, 8)
        const record = await User.create({
            firstname: req.body.firstname,
            lastname: req.body.lastname,
            email:req.body.email,
            isVerified: true,
            isAdmin: false,
            password:passwordHash
         })
         if (record) {
            const email = req.body.email as string;
            const subject = "User verification";
            const firstname =req.body.username as string
            const token = jwt.sign({id},secret,{expiresIn:'7d'}) 
            const html:string = emailVerificationView(token)
            await sendMail(html,email,subject,firstname)

       return res.status(200).json({
            message:"You have successfully signed up.",
            record
        })
    }
}
catch(err){
        console.log(err)
        return res.status(500).json({
            message:'failed to register',
            route:'/register'

        })
    }

  }

  export async function LoginUser(req:Request, res:Response, next:NextFunction) {
    const id = uuidv4()
    try{
        const validateResult = LoginSchema.validate(req.body,options)
        if(validateResult.error){
            return res.status(400).json({
                Error:validateResult.error.details[0].message
            })
        }
        const user =  await User.findOne({email: req.body.email}) as unknown as {[key:string]:string};

       const {id} = user
       const token = generateToken({id})
       res.cookie('mytoken', token, {httpOnly:true})
       res.cookie('id',id,{httpOnly:true})
       const validUser= await bcrypt.compare(req.body.password, user.password)
       if(!validUser){
        res.status(401)
       res.json({message: "incorrect password"  
         })
       }
       if(validUser){
       res.status(200)
       res.json({message: "login successful",
          token,
          user   
         })
       }
    } catch(err){
        console.log(err)
        res.status(500)
        res.json({
            message:'failed to login',
            route:'/login'

        })
    }

  }

  export async function verifyUser(token: string) {
    try {
      const decode = jwt.verify(token, process.env.JWT_SECRET as string);
      const details = decode as unknown as Record<string, unknown>;
      const id = details.id as string;
      
      const user = await User.findOne();
      if (!user) {
        throw new Error('User not found');
      }
      await User.findOne({ isVerified: true });
      return { message: 'User verified successfully', user };
    } catch (error) {
      console.error('Error verifying user:', error);
      throw error;
    }
  }

  
  

  export async function getUser(
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    try {
      //const id=req.user.id;
      const { id } = req.params;
      const record = await User.findById(id);
      res.status(200).json({ "record": record });
    } catch (error) {
      res.status(500).json({
        msg: "Invalid User",
        route: "/user/:id",
      });
    }
  }

  export async function getUsers(
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    try {
      const { id } = req.params;
      const record = await User.find();
      res.status(200).json({ "record": record });
    } catch (error) {
      res.status(500).json({
        msg: "Invalid User",
        route: "/user",
      });
    }
  }

  export async function forgotPassword(req: Request, res: Response) {
    try {

      const user =  await User.findOne({email: req.body.email}) as unknown as {[key:string]:string};
  
      if (!user) {
        return res.status(404).json({
          message: 'email not found'
        });
      }
      const { id } = user;
      const fromUser = process.env.FROM as string;
      const subject = "Reset Password";
      const html = forgotPasswordVerification(id);
  
      await sendMail(html, req.body.email, subject, fromUser);
  
      res.status(200).json({
        message: 'Check email for the verification link'
      });
    } catch (error) {
      res.status(500).json({
        message: 'Internal server error'
      });
    }
  }

  export async function deleteUser(
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    try {
      const { id } = req.params;
      const record = await User.findById(id);
      if (!record) {
        return res.status(404).json({
          msg: "User not found",
        });
      }
      const deletedRecord = await record.deleteOne();
      return res.status(200).json({
        msg: "User deleted successfully",
      });
    } catch (error) {
      return res.status(500).json({
        msg: "failed to delete",
        route: "/deleteuser/:id",
      });
    }
  }