#!/usr/bin/env node
'use strict';
/**
 * Creates the site admin's account, or makes an existing account the admin.
 *
 *   npm run create-admin                       asks for the email and password (typing hidden)
 *   npm run create-admin -- you@example.com    asks only for the password
 *   npm run create-admin -- --remove you@example.com   turns an admin back into a normal user
 *
 * For a non-interactive run (a deploy shell), set ADMIN_EMAIL and ADMIN_PASSWORD instead.
 * It uses MONGODB_URI from backend/.env, so it changes whichever database that points at.
 *
 * Admin rights are never granted through the website: only this command, which needs
 * access to the database, can make an admin. If someone had already signed up with the
 * admin's email, the account is taken over: the password is replaced and every session
 * on it is ended.
 */
require('dotenv').config({ path: require('node:path').join(__dirname, '..', '.env') });
const readline = require('node:readline');
const mongoose = require('mongoose');
const { connectDB, isDBConnected } = require('../src/config/db');
const { normalizeEmail } = require('../src/utils/preferences');
const { hashPassword, passwordProblem } = require('../src/utils/passwords');

function ask(question, hidden = false) {
  return new Promise(resolve => {
    const rl = readline.createInterface({ input: process.stdin, output: process.stdout, terminal: process.stdin.isTTY });
    if (hidden && process.stdin.isTTY) {
      // echo a * for each key instead of the character typed
      rl._writeToOutput = s => rl.output.write(s.startsWith(question) ? question + '*'.repeat(rl.line.length) : s.replace(/[^\r\n]/g, '*'));
    }
    rl.question(question, answer => { rl.close(); resolve(answer); });
  });
}

/** A few patterns that guessing tools try first: say so, but leave the choice to the owner. */
function weakness(password, email) {
  const local = email.split('@')[0].toLowerCase();
  const name = local.replace(/[^a-z]/g, '');
  if (password.length < 12) return 'it is shorter than 12 characters';
  if (/^[A-Za-z]+[^A-Za-z0-9]?\d{1,4}[^A-Za-z0-9]?$/.test(password)) return 'it is a word followed by a few digits';
  if (name.length >= 4 && password.toLowerCase().includes(name.slice(0, 6))) return 'it contains part of the email address';
  return null;
}

async function main() {
  const args = process.argv.slice(2);
  const remove = args.includes('--remove');
  const argEmail = args.find(a => !a.startsWith('--'));

  const email = normalizeEmail(process.env.ADMIN_EMAIL || argEmail || await ask('Admin email: '));
  if (!email) throw new Error('That is not a valid email address.');

  await connectDB();
  if (!isDBConnected()) throw new Error('Could not connect to MongoDB. Check MONGODB_URI in backend/.env.');
  const User = require('../src/models/User');
  const Session = require('../src/models/Session');

  if (remove) {
    const r = await User.updateOne({ email, role: 'admin' }, { $set: { role: 'user' } });
    console.log(r.modifiedCount ? `${email} is no longer an admin.` : `${email} was not an admin.`);
    return;
  }

  let password = process.env.ADMIN_PASSWORD;
  if (!password) {
    password = await ask('Password (typing is hidden): ', true);
    const again = await ask('Type it again: ', true);
    if (password !== again) throw new Error('The two passwords do not match. Nothing was changed.');
  }
  const problem = passwordProblem(password);
  if (problem) throw new Error(problem);
  const weak = weakness(password, email);
  if (weak) console.warn(`\nWarning: this password is easy to guess (${weak}). The admin can read every user's email; consider a longer, unique one.\n`);

  const passwordHash = await hashPassword(password);
  const existing = await User.findOne({ email });
  if (existing) {
    existing.set({ role: 'admin', passwordHash, emailVerified: true, failedLogins: 0, lockedUntil: null });
    await existing.save();
    const { deletedCount } = await Session.deleteMany({ user: existing._id });
    console.log(`${email} is now the admin (existing account, password replaced, ${deletedCount} session(s) signed out).`);
  } else {
    await User.create({ email, name: 'Admin', passwordHash, role: 'admin', emailVerified: true });
    console.log(`Admin account created for ${email}.`);
  }
  console.log('Sign in on the site with this email and password, then open the Admin tab.');
}

main()
  .catch(err => { console.error(`\n${err.message}`); process.exitCode = 1; })
  .finally(() => mongoose.disconnect());
