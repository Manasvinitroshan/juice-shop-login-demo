# Juice Shop-style Login Form

A minimal login page modeled on OWASP Juice Shop's login screen, built for a web-security
homework assignment. It demonstrates **client-side and server-side validation**, **bcrypt
password hashing**, and basic **XSS / SQL-injection defenses**.

## What it does

- Serves a single login page (`public/index.html`) with email + password fields.
- **Client-side validation** (in the browser): blocks empty submissions, checks the email
  contains `@`, and requires a password of at least 8 characters. This is for fast feedback only.
- **Server-side validation** (`server.js`): re-checks the same rules on every request, because
  a client check can be bypassed with curl, Postman, or the browser dev tools.
- **Passwords are never stored in plaintext.** The seeded demo user's password is hashed with
  bcrypt (cost factor 12) at startup, and login compares against the hash with `bcrypt.compare`.
- **XSS defense:** any value echoed back to the browser is HTML-escaped on the server, and the
  front end renders server messages with `textContent`, never `innerHTML`.
- **SQL-injection note:** the code uses an in-memory lookup that compares input as *data*, not
  as SQL. `server.js` documents the parameterized-query pattern that prevents injection in a
  real database.

## Requirements

- Node.js 18 or newer

## How to run

```bash
# 1. Install dependencies
npm install

# 2. Start the server
npm start

# 3. Open the app
#    http://localhost:3000
```

You'll see a startup log with a seeded demo account:

```
Seeded demo user: admin@juice-shop.local / CorrectHorse9!
```

Log in with those credentials to see a success message; anything else returns
"Invalid email or password."

## Project structure

```
juice-shop-login-demo/
├── package.json        # dependencies + start script
├── server.js           # Express server, validation, bcrypt, escaping
└── public/
    └── index.html      # login form + client-side validation
```

## Security notes

This is a teaching demo, not production code. A real deployment would also add: HTTPS,
rate limiting / account lockout, CSRF protection, secure session cookies, and a Content
Security Policy header.

## License

MIT
# juice-shop-login-demo
# juice-shop-login-demo
# juice-shop-login-demo
