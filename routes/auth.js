import express from "express";
import user from "../models/user.js";
import userModel from "../models/user.js"


import {readFile} from 'fs/promises'
import validate from "../middlewares/validate.js";
import bcrypt from "bcryptjs";
import bcryptjs from "bcryptjs";
import jwt from "jsonwebtoken";
import randomstring from "randomstring";
import dotenv from 'dotenv'

const router = express.Router();
dotenv.config();

const SECRET_KEY = process.env.SECRET_KEY;

const registerSchema = JSON.parse(await readFile(new URL('../validate-schemas/register.json', import.meta.url)));
const loginSchema = JSON.parse(await readFile(new URL('../validate-schemas/login.json', import.meta.url)));
const refreshTokenSchema = JSON.parse(await readFile(new URL('../validate-schemas/refresh-token.json', import.meta.url)));

router.post('/register',validate(registerSchema),async (req,res)=>{

    try{
        //check username and email duplicate
        const existUsername = await userModel.findOne({username:req.body.username});
        if (existUsername)
            return res.status(400).json({
                message:"Username is not available!"
            })
        const existEmail = await userModel.findOne({email:req.body.email});
        if (existEmail)
            return res.status(400).json({
                message:"Email is not available!"
            })
        const salt = await bcrypt.genSalt(10);
        req.body.password = await bcrypt.hash(req.body.password, salt)
        const newUser = new userModel(req.body)
        await newUser.save();
        return res.status(201).json(newUser)
    }catch(err){
        console.log(err);
        return res.status(500).json({
            message:"Something went wrong. Please try again."
        })
    }
    
})
router.post('/login',validate(loginSchema),async (req,res)=>{

    try{

        const existEmail = await userModel.findOne({email:req.body.email});
        if (!existEmail)
            return res.status(400).json({
                message:"Email or Password is invalid!"
            })
        const success = await bcryptjs.compareSync(req.body.password,existEmail.password);
        if(!success)
            return res.status(400).json({
                message:"Email or Password is invalid!"
            })
        

        const payload = {
            userId: existEmail._id+"",
            isAdmin: existEmail.isAdmin,
        }
        const opts = {
            expiresIn: 60*60
        }
        
        const accessToken = jwt.sign(payload,SECRET_KEY,opts);
        const refreshToken = randomstring.generate(80);

        await userModel.updateOne({_id:existEmail._id},{refreshToken});
        

        const {password, updatedAt, ...other} = existEmail._doc;
        return res.status(200).json({
            ...other,
            accessToken,
            refreshToken,
        });
    }catch(err){
        console.log(err);
        return res.status(500).json({
            message:"Something went wrong. Please try again."
        })
    }
    
})
router.post('/refresh',validate(refreshTokenSchema),async (req,res)=>{

    try{
        try{
            const {userId, isAdmin} = jwt.verify(req.body.accessToken,SECRET_KEY,{
                ignoreExpiration: true
            })
            const user = await userModel.findById(userId);
            if(!user) return res.status(400).json({
                message:"User not found!"
            })
            if (user.refreshToken!==req.body.refreshToken){
                return res.status(400).json({
                    message:"Invalid refresh token!"
                })
            }
            const opts = {
                expiresIn: 60*60
            }
            
            const newAccessToken = jwt.sign({userId,isAdmin},SECRET_KEY,opts);
            res.status(200).json({
                accessToken: newAccessToken
            })
        }catch(err){
            console.log(err);
            return res.status(400).json({
                message:"Invalid access token!"
            })
        }
        
        
    }catch(err){
        console.log(err);
        return res.status(500).json({
            message:"Something went wrong. Please try again."
        })
    }
    
})
export default router;