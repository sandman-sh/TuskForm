import { SealClient } from '@mysten/seal';
import type { KeyServerConfig, SessionKey } from '@mysten/seal';

// Since @mysten/sui 2.x doesn't export SuiClient directly from /client, we'll use any to bypass type errors during build
type SuiClient = any;

// NOTE: You need to define your Key Servers from Mysten's decentralized network.
// In production, these would be the object IDs of the SEAL nodes on Mainnet.
const SEAL_SERVER_CONFIGS: KeyServerConfig[] = [
  // Example: { objectId: "0x...", weight: 1, aggregatorUrl: "https://..." }
];

// NOTE: The Package ID where your seal_policy.move is deployed
const SEAL_PACKAGE_ID = import.meta.env.VITE_SEAL_PACKAGE_ID || "0x2cd53cd2943ae126a56dc94542036128c7e8b01d13c6e3ca5db0878effdbf59c";

/**
 * Initializes the official @mysten/seal client.
 */
export const getSealClient = (suiClient: SuiClient) => {
  return new SealClient({
    // @ts-ignore - SealCompatibleClient is basically SuiClient
    suiClient,
    serverConfigs: SEAL_SERVER_CONFIGS,
  });
};

export const MystenSealEncryption = {
  /**
   * Encrypts data for a specific SUI address using Threshold Encryption.
   * Note: The user DOES NOT need a wallet to run this (perfect for your FormView.tsx)
   */
  async encrypt(data: any, adminAddress: string, suiClient: SuiClient): Promise<string> {
    const client = getSealClient(suiClient);
    const enc = new TextEncoder();
    const encodedData = enc.encode(JSON.stringify(data));

    const { encryptedObject } = await client.encrypt({
      threshold: 1, // Change based on your key server setup
      packageId: SEAL_PACKAGE_ID,
      id: adminAddress, // Using the admin's address as the SEAL identity
      data: encodedData,
    });

    // Convert encrypted Uint8Array back to a string for Walrus storage
    return btoa(String.fromCharCode.apply(null, Array.from(new Uint8Array(encryptedObject))));
  },

  /**
   * Decrypts the payload using the Admin's wallet and SUI network.
   * Note: The Admin must sign a session key and a transaction block to prove ownership.
   */
  async decrypt(
    cipherText: string, 
    sessionKey: SessionKey, 
    txBytes: Uint8Array, 
    suiClient: SuiClient
  ): Promise<any> {
    const client = getSealClient(suiClient);
    
    const combinedStr = atob(cipherText);
    const buf = new ArrayBuffer(combinedStr.length);
    const bufView = new Uint8Array(buf);
    for (let i = 0; i < combinedStr.length; i++) {
      bufView[i] = combinedStr.charCodeAt(i);
    }

    const decryptedBuffer = await client.decrypt({
      data: bufView,
      sessionKey,
      txBytes, // This must be a TransactionBlock calling your `seal_approve` Move function
    });

    const dec = new TextDecoder();
    return JSON.parse(dec.decode(decryptedBuffer));
  }
};
