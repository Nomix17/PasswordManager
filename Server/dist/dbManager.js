"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.setupDb = setupDb;
exports.insertNewPasswordEntry = insertNewPasswordEntry;
exports.validateLogin = validateLogin;
exports.signIn = signIn;
exports.getPasswords = getPasswords;
const sqlite3_1 = __importDefault(require("sqlite3"));
const sqlite_1 = require("sqlite");
const bcrypt_1 = __importDefault(require("bcrypt"));
;
async function setupDb(dbPath) {
    const db = await (0, sqlite_1.open)({
        filename: dbPath,
        driver: sqlite3_1.default.Database
    });
    db.run(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      userName TEXT UNIQUE
    )
  `);
    db.run(`
    CREATE TABLE IF NOT EXISTS passwords (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      userId INTEGER,
      type TEXT,
      password TEXT,
      FOREIGN KEY(userId) REFERENCES users(id) ON DELETE CASCADE
    )
  `);
    return db;
}
async function insertNewPasswordEntry(db, sessionUserName, { type, userName, password }) {
    const hashedPassword = bcrypt_1.default.hash(password, 10);
    const row = await db.get("SELECT id FROM users WHERE userName = ?", [sessionUserName]);
    if (!row)
        throw new Error("User not found");
    await db.run("INSERT INTO passwords (userId, userName, type, password) VALUES (?, ?, ?, ?)", [row.id, userName, type, hashedPassword]);
}
async function validateLogin(db, userName, password) {
    const row = await db.get("SELECT password FROM users WHERE userName = ?", [userName]);
    if (!row)
        return false;
    const res = await bcrypt_1.default.compare(password, row.password.toString());
    return res;
}
function signIn(db, userName, password) {
    return true;
}
function getPasswords(db, userName) {
}
