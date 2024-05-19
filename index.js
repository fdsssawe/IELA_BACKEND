import express from 'express'
import cors from 'cors'
import  mongo, { version } from 'mongoose';
import dotenv from "dotenv"
import cookieParser from 'cookie-parser';
import { router } from './router/index.js';
import { errorMiddleware } from './middlewares/errorMiddleware.js'
import bodyParser from 'body-parser';

dotenv.config()

mongo.connect(process.env.MONGO_URL,
    {
        useNewUrlParser: true,
        useUnifiedTopology : true,
    }).then(()=>{
    console.log("db ok");
}).catch((err)=>console.log(err))

mongo.set('strictQuery', true);

const app = express();


app.use(cors({
    credentials : true,
    origin : ["https://iela.vercel.app/","https://iela.vercel.app", "http://localhost:5173"]
}))

app.use(cookieParser())
app.use(errorMiddleware);
app.use(express.json({ limit: '50mb' }));
app.use('/api',router)

app.use(bodyParser.json())
app.use(bodyParser.urlencoded({extended: true}))


app.listen(process.env.PORT, (err) => {
    if (err){
        return console.log(err);
    }
    console.log(`Server is working correctly on port ${process.env.PORT}`);
})

export default app;