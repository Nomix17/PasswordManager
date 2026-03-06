import sqlite3 from 'sqlite3';
import { Database, open } from "sqlite";
import bcrypt from 'bcrypt';
import { ErrorRequestHandler } from 'express';


export enum dbErrors {
  DUPLICATED_USERNAME,
  UNKNOWN_ERROR
};

export class PasswordEntry {
  id: string;
  type: string;
  userName: string;
  password: string;
  constructor(id:string, type:string, userName:string, password:string) {
    this.id = id;
    this.type = type;
    this.userName = userName;
    this.password = password;
  }

  toJson(): {id:string, type: string, userName: string, password: string } {
    return {
      id: this.id,
      type: this.type,
      userName: this.userName,
      password: this.password
    };
  }
};

export async function setupDb(dbPath:string): Promise<Database> {
  const db = await open({
    filename: dbPath,
    driver: sqlite3.Database
  })

  db.run(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      userName TEXT UNIQUE,
      password TEXT
    )
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS passwords (
      userId INTEGER,
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      userName INTEGER,
      type TEXT,
      password TEXT,
      FOREIGN KEY(userId) REFERENCES users(id) ON DELETE CASCADE
    )
  `);

  return db;
}

export async function validateLogin(db: Database, userName: string, password: string): Promise<boolean> {
  const row = await db.get(
    "SELECT password FROM users WHERE userName = ?",
    [userName]
  );

  if (!row)
    return false;

  const res = await bcrypt.compare(password, row.password.toString());
  return res;
}

export async function signUp( db: Database, userName:string, password:string ): Promise<{ success: boolean, error_type:dbErrors | null, error_msg:string} > {
  try {
    const hashedPassword = await bcrypt.hash(password, 12);
    const row = await db.get(
      "INSERT INTO users (userName, password) VALUES (?, ?)",
      [userName, hashedPassword]
    );
  } catch (err: any) {
    if (err.code === "SQLITE_CONSTRAINT") {
      return { success: false, error_type:dbErrors.DUPLICATED_USERNAME, error_msg:"Username already exists" }
    } else {
      return { success: false, error_type:dbErrors.UNKNOWN_ERROR ,error_msg:err.message }
    }
  }

  return { success: true, error_type:null, error_msg:"" }
}

export async function insertNewPasswordEntry (
  db: Database,
  sessionUserName: string,
  passwordEntry: PasswordEntry
): Promise<void>{

  const row =  await db.get(
    "SELECT id FROM users WHERE userName = ?",
    [sessionUserName]
  );

  if (!row)
    throw new Error("User not found");

  await db.run(
    "INSERT INTO passwords (userId, userName, type, password) VALUES (?, ?, ?, ?)",
    [row.id, passwordEntry.userName, passwordEntry.type, passwordEntry.password],
  );
}

export async function updatePasswordsEntries(
  db: Database,
  sessionUserName: string,
  newPasswords: PasswordEntry[]
): Promise<void> {
  if (newPasswords.length === 0) return;

  const row = await db.get(
    "SELECT id FROM users WHERE userName = ?",
    [sessionUserName]
  );
  if (!row) throw new Error("User not found");

  await db.run("BEGIN TRANSACTION");
  try {
    const stmt = await db.prepare(
      "REPLACE INTO passwords (userId, id, userName, type, password) VALUES (?, ?, ?, ?, ?)"
    );
    try {
      for (const passwordEntry of newPasswords) {
        await stmt.run(
          row.id,
          passwordEntry.id,
          passwordEntry.userName,
          passwordEntry.type,
          passwordEntry.password
        );
      }
    } finally {
      await stmt.finalize();
    }
    await db.run("COMMIT");
  } catch (err) {
    await db.run("ROLLBACK");
    throw err;
  }
}

export async function removePasswordsEntries (
  db: Database,
  sessionUserName: string,
  passwordEntry: PasswordEntry
): Promise<void> {

  const row = await db.get(
    "SELECT id FROM users WHERE userName = ?",
    [sessionUserName]
  );
  if (!row) throw new Error("User not found");

  await db.run(
    "DELETE FROM passwords WHERE userId = ? AND id = ? AND userName = ? AND type = ?",
    [row.id, passwordEntry.id, passwordEntry.userName, passwordEntry.type ]
  );
}

export async function getPasswordsByUserName(db: Database, userName: string): Promise<PasswordEntry[]> {
  const rows = await db.all(`
      SELECT p.*
      FROM users u
      INNER JOIN passwords p ON p.userId = u.id
      WHERE u.userName = ?
  `, [userName]);

  return rows.map(
    row => new PasswordEntry(row.id, row.type, row.userName, row.password)
  );
}

