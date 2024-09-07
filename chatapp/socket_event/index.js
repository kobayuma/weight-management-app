import sqlite3 from 'sqlite3';
import path from 'node:path';

const db = new sqlite3.Database(path.join(process.cwd(), 'test.db'));

db.each("CREATE TABLE IF NOT EXISTS users (id integer PRIMARY KEY, name text UNIQUE)");
db.each("CREATE TABLE IF NOT EXISTS passwords (id integer PRIMARY KEY, password text, user_id integer)");
db.each("CREATE TABLE IF NOT EXISTS weights (id integer PRIMARY KEY, weights float, user_id integer, date text)");
db.each("CREATE TABLE IF NOT EXISTS menu (id integer PRIMARY KEY, date text, user_id integer, type integer)");
db.each("CREATE TABLE IF NOT EXISTS meal_contents (id integer PRIMARY KEY, menu_id integer, type integer)");

// db.each('insert into users(name) values("bbb");', (err, row) => {
//   console.log(err);
//   console.log(row);
// });

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

  socket.on("loginEvent", ({ username, password }, callback) => {
    db.get("SELECT * FROM users JOIN passwords ON users.id = passwords.user_id WHERE users.name = ? AND passwords.password = ?", [username, password], (err, row) => {
      if (err) {
        callback({ success: false, message: "データベースエラー" });
      } else if (row) {
        callback({ success: true, message: "ログイン成功", userId: row.id });
      } else {
        callback({ success: false, message: "ユーザー名またはパスワードが間違っています" });
      }
    });
  });  
}

