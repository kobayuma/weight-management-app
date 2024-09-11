import sqlite3 from 'sqlite3';
import path from 'node:path';

const db = new sqlite3.Database(path.join(process.cwd(), 'test.db'));

db.run("CREATE TABLE IF NOT EXISTS users (id integer PRIMARY KEY, name text UNIQUE)");
db.run("CREATE TABLE IF NOT EXISTS passwords (id integer PRIMARY KEY, password text, user_id integer)");
db.run("CREATE TABLE IF NOT EXISTS weights (id integer PRIMARY KEY, weights float, user_id integer, date text)");
db.run("CREATE TABLE IF NOT EXISTS menu (id integer PRIMARY KEY, date text, user_id integer, type integer)");
db.run("CREATE TABLE IF NOT EXISTS meal_contents (id integer PRIMARY KEY, menu_id integer, type integer)");

export default db;