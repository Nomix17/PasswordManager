export class Cryptography {
  private static _key: CryptoKey | null = null;

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

  static getDerivateKey(): CryptoKey | null {
    return this._key;
  }

  static async derivateKeyFromPassword(
      userName:string,
      password: string
  ): Promise<{success:boolean, err_msg:string | null}> {
    try {
      const encoder = new TextEncoder();
      const salt = Uint8Array.fromHex(
          await Cryptography.hashSHA256(userName)
        ).slice(0, 16);

      const keyMaterial = await window.crypto.subtle.importKey(
        "raw",
        encoder.encode(password),
        "PBKDF2",
        false,
        ["deriveBits", "deriveKey"]
      );
      this._key = await window.crypto.subtle.deriveKey(
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
    const hashHex: string = new Uint8Array(hashBuffer).toHex();
    return hashHex;
  }
}
