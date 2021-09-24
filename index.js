const express = require("express");
const app = express();
const dotenv = require('dotenv');
dotenv.config();
const cors = require('cors')
const mongoose = require('mongoose');
const Live = require('./models/live');
const jwt_decode = require('jwt-decode');
const { createServer } = require("http");
const { Server } = require("socket.io");
const httpServer = createServer(app);
const io = new Server(httpServer, {
  path: "/go-live/",
  cors: {
    origin: "https://socket-client-one.vercel.app",
    methods: ["GET", "POST"]
  },
});

app.use(cors())

app.get('/getlivedoctors', async (req, res) => {
  Live.find({}, (err, docs) => {
    if (err) {
      return res.status(404).json(err);
    }
    const total = docs.length
    return res.status(200).json({ total, docs });
  })
});


io.on("connection", (socket) => {
  socket.on("connect", () => {
    socket.sendBuffer = [];
  });
  
  // console.log("user connected!");
  
  const decoded = jwt_decode(socket.handshake.query.AuthData)
  // console.log(decoded);
  Live.create({
    auth: decoded.sub,
    role: decoded.role,
    docid: decoded.docid,
    specialization: decoded.specialization,
    charge: decoded.charge,
    rating: decoded.rating,
    name: decoded.name,
  }, (err, docs) => {
    if (err) {
      console.log('Live create error: ' + err);
    } else {
      console.log("Doctor is Live");
    }
  });


  socket.on('disconnect', () => {
    //console.log('user disconnected');
    Live.findOneAndDelete(decoded.sub, (err, docs) => { 
      if (err) {
        console.log('Live delete error: ' + err);
      } else {
        console.log("Doctor is Offline")
      }
    })
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
})
