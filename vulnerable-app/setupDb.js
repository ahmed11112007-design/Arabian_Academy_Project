const Database = require('better-sqlite3');
const db = new Database('database.db');

db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT NOT NULL,
    password TEXT NOT NULL
  )
`);


db.exec('DELETE FROM users');

db.prepare('INSERT INTO users (username, password) VALUES (?, ?)').run('admin', 'password123');

console.log('Database created and seeded successfully!');
db.close();