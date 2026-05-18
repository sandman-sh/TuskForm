export const SealEncryption = {
  // Convert string to Uint8Array
  str2ab(str: string) {
    const buf = new ArrayBuffer(str.length);
    const bufView = new Uint8Array(buf);
    for (let i = 0, strLen = str.length; i < strLen; i++) {
      bufView[i] = str.charCodeAt(i);
    }
    return bufView;
  },
  // Convert Uint8Array to string
  ab2str(buf: Uint8Array) {
    return String.fromCharCode.apply(null, Array.from(buf));
  },

  async deriveKey(keyMaterial: string): Promise<CryptoKey> {
    const enc = new TextEncoder();
    const keyMaterialBuffer = enc.encode(keyMaterial);
    const baseKey = await crypto.subtle.importKey(
      "raw", keyMaterialBuffer, { name: "PBKDF2" }, false, ["deriveKey"]
    );
    return crypto.subtle.deriveKey(
      {
        name: "PBKDF2",
        salt: enc.encode("tuskform-salt-mainnet"),
        iterations: 100000,
        hash: "SHA-256"
      },
      baseKey,
      { name: "AES-GCM", length: 256 },
      false,
      ["encrypt", "decrypt"]
    );
  },

  async encrypt(data: any, keyString: string): Promise<string> {
    try {
      const key = await this.deriveKey(keyString);
      const iv = crypto.getRandomValues(new Uint8Array(12));
      const enc = new TextEncoder();
      const encodedData = enc.encode(JSON.stringify(data));
      
      const cipherBuffer = await crypto.subtle.encrypt(
        { name: "AES-GCM", iv: iv }, key, encodedData
      );
      
      const cipherArray = new Uint8Array(cipherBuffer);
      const combined = new Uint8Array(iv.length + cipherArray.length);
      combined.set(iv);
      combined.set(cipherArray, iv.length);
      
      return btoa(this.ab2str(combined));
    } catch (e) {
      console.error('Encryption failed', e);
      throw e;
    }
  },

  async decrypt(cipherText: string, keyString: string): Promise<any> {
    try {
      const key = await this.deriveKey(keyString);
      const combinedStr = atob(cipherText);
      const combined = this.str2ab(combinedStr);
      
      const iv = combined.slice(0, 12);
      const data = combined.slice(12);
      
      const decryptedBuffer = await crypto.subtle.decrypt(
        { name: "AES-GCM", iv: iv }, key, data
      );
      
      const dec = new TextDecoder();
      const jsonStr = dec.decode(decryptedBuffer);
      return JSON.parse(jsonStr);
    } catch (e) {
      console.error('Decryption failed', e);
      return null;
    }
  }
};
