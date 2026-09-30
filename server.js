const express = require('express');
const bcrypt = require('bcryptjs');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.urlencoded({ extended: false }));
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// --- Fake user store (stands in for a database table) ---
// In a real app these rows live in a DB and you read them with a
// PARAMETERIZED query, never by concatenating strings into SQL.
const users = [];

// Seed one user. The password is stored ONLY as a bcrypt hash.
(async () => {
  const passwordHash = await bcrypt.hash('CorrectHorse9!', 12); // cost factor 12
  users.push({ id: 1, email: 'admin@juice-shop.local', passwordHash });
  console.log('Seeded demo user: admin@juice-shop.local / CorrectHorse9!');
})();

// Escape any value we echo back so it renders as text, not markup (XSS defense).
function escapeHtml(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

// Server-side validation — the client checks are for UX; THIS is the real gate.
function validate(email, password) {
  const errors = [];
  if (typeof email !== 'string' || typeof password !== 'string') {
    errors.push('Malformed request.');
    return errors;
  }
  if (!email.trim() || !password) errors.push('Email and password are required.');
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) errors.push('Enter a valid email address.');
  if (password.length < 8) errors.push('Password must be at least 8 characters.');
  return errors;
}

app.post('/login', async (req, res) => {
  const { email, password } = req.body;

  const errors = validate(email, password);
  if (errors.length) {
    return res.status(400).json({
      ok: false,
      message: errors.join(' '),
      echo: escapeHtml(email || '') // escaped, so a payload here can't execute
    });
  }

  // --- SQL INJECTION NOTE ---------------------------------------------------
  // A raw, string-built query is what makes Juice Shop's login exploitable:
  //     const sql = `SELECT * FROM users WHERE email = '${email}'`;
  //   Passing  ' OR 1=1--  turns that into "... WHERE email = '' OR 1=1--'"
  //   which matches every row and bypasses authentication.
  //
  // The fix is a parameterized / prepared statement, e.g. with better-sqlite3:
  //     db.prepare('SELECT * FROM users WHERE email = ?').get(email);
  //   The driver treats the input strictly as data, never as SQL.
  //
  // Our in-memory lookup below has the same safe property: input is compared
  // as a value, never parsed as code.
  const user = users.find(u => u.email === String(email).toLowerCase());

  // Run bcrypt.compare either way to avoid leaking which emails exist (timing).
  const passwordOk = user
    ? await bcrypt.compare(password, user.passwordHash)
    : await bcrypt.compare(password, '$2a$12$invalidinvalidinvalidinvalidinvalidinvalidinvalidinv');

  if (!passwordOk) {
    return res.status(401).json({ ok: false, message: 'Invalid email or password.' });
  }

  return res.json({ ok: true, message: 'Login successful.' });
});

app.listen(PORT, () => {
  console.log(`Login demo running at http://localhost:${PORT}`);
});
