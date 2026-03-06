import { setupDb, validateLogin, signUp, getPasswordsByUserName, insertNewPasswordEntry, dbErrors, PasswordEntry, insertPasswordsEntries } from "./dbManager";
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
  const loginIsValide = await validateLogin(db, userName, password);
  if (loginIsValide) {
    const sessionToken = generateSessionKey(password);
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
  const signUpRes = await signUp(db, userName, password);

  if (signUpRes.success) {
    const sessionToken = generateSessionKey(password);
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
      new PasswordEntry(row?.id, row?.type, row?.userName, row?.password)
    )
  );
}

app.post("/add_passwords", (req, res) => {
  const { sessionUserName, sessionToken, newPasswords } = req.body;

  try {
    if(validateCredentials(sessionUserName, sessionToken)) {
      insertPasswordsEntries(db, sessionUserName, formatResponse(newPasswords));
      return res.status(200).json({
        success: true,
        message: "Passwords where added Successfully",
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

function generateSessionKey(password: string): string {
  const hash = crypto.createHash("sha256");
  hash.update(password);
  return hash.digest("hex");
}

