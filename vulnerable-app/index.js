const express = require('express');
const cookieParser = require('cookie-parser');
const Database = require('better-sqlite3');
const db = new Database('database.db');

const app = express();
const PORT = 3000;

app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(express.static('public'));

// صفحة تسجيل الدخول
app.get('/login', (req, res) => {
    res.send(`
    <link rel="stylesheet" href="/style.css">
    <h2>Login</h2>
    <form method="POST" action="/login">
      <input type="text" name="username" placeholder="Username"><br>
      <input type="password" name="password" placeholder="Password"><br>
      <button type="submit">Login</button>
    </form>
  `);
});

// معالجة تسجيل الدخول
app.post('/login', (req, res) => {
    const { username, password } = req.body;
    const query = `SELECT * FROM users WHERE username = '${username}' AND password = '${password}'`;
    const user = db.prepare(query).get();

    if (user) {
        // بنحط كوكيز بسيطة فيها اسم المستخدم، عشان "نتذكر" إنه داخل
        res.cookie('loggedInUser', user.username, { sameSite: 'none', secure: true });
        res.send(`Welcome, ${user.username}! <a href="/account">Go to Account Settings</a>`);
    } else {
        res.send('Invalid username or password.');
    }
});

// صفحة إعدادات الحساب - عرض البريد الحالي وفورم تغييره
app.get('/account', (req, res) => {
    const username = req.cookies.loggedInUser;
    if (!username) {
        return res.send('You must log in first. <a href="/login">Login</a>');
    }

    const user = db.prepare('SELECT * FROM users WHERE username = ?').get(username);

    res.send(`
    <link rel="stylesheet" href="/style.css">
    <h2>Account Settings</h2>
    <p>Current email: ${user.email}</p>
    <form method="POST" action="/change-email">
      <input type="email" name="newEmail" placeholder="New email"><br>
      <button type="submit">Change Email</button>
    </form>
  `);
});

// تغيير البريد الإلكتروني - هنا الثغرة!
app.post('/change-email', (req, res) => {
    const username = req.cookies.loggedInUser;
    if (!username) {
        return res.send('You must log in first.');
    }

    const { newEmail } = req.body;
    // خطر: مفيش أي تحقق إن الطلب ده جاي فعليًا من صفحة موقعنا
    db.prepare('UPDATE users SET email = ? WHERE username = ?').run(newEmail, username);

    res.send(`Email changed to: ${newEmail}`);
});

// صفحة التعليقات
app.get('/comments', (req, res) => {
    const comments = db.prepare('SELECT * FROM comments').all();
    const commentsHtml = comments.map(c => `<p>${c.content}</p>`).join('');

    res.send(`
    <link rel="stylesheet" href="/style.css">
    <h2>Comments</h2>
    <form method="POST" action="/comments">
      <textarea name="content" placeholder="Write a comment..."></textarea><br>
      <button type="submit">Post Comment</button>
    </form>
    <hr>
    ${commentsHtml}
  `);
});

app.post('/comments', (req, res) => {
    const { content } = req.body;
    db.prepare('INSERT INTO comments (content) VALUES (?)').run(content);
    res.redirect('/comments');
});

app.get('/', (req, res) => {
    res.send(`
    <link rel="stylesheet" href="/style.css">
    <h2>Vulnerable App - Node.js</h2>
    <div class="vuln-grid">
      <a href="/login" class="vuln-card">SQL Injection</a>
      <a href="/comments" class="vuln-card">XSS</a>
      <a href="/account" class="vuln-card">CSRF</a>
    </div>
  `);
});

app.listen(PORT, () => {
    console.log(`Vulnerable app running at http://localhost:${PORT}`);
});