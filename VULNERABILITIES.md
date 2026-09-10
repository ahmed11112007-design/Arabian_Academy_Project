# Vulnerability Documentation

This document provides a detailed analysis of all seven vulnerability categories implemented in the vulnerable version of this project. Each section covers the vulnerability's location, the flawed code, exploitation steps, and a Q&A section addressing common questions.

## Overview Table

| # | Vulnerability | Stack | Endpoint |
|---|---|---|---|
| 1 | SQL Injection | Node.js | `POST /login` |
| 2 | Cross-Site Scripting (XSS) | Node.js | `GET/POST /comments` |
| 3 | Cross-Site Request Forgery (CSRF) | Node.js | `POST /change-email` |
| 4 | Server-Side Request Forgery (SSRF) | Python/Flask | `POST /fetch-url` |
| 5 | Server-Side Template Injection (SSTI) | Python/Flask | `GET /welcome` |
| 6 | OS Command Injection | Python/Flask | `POST /ping` |
| 7 | Information Disclosure | Python/Flask | `GET /calculate` + HTTP headers |

---

# Part 1: Node.js Application (port 3000)

## 1. SQL Injection

**File:** `vulnerable-app/index.js`
**Endpoint:** `POST /login`

### Description
The login form checks a username and password against the database. Instead of treating user input as pure data, the application builds the SQL query by directly inserting the raw input into the query string.

### Vulnerable Code
```javascript
const query = `SELECT * FROM users WHERE username = '${username}' AND password = '${password}'`;
const user = db.prepare(query).get();
```

### Exploitation Steps
1. Navigate to `http://localhost:3000/login`
2. Enter Username: `admin' --`
3. Enter any value for Password
4. Click Login
5. Result: logged in as `admin` without knowing the real password

### Root Cause
The `--` sequence is interpreted by SQL as the start of a comment, so everything after it (including the password check) is ignored by the database engine.

### Q&A

**Q: Why does adding `--` make the query succeed?**
A: In SQL, `--` marks the rest of the line as a comment. The final query becomes `SELECT * FROM users WHERE username = 'admin'`, with no password condition at all.

**Q: Could this be used for more than bypassing login?**
A: Yes. Depending on the database and privileges, SQL Injection can be used to read entire tables, modify or delete data, or in some configurations even execute operating system commands.

**Q: Is this a realistic scenario, or only a classroom example?**
A: Extremely realistic. SQL Injection has consistently ranked among the OWASP Top 10 vulnerabilities for over a decade and has caused real-world breaches affecting millions of user records.

---

## 2. Cross-Site Scripting (XSS)

**File:** `vulnerable-app/index.js`
**Endpoint:** `GET/POST /comments`

### Description
User-submitted comments are stored in the database and later displayed to every visitor. The application inserts the raw comment content into the HTML response without any encoding.

### Vulnerable Code
```javascript
const commentsHtml = comments.map(c => `<p>${c.content}</p>`).join('');
```

### Exploitation Steps
1. Navigate to `http://localhost:3000/comments`
2. Enter the comment: `<script>alert('XSS Attack!')</script>`
3. Click Post Comment
4. Result: a JavaScript alert box appears, confirming the script executed

### Root Cause
Browsers cannot distinguish text intended for display from text intended to be executed as code. When raw HTML/JavaScript is embedded in the page, the browser parses and runs it.

### Q&A

**Q: Why is this called "Stored" XSS specifically?**
A: Because the malicious script is saved in the database (not just reflected in a single response), meaning every visitor who loads the comments page afterward will also trigger the script.

**Q: What could an attacker actually achieve with this beyond a popup?**
A: In a real attack, the script could steal session cookies, redirect users to phishing pages, or silently perform actions on the victim's behalf using their authenticated session.

**Q: Does this only affect the specific browser of the attacker?**
A: No — since the payload is stored server-side, it affects every user who views the page, regardless of which browser or device they use.

---

## 3. Cross-Site Request Forgery (CSRF)

**File:** `vulnerable-app/index.js`
**Endpoint:** `POST /change-email`

### Description
The email-change feature only checks whether a login cookie is present, without verifying that the request actually originated from the application's own interface.

### Vulnerable Code
```javascript
res.cookie('loggedInUser', user.username, { sameSite: 'none', secure: true });
// /change-email has no CSRF token check
```

