import db from '../db.js'; 

export const handleLoginEvent = (data, callback) => {
  const { username, password } = data;
  db.get("SELECT * FROM users JOIN passwords ON users.id = passwords.user_id WHERE users.name = ? AND passwords.password = ?", [username, password], (err, row) => {
    if (err) {
      callback({ success: false, message: "データベースエラー" });
    } else if (row) {
      callback({ success: true, message: "ログイン成功", userId: row.id });
    } else {
      callback({ success: false, message: "ユーザー名またはパスワードが間違っています" });
    }
  });
};

export const handleUserRegistration = (data, callback) => {
  const { registerUsername, registerPassword } = data;
  
  db.serialize(() => {
    db.run('BEGIN TRANSACTION');

    // ユーザー名の重複チェック
    db.get('SELECT COUNT(*) as count FROM users WHERE name = ?', [registerUsername], (err, row) => {
      if (err) {
        console.error('Error checking user name:', err.message);
        db.run('ROLLBACK');
        callback({ success: false, message: "そのユーザー名は使用できません。" });
        return;
      }

      if (row.count > 0) {
        console.error('User name already exists.');
        db.run('ROLLBACK');
        callback({ success: false, message: "このユーザー名は既に存在します。別の名前を入力してください。" });
        return;
      }

      // ユーザー名をusersテーブルに挿入
      db.run('INSERT INTO users(name) VALUES (?)', [registerUsername], function(err) {
        if (err) {
          console.error('Error inserting user name:', err.message);
          db.run('ROLLBACK');
          callback({ success: false, message: "登録に失敗しました。エラー内容：Error inserting user name" });
          return;
        }
        // 挿入されたユーザーのIDを取得
        const userId = this.lastID;
        // passwordとuser_idをpasswordsテーブルに挿入
        db.run('INSERT INTO passwords(password, user_id) VALUES (?, ?)', [registerPassword, userId], function(err) {
          if (err) {
            console.error('Error inserting password:', err.message);
            db.run('ROLLBACK');
            callback({ success: false, message: "登録に失敗しました。エラー内容：Error inserting password" });
            return;
          }

          // トランザクションをコミット
          db.run('COMMIT', (err) => {
            if (err) {
              console.error('Error committing transaction:', err.message);
              callback({ success: false, message: "登録に失敗しました。エラー内容：Error committing transaction" });
              return;
            }
            console.log('User registration successful');
            callback({ success: true, message: "登録が完了しました！" });
          });
        });
      });
    });
  });
};
