"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const dbManager_1 = require("./dbManager");
const express_1 = __importDefault(require("express"));
const crypto_1 = __importDefault(require("crypto"));
const app = (0, express_1.default)();
const port = 8080;
let db;
app.post("/login", async (req, res) => {
    const { userName, password } = req.body;
    const sessionToken = generateSessionKey(password);
    const loginIsValide = await (0, dbManager_1.validateLogin)(db, userName, password);
    if (loginIsValide) {
        res.status(200).json({
            success: true,
            message: "Success",
            sessionToken: sessionToken
        });
    }
    else {
        res.status(401).json({
            success: false,
            message: "Invalid information"
        });
    }
});
app.post("/sign_in", (req, res) => {
    const { userName, password } = req.body;
    const successfullySignIn = (0, dbManager_1.signIn)(db, userName, password);
    if (successfullySignIn) {
        const sessionToken = generateSessionKey(password);
        return res.status(200).json({
            success: true,
            message: "Success",
            sessionToken: sessionToken
        });
    }
    else {
        return res.status(401).json({
            success: false,
            message: "User Name already Taken"
        });
    }
});
app.post("/get_passwords", (req, res) => {
    const { sessionUserName, sessionToken } = req.body;
});
app.post("/add_password", (req, res) => {
    const { sessionUserName, sessionToken, newPassword } = req.body;
    const { type, userName, password } = newPassword;
});
app.listen(port, async () => {
    db = await (0, dbManager_1.setupDb)("database.db");
    console.log(`Example app listening at http://localhost:${port}`);
});
function generateSessionKey(password) {
    const hash = crypto_1.default.createHash("sha256");
    hash.update(password);
    return hash.digest("hex");
}
