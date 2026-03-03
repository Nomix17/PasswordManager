import sqlite3, { Database } from 'sqlite3';
import bcrypt from 'bcrypt';

const db: sqlite3.Database = new sqlite3.verbose().Database('mydatabase.db');

export interface PasswordEntry {
  type: string,
  userName: string,
  password: string
};

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

export function createPasswordEntryPoint(
  sessionUserName: string,
  type: string,
  password: string
): Promise<void> {
  return new Promise(async (resolve, reject) => {
    try {
      const hashedPassword = await bcrypt.hash(password, 10);
      db.get(
        "SELECT id FROM users WHERE userName = ?",
        [sessionUserName],
        (err, row) => {
          if (err) return reject(err);
          if (!row) return reject(new Error("User not found"));

          db.run(
            "INSERT INTO passwords (userId, type, password) VALUES (?, ?, ?)",
            [row.id, type, hashedPassword],
            (err) => {
              if (err) return reject(err);
              resolve();
            }
          );
        }
      );
    } catch (err) {
      reject(err);
    }
  });
}

export function validateLogin(userName: string, password: string): Promise<boolean> {
  return new Promise((resolve, reject) => {
    db.get(
      "SELECT password FROM users WHERE userName = ?",
      [userName],
      (err, row) => {
        if (err) return reject(err);
        if (!row) return resolve(false);
        bcrypt.compare(password, row.password.toString(), (err, result) => {
          if (err) return reject(err);
          resolve(result);
        });
      }
    );
  });
}

export function signIn( userName:string, password:string ): boolean {
  return true;
}

export function getPasswords( userName:string ) {
}

