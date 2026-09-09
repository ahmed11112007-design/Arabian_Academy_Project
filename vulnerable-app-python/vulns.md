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