# Vulnerabilities Documentation (Python/Flask)

## 1. SSRF (Server-Side Request Forgery)
**Location:** `/fetch-url` route (POST) in `app.py`

**Vulnerable code:**
The server fetches any URL provided by the user with no validation of the destination, allowing it to reach internal resources.

**How to exploit:**
1. Go to http://localhost:5000/fetch-url
2. Enter: `http://localhost:5000/`
3. Click Fetch
4. Result: The server fetches and returns content from its own internal address, proving it can be tricked into accessing resources not meant to be reachable via this feature

**Why it works:**
The `requests.get(url)` call trusts the user-supplied URL completely, with no allowlist or check against internal/private addresses (e.g., localhost, 127.0.0.1, or cloud metadata endpoints like 169.254.169.254).

-------------------------------------------------------

## 2. SSTI (Server-Side Template Injection)
**Location:** `/welcome` route (GET) in `app.py`

**Vulnerable code:**
User input is inserted directly into the template string before Jinja2 processes it, instead of being passed as safe template data.

**How to exploit:**
1. Go to http://localhost:5000/welcome?name={{7*7}}
2. Result: The page displays "Welcome, 49!" instead of the literal text "{{7*7}}", proving the input was executed as Jinja2 code, not rendered as plain text

**Why it works:**
`render_template_string(template)` processes the entire string as a Jinja2 template. Since user input was concatenated into that string before rendering, any Jinja2 syntax the user provides gets executed by the template engine, not just displayed.

**Note:** In a real-world scenario, an attacker would first test multiple template syntaxes to fingerprint the templating engine in use, before crafting an engine-specific payload. Here, Jinja2 syntax was used directly since the application's stack is known to be Flask.
---------------------------------------------------------------------

## 3. OS Command Injection
**Location:** `/ping` route (POST) in `app.py`

**Vulnerable code:**
User input is concatenated directly into a shell command string, and executed with `shell=True`, allowing special shell characters to inject additional commands.

**How to exploit:**
1. Go to http://localhost:5000/ping
2. Enter: `google.com & dir`
3. Click Ping
4. Result: The output shows both the ping result AND a directory listing, proving that a second, unintended command was executed

**Why it works:**
`subprocess.run(command, shell=True)` passes the entire string to the system shell for interpretation. The shell treats `&` as a command separator, so it executes the ping command and then the injected `dir` command sequentially. Since user input was never validated or separated from the command structure, any shell metacharacter can be used to inject arbitrary commands.
-------------------------------------------------

## 4. Information Disclosure
**Location:** `/calculate` route in `app.py`, and default Flask server headers

**Vulnerable code (Example 1 - Debug error pages):**
Flask is running with `debug=True`, and the `/calculate` route has no error handling around integer division.

**How to exploit (Example 1):**
1. Go to http://localhost:5000/calculate?number=0
2. Result: A full Flask debug page appears, showing the exact error type (ZeroDivisionError), the full file path on the server, the exact line number, the source code snippet, and an interactive debugging console

**Vulnerable code (Example 2 - HTTP header leakage):**
Flask's default development server exposes detailed version information in the `Server` HTTP response header.

**How to exploit (Example 2):**
1. Open any page (e.g. http://localhost:5000/) with browser DevTools open on the Network tab
2. Inspect the Response Headers of the request
3. Result: The `Server` header reveals the exact Werkzeug and Python versions in use (e.g. "Werkzeug/3.1.8 Python/3.14.7")

**Why it works:**
Debug mode is intended for development only, but leaving it enabled exposes internal application details and even remote code execution capability via the interactive console. Similarly, default server headers are not stripped or customized, letting any visitor fingerprint the exact software stack and search for known vulnerabilities matching those specific versions.