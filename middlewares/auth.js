import jwt from "jsonwebtoken";
import dotenv from "dotenv"

dotenv.config();
const SECRET_KEY = process.env.SECRET_KEY;

export default{
    auth(req,res,next){
        const accessToken = req.headers['x-access-token'];
        if(!accessToken) return  res.status(401).json({
            message:"Access token not found!"
        })
        try{
            const decoded = jwt.verify(accessToken,SECRET_KEY);
            req.userId = decoded.userId;
            req.isAdmin = decoded.isAdmin;
            next();
        }catch(err){
            console.log(err);
            return res.status(401).json({
                message:"Invalid access token!"
            })
        }
        

    }
}