export class Cryptography {
  static async decrypt(cipherTextBase64: string, ivBase64: string, key: CryptoKey) {
    const encryptedBytes = new Uint8Array(
      atob(cipherTextBase64).split("").map(c => c.charCodeAt(0))
    );

    const ivBytes = new Uint8Array(
      atob(ivBase64).split("").map(c => c.charCodeAt(0))
    );

    const decryptedBuffer = await window.crypto.subtle.decrypt(
      { name: "AES-GCM", iv: ivBytes },
      key,
      encryptedBytes
    );

    const decoder = new TextDecoder();
    return decoder.decode(decryptedBuffer);
  }

  static async encrypt(plainText: string, key: CryptoKey) {
    const encoder = new TextEncoder();
    const plainTextBuffer = encoder.encode(plainText);

    const ivBytes = crypto.getRandomValues(new Uint8Array(12));

    const encryptedBuffer = await window.crypto.subtle.encrypt(
      { name: "AES-GCM", iv: ivBytes },
      key,
      plainTextBuffer
    );

    const encryptedBase64 = btoa(
      String.fromCharCode(...new Uint8Array(encryptedBuffer))
    );

    const ivBase64 = btoa(String.fromCharCode(...ivBytes));

    return [encryptedBase64, ivBase64];
  }

  static async getDerivateKey(): Promise<CryptoKey | null> {
    const key = sessionStorage.getItem("DerivatedKey");
    if(key == null || key.trim() === "") return null;
    const KeyBuffer: ArrayBuffer = Uint8Array.fromHex(key);
    return await window.crypto.subtle.importKey(
      "raw",
      KeyBuffer,
      { name: "AES-GCM", length: 256 },
      false,
      ["encrypt", "decrypt"]
    );
  }

  static async derivateKeyFromPassword(userName:string ,password: string): Promise<string> {
    const encoder = new TextEncoder();
    const salt = Uint8Array.fromHex(await Cryptography.hash(userName)).slice(0, 16);
    const keyMaterial = await window.crypto.subtle.importKey(
      "raw",
      encoder.encode(password),
      "PBKDF2",
      false,
      ["deriveBits", "deriveKey"]
    );
    const derivatedKey = await window.crypto.subtle.deriveKey(
      {
        name: "PBKDF2",
        salt,
        iterations: 100000,
        hash: "SHA-256"
      },
      keyMaterial,
      { name:"AES-GCM", length:256 },
      true,
      ["encrypt", "decrypt"]
    );

    return new Uint8Array(
      await window.crypto.subtle.exportKey("raw",derivatedKey)
    ).toHex();
  }

  static async hash(data:string): Promise<string> {
    const encoder = new TextEncoder();
    const encodedData = encoder.encode(data);
    const hashBuffer: ArrayBuffer = await window.crypto.subtle.digest("SHA-256",encodedData);
    const hashHex: string = new Uint8Array(hashBuffer).toHex();
    return hashHex;
  }
}
