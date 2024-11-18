// console.log('Hello from node application');

import bodyParser from "body-parser";
import cors from "cors";
import express from "express";
import server from "./routes/server.js";
const app=express();
const port=3000;

const myLogger=function(req,res,next){
    console.log('Calling Api');
    next()
    console.log('Database has been successfully called');
}

app.use(myLogger);
app.use(bodyParser.json());
app.use(cors({
    origin:"*"
}))
app.use('/app', server);

app.listen(port,()=>{
    console.log(`Server is running at port ${port}`);
});

export default app;