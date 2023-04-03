import express from 'express'
import morgan from 'morgan'
import {Server as SocketServer} from 'socket.io'
import http from 'http'
import cors from 'cors'
import mongoose from 'mongoose'
import router from './routes/message.js'
import bodyParser from 'body-parser'

const PORT = 4000;
//Mongoose configuration 
var url = 'mongodb+srv://pabelH:pabel12@cluster0.rg5lsii.mongodb.net/?retryWrites=true&w=majority'
//avoid connection failures with mongoDB
mongoose.Promise = global.Promise;

const app = express()
//server with node's http module
const server = http.createServer(app)
//use the server provided by socket.io as a server. Configure cors indicating that any server can connect
const io = new SocketServer(server, {
    cors: {
        origin: '*'
    }
})

app.use(cors())

//see the requests by console using the morgan package in dev mode
app.use(morgan('dev'))

//load the bodyParser: middleware to parse bodies from via URL
//this parser accepts only the UTF-8 encoding contained in the body
app.use(bodyParser.urlencoded({ extended: false }));

//convert any type of request to json:
app.use(bodyParser.json());

//listen to the customer connection. We can print the id of the connected client
io.on('connection', (socket) =>{
    //console.log('user connected')
    //console.log(socket.id)

    socket.on('message', (message, nickname) => {
        console.log(message)
        //Send to other clients with broadcast.emit
        socket.broadcast.emit('message', {
            body: message,
            from: nickname
        })
    })
})

//route files
app.use('/api', router);


//connect to mongoDB. Option { useNewUrlParser: true } to use the latest mongoDB features
mongoose.connect(url, { useNewUrlParser: true }).then(() =>{
    console.log('Conexión con la BDD realizada con éxito!!!');
    server.listen(PORT, () =>{
		console.log('servidor ejecutándose en http://localhost:', PORT );
	});
})