import { useEffect, useRef, forwardRef, useImperativeHandle } from 'react';
import { Html5QrcodeScanner, Html5QrcodeScanType } from 'html5-qrcode';

const QRScanner = forwardRef(({ onScanSuccess, scanDelay = 500 }, ref) => {
  const scannerRef = useRef(null);
  const scanTimeoutRef = useRef(null);

  const handleScan = (decodedText) => {
      console.log('QRScanner decodedText:', decodedText); // <-- Add this log
    if (!decodedText || scanTimeoutRef.current) return;
    
    // Valid QR code found
    onScanSuccess(decodedText);
    
    // Temporarily disable scanning to prevent duplicates
    scanTimeoutRef.current = setTimeout(() => {
      scanTimeoutRef.current = null;
    }, scanDelay);
  };

  const handleError = (error) => {
    // Ignore "No MultiFormat Readers" error as it's too frequent
    if (!error.message.includes('No MultiFormat Readers')) {
      console.error('QR Scanner Error:', error);
    }
  };

  useImperativeHandle(ref, () => ({
    restartCamera: async () => {
      try {
        if (scannerRef.current) {
          await scannerRef.current.clear();
          scannerRef.current.render(handleScan, handleError);
        }
      } catch (error) {
        console.error('Error restarting camera:', error);
      }
    }
  }));

  useEffect(() => {
    const config = { 
      fps: 10,
      qrbox: 250,
      rememberLastUsedCamera: true,
      supportedScanTypes: [Html5QrcodeScanType.SCAN_TYPE_CAMERA]
    };

    scannerRef.current = new Html5QrcodeScanner('qr-reader', config, false);
    scannerRef.current.render(handleScan, handleError);

    return () => {
      clearTimeout(scanTimeoutRef.current);
      scannerRef.current?.clear().catch(error => {
        console.error('Scanner cleanup error:', error);
      });
    };
  }, []);

  return <div id="qr-reader" style={{ width: '100%', height: '100%' }} />;
});

QRScanner.displayName = 'QRScanner';

export default QRScanner;
