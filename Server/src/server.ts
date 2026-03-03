import express, { type Express } from "express";
import crypto from 'crypto';
import { PasswordEntry, validateLogin, signIn, insertNewPasswordEntry } from "./dbManager";

const app: Express = express();
const port: number = 8080;

app.post("/login", (req, res) => {
  const { userName, password } = req.body;
  const sessionToken = generateSessionKey(password);
  const loginIsValide = validateLogin(userName, password);
  if (loginIsValide) {
    res.status(200).json({
      success: true,
      message: "Success",
      sessionToken: sessionToken
    });

  } else {
    res.status(401).json({ 
      success: false, 
      message: "Invalid information" 
    });
  }
});

app.post("/sign_in", (req, res) => {
  const { userName, password } = req.body;
  const successfullySignIn = signIn(userName, password);

  if (successfullySignIn) {
    const sessionToken = generateSessionKey(password);
    return res.status(200).json({
      success: true,
      message: "Success",
      sessionToken: sessionToken
    });

  } else {
    return res.status(401).json({ 
      success: false, 
      message: "User Name already Taken" 
    });
  }
});

app.post("/get_passwords", (req, res) => {
  const { sessionUserName, sessionToken} = req.body;
});

app.post("/add_password", (req, res) => {
  const { sessionUserName, sessionToken, newPassword } = req.body;
  const { type, userName, password } = newPassword;
});

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`);
});


function generateSessionKey(password: string): string {
  const hash = crypto.createHash("sha256");
  hash.update(password);
  return hash.digest("hex");
}

