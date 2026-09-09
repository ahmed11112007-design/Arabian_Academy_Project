# Vulnerabilities Documentation

This document lists all seven vulnerability categories implemented in the vulnerable version of this project, organized by technology stack.

## Summary Table

| # | Vulnerability | Stack | Location |
|---|---|---|---|
| 1 | SQL Injection | Node.js | `/login` (POST) |
| 2 | XSS | Node.js | `/comments` |
| 3 | CSRF | Node.js | `/change-email` (POST) |
| 4 | SSRF | Python | `/fetch-url` (POST) |
| 5 | SSTI | Python | `/welcome` |
| 6 | OS Command Injection | Python | `/ping` (POST) |
| 7 | Information Disclosure | Python | `/calculate` + HTTP headers |

---

## Node.js Application (port 3000)

### 1. SQL Injection
**Location:** `/login` route (POST) in `vulnerable-app/index.js`

**Vulnerable code:**
User input is concatenated directly into the SQL query string instead of using parameterized queries.

**How to exploit:**
1. Go to http://localhost:3000/login
2. Username: `admin' --`
3. Password: anything
4. Result: Logs in as admin without knowing the real password

**Why it works:**
The `--` sequence comments out the rest of the SQL query, removing the password check entirely.

---

### 2. XSS (Cross-Site Scripting)
**Location:** `/comments` route (GET & POST) in `vulnerable-app/index.js`

**Vulnerable code:**
User comment content is inserted directly into the HTML response without any sanitization or encoding.

**How to exploit:**
1. Go to http://localhost:3000/comments
2. In the comment box, enter: `<script>alert('XSS Attack!')</script>`
3. Click Post Comment
4. Result: The script executes in the browser, showing an alert popup

**Why it works:**
The browser cannot distinguish between plain text and executable code when raw HTML is inserted. Since the comment is stored in the database, every visitor who views the page will also trigger the script (Stored XSS).

---

### 3. CSRF (Cross-Site Request Forgery)
**Location:** `/change-email` route (POST) in `vulnerable-app/index.js`

**Vulnerable code:**
The email-change endpoint only checks for the presence of a login cookie, with no CSRF token verification. The cookie itself was configured with `sameSite: 'none'`, disabling the browser's built-in CSRF protection.

**How to exploit:**
1. Log in normally at http://localhost:3000/login
2. Without logging out, open `csrf_attack.html` in the same browser
3. The hidden form auto-submits a POST request to `/change-email`
4. Result: The victim's email is changed to `hacker@evil.com` without their knowledge or consent

**Why it works:**
Browsers automatically attach cookies to requests sent to a domain, regardless of which site initiated the request. Without a CSRF token tied to the user's session, the server cannot distinguish a legitimate request from a forged one.

---

## Python/Flask Application (port 5000)

### 4. SSRF (Server-Side Request Forgery)
**Location:** `/fetch-url` route (POST) in `vulnerable-app-python/app.py`

**Vulnerable code:**
The server fetches any URL provided by the user with no validation of the destination, allowing it to reach internal resources.

**How to exploit:**
1. Go to http://localhost:5000/fetch-url
2. Enter: `http://localhost:5000/`
3. Click Fetch
4. Result: The server fetches and returns content from its own internal address

**Why it works:**
The `requests.get(url)` call trusts the user-supplied URL completely, with no allowlist or check against internal/private addresses (e.g., localhost, 127.0.0.1, or cloud metadata endpoints like 169.254.169.254).

---

### 5. SSTI (Server-Side Template Injection)
**Location:** `/welcome` route (GET) in `vulnerable-app-python/app.py`

**Vulnerable code:**
User input is inserted directly into the template string before Jinja2 processes it, instead of being passed as safe template data.

**How to exploit:**
1. Go to http://localhost:5000/welcome?name={{7*7}}
2. Result: The page displays "Welcome, 49!" instead of the literal text "{{7*7}}", proving the input was executed as Jinja2 code

**Why it works:**
`render_template_string(template)` processes the entire string as a Jinja2 template. Since user input was concatenated into that string before rendering, any Jinja2 syntax provided gets executed by the template engine.

**Note:** In a real-world scenario, an attacker would first fingerprint the templating engine in use before crafting an engine-specific payload. Here, Jinja2 syntax was used directly since the application's stack is known to be Flask.

---

### 6. OS Command Injection
**Location:** `/ping` route (POST) in `vulnerable-app-python/app.py`

**Vulnerable code:**
User input is concatenated directly into a shell command string, and executed with `shell=True`, allowing special shell characters to inject additional commands.

**How to exploit:**
1. Go to http://localhost:5000/ping
2. Enter: `google.com & dir`
3. Click Ping
4. Result: The output shows both the ping result AND a directory listing, proving a second, unintended command was executed

**Why it works:**
`subprocess.run(command, shell=True)` passes the entire string to the system shell for interpretation. The shell treats `&` as a command separator, executing both commands sequentially.

---

### 7. Information Disclosure
**Location:** `/calculate` route in `vulnerable-app-python/app.py`, and default Flask server headers

**Vulnerable code (Example 1 - Debug error pages):**
Flask is running with `debug=True`, and the `/calculate` route has no error handling around integer division.

**How to exploit (Example 1):**
1. Go to http://localhost:5000/calculate?number=0
2. Result: A full Flask debug page appears, showing the exact error type, the full file path, the exact line number, source code, and an interactive debugging console

**Vulnerable code (Example 2 - HTTP header leakage):**
Flask's default development server exposes detailed version information in the `Server` HTTP response header.

**How to exploit (Example 2):**
1. Open any page with browser DevTools open on the Network tab
2. Inspect the Response Headers of the request
3. Result: The `Server` header reveals the exact Werkzeug and Python versions in use

**Why it works:**
Debug mode is intended for development only, but leaving it enabled exposes internal application details and even remote code execution capability via the interactive console. Default server headers let any visitor fingerprint the exact software stack.