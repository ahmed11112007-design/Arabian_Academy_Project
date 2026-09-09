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

--------------------------------------------------------

## 3. CSRF (Cross-Site Request Forgery)
**Location:** `/change-email` route (POST) in `index.js`

**Vulnerable code:**
The email-change endpoint only checks for the presence of a login cookie, with no CSRF token verification. The cookie itself was configured with `sameSite: 'none'`, disabling the browser's built-in CSRF protection.

**How to exploit:**
1. Log in normally at http://localhost:3000/login
2. Without logging out, open `csrf_attack.html` in the same browser
3. The hidden form auto-submits a POST request to `/change-email`
4. Result: The victim's email is changed to `hacker@evil.com` without their knowledge or consent

**Why it works:**
Browsers automatically attach cookies to requests sent to a domain, regardless of which site initiated the request. Without a CSRF token tied to the user's session, the server cannot distinguish a legitimate request (from our own form) from a forged one (from an attacker's page).