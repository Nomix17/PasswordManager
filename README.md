# Password Manager

A password manager built as a Chrome extension. Passwords are encrypted client-side using AES-256-GCM before being sent to the server, the server never sees plaintext credentials.

## Tech Stack
- **Extension**: React, TypeScript, WebCrypto API, Vite, Chrome MV3
- **Server**: Node.js, Express, SQLite, bcrypt

## Setup

**Server**
```bash
cd Server
npm install
npm run compile
```
Starts on `http://localhost:8080`.

**Extension**
```bash
cd Extension
npm install
npm run build
```
Then load the `Extension/dist` folder as an unpacked extension in `chrome://extensions`.
