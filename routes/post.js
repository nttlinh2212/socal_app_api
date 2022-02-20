import express from "express";
import postModel from "../models/post.js";
import {readFile} from 'fs/promises';
import validate from "../middlewares/validate.js";
import userModel from "../models/user.js";
import auth from "../middlewares/auth.js";
import multer from "multer";

const router = express.Router();

const postSchema = JSON.parse(await readFile(new URL("../validate-schemas/post.json",import.meta.url))) ;

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, 'public/assets/post')
    },
    filename: function (req, file, cb) {
        
        cb(null, file.originalname)
    }
})
  
const upload = multer({ storage: storage })

router.post('/', validate(postSchema), async(req,res)=>{
    try{
        req.body.userId = req.userId;
        const newPost = new postModel(req.body);
        const ret = await newPost.save();
        return res.status(201).json(ret);
    }catch(err){
        console.log(err);
        return res.status(500).json({
            message:"Something went wrong. Please try again."
        })
    }
    

});

router.post('/upload', upload.single('img'), function (req, res, next) {
    res.status(201).json({
        message:"Upload file successfully."
    })
  })
router.patch('/:id', async(req,res)=>{
    try{
        const id = req.params.id;
        const post = await postModel.findById(id);
        if(!post){
            return res.status(400).json({
                message:"Invalid post id"
            })
        }
        if(post.userId !== req.userId){
            return res.status(403).json({
                message:"You can not update other user's post!"
            })
        }
        await post.updateOne({$set:req.body})
        return res.status(204).json();
    }catch(err){
        console.log(err);
        return res.status(500).json({
            message:"Something went wrong. Please try again."
        })
    }
    

})
router.get('/timeline',async(req,res)=>{//auth.auth ,
    try{
        const myPosts = await postModel.find({userId:req.userId});
        const me = await userModel.findById(req.userId);
        const friendPosts = await Promise.all(me.followings.map(id=>
            postModel.find({userId:id})
        ))
        return res.status(200).json(myPosts.concat(...friendPosts));
    }catch(err){
        console.log(err);
        return res.status(500).json({
            message:"Something went wrong. Please try again."
        })
    }
    

})
router.get('/all/:username', async(req,res)=>{
    try{
        const username = req.params.username;
        const user = await userModel.findOne({username});
        if(!user)
            return res.status(400).json({
                message:"Invalid username!"
            })
        const posts = await postModel.find({userId:user._id});
        console.log(posts)
        return res.status(200).json(posts);
    }catch(err){
        console.log(err);
        return res.status(500).json({
            message:"Something went wrong. Please try again."
        })
    }
    

})
router.get('/:id', async(req,res)=>{
    try{
        const id = req.params.id;
        const post = await postModel.findById(id);
        if(!post){
            return res.status(404).json({
                message:"Not found post"
            })
        }
        return res.status(200).json(post);
    }catch(err){
        console.log(err);
        return res.status(500).json({
            message:"Something went wrong. Please try again."
        })
    }
    

})
router.post('/:id/like', async(req,res)=>{
    try{
        const id = req.params.id;
        const post = await postModel.findById(id);
        if(!post){
            return res.status(400).json({
                message:"Not found post"
            })
        }
        if(!post.likes.includes(req.userId)){
            await post.updateOne({$push:{
                likes:req.userId
            }})
            return res.status(200).json({
                message: "The post has been liked!"
            });
        }
        await post.updateOne({$pull:{
            likes:req.userId
        }})
        return res.status(200).json({
            message: "The post has been unliked!"
        });
    }catch(err){
        console.log(err);
        return res.status(500).json({
            message:"Something went wrong. Please try again."
        })
    }
    

});



export default router;