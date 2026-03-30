import { setupDb, validateLogin, signUp, getPasswordsByUserName, dbErrors, PasswordEntry, updatePasswordsEntries, removePasswordsEntries } from "./dbManager";
import express, { type Express } from "express";
import cors from "cors";
import { Database } from "sqlite";
import crypto, { sign } from 'crypto';

class userSession {
  static logedInUsers: userSession[] = [];
  sessionUserName: string;
  sessionToken: string;
  constructor(sessionUserName:string, sessionToken: string) {
    this.sessionUserName = sessionUserName;
    this.sessionToken = sessionToken;
  }

  static findUserByUserName(userName:string): userSession | null {
    for(const user of this.logedInUsers) {
      if(user.sessionUserName === userName) {
        return user;
      }
    }
    return null;
  }
}

function validateCredentials(sessionUserName: string, sessionToken: string): boolean {
  for(const user of userSession.logedInUsers) {
    if(user.sessionUserName === sessionUserName && user.sessionToken === sessionToken) return true;
  }
  return false;
}

const app: Express = express();
const port: number = 8080;
let db: Database;

app.use(cors());
app.use(express.json());

app.post("/login", async (req, res) => {
  const { userName, password } = req.body;
  console.log(`Received login request from the alleged: ${userName}`);

  const loginIsValide = await validateLogin(db, userName, password);
  if (loginIsValide) {
    const sessionToken = generateSessionKey();
    const newUser: userSession = new userSession(userName, sessionToken);
    userSession.logedInUsers.push(newUser);

    return res.status(200).json({
      success: true,
      message: "Success",
      sessionToken: sessionToken
    });

  } else {
    return res.status(401).json({ 
      success: false, 
      message: "Invalid credentials" 
    });
  }
});

app.post("/sign_up", async(req, res) => {
  const { userName, password } = req.body;
  console.log(`Received signup request from the alleged: ${userName}`);

  const signUpRes = await signUp(db, userName, password);
  if (signUpRes.success) {
    const sessionToken = generateSessionKey();
    const newUser: userSession = new userSession(userName, sessionToken);
    userSession.logedInUsers.push(newUser);

    return res.status(200).json({
      success: true,
      message: "Success",
      sessionToken: sessionToken
    });

  } else {

    if(signUpRes.error_type === dbErrors.DUPLICATED_USERNAME) {
      return res.status(401).json({ 
        success: false, 
        message: signUpRes.error_msg
      });
    } else {
      console.error(signUpRes.error_msg);
      return res.status(401).json({ 
        success: false, 
        message: "Something Went Wrong"
      });
    }
  }
});

app.post("/get_passwords", async (req, res) => {
  const { sessionUserName, sessionToken } = req.body;
  console.log(`Received get passwords request from ${sessionUserName}`);

  if(typeof sessionUserName !== "string" || typeof sessionToken !== "string") {
    return res.status(401).json({
      success: false,
      message: "Invalid parameters"
    });
  }
  const user: userSession | null = userSession.findUserByUserName(sessionUserName);

  if(user == null || user.sessionToken !== sessionToken) {
     return res.status(401).json({
       success: false,
       message: "Invalid credentials"
    });
  }

  const passwordEntries: PasswordEntry[] | null = await getPasswordsByUserName(db, sessionUserName);
  
  if(passwordEntries == null) {
    return res.status(500).json({
      success: false,
      message: "An unexpected error occurred"
    });
  }

  const passToSend: any[] = passwordEntries.map(element => (element.toJson()));
  return res.status(200).json({
    success:true,
    data:passToSend
  });
});

function formatResponse(newPasswords: any) {
  return newPasswords.map(
    (row: any) => (
      new PasswordEntry(row?.id, row?.type, row?.userName, row?.password, row?.iv)
    )
  );
}

app.post("/update_passwords", async (req, res) => {
  const { sessionUserName, sessionToken, newPasswords } = req.body;
  console.log(`Received passwords update request from ${sessionUserName}`);

  try {
    if(validateCredentials(sessionUserName, sessionToken)) {
      await updatePasswordsEntries(db, sessionUserName, formatResponse(newPasswords));

      const passwordEntries: PasswordEntry[] | null = await getPasswordsByUserName(db, sessionUserName);

      if(passwordEntries == null) {
        return res.status(500).json({
          success: false,
          message: "An unexpected error occurred"
        });
      }

      const updatedPasswords: any[] = passwordEntries.map(element => (element.toJson()));

      return res.status(200).json({
        success: true,
        message: "Passwords where Updated Successfully",
        updated_passwords: updatedPasswords,
      });

    } else {
      throw new Error("Invalid credentials");
    }

  } catch(err: any) {
    console.error(err.message);
    return res.status(500).json({
      success: false,
      message: err.message
    });
  }
});

app.post("/remove_password", (req, res) => {
  const { sessionUserName, sessionToken, passwordEntryToRemove } = req.body;

  try {
    if(validateCredentials(sessionUserName, sessionToken)) {
      removePasswordsEntries(
        db,
        sessionUserName,
        new PasswordEntry(
          passwordEntryToRemove?.id,
          passwordEntryToRemove?.type,
          passwordEntryToRemove?.userName,
          passwordEntryToRemove?.password,
          passwordEntryToRemove?.iv
        )
      );

      return res.status(200).json({
        success: true,
        message: "Passwords where Updated Successfully",
      });

    } else {
      throw new Error("Invalid credentials");
    }

  } catch(err: any) {
    console.error(err.message);
    return res.status(500).json({
      success: false,
      message: err.message
    });
  }
});

app.listen(port, async() => {
  db = await setupDb("database.db");
  console.log(`Example app listening at http://localhost:${port}`);
});

function generateSessionKey(): string {
  const arr = new Uint8Array(32);
  crypto.getRandomValues(arr);
  return Array.from(arr, byte => byte.toString(16).padStart(2, '0')).join('');
}

