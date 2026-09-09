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