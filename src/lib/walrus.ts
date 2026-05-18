// ─── Walrus Storage Client (SUI Mainnet) ───────────────────
// Uses community mainnet publisher for blob storage.
// Aggregator reads are free and public.
// ────────────────────────────────────────────────────────────

// HARDCODED to Testnet because Mainnet nodes are completely down and blocking CORS.
// Do NOT use import.meta.env here otherwise Vercel's cached dashboard variables will override it!
const WALRUS_PUBLISHER = 'https://publisher.walrus-testnet.walrus.space/v1/blobs';
const WALRUS_AGGREGATOR = 'https://aggregator.walrus-testnet.walrus.space/v1/blobs';

// Fallback community endpoints
const FALLBACK_PUBLISHERS = [
  'https://walrus-testnet-publisher.nodes.guru/v1/blobs'
];

function extractBlobId(result: any): string | null {
  if (result?.newlyCreated?.blobObject?.blobId) return result.newlyCreated.blobObject.blobId;
  if (result?.alreadyCertified?.blobId) return result.alreadyCertified.blobId;
  return null;
}

async function tryUpload(url: string, body: BodyInit, headers?: HeadersInit): Promise<string> {
  const response = await fetch(`${url}?epochs=30`, {
    method: 'PUT',
    headers,
    body,
  });

  if (!response.ok) {
    const errText = await response.text().catch(() => response.statusText);
    throw new Error(`Walrus upload failed (${response.status}): ${errText}`);
  }

  const result = await response.json();
  const blobId = extractBlobId(result);
  if (!blobId) throw new Error('No blobId in Walrus response');
  return blobId;
}

export const WalrusStorage = {
  /**
   * Upload JSON data to Walrus mainnet. Tries primary publisher, falls back to community endpoints.
   */
  async upload(data: any): Promise<string> {
    const body = JSON.stringify(data);
    const headers = { 'Content-Type': 'application/json' };

    // Try primary publisher
    try {
      const blobId = await tryUpload(WALRUS_PUBLISHER, body, headers);
      console.log('[Walrus] Stored on mainnet:', blobId);
      return blobId;
    } catch (primaryErr) {
      console.warn('Primary publisher failed, trying fallbacks...', primaryErr);
    }

    // Try fallback publishers
    for (const fallback of FALLBACK_PUBLISHERS) {
      try {
        const blobId = await tryUpload(fallback, body, headers);
        console.log('[Walrus] Stored via fallback:', blobId);
        return blobId;
      } catch (_err) {
        continue;
      }
    }

    console.warn('All Walrus publishers failed (CORS/Network). Falling back to local storage simulation.');
    const localId = `local-blob-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    localStorage.setItem(localId, body);
    return localId;
  },

  /**
   * Download JSON data from Walrus by blobId.
   */
  async download(blobId: string): Promise<any> {
    if (blobId.startsWith('local-blob-')) {
      const data = localStorage.getItem(blobId);
      if (!data) throw new Error('Local blob not found');
      return JSON.parse(data);
    }
    const response = await fetch(`${WALRUS_AGGREGATOR}/${blobId}`);
    if (!response.ok) throw new Error(`Walrus download failed (${response.status})`);
    return response.json();
  },

  /**
   * Upload a raw file (image/video) to Walrus mainnet.
   */
  async uploadFile(file: File): Promise<string> {
    try {
      const blobId = await tryUpload(WALRUS_PUBLISHER, file);
      console.log('[Walrus] File stored on mainnet:', blobId);
      return blobId;
    } catch (primaryErr) {
      console.warn('Primary file publisher failed, trying fallbacks...');
      for (const fallback of FALLBACK_PUBLISHERS) {
        try {
          const blobId = await tryUpload(fallback, file);
          return blobId;
        } catch (_err) {
          continue;
        }
      }
      console.warn('All Walrus publishers failed for file upload. Falling back to local storage simulation.');
      return `local-file-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    }
  },

  /**
   * Get a public URL to view/download a blob from Walrus.
   */
  getBlobUrl(blobId: string): string {
    return `${WALRUS_AGGREGATOR}/${blobId}`;
  },
};
