import sqlite3 from 'sqlite3';
import path from 'node:path';
import OpenAI from "openai";
import { config } from 'dotenv';
config();

const db = new sqlite3.Database(path.join(process.cwd(), 'test.db'));

db.run("CREATE TABLE IF NOT EXISTS users (id integer PRIMARY KEY, name text UNIQUE)");
db.run("CREATE TABLE IF NOT EXISTS passwords (id integer PRIMARY KEY, password text, user_id integer)");
db.run("CREATE TABLE IF NOT EXISTS weights (id integer PRIMARY KEY, weights float, user_id integer, date text)");
db.run("CREATE TABLE IF NOT EXISTS menu (id integer PRIMARY KEY, date text, user_id integer, type integer)");
db.run("CREATE TABLE IF NOT EXISTS meal_contents (id integer PRIMARY KEY, menu_id integer, type integer)");

const openai = new OpenAI({
  apiKey: process.env.VITE_OPENAI_API_KEY,
});

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

  // クライアント側から送られてきたプロンプトを受け取って、出力をクライアント側に送信する
  socket.on("promptEvent", async (data) => {
    try {
      const completion = await openai.chat.completions.create({
        messages: [{ role: 'user', content: data.prompt }],
        model: 'gpt-3.5-turbo',
      });
      const gptResponse = completion.choices[0].message.content;

      socket.emit("promptResponse", { response: gptResponse });
    } catch (error) {
      console.error('Failed to fetch from OpenAI:', error);
      socket.emit("promptResponse", { response: 'Error fetching from OpenAI' });
    }
  });

  // ユーザー名とパスワードがDBに含まれているかを比較する
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

  // 新規登録されたユーザー名とパスワードをDBにinsertする
  socket.on("userRegistration", ({registerUsername, registerPassword}, callback) => {
    
    db.serialize(() => {
      db.run('BEGIN TRANSACTION');
  
      // ユーザー名の重複チェック
      db.get('SELECT COUNT(*) as count FROM users WHERE name = ?', [registerUsername], (err, row) => {
        if (err) {
          console.error('Error checking user name:', err.message);
          db.run('ROLLBACK');
          callback({ success:false, message: "そのユーザー名は使用できません。"});
          return;
        }
        
        if (row.count > 0) {
          console.error('User name already exists.');
          db.run('ROLLBACK');
          callback({ success:false, message: "このユーザー名は既に存在します。別の名前を入力してください。"});
          return;
        }
  
        // ユーザー名をusersテーブルに挿入
        db.run('INSERT INTO users(name) VALUES (?)', [registerUsername], function(err){
          if (err) {
            console.error('Error inserting user name:', err.message);
            db.run('ROLLBACK');
            callback({ succsess: false, message: "登録に失敗しました。エラー内容：Error inserting user name"});
            return;
          }
          // 挿入されたユーザーのIDを取得
          const userId = this.lastID;
          // passwordとuser_idをpasswordsテーブルに挿入
          db.run('INSERT INTO passwords(password, user_id) VALUES (?, ?)', [registerPassword, userId], function(err) {
            if (err) {
              console.error('Error inserting password:', err.message);
              db.run('ROLLBACK');
              callback({success: false, message: "登録に失敗しました。エラー内容：Error inserting password"});
              return;
            }
  
            // トランザクションをコミット
            db.run('COMMIT', (err) => {
              if (err) {
                console.error('Error committing transaction:', err.message);
                callback({success: false, message: "登録に失敗しました。エラー内容：Error committing transaction"})
                return;
              }
              console.log('User registration successful');
              callback({success: true, message: "登録が完了しました！"})
            });
          });
        });
      });
    });
  });  
}

