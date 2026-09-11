# 🛡️ Web Application Security Project

![Node.js](https://img.shields.io/badge/Node.js-Express-339933?logo=node.js&logoColor=white)
![Python](https://img.shields.io/badge/Python-Flask-3776AB?logo=python&logoColor=white)
![SQLite](https://img.shields.io/badge/Database-SQLite-07405E?logo=sqlite&logoColor=white)
![Status](https://img.shields.io/badge/Status-Educational-orange)
![License](https://img.shields.io/badge/Use-Local%20Only-red)

> ⚠️ **This is a Proof of Concept (PoC) built strictly for learning.** Every vulnerability here is real and exploitable in a controlled, local environment — not a production system. Each attack demonstrates the core mechanism of the vulnerability rather than a full real-world exploitation chain, and is then properly fixed, so you can see exactly what changed and why it matters.

🔗 **Repository:** [github.com/ahmed11112007-design/Arabian_Academy_Project](https://github.com/ahmed11112007-design/Arabian_Academy_Project)

This project demonstrates **seven categories of web vulnerabilities** across two technology stacks (Node.js/Express and Python/Flask), each implemented in a genuinely exploitable way, then remediated with industry-standard fixes.

---

## 📑 Table of Contents

- [Vulnerability Coverage](#-vulnerability-coverage)
- [Tech Stack](#-tech-stack)
- [Project Structure](#-project-structure)
- [Quick Start](#-quick-start)
- [Full Setup Instructions](#-full-setup-instructions)
- [Test Credentials](#-test-credentials)
- [Documentation](#-documentation)
- [What This Project Demonstrates](#-what-this-project-demonstrates)
- [Notes](#-notes)

---

## 🎯 Vulnerability Coverage

| # | Vulnerability | Stack | Vulnerable | Secured |
|---|---|---|:---:|:---:|
| 1 | SQL Injection | Node.js | 🔴 | 🟢 |
| 2 | XSS | Node.js | 🔴 | 🟢 |
| 3 | CSRF | Node.js | 🔴 | 🟢 |
| 4 | SSRF | Python | 🔴 | 🟢 |
| 5 | SSTI | Python | 🔴 | 🟢 |
| 6 | OS Command Injection | Python | 🔴 | 🟢 |
| 7 | Information Disclosure | Python | 🔴 | 🟢 |

---

## 🛠️ Tech Stack

**Backend:** Node.js (Express) · Python (Flask)
**Database:** SQLite
**Frontend:** Vanilla HTML/CSS
**Version Control:** Git + GitHub

---

## 📂 Project Structure
Arabian_Academy_Project/
├── vulnerable-app/ 🔴 Node.js — SQLi, XSS, CSRF (port 3000)
├── vulnerable-app-python/ 🔴 Flask — SSRF, SSTI, OS Cmd, Info (port 5000)
├── secured-app/ 🟢 Node.js — all three fixed (port 4000)
├── secured-app-python/ 🟢 Flask — all four fixed (port 5001)
├── VULNERABILITIES.md 📖 Full exploit documentation + Q&A
├── SECURITY_FIXES.md 📖 Full fix documentation + Q&A
├── csrf_attack.html 💣 CSRF PoC → targets vulnerable-app
└── csrf_attack_secured.html 🛡️ CSRF PoC → fails against secured-app

---

## ⚡ Quick Start

```bash
git clone https://github.com/ahmed11112007-design/Arabian_Academy_Project.git
cd Arabian_Academy_Project
```

Then run any of the four apps below — each is fully independent.

---

## 🔧 Full Setup Instructions

<details>
<summary><strong>🔴 Vulnerable Node.js App (port 3000)</strong></summary>

```bash
cd vulnerable-app
npm install
node setupDb.js
node index.js
```
Visit: **http://localhost:3000**

</details>

<details>
<summary><strong>🔴 Vulnerable Python App (port 5000)</strong></summary>

```bash
cd vulnerable-app-python
python -m venv venv
venv\Scripts\Activate.ps1
pip install flask requests
python app.py
```
Visit: **http://localhost:5000**

</details>

<details>
<summary><strong>🟢 Secured Node.js App (port 4000)</strong></summary>

```bash
cd secured-app
npm install
node setupDb.js
node index.js
```
Visit: **http://localhost:4000**

</details>

<details>
<summary><strong>🟢 Secured Python App (port 5001)</strong></summary>

```bash
cd secured-app-python
python -m venv venv
venv\Scripts\Activate.ps1
pip install flask requests
python app.py
```
Visit: **http://localhost:5001**

</details>

---

## 🔑 Test Credentials

All four applications share the same seeded test account:
Username: admin
Password: password123

---

## 📖 Documentation

| File | Contents |
|---|---|
| [`VULNERABILITIES.md`](./VULNERABILITIES.md) | Vulnerable code, exploitation steps, and Q&A for each of the 7 vulnerabilities |
| [`SECURITY_FIXES.md`](./SECURITY_FIXES.md) | Before/after code, explanation of why each fix works, and Q&A |

---

## 🎓 What This Project Demonstrates

- Real-world exploitation techniques for 7 OWASP-style vulnerabilities, demonstrated as PoCs in a local environment
- Root-cause understanding of *why* each vulnerability exists, not just that it exists
- Industry-standard mitigation techniques (parameterized queries, output encoding, allowlisting, safe template rendering, and more)
- Side-by-side comparison methodology: vulnerable vs. secured implementations for direct, practical comparison

---

## 📝 Notes

- All applications run **locally only** (`localhost`) and are intended strictly for **educational purposes** as Proof of Concept demonstrations.
- All test data (usernames, passwords, emails) is entirely **fictional**.
- Commit history reflects incremental, real development — one vulnerability (or fix) at a time.