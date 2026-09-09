const Database = require('better-sqlite3');
const db = new Database('database.db');

db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT NOT NULL,
    password TEXT NOT NULL,
    email TEXT
  )
`);

db.exec(`
  CREATE TABLE IF NOT EXISTS comments (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    content TEXT NOT NULL
  )
`);

db.exec('DELETE FROM users');
db.exec('DELETE FROM comments');

db.prepare('INSERT INTO users (username, password, email) VALUES (?, ?, ?)').run('admin', 'password123', 'admin@example.com');

console.log('Database created and seeded successfully!');
db.close();