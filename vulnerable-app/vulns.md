# Vulnerabilities Documentation

## 1. SQL Injection
**Location:** `/login` route (POST) in `index.js`

**Vulnerable code:**
User input is concatenated directly into the SQL query string instead of using parameterized queries.

**How to exploit:**
1. Go to http://localhost:3000/login
2. Username: `admin' --`
3. Password: anything
4. Result: Logs in as admin without knowing the real password

**Why it works:**
The `--` sequence comments out the rest of the SQL query, removing the password check entirely.

----------------------------------------------------------

## 2. XSS (Cross-Site Scripting)
**Location:** `/comments` route (GET & POST) in `index.js`

**Vulnerable code:**
User comment content is inserted directly into the HTML response without any sanitization or encoding.

**How to exploit:**
1. Go to http://localhost:3000/comments
2. In the comment box, enter: `<script>alert('XSS Attack!')</script>`
3. Click Post Comment
4. Result: The script executes in the browser, showing an alert popup

**Why it works:**
The browser cannot distinguish between plain text and executable code when raw HTML is inserted. Since the comment is stored in the database, every visitor who views the page will also trigger the script (Stored XSS).
