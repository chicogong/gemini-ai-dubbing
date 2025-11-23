// Utility to convert Base64 string to Uint8Array
export function base64ToBytes(base64: string): Uint8Array {
  // Remove any whitespace that might have crept in
  const cleanBase64 = base64.replace(/\s/g, '');
  const binaryString = atob(cleanBase64);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
}

// Convert Raw PCM (Float32 or Int16) to WAV file format (Blob)
export function pcmToWavBlob(pcmData: Int16Array, sampleRate: number): Blob {
  const numChannels = 1;
  const byteRate = sampleRate * numChannels * 2; // 2 bytes per sample (16-bit)
  const blockAlign = numChannels * 2;
  const dataSize = pcmData.length * 2;
  const buffer = new ArrayBuffer(44 + dataSize);
  const view = new DataView(buffer);

  // RIFF chunk descriptor
  writeString(view, 0, 'RIFF');
  view.setUint32(4, 36 + dataSize, true);
  writeString(view, 8, 'WAVE');

  // fmt sub-chunk
  writeString(view, 12, 'fmt ');
  view.setUint32(16, 16, true); // Subchunk1Size (16 for PCM)
  view.setUint16(20, 1, true); // AudioFormat (1 for PCM)
  view.setUint16(22, numChannels, true); // NumChannels
  view.setUint32(24, sampleRate, true); // SampleRate
  view.setUint32(28, byteRate, true); // ByteRate
  view.setUint16(32, blockAlign, true); // BlockAlign
  view.setUint16(34, 16, true); // BitsPerSample

  // data sub-chunk
  writeString(view, 36, 'data');
  view.setUint32(40, dataSize, true);

  // Write PCM samples
  let offset = 44;
  for (let i = 0; i < pcmData.length; i++, offset += 2) {
    view.setInt16(offset, pcmData[i], true);
  }

  return new Blob([view], { type: 'audio/wav' });
}

function writeString(view: DataView, offset: number, string: string) {
  for (let i = 0; i < string.length; i++) {
    view.setUint8(offset + i, string.charCodeAt(i));
  }
}

// Helper to convert Uint8Array (bytes) -> Int16Array (PCM)
export function bytesToInt16(bytes: Uint8Array): Int16Array {
  // Check if bytes.buffer is valid
  if (!bytes.buffer) {
    throw new Error("Invalid audio buffer received");
  }

  // Handle odd byte length by slicing off the last byte
  // Int16Array requires a buffer length that is a multiple of 2
  const length = bytes.length;
  const evenLength = length % 2 === 0 ? length : length - 1;
  
  // Create a view on the existing buffer instead of copying if possible, 
  // but creating a new Int16Array from the buffer is standard.
  // Note: we must use the byteOffset and byteLength correctly.
  
  return new Int16Array(bytes.buffer, bytes.byteOffset, evenLength / 2);
}