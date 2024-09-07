import sqlite3 from 'sqlite3';
import path from 'node:path';
import OpenAI from "openai";
import { config } from 'dotenv';
config();

const db = new sqlite3.Database(path.join(process.cwd(), 'test.db'));

db.each("CREATE TABLE IF NOT EXISTS users (id integer PRIMARY KEY, name text UNIQUE)");
db.each("CREATE TABLE IF NOT EXISTS passwords (id integer PRIMARY KEY, password text, user_id integer)");
db.each("CREATE TABLE IF NOT EXISTS weights (id integer PRIMARY KEY, weights float, user_id integer, date text)");
db.each("CREATE TABLE IF NOT EXISTS menu (id integer PRIMARY KEY, date text, user_id integer, type integer)");
db.each("CREATE TABLE IF NOT EXISTS meal_contents (id integer PRIMARY KEY, menu_id integer, type integer)");

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
}