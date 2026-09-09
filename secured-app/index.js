const express = require('express');
const cookieParser = require('cookie-parser');
const Database = require('better-sqlite3');
const Tokens = require('csrf');
const tokens = new Tokens();
const csrfSecret = tokens.secretSync();
const db = new Database('database.db');

const app = express();
const PORT = 4000;

app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

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


app.get('/', (req, res) => {
    res.send('Secured App - Node.js. Try /login');
});
app.post('/login', (req, res) => {
    const { username, password } = req.body;
    const user = db.prepare('SELECT * FROM users WHERE username = ? AND password = ?').get(username, password);

    if (user) {
        res.cookie('loggedInUser', user.username, { sameSite: 'strict' }); //*** 
        res.send(`Welcome, ${user.username}! <a href="/account">Go to Account Settings</a>`);
    } else {
        res.send('Invalid username or password.');
    }
});

app.get('/account', (req, res) => {
    const username = req.cookies.loggedInUser;
    if (!username) {
        return res.send('You must log in first. <a href="/login">Login</a>');
    }

    const user = db.prepare('SELECT * FROM users WHERE username = ?').get(username);
    const csrfToken = tokens.create(csrfSecret);

    res.send(`
    <h2>Account Settings</h2>
    <p>Current email: ${user.email}</p>
    <form method="POST" action="/change-email">
      <input type="hidden" name="_csrf" value="${csrfToken}">
      <input type="email" name="newEmail" placeholder="New email"><br>
      <button type="submit">Change Email</button>
    </form>
  `);
});

app.post('/change-email', (req, res) => {
    const username = req.cookies.loggedInUser;
    if (!username) {
        return res.send('You must log in first.');
    }

    const { newEmail, _csrf } = req.body;

    if (!tokens.verify(csrfSecret, _csrf)) {
        return res.status(403).send('Invalid or missing CSRF token. Request rejected.');
    }

    db.prepare('UPDATE users SET email = ? WHERE username = ?').run(newEmail, username);
    res.send(`Email changed to: ${newEmail}`);
});

app.listen(PORT, () => {
    console.log(`Secured app running at http://localhost:${PORT}`);
});

app.get('/comments', (req, res) => {
    const comments = db.prepare('SELECT * FROM comments').all();

    const escapeHtml = (text) => {
        return text
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#039;');
    };//*** 

    const commentsHtml = comments.map(c => `<p>${escapeHtml(c.content)}</p>`).join('');

    res.send(`
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