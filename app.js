const http=require('http');
const express=require('express');
const app=express();
const fs = require('fs');
const cors=require('cors');
const path=require('path')
const bodyParser=require('body-parser');
const server=http.createServer(app);
const {Server}=require('socket.io');
const { exec } = require('child_process');
require('dotenv').config()
app.use(bodyParser.json());
app.use(cors());
const io=new Server(server);
const PORT=process.env.PORT ||8000;
io.on('connection',(socket)=>{
    console.log(socket.id)
    socket.on('runCode',(data)=>{
        const {code,sendLanguage}=data;
        const fileName=`main.${sendLanguage}`;
        const filePath=path.join(__dirname,fileName)
        fs.writeFileSync(filePath,code);
        try{
            var childProccess;
            if(sendLanguage==="cpp"){
                childProccess=exec(`g++ ${fileName} -o main && ./main`,(error,stdout,stderr)=>{
                    if(error){
                        socket.emit('output',stderr);
                    }
                })
            }else if(sendLanguage==="c"){
                childProccess=exec(`gcc ${fileName} -o main && ./main`,(error,stdout,stderr)=>{
                    if(error){
                        socket.emit('output',stderr);
                    }
                })
            }else if(sendLanguage==="java"){
                childProccess=exec(`javac ${fileName} && java main`,(error,stdout,stderr)=>{
                    if(error){
                        socket.emit("output",stderr);
                    }
                 })
            }else if(sendLanguage==="py"){
                childProccess=exec(`python3 ${fileName}`,(error,stdout,stderr)=>{
                    if(error){
                        socket.emit('output',stderr);
                    }
                })
            }else if(sendLanguage==="dart"){
                childProccess=exec(`dart ${fileName}`,(error,stdout,stderr)=>{
                    if(error){
                        socket.emit('output',stderr);
                    }
                })
            }else if(sendLanguage==="js"){
                childProccess=exec(`node ${fileName}`,(error,stdout,stderr)=>{
                    if(error){
                        socket.emit('output',stderr);
                    }
                })
            }
        childProccess.stdout.on('data',(data)=>{
            socket.emit("output",data);
        })
        socket.on('inputValue',(input)=>{
            childProccess.stdin.write(input+'\n');
        })
        childProccess.on('close',(code)=>{
            socket.emit('output',`${"\n"}Existed code With ${code}`);
            childProccess.stdin.end();
            fs.unlinkSync(fileName,()=>{});
        })
    }catch(e){
        socket.emit('output',e);
    }
    })
    socket.on("disconnect",()=>{
        console.log("disconnected");
    })
})
server.listen(PORT,()=>console.log(`server started at port ${PORT}`));