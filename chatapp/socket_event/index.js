import sqlite3 from 'sqlite3';
import path from 'node:path';

const db = new sqlite3.Database(path.join(process.cwd(), 'test.db'));

db.run("CREATE TABLE IF NOT EXISTS users (id integer PRIMARY KEY, name text UNIQUE)");
db.run("CREATE TABLE IF NOT EXISTS passwords (id integer PRIMARY KEY, password text, user_id integer)");
db.run("CREATE TABLE IF NOT EXISTS weights (id integer PRIMARY KEY, weights float, user_id integer, date text)");
db.run("CREATE TABLE IF NOT EXISTS menu (id integer PRIMARY KEY, date text, user_id integer, type integer)");
db.run("CREATE TABLE IF NOT EXISTS meal_contents (id integer PRIMARY KEY, menu_id integer, type integer)");

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
  socket.on("userRegistration", (data) => {
    const { name, password } = data;
    
    db.serialize(() => {
      db.run('BEGIN TRANSACTION');
  
      // ユーザー名の重複チェック
      db.get('SELECT COUNT(*) as count FROM users WHERE name = ?', [name], (err, row) => {
        if (err) {
          console.error('Error checking user name:', err.message);
          db.run('ROLLBACK');
          socket.emit("registrationFailure", { message: 'Error checking user name' })
          return;
        }
        
        if (row.count > 0) {
          console.error('User name already exists.');
          db.run('ROLLBACK');
          socket.emit("userNameAlreadyExit");
          return;
        }
  
        // ユーザー名をusersテーブルに挿入
        db.run('INSERT INTO users(name) VALUES (?)', [name], function(err){
          if (err) {
            console.error('Error inserting user name:', err.message);
            db.run('ROLLBACK');
            socket.emit("registrationFailure", { message: 'Error inserting user name' });
            return;
          }
          // 挿入されたユーザーのIDを取得
          const userId = this.lastID;
          // passwordとuser_idをpasswordsテーブルに挿入
          db.run('INSERT INTO passwords(password, user_id) VALUES (?, ?)', [password, userId], function(err) {
            if (err) {
              console.error('Error inserting password:', err.message);
              db.run('ROLLBACK');
              socket.emit("registrationFailure", { message: 'Error inserting password' });
              return;
            }
  
            // トランザクションをコミット
            db.run('COMMIT', (err) => {
              if (err) {
                console.error('Error committing transaction:', err.message);
                socket.emit("registrationFailure", { message: 'Error committing transaction' });
                return;
              }
              console.log('User registration successful');
              socket.emit("registrationSucesss")
            });
          });
        });
      });
    });
  });  

  socket.on("WeightRegisterEvent", (data) => {
    const { username, weight, date } = data;
  
    // First, retrieve the userId based on the username
    db.get('SELECT id FROM users WHERE name = ?', [username], (err, row) => {
      if (err) {
        console.error('Error fetching userId:', err.message);
        socket.emit("weightRegisterFailure", { message: 'Error fetching userId' });
      } else if (row) {
        const userId = row.id;
        
        // Insert the weight entry into the weights table
        db.run('INSERT INTO weights (weights, user_id, date) VALUES (?, ?, ?)', [weight, userId, date], function(err) {
          if (err) {
            console.error('Error inserting weight:', err.message);
            socket.emit("weightRegisterFailure", { message: 'Error inserting weight' });
          } else {
            console.log('Weight registered successfully');
            socket.emit("weightRegisterSuccess", { message: 'Weight registered successfully' });
          }
        });
      } else {
        // If the username does not exist in the database
        socket.emit("weightRegisterFailure", { message: 'User not found' });
      }
    });
  });
  
  //体重推移グラフ
  socket.on("getWeightHistory", (username, callback) => {
    // First, retrieve the userId based on the username
    db.get('SELECT id FROM users WHERE name = ?', [username], (err, row) => {
      if (err) {
        console.error('Error fetching userId:', err.message);
        callback({ success: false, message: 'Error fetching userId' });
      } else if (row) {
        const userId = row.id;
        
        // Fetch the user's weight history from the weights table, ordered by date
        db.all('SELECT weights, date FROM weights WHERE user_id = ? ORDER BY date', [userId], (err, rows) => {
          if (err) {
            console.error('Error fetching weight history:', err.message);
            callback({ success: false, message: 'Error fetching weight history' });
          } else {
            console.log('Fetched weight data:', rows);  // Log fetched data
            callback({ success: true, data: rows });
          }
        });
      } else {
        callback({ success: false, message: 'User not found' });
      }
    });
  });
}

