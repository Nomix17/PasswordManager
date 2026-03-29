import { Storage } from "./Storage";

export class Cryptography {

  static async decrypt(
    cipherTextBase64: string,
    ivBase64: string,
    key: CryptoKey
  ) {
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

  static async derivateKeyFromPassword(
      userName:string,
      password: string
  ): Promise<{success:boolean, err_msg:string | null}> {
    try {
      const encoder = new TextEncoder();
      const salt = this.fromHex(
        await Cryptography.hashSHA256(userName)
      ).slice(0, 16);

      const keyMaterial = await window.crypto.subtle.importKey(
        "raw",
        encoder.encode(password),
        "PBKDF2",
        false,
        ["deriveBits", "deriveKey"]
      );
      const Key: CryptoKey = await window.crypto.subtle.deriveKey(
        {
          name: "PBKDF2",
          salt,
          iterations: 100000,
          hash: "SHA-256"
        },
        keyMaterial,
        { name:"AES-GCM", length:256 },
        false,
        ["encrypt", "decrypt"]
      );
      await Storage.set("derivateKey",Key);
      return {success: true, err_msg: null};
    } catch (error: unknown) {
      console.error(error);
      return {
        success: false,
        err_msg: error instanceof Error ? error.message : String(error),
      };
    }
  }

  static async hashSHA256(data:string): Promise<string> {
    const encoder = new TextEncoder();
    const encodedData = encoder.encode(data);
    const hashBuffer: ArrayBuffer = await window.crypto.subtle.digest("SHA-256",encodedData);
    const hashHex: string = this.toHex(new Uint8Array(hashBuffer));
    return hashHex;
  }

  static toHex(arr: Uint8Array): string {
    return Array.from(arr, (num) => ('00' + num.toString(16)).slice(-2)).join('');
  }

  static fromHex(hexStr: string): Uint8Array {
    if (hexStr.length % 2 !== 0) throw new Error('Invalid hex string');

    const arr: number[] = [];
    for (let i = 0; i < hexStr.length; i += 2) {
      const num: number = parseInt(hexStr.substring(i, i + 2), 16);
      arr.push(num);
    }
    return new Uint8Array(arr);
  }
}
