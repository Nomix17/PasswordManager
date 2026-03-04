import { setupDb, validateLogin, signIn, getPasswordsByUserName, insertNewPasswordEntry, dbErrors, PasswordEntry } from "./dbManager";
import express, { type Express } from "express";
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

const app: Express = express();
const port: number = 8080;
let db: Database;

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

app.post("/sign_in", async(req, res) => {
  const { userName, password } = req.body;
  const signInRes = await signIn(db, userName, password);

  if (signInRes.success) {
    const sessionToken = generateSessionKey(password);
    const newUser: userSession = new userSession(userName, sessionToken);
    userSession.logedInUsers.push(newUser);

    return res.status(200).json({
      success: true,
      message: "Success",
      sessionToken: sessionToken
    });

  } else {

    if(signInRes.error_type === dbErrors.DUPLICATED_USERNAME) {
      return res.status(401).json({ 
        success: false, 
        message: signInRes.error_msg
      });
    } else {
      console.error(signInRes.error_msg);
      return res.status(401).json({ 
        success: false, 
        message: "Something Went Wrong"
      });
    }
  }
});

app.post("/get_passwords", async (req, res) => {
  const { sessionUserName, sessionToken } = req.body;
  if(sessionUserName == null || sessionToken == null) {
    return res.status(401).json({
      success: false,
      message: "Invalide session token, or user name"
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

  return res.status(200).json({
    success:true,
    data:passwordEntries.map(element=>(element.toJson()))
  });
});

app.post("/add_password", (req, res) => {
  const { sessionUserName, sessionToken, newPassword } = req.body;
  const { type, userName, password } = newPassword;
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

