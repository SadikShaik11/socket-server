const express = require("express");
const app = express();
const dotenv = require('dotenv');
dotenv.config();
const mongoose = require('mongoose');
const jwt_decode = require('jwt-decode');
const { createServer } = require("http");
const { Server } = require("socket.io");
const httpServer = createServer(app);
const io = new Server(httpServer, { 
  cors: {
    origin: "http://localhost:3000",
    methods: ["GET", "POST"]
  },
});

io.on("connection", (socket) => {
  console.log("doctor connected!");
  const decoded = jwt_decode(socket.handshake.query.AuthData);
  console.log(decoded);

  //const transport = socket.conn.transport.name; // in most cases, "polling"
  //console.log(transport)
  socket.conn.on("upgrade", () => {
    //const upgradedTransport = socket.conn.transport.name; // in most cases, "websocket"
    //console.log(upgradedTransport)
  });

});

httpServer.listen(process.env.PORT, () => {
  console.log("Server is running on PORT: ", process.env.PORT);
});

//connection to database
mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
})

const db = mongoose.connection

db.on('error', console.error.bind(console, "Error Connecting to MongoDB: "));

db.once('open', () => {
  console.log("Connected to MongoDB")
  
  const messageCollection = db.collection('live-doctors');
  const changeStream = messageCollection.watch();
    
  changeStream.on('change', (change) => {
      console.log("Change Stream: " + change.operationType);
      
      if(change.operationType === 'insert') {
          const doctor = change.fullDocument;
          console.log("insert")
          //socketio triggers give update to frontend

      } else if(change.operationType === 'delete') {
          const doctor = change.fullDocument;
          console.log("insert")
          //socketio triggers give update to backend
      }
  })
})