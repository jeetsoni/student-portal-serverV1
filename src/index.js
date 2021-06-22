const cors = require('cors');
const express = require('express');
const connectDB = require('./db/mongoose');
const colors = require('colors');
const errorHandler = require('./middleware/error');
var cookieParser = require('cookie-parser');
const morgan = require('morgan');
const path = require('path');
const dotenv = require('dotenv');
const app = express();

// //Socket.io
// var http = require('http').Server(app);
// const io = require('socket.io')(http);

dotenv.config({ path: './config/dev.env' });

//Body parser
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

const port = process.env.PORT;

//Cokie parser
app.use(cookieParser());

//Dev logging middleware
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

const userRouter = require('./routers/user.js');
const postRouter = require('./routers/post');

//Connect to database
connectDB();

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb' }));
app.use(cors());
app.use(express.json());
app.use('/users', userRouter);
app.use('/post', postRouter);

app.use(errorHandler);

const PORT = process.env.PORT || 3000;

const server = app.listen(PORT, () => {
  console.log('Server is up on port ' + PORT);
});

const io = require('socket.io').listen(server);
io.on('connection', (socket) => {
  console.log('new connection made.');

  socket.on('join', function (data) {
    //joining
    socket.join(data.room);

    console.log(data.user + 'joined the room : ' + data.room);

    socket.broadcast.to(data.room).emit('new user joined', {
      user: data.user,
      message: 'has joined this room.',
    });

    io.to(socket.id).emit('joined successfully', {
      user: data.user,
      message: 'You Joined Successfully',
    });
  });

  socket.on('leave', function (data) {
    console.log(data.user + 'left the room : ' + data.room);

    socket.broadcast
      .to(data.room)
      .emit('left room', { user: data.user, message: 'has left this room.' });
    io.to(socket.id).emit('leave successfully', {
      user: data.user,
      message: 'You leave Successfully',
    });
    socket.leave(data.room);
  });

  socket.on('message', function (data) {
    io.in(data.room).emit('new message', {
      user: data.user,
      message: data.message,
    });
  });
});
