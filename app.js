import express from 'express'
import dotenv from 'dotenv'
import mongoose from 'mongoose'
import morgan from 'morgan'

import cors from 'cors'
import authRouter from './routes/auth.js'
import userRouter from './routes/user.js'
import postRouter from './routes/post.js'
import auth from './middlewares/auth.js'
import path, {dirname} from 'path'
import { fileURLToPath } from 'url';

dotenv.config();
const app = express();
const PORT = process.env.PORT;
const PORT_FE = process.env.PORT_FE;

app.use(express.json());
app.use(morgan('dev'))
app.use(cors({
    origin:[
        `http://localhost:${PORT_FE}`,
        `http://localhost:3001`
    ],
    //cross-origin-resource-policy: same-origin
    methods: 'GET,PATCH,PUT,POST,DELETE'
}))

// app.get('/', (req,res,next)=>{
//     res.send("Hello to my api!");
//     //throw new Error("custom error!")
// })
const __dirname = dirname(fileURLToPath(import.meta.url));
app.use('/images', express.static(path.join(__dirname,"public/assets")))
app.use('/api/auth/', authRouter);
app.use('/api/users/',auth.auth, userRouter);
app.use('/api/posts/', auth.auth, postRouter);
app.use((req,res,next)=>{
    res.status(404).json({
        message:"Endpoint not found!"
    });
})
app.use((err,req,res,next)=>{
    console.log(err.stack)
    res.status(500).json({
        message:"Something went wrong. Please try again."
    });
})


try{
    await mongoose.connect(process.env.DB_URL,{
        autoIndex: false, // Don't build indexes
        maxPoolSize: 50, // Maintain up to 10 socket connections
        serverSelectionTimeoutMS: 5000, // Keep trying to send operations for 5 seconds
        socketTimeoutMS: 45000, // Close sockets after 45 seconds of inactivity
        family: 4, // Use IPv4, skip trying IPv6
    })
    console.log("Connected to Mongodb!")
}catch(err){
    console.log("Fail to connect to Mongodb!")
}

app.listen(PORT,()=>{
    console.log(`API server is running at http://localhost:${PORT}`)
})