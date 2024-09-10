import db from '../db.js'; 
import { handlePromptEvent } from './gpt.js';
import { handleLoginEvent, handleUserRegistration } from './auth.js'
import { config } from 'dotenv';
config();

export default (io, socket) => {
  // 入室メッセージをクライアントに送信する
  socket.on("enterEvent", (data) => {
    socket.broadcast.emit("enterEvent", data)
  })

  // 退室メッセージをクライアントに送信する
  socket.on("exitEvent", (data) => {
    socket.broadcast.emit("exitEvent", data)
  })

  // 投稿メッセージを送信する
  socket.on("publishEvent", (data) => {
    io.sockets.emit("publishEvent", data)
  })

  // GPTへのプロンプトを受信する  
  socket.on("promptEvent", handlePromptEvent);

  // ユーザー名とパスワードがDBに含まれているかを比較する
  socket.on("loginEvent", (data, callback) => {
    handleLoginEvent(data, callback);
  });

  // 新規登録されたユーザー名とパスワードをDBにinsertする
  socket.on("userRegistration", (data, callback) => {
    handleUserRegistration(data, callback);
  });
}

