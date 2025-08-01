import QRCode from 'qrcode';

/**
 * Generates QR code as Buffer for email attachment
 * @param {string} text Text to encode
 * @returns {Promise<Buffer>} QR code image buffer
 */

// Generates QR with the employee code
export const generateQRCode = async (text) => {
  try {
    return await QRCode.toBuffer(text, {
      type: 'image/png',
      width: 300,
      margin: 2,
      errorCorrectionLevel: 'H'
    });
  } catch (err) {
    console.error('Error generating QR code:', err);
    throw err;
  }
};