### Exploitation Steps
1. Log in normally at `http://localhost:3000/login`
2. Without logging out, open `csrf_attack.html` (a page simulating an attacker's site) in the same browser
3. The hidden form on that page automatically submits a POST request to `/change-email`
4. Result: the victim's email is changed to `hacker@evil.com` without their knowledge or action

### Root Cause
Browsers automatically attach cookies to any request sent to a given domain, regardless of which website initiated that request. With `sameSite: 'none'`, this cross-site cookie transmission is explicitly allowed.

### Q&A

**Q: Why does the browser send the cookie even though the request came from another website?**
A: By default (and explicitly here via `sameSite: 'none'`), cookies are attached to any request targeting their domain, independent of the page that triggered the request.

**Q: Isn't logging in required to prevent this?**
A: Being logged in is actually what enables the attack — the attacker relies on the victim already having an active, authenticated session.

**Q: What real-world actions could be forged besides changing an email?**
A: Any state-changing action exposed without CSRF protection — transferring funds, changing passwords, submitting orders, or deleting data — could potentially be forged this way.

---

# Part 2: Python/Flask Application (port 5000)

## 4. Server-Side Request Forgery (SSRF)

**File:** `vulnerable-app-python/app.py`
**Endpoint:** `POST /fetch-url`

### Description
A "URL preview" feature allows the server to fetch and display the content of any URL supplied by the user, with no restriction on the destination.

### Vulnerable Code
```python
url = request.form['url']
response = requests.get(url, timeout=5)
```

### Exploitation Steps
1. Navigate to `http://localhost:5000/fetch-url`
2. Enter: `http://localhost:5000/`
3. Click Fetch
4. Result: the server returns content from its own internal address, proving it can be directed to reach resources not meant to be publicly accessible via this feature

### Root Cause
The server trusts the user-supplied URL completely, using it directly in an outbound request without validating the destination host.

### Q&A

**Q: Why is it dangerous for a server to fetch its own internal pages?**
A: In this demo it is low-risk, but in real cloud environments, servers often have access to internal-only endpoints (like cloud metadata services) that expose sensitive credentials — SSRF can be used to reach those.

**Q: Why not just block "localhost" specifically?**
A: Blocking specific strings is fragile — attackers can use alternate representations (like `127.0.0.1`, `0.0.0.0`, or DNS rebinding techniques) to bypass a simple denylist. This is why the fix uses an allowlist instead.

**Q: Is SSRF only a problem for URL-preview features?**
A: No — SSRF can occur in any feature that makes server-side requests based on user input, such as webhooks, PDF generators, or image-fetching tools.

---

## 5. Server-Side Template Injection (SSTI)

**File:** `vulnerable-app-python/app.py`
**Endpoint:** `GET /welcome`

### Description
A "welcome" page builds a Jinja2 template string by directly embedding user input, then renders that string as a template.

### Vulnerable Code
```python
template = f'<h2>Welcome, {name}!</h2>'
return render_template_string(template)
```

### Exploitation Steps
1. Navigate to `http://localhost:5000/welcome?name={{7*7}}`
2. Result: the page displays "Welcome, 49!" instead of the literal text "{{7*7}}", proving the input was executed as Jinja2 code rather than displayed as plain text

### Root Cause
`render_template_string()` parses its entire input as a template. Since user input became part of that string before parsing, any Jinja2 syntax within it is interpreted and executed.

### Q&A

**Q: How does this escalate beyond a simple math calculation?**
A: Jinja2's expression syntax can access Python objects and, through known technique chains, reach functions capable of executing arbitrary code on the server — making SSTI potentially as severe as remote code execution.

**Q: Why did you use Jinja2 syntax specifically to test this?**
A: Because the application's technology stack (Flask) was already known to use Jinja2 by default. In a real penetration test, an attacker would first try multiple template syntaxes to fingerprint which engine is in use before crafting a targeted payload.

**Q: Is SSTI the same as XSS?**
A: No. XSS executes in the victim's browser (client-side), while SSTI executes on the server itself — making SSTI generally more severe.

---

## 6. OS Command Injection

**File:** `vulnerable-app-python/app.py`
**Endpoint:** `POST /ping`

### Description
A "server health check" tool builds a shell command string using user input and executes it via the system shell.

### Vulnerable Code
```python
command = f'ping -n 1 {host}'
result = subprocess.run(command, shell=True, capture_output=True, text=True)
```

### Exploitation Steps
1. Navigate to `http://localhost:5000/ping`
2. Enter: `google.com & dir`
3. Click Ping
4. Result: the output shows both the ping result and a directory listing, proving a second, unintended command was executed

### Root Cause
`shell=True` causes the operating system's shell to interpret the entire string, including special characters like `&`, which chains multiple commands together.

### Q&A

**Q: What makes OS Command Injection more dangerous than SQL Injection?**
A: While SQL Injection is limited to database operations, OS Command Injection grants direct access to the underlying operating system — potentially allowing file manipulation, malware installation, or full server takeover.

**Q: Why does `&` specifically cause a second command to run?**
A: On Windows, `&` is a command separator recognized by the shell (`cmd.exe`), instructing it to run the command before `&` and then the command after it, regardless of the first command's success.

**Q: Would this vulnerability exist without `shell=True`?**
A: No — that flag is precisely what allows the input to be interpreted by the shell. Without it, arguments are passed literally to the target program, which is the basis of the fix.

---

## 7. Information Disclosure

**File:** `vulnerable-app-python/app.py`
**Location:** `GET /calculate` (debug error pages) and default Flask response headers

### Description
This category is demonstrated through two related but distinct issues: verbose debug error pages, and default server headers revealing software versions.

### Vulnerable Code (Example 1 — Debug Error Pages)
```python
result = 100 / int(number)
return f'Result: {result}'
# app.run(port=5000, debug=True)
```

### Exploitation Steps (Example 1)
1. Navigate to `http://localhost:5000/calculate?number=0`
2. Result: Flask's full debug page appears, showing the exact exception type, the complete file path on the server, the exact line number, a source code snippet, and an interactive debugging console

### Exploitation Steps (Example 2 — HTTP Headers)
1. Open any page with browser DevTools open on the Network tab
2. Inspect the Response Headers of the request
3. Result: the `Server` header reveals the exact Werkzeug and Python versions in use

### Root Cause
Debug mode is a development convenience that should never be enabled in a real deployment. Default server headers are also left unmodified, exposing exact software versions.

### Q&A

**Q: Why is the debug console more dangerous than just an error message?**
A: Flask's debug mode includes an interactive Python console directly in the error page, which — if left enabled in production — could allow an attacker to execute arbitrary Python code on the server.

**Q: Why would knowing the exact software version matter to an attacker?**
A: Publicly known vulnerabilities (CVEs) are often tied to specific software versions. Knowing the precise version lets an attacker search for and apply a matching known exploit directly.

**Q: Isn't this a "minor" vulnerability compared to the others?**
A: On its own, it does not directly grant access — but it significantly assists an attacker in planning further attacks, which is why it is classified as its own vulnerability category rather than dismissed as harmless.