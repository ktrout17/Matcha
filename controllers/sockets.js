const User = require('../models/User');
const Like = require('../models/Likes');
const Chat = require('../models/Chats');

module.exports = function(io, connectedUsers) {
  io.on("connection", socket => {
    let user = {};

    socket.on("send_message", data => {
      let msg = data.message;
      let msgTime = data.time;
      let to = data.to;
      let from = data.from;
      let chatId = data.chatId;

      if (msg != '' && chatId != '') {
        let newChat = new Chat({
          to: to,
          from: from,
          message: msg,
          msgTime: msgTime,
          chatId: chatId
        })
        newChat.save();
        io.sockets.emit('recieve_message', {to: to, from: from, msg: msg, msgTime: msgTime, chatId: chatId})
      } else {
       console.log('No message or chatId') 
      }
    });

    socket.on('login', (data) => {
      User.findOne({$or: [{username: data.email}, {email: data.email}]}, (err, doc) => {
        if (err) throw err;
        if (doc) {
          let verif = 0;
          user.user = doc.username;
          user.socketId = socket.id;
          for (const i in connectedUsers) {
            if (connectedUsers[i].user == doc.username) {
              connectedUsers[i].socketId = user.socketId
              verif = 1;
            }
          };
          if (verif == 0){
            connectedUsers.push(user);
          }
        }
      }).catch(err => {console.log(err)})
    });

    socket.on('like', (data) => {
      
      // io.to(connectedUsers[0].socketId).emit('notification', {user: connectedUsers[0].user})
      // io.to(connectedUsers[1].socketId).emit('notification', {user: connectedUsers[1].user})
      // io.to(data.id).emit('notification', {id: data.id})

      // console.log(connectedUsers[0].socketId)
      // console.log(connectedUsers[1].socketId)
      // console.log(data.id)

      Like.findOne({user_username: data.likedUser, liked_username: data.currUser}, (err, likeDoc) => {
        if (err) throw err;

        User.findOne({username: data.likedUser}, (err, doc) => {
          if (err) throw err;

          if (likeDoc) {
            let isBlocked = 0;
  
            if (typeof doc.blocked !== "undefined") {
            if (Array.isArray(doc.blocked)) {
            for (let i in doc.blocked) {
              const blockedUser = doc.blocked[i];
              if (blockedUser === data.currUser) {
                isBlocked = 1;
              }
            }
          }
        } else {
          if (doc.blocked === data.currUser) {
            isBlocked = 1;
          }
        }
            if (isBlocked == 0)
              io.sockets.emit('notification', {user: data.currUser, msg: "You have a new match with", match: 2})
          } else {
            let isBlocked = 0;
  
            if (doc) {
            if (typeof doc.blocked !== "undefined") {
            if (Array.isArray(doc.blocked)) {
            for (let i in doc.blocked) {
              const blockedUser = doc.blocked[i];
              if (blockedUser === data.currUser) {
                isBlocked = 1;
              }
            }
          }
        } else {
          if (doc.blocked === data.currUser){
            isBlocked = 1;
          }
        }
        }
            if (isBlocked == 0)
              io.sockets.emit('notification', {user: data.currUser, msg: "Liked your profile", match: 1})
          }
        })
      })

      // for (var i in connectedUsers) {
      //   if (connectedUsers[i].user === data.likedUser) {
      //     io.sockets.emit('notification', {user: data.likedUser, msg: "Liked your profile!"})
      //   }
      // }
    });

    socket.on('block', (data) => {
      console.log("blocking");
      console.log(data);
        io.sockets.emit('notification', {user: data.currUser, msg: "Blocked / unliked you", match: 1})
    })

    socket.on('view', (data) => {
      console.log("viewing")
      console.log(data);
    })
  });
};