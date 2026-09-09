const express = require('express');
const Database = require('better-sqlite3');
const db = new Database('database.db');

const app = express();
const PORT = 3000;

app.use(express.urlencoded({ extended: true }));

// صفحة تسجيل الدخول (نموذج HTML بسيط)
app.get('/login', (req, res) => {
    res.send(`
    <h2>Login</h2>
    <form method="POST" action="/login">
      <input type="text" name="username" placeholder="Username"><br>
      <input type="password" name="password" placeholder="Password"><br>
      <button type="submit">Login</button>
    </form>
  `);
});

// معالجة تسجيل الدخول - هنا الثغرة!
app.post('/login', (req, res) => {
    const { username, password } = req.body;

    // خطر: بنلزّق كلام المستخدم مباشرة جوا جملة SQL
    const query = `SELECT * FROM users WHERE username = '${username}' AND password = '${password}'`;
    console.log('Running query:', query);

    const user = db.prepare(query).get();

    if (user) {
        res.send(`Welcome, ${user.username}! Login successful.`);
    } else {
        res.send('Invalid username or password.');
    }
});

app.get('/', (req, res) => {
    res.send('Hello from the Vulnerable App! Go to /login to try logging in.');
});

app.listen(PORT, () => {
    console.log(`Vulnerable app running at http://localhost:${PORT}`);
});