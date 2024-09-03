import express from 'express';
import sqlite3 from 'sqlite3';
import path from 'node:path';

const app = express();
const db = new sqlite3.Database(path.join(process.cwd(), 'tt.db'));

app.use(express.json());

// テーブル作成のクエリ
const createTableQuery = `
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT,
    email TEXT,
    password TEXT
  )
`;

// テーブルの作成
db.run(createTableQuery, function(err) {
  if (err) {
    console.error(err.message);
  } else {
    console.log('テーブルが作成されました');
  }
});

// ユーザー登録のエンドポイント
app.post('/api/register', (req, res) => {
  const { name, email, password } = req.body;
  const insertUserQuery = `
    INSERT INTO users (name, email, password)
    VALUES (?, ?, ?)
  `;

  db.run(insertUserQuery, [name, email, password], function(err) {
    if (err) {
      res.status(500).json({ error: err.message });
    } else {
      res.status(201).json({ message: 'ユーザーが登録されました' });
    }
  });
});

// ログイン認証のエンドポイント
app.post('/api/login', (req, res) => {
  const { name, password } = req.body;
  const getUserQuery = 'SELECT * FROM users WHERE name = ? AND password = ?';

  db.get(getUserQuery, [name, password], (err, row) => {
    if (err) {
      res.status(500).json({ error: err.message });
    } else if (row) {
      res.status(200).json({ message: '認証成功' });
    } else {
      res.status(401).json({ error: '認証失敗' });
    }
  });
});

// サーバー起動
app.listen(3000, () => {
  console.log('Server is running on port 3000');
});
