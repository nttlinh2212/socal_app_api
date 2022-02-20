import express from "express";
import userModel from "../models/user.js";
import auth from "../middlewares/auth.js";

const router = express.Router();

//user can follow 
router.patch('/follow', async(req,res)=>{//auth.auth,
    try {
        const followedUserId = req.body.followedUser;
        //console.log(req.userId===followedUserId)
        if(followedUserId===req.userId){
            return res.status(400).json({
                message:"You can't follow your account!"
            });
        }
        const followedUser = await userModel.findById(followedUserId);
        if(!followedUser){
            return res.status(404).json({
                message:"Not found user."
            })
        }
        const curUser = await userModel.findById(req.userId);
        if(!curUser.followings.includes(followedUserId)){
            await curUser.updateOne({$push:{followings:followedUserId}})
            await followedUser.updateOne({$push:{followers:req.userId}})
            return res.status(204).json();
        }
        return res.status(400).json({
            message:"You already follow this account!"
        });
    } catch (err) {
        console.log(err);
        return res.status(500).json({
            message:"Something went wrong. Please try again."
        })
    }
    

})
//user can follow 
router.patch('/unfollow', async(req,res)=>{//auth.auth,
    try {
        const otherUserId = req.body.otherUser;
        if(otherUserId===req.userId){
            return res.status(400).json({
                message:"You can't follow your account!"
            });
        }
        const otherUser = await userModel.findById(otherUserId);
        if(!otherUser){
            return res.status(404).json({
                message:"Not found user."
            })
        }
        const curUser = await userModel.findById(req.userId);
        if(curUser.followings.includes(otherUserId)){
            await curUser.updateOne({$pull:{followings:otherUserId}})
            await otherUser.updateOne({$pull:{followers:req.userId}})
            return res.status(204).json();
        }
        return res.status(400).json({
            message:"You already follow this account!"
        });
    } catch (err) {
        console.log(err);
        return res.status(500).json({
            message:"Something went wrong. Please try again."
        })
    }
    

})
router.patch('/', async(req,res)=>{//auth.auth,
    try {
        await userModel.updateOne({_id:req.userId},req.body);
        return res.status(204).json();
    } catch (err) {
        console.log(err);
        return res.status(500).json({
            message:"Something went wrong. Please try again."
        })
    }
    

})
router.delete('/:id', async(req,res)=>{
    try {
        const id = req.params.id;
        if(!req.isAdmin){
            return res.status(403).json({
                message:"You don't have permission to do this action!"
            })
        }
        await userModel.deleteOne({_id:id});
        return res.status(204).json();
    } catch (err) {
        console.log(err);
        return res.status(500).json({
            message:"Something went wrong. Please try again."
        })
    }
    

})
router.get('/find', async(req,res)=>{
    try {
        
        const user = await userModel.findOne(req.query);
        if(!user){
            return res.status(404).json({
                message:"Not found user!"
            });
        }
        const {password, updatedAt, ...other} = user._doc;
        return res.status(200).json(other);
    } catch (err) {
        console.log(err);
        return res.status(500).json({
            message:"Something went wrong. Please try again."
        })
    }
    

})
router.get('/:id/friends', async(req,res)=>{
    try {
        
        const user = await userModel.findById(req.params.id);
        if(!user){
            return res.status(404).json({
                message:"Not found user!"
            });
        }
        const friends = await Promise.all(user.followings.map((f =>{
            return userModel.findById(f).select({
                username:1,
                profilePicture:1
            })
        })));

        
        return res.status(200).json(friends);
    } catch (err) {
        console.log(err);
        return res.status(500).json({
            message:"Something went wrong. Please try again."
        })
    }
    

})
router.get('/:id', async(req,res)=>{
    try {
        
        const user = await userModel.findById(req.params.id);
        const {password, updatedAt, ...other} = user._doc;
        return res.status(200).json(other);
    } catch (err) {
        console.log(err);
        return res.status(500).json({
            message:"Something went wrong. Please try again."
        })
    }
    

})

export default router;