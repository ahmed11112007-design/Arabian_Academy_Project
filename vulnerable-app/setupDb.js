const Database = require('better-sqlite3');
const db = new Database('database.db');

// جدول المستخدمين
db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT NOT NULL,
    password TEXT NOT NULL
  )
`);

// جدول التعليقات - جديد
db.exec(`
  CREATE TABLE IF NOT EXISTS comments (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    content TEXT NOT NULL
  )
`);

// امسح أي بيانات قديمة
db.exec('DELETE FROM users');
db.exec('DELETE FROM comments');

// أضف مستخدم تجريبي واحد
db.prepare('INSERT INTO users (username, password) VALUES (?, ?)').run('admin', 'password123');

console.log('Database created and seeded successfully!');
db.close